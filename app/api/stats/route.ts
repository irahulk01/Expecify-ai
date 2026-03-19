import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// GET /api/stats — aggregated financial stats for the logged-in user
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const [allTransactions, monthlyTransactions, last14Days] = await Promise.all([
    prisma.transaction.findMany({ where: { userId } }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: startOfMonth } },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: fourteenDaysAgo } },
      orderBy: { date: "asc" },
    }),
  ]);

  // Total balance (income - expenses)
  const totalBalance = allTransactions.reduce(
    (acc, t) => acc + (t.type === "income" ? t.amount : -t.amount),
    0
  );

  // Monthly figures
  const monthlyIncome = monthlyTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  // Spending by category (expenses only)
  const categoryMap: Record<string, number> = {};
  monthlyTransactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      categoryMap[t.category] = (categoryMap[t.category] ?? 0) + t.amount;
    });

  const categoryBreakdown = Object.entries(categoryMap)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  // Daily trend for last 14 days
  const trendMap: Record<string, number> = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    trendMap[d.toISOString().split("T")[0]] = 0;
  }
  last14Days
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const day = new Date(t.date).toISOString().split("T")[0];
      if (trendMap[day] !== undefined) trendMap[day] += t.amount;
    });

  const spendingTrend = Object.entries(trendMap).map(([date, amount]) => ({
    date,
    amount,
  }));

  return NextResponse.json({
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    categoryBreakdown,
    spendingTrend,
    recentTransactions: last14Days.slice(-6).reverse(),
  });
}
