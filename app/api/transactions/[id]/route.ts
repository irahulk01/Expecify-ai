import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/transactions/:id
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(body.title && { title: body.title }),
      ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
      ...(body.type && { type: body.type }),
      ...(body.category && { category: body.category }),
      ...(body.note !== undefined && { note: body.note }),
      ...(body.date && { date: new Date(body.date) }),
    },
  });

  return NextResponse.json({ transaction: updated });
}

// DELETE /api/transactions/:id
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.transaction.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Transaction not found." }, { status: 404 });
  }

  await prisma.transaction.delete({ where: { id } });

  return NextResponse.json({ message: "Transaction deleted." });
}
