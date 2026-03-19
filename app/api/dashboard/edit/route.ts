import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.onboardingCompleted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, id } = await req.json();

    if (type === "transaction" || type === "income" || type === "investment") {
      await prisma.transaction.delete({ where: { id, userId: session.user.id } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/dashboard/edit]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || !user.onboardingCompleted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, id, title, amount } = await req.json();

    if (type === "transaction" || type === "income" || type === "investment") {
      await prisma.transaction.update({
        where: { id, userId: session.user.id },
        data: { title, amount: Number(amount) }
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/dashboard/edit]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
