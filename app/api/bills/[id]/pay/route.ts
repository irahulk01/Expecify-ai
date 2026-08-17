import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const bill = await (prisma as any).bill.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!bill) {
      return NextResponse.json({ error: "Bill not found" }, { status: 404 });
    }

    // Update bill status
    const updatedBill = await (prisma as any).bill.update({
      where: { id },
      data: { status: "paid" },
    });

    // Create a transaction for this payment
    await prisma.transaction.create({
      data: {
        userId: session.user.id,
        title: `Payment: ${bill.title}`,
        amount: bill.amount,
        type: "expense",
        category: bill.category,
        date: new Date(),
      },
    });

    return NextResponse.json(updatedBill);
  } catch (err) {
    console.error("[POST /api/bills/[id]/pay]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
