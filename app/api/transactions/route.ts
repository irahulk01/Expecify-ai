import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/transactions — fetch all transactions for the logged-in user
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type"); // "income" | "expense" | null
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") ?? "50");

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(type && { type }),
      ...(category && { category }),
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  return NextResponse.json({ transactions });
}

// POST /api/transactions — create a new transaction
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, amount, type, category, date, note } = await req.json();

    if (!title || !amount || !type || !category) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "type must be 'income' or 'expense'." }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        title,
        amount: parseFloat(amount),
        type,
        category,
        date: date ? new Date(date) : new Date(),
        note,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/transactions]", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
