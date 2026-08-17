"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTransaction(data: {
  title: string;
  amount: number;
  type: string;
  category: string;
  date?: string;
  note?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const { title, amount, type, category, date, note } = data;

  if (!title || !amount || !type || !category) {
    throw new Error("Missing required fields.");
  }

  if (!["income", "expense"].includes(type)) {
    throw new Error("type must be 'income' or 'expense'.");
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: session.user.id,
      title,
      amount: amount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      note,
    },
  });

  revalidatePath("/dashboard");
  return transaction;
}

export async function getTransactions(type?: string, category?: string, limit: number = 50) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  return await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(type && { type }),
      ...(category && { category }),
    },
    orderBy: { date: "desc" },
    take: limit,
  });
}
