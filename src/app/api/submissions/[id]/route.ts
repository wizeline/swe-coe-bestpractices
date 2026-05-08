import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const email = session?.user?.email?.toLowerCase().trim();
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  await prisma.submission.deleteMany({
    where: { id, email },
  });

  return NextResponse.json({ ok: true });
}
