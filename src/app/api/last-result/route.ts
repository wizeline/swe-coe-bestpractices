import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AssessmentResult, LastResultRecord } from "@/types/assessment";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email")?.toLowerCase().trim();

  if (!email) {
    return NextResponse.json({ data: null });
  }

  const record = await prisma.lastResult.findUnique({ where: { email } });

  if (!record) {
    return NextResponse.json({ data: null });
  }

  const data: LastResultRecord = {
    email: record.email,
    result: record.result as unknown as AssessmentResult,
    savedAt: record.savedAt.toISOString(),
  };

  return NextResponse.json({ data });
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as {
    email?: string;
    result?: AssessmentResult;
  };

  const email = body.email?.toLowerCase().trim();

  if (!email || !body.result) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await prisma.lastResult.upsert({
    where: { email },
    update: {
      result: body.result as unknown as Prisma.JsonObject,
    },
    create: {
      email,
      result: body.result as unknown as Prisma.JsonObject,
    },
  });

  return NextResponse.json({ ok: true });
}
