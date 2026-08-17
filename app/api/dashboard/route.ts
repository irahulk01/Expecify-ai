import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30";

  let dateFilter = {};
  const days = parseInt(range);
  if (!isNaN(days)) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    dateFilter = { date: { gte: d } };
  }

  try {
    // 1. Fetch User and core relations
    const [user, transactions, bills, goals, accounts, budgets, debts] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.transaction.findMany({
        where: { userId, ...dateFilter },
        orderBy: { date: "desc" },
      }),
      prisma.bill.findMany({ where: { userId } }),
      prisma.goal.findMany({ where: { userId } }),
      prisma.bankAccount.findMany({ where: { userId: userId } }),
      prisma.budget.findMany({ where: { userId } }),
      prisma.debt.findMany({ where: { userId } }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate totals
    const totalIncome = transactions
      .filter((tx: any) => tx.type === "income")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const totalExpenses = transactions
      .filter((tx: any) => tx.type === "expense")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const totalBalance = (accounts as any[]).reduce(
      (sum: number, acc: any) => sum + acc.balance,
      0
    );
    const monthlySavings = (goals as any[]).reduce(
      (sum: number, g: any) => sum + g.currentAmount,
      0
    );
    const totalDebt = (debts as any[]).reduce((sum: number, d: any) => sum + d.remainingAmount, 0);

    // Today's stats
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    transactions
      .filter((tx: any) => tx.type === "expense")
      .forEach((tx: any) => {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      });

    const categoryColors = [
      "bg-orange-400",
      "bg-cyan-400",
      "bg-yellow-400",
      "bg-red-400",
      "bg-indigo-400",
      "bg-emerald-400",
    ];
    const categories = Object.entries(categoryTotals)
      .map(([label, amount], i) => ({
        label,
        amount,
        value: Math.round((amount / (totalExpenses || 1)) * 100),
        color: categoryColors[i % categoryColors.length],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Chart Data: Last 7 Days
    const sevenDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return {
        name: d.toLocaleDateString("en-IN", { weekday: "short" }),
        amount: 0,
        fullDate: d.toDateString(),
      };
    });

    transactions
      .filter((tx: any) => tx.type === "expense")
      .forEach((tx: any) => {
        const txDate = new Date(tx.date).toDateString();
        const idx = sevenDays.findIndex((d) => d.fullDate === txDate);
        if (idx !== -1) sevenDays[idx].amount += tx.amount;
      });

    // Chart Data: Last 6 Months
    const sixMonths = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        name: d.toLocaleDateString("en-IN", { month: "short" }),
        amount: 0,
        month: d.getMonth(),
        year: d.getFullYear(),
      };
    });

    // We'd need more data for 6 months, but let's summarize what we have
    const allTimeTx = await prisma.transaction.findMany({
      where: { userId, type: "expense" },
    });

    allTimeTx.forEach((tx: any) => {
      const txDate = new Date(tx.date);
      const idx = sixMonths.findIndex(
        (m) => m.month === txDate.getMonth() && m.year === txDate.getFullYear()
      );
      if (idx !== -1) sixMonths[idx].amount += tx.amount;
    });

    return NextResponse.json({
      metrics: {
        totalBalance,
        totalIncome,
        totalExpenses,
        monthlySavings,
        totalDebt,
        categories,
        charts: {
          daily: sevenDays.map((d) => ({ name: d.name, amount: d.amount })),
          monthly: sixMonths.map((m) => ({ name: m.name, amount: m.amount })),
        },
      },
      transactions,
      bills,
      goals,
      accounts,
      debts,
      user: {
        name: user.name || "User",
      },
    });
  } catch (err) {
    console.error("[GET /api/dashboard]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
