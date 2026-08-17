import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const p = prisma as any;
    const debtModel = p.debt || p.Debt;
    if (!debtModel) return NextResponse.json([], { status: 200 });

    const debts = await debtModel.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(debts);
  } catch (error) {
    console.error("[DEBTS_GET]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, category, totalAmount } = body;

    const p = prisma as any;
    const debtModel = p.debt || p.Debt;

    if (!debtModel) return NextResponse.json({ error: "Model missing" }, { status: 500 });

    const debt = await debtModel.create({
      data: {
        userId: session.user.id,
        title,
        category,
        totalAmount: Number(totalAmount),
        remainingAmount: Number(totalAmount),
      },
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error("[DEBTS_POST]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Debt ID required" }, { status: 400 });
    }

    const p = prisma as any;
    const debtModel = p.debt || p.Debt;

    if (!debtModel) return NextResponse.json({ error: "Model missing" }, { status: 500 });

    const debt = await debtModel.delete({
      where: {
        id: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(debt);
  } catch (error) {
    console.error("[DEBTS_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
