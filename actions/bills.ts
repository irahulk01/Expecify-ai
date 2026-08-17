"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function payBill(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const bill = await prisma.bill.findUnique({
    where: { id, userId: session.user.id },
  });

  if (!bill) {
    throw new Error("Bill not found");
  }

  const updatedBill = await prisma.bill.update({
    where: { id },
    data: { status: "paid" },
  });

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

  revalidatePath("/dashboard");
  return updatedBill;
}
