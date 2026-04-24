import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnswerMap, AssessmentResult, SubmissionRecord } from "@/types/assessment";

function toSubmissionRecord(data: {
  id: string;
  email: string;
  sessionId: string | null;
  totalScore: number | null;
  maxScore: number | null;
  completion: number | null;
  maturityLabel: string | null;
  answers: Prisma.JsonValue;
  result: Prisma.JsonValue;
  submittedAt: Date;
  session?: {
    code: string;
    name: string;
  } | null;
}): SubmissionRecord {
  return {
    id: data.id,
    email: data.email,
    sessionId: data.sessionId,
    sessionCode: data.session?.code ?? null,
    sessionName: data.session?.name ?? null,
    totalScore: data.totalScore ?? undefined,
    maxScore: data.maxScore ?? undefined,
    completion: data.completion ?? undefined,
    maturityLabel: (data.maturityLabel as SubmissionRecord["maturityLabel"]) ?? undefined,
    answers: data.answers as unknown as AnswerMap,
    result: data.result as unknown as AssessmentResult,
    submittedAt: data.submittedAt.toISOString(),
  };
}

async function resolveSessionByCode(code?: string | null) {
  if (!code) {
    return null;
  }

  return prisma.assessmentSession.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const latestOnly = searchParams.get("latest") === "true";
  const teamView = searchParams.get("team") === "true";
  const sessionCode = searchParams.get("sessionCode");
  const assessmentSession = await resolveSessionByCode(sessionCode);

  if (sessionCode && !assessmentSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (teamView) {
    if (!assessmentSession) {
      return NextResponse.json({ error: "Session code is required" }, { status: 400 });
    }

    if (assessmentSession.ownerEmail !== email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teamSubmissions = await prisma.submission.findMany({
      where: { sessionId: assessmentSession.id },
      include: { session: { select: { code: true, name: true } } },
      orderBy: { submittedAt: "asc" },
    });

    return NextResponse.json(teamSubmissions.map(toSubmissionRecord));
  }

  if (latestOnly) {
    const latest = await prisma.submission.findFirst({
      where: { email, sessionId: assessmentSession?.id ?? null },
      include: { session: { select: { code: true, name: true } } },
      orderBy: { submittedAt: "desc" },
    });

    if (!latest) {
      return NextResponse.json(null);
    }

    return NextResponse.json(toSubmissionRecord(latest));
  }

  const submissions = await prisma.submission.findMany({
    where: { email, sessionId: assessmentSession?.id ?? null },
    include: { session: { select: { code: true, name: true } } },
    orderBy: { submittedAt: "asc" },
  });

  return NextResponse.json(submissions.map(toSubmissionRecord));
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    answers?: AnswerMap;
    result?: AssessmentResult;
    sessionCode?: string;
  };

  if (!email || !body.answers || !body.result) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const assessmentSession = await resolveSessionByCode(body.sessionCode);

  if (body.sessionCode && !assessmentSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const created = await prisma.submission.create({
    data: {
      email,
      sessionId: assessmentSession?.id ?? null,
      totalScore: body.result.totalScore,
      maxScore: body.result.maxScore,
      completion: body.result.completion,
      maturityLabel: body.result.maturityLabel,
      answers: body.answers as unknown as Prisma.InputJsonValue,
      result: body.result as unknown as Prisma.InputJsonValue,
    },
    include: { session: { select: { code: true, name: true } } },
  });

  return NextResponse.json(toSubmissionRecord(created), { status: 201 });
}
