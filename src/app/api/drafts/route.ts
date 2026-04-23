import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AnswerMap } from "@/types/assessment";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const draft = await prisma.draft.findUnique({ where: { email } });
  return NextResponse.json({ answers: (draft?.answers as AnswerMap | null) ?? null });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    answers?: AnswerMap;
  };

  const email = body.email?.toLowerCase().trim();

  if (!email || !body.answers) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.draft.upsert({
    where: { email },
    update: { answers: body.answers as Prisma.JsonObject },
    create: {
      email,
      answers: body.answers as Prisma.JsonObject,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  await prisma.draft.deleteMany({
    where: { email },
  });

  return NextResponse.json({ ok: true });
}
