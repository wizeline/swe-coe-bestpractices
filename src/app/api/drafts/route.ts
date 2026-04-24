import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnswerMap } from "@/types/assessment";

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

  const draft = await prisma.draft.findUnique({
    where: { email_sessionKey: { email, sessionKey } },
  });
  return NextResponse.json({ answers: (draft?.answers as AnswerMap | null) ?? null });
}

export async function PUT(request: Request) {
  const email = await getSessionEmail();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    answers?: AnswerMap;
    sessionKey?: string;
  };

  if (!email || !body.answers) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sessionKey = getSessionKey(body.sessionKey);

  const sanitizedAnswers = Object.fromEntries(
    Object.entries(body.answers).filter(([, value]) => value !== undefined),
  );

  await prisma.draft.upsert({
    where: { email_sessionKey: { email, sessionKey } },
    update: { answers: sanitizedAnswers },
    create: {
      email,
      sessionKey,
      answers: sanitizedAnswers,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const email = await getSessionEmail();

  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { sessionKey?: string };
  const sessionKey = getSessionKey(body.sessionKey);

  await prisma.draft.deleteMany({
    where: { email, sessionKey },
  });

  return NextResponse.json({ ok: true });
}
