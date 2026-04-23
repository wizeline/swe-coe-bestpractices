import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  await prisma.submission.deleteMany({
    where: { id },
  });

  return NextResponse.json({ ok: true });
}
