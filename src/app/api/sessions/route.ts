import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssessmentSessionRecord } from "@/types/assessment";

function toSessionRecord(
  session: { id: string; code: string; name: string; ownerEmail: string; createdAt: Date },
  currentEmail: string,
): AssessmentSessionRecord {
  return {
    id: session.id,
    code: session.code,
    name: session.name,
    ownerEmail: session.ownerEmail,
    createdAt: session.createdAt.toISOString(),
    isOwner: session.ownerEmail === currentEmail,
  };
}

async function getCurrentEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase().trim() ?? null;
}

function generateCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

async function createUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = generateCode();
    const existing = await prisma.assessmentSession.findUnique({ where: { code } });
    if (!existing) {
      return code;
    }
  }

  throw new Error("Unable to generate session code");
}

export async function GET(request: NextRequest) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code")?.trim().toUpperCase();

  if (code) {
    const session = await prisma.assessmentSession.findUnique({ where: { code } });
    return NextResponse.json(session ? toSessionRecord(session, email) : null);
  }

  const sessions = await prisma.assessmentSession.findMany({
    where: { ownerEmail: email },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(sessions.map((session) => toSessionRecord(session, email)));
}

export async function POST(request: Request) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { name?: string };
  const name = body.name?.trim();

  if (!name) {
    return NextResponse.json({ error: "Session name is required" }, { status: 400 });
  }

  const code = await createUniqueCode();
  const session = await prisma.assessmentSession.create({
    data: {
      code,
      name,
      ownerEmail: email,
    },
  });

  return NextResponse.json(toSessionRecord(session, email), { status: 201 });
}

export async function DELETE(request: Request) {
  const email = await getCurrentEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { id?: string };
  const id = body.id?.trim();

  if (!id) {
    return NextResponse.json({ error: "Session id is required" }, { status: 400 });
  }

  const deleted = await prisma.assessmentSession.deleteMany({
    where: {
      id,
      ownerEmail: email,
    },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}