import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { subDays, eachDayOfInterval } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.transaction.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("123456", 10);

  const user = await prisma.user.create({
    data: {
      email: "irahulkv@gmail.com",
      password: passwordHash,
      name: "Rahul Kumar",
      onboardingCompleted: true,
      salaryDate: "01",
    },
  });

  console.log(`Created user: ${user.email}`);

  // 🏦 Create Accounts (Payment Hub)
  const accounts = [
    { name: "UPI (Primary)", type: "Wallet", balance: 82450 },
    { name: "HDFC Savings", type: "Bank", balance: 145000 },
    { name: "Amex Gold", type: "Credit", balance: -12500 },
    { name: "Cash", type: "Wallet", balance: 8700 },
  ];

  for (const acc of accounts) {
    await prisma.account.create({
      data: { ...acc, userId: user.id },
    });
  }

  // 🎯 Create Goals
  const goals = [
    { title: "Goa Trip 2024", targetAmount: 50000, currentAmount: 18000, icon: "Plane", deadline: new Date("2024-06-30") },
    { title: "Emergency Fund", targetAmount: 500000, currentAmount: 120000, icon: "Target", deadline: new Date("2024-12-31") },
    { title: "New SUV", targetAmount: 1500000, currentAmount: 200000, icon: "Car", deadline: new Date("2025-10-15") },
  ];

  for (const goal of goals) {
    await prisma.goal.create({
      data: { ...goal, userId: user.id },
    });
  }

  // 🧾 Create Bills
  const bills = [
    { title: "SBI Home Loan EMI", amount: 45000, dueDate: new Date("2026-03-25"), category: "EMI", status: "unpaid", icon: "Home" },
    { title: "Electricity Bill", amount: 2400, dueDate: new Date("2026-03-20"), category: "Utility", status: "unpaid", icon: "Zap" },
    { title: "Netflix Premium", amount: 649, dueDate: new Date("2026-03-23"), category: "Subscription", status: "unpaid", icon: "Tv" },
    { title: "Airtel Postpaid", amount: 1299, dueDate: new Date("2026-03-08"), category: "Utility", status: "paid", icon: "Phone" },
  ];

  for (const bill of bills) {
    await prisma.bill.create({
      data: { ...bill, userId: user.id },
    });
  }

  // 📊 Create Transactions for last 30 days
  const today = new Date();
  const thirtyDaysAgo = subDays(today, 30);
  
  const intervals = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

  const categories = [
    { name: "Food & Drinks", amount: [100, 800], type: "expense" },
    { name: "Shopping", amount: [500, 3000], type: "expense" },
    { name: "Transport", amount: [50, 400], type: "expense" },
    { name: "Salary", amount: [150000, 150000], type: "income" },
    { name: "Investment", amount: [1000, 5000], type: "expense" },
    { name: "Miscellaneous", amount: [20, 200], type: "expense" },
  ];

  for (const day of intervals) {
    // Random number of transactions per day (0 to 3)
    const txCount = Math.floor(Math.random() * 4);
    
    // Monthly salary on the 1st
    if (day.getDate() === 1) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          title: "Monthly Salary Credit",
          amount: 150000,
          type: "income",
          category: "Salary",
          date: day,
        }
      });
    }

    for (let i = 0; i < txCount; i++) {
      const isExpense = Math.random() > 0.1; // 90% chance it's an expense
      const possibleCats = categories.filter(c => c.type === (isExpense ? "expense" : "income"));
      const cat = possibleCats[Math.floor(Math.random() * possibleCats.length)];
      
      const amount = Math.floor(Math.random() * (cat.amount[1] - cat.amount[0] + 1)) + cat.amount[0];

      await prisma.transaction.create({
        data: {
          userId: user.id,
          title: `${cat.name} Payment`,
          amount,
          type: isExpense ? "expense" : "income",
          category: cat.name,
          date: day,
        }
      });
    }
  }

  // 📅 Create Budgets for current month
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const budgetLimits = [
    { category: "Food & Drinks", limit: 15000 },
    { category: "Shopping", limit: 20000 },
    { category: "Transport", limit: 5000 },
    { category: "Miscellaneous", limit: 3000 },
  ];

  for (const b of budgetLimits) {
    await prisma.budget.create({
      data: {
        ...b,
        userId: user.id,
        month,
        year,
      }
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
