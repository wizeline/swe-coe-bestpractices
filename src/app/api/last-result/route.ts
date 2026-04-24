import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssessmentResult, LastResultRecord } from "@/types/assessment";

async function getSessionEmail(): Promise<string | null> {
  const session = await auth();
  return session?.user?.email?.toLowerCase().trim() ?? null;
}

function getSessionKey(value?: string | null): string {
  return value?.trim() || "personal";
}

export async function GET(request: Request) {
  const email = await getSessionEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sessionKey = getSessionKey(searchParams.get("sessionKey"));

  const record = await prisma.lastResult.findUnique({
    where: { email_sessionKey: { email, sessionKey } },
  });

  if (!record) {
    return NextResponse.json({ data: null });
  }

  const data: LastResultRecord = {
    email: record.email,
    sessionKey: record.sessionKey,
    result: record.result as unknown as AssessmentResult,
    savedAt: record.savedAt.toISOString(),
  };

  return NextResponse.json({ data });
}

export async function PUT(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    result?: AssessmentResult;
    sessionKey?: string;
  };

  if (!email || !body.result) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sessionKey = getSessionKey(body.sessionKey);

  await prisma.lastResult.upsert({
    where: { email_sessionKey: { email, sessionKey } },
    update: {
      result: body.result as unknown as Prisma.JsonObject,
    },
    create: {
      email,
      sessionKey,
      result: body.result as unknown as Prisma.JsonObject,
    },
  });

  return NextResponse.json({ ok: true });
}
