import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

// GET /api/seed — dev-only seeding endpoint
// Disable or remove this in production!
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production." }, { status: 403 });
  }

  try {
    const hashedPw = await hash("password123", 12);

    const user = await prisma.user.upsert({
      where: { email: "demo@expensify.ai" },
      update: {},
      create: { email: "demo@expensify.ai", password: hashedPw, name: "John" },
    });

    // Only seed transactions if there are none yet
    const existingCount = await prisma.transaction.count({ where: { userId: user.id } });
    let seeded = 0;

    if (existingCount === 0) {
      const txs = [
        { title: "March Salary", amount: 45000, type: "income", category: "Salary", date: new Date("2026-03-01") },
        { title: "Grocery Shopping", amount: 340, type: "expense", category: "Food", date: new Date("2026-03-14") },
        { title: "Uber Auto", amount: 200, type: "expense", category: "Transport", date: new Date("2026-03-13") },
        { title: "Netflix", amount: 649, type: "expense", category: "Entertainment", date: new Date("2026-03-13") },
        { title: "Café Coffee Day", amount: 220, type: "expense", category: "Food", date: new Date("2026-03-12") },
        { title: "Electricity Bill", amount: 1200, type: "expense", category: "Utilities", date: new Date("2026-03-10") },
        { title: "Freelance Payment", amount: 15000, type: "income", category: "Salary", date: new Date("2026-03-11") },
        { title: "Petrol", amount: 500, type: "expense", category: "Transport", date: new Date("2026-03-08") },
        { title: "Dinner with friends", amount: 1200, type: "expense", category: "Food", date: new Date("2026-03-07") },
      ];

      for (const tx of txs) {
        await prisma.transaction.create({ data: { ...tx, userId: user.id } });
      }
      seeded = txs.length;
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      transactionsSeeded: seeded,
      message: seeded > 0 ? `Seeded ${seeded} transactions` : "User already had transactions — skipped.",
    });
  } catch (err) {
    console.error("[SEED]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
