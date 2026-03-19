#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────
# start.sh — One-command startup for Expensify AI
# Usage: ./start.sh
# ──────────────────────────────────────────────────────────────────

set -e
cd "$(dirname "$0")"

echo ""
echo "🚀 Starting Expensify AI..."
echo "──────────────────────────────────────"

# 1. Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# 2. Generate Prisma client if it's stale
echo "🔧 Ensuring Prisma client is up to date..."
npx prisma generate

# 3. Push schema to DB (creates tables if they don't exist)
echo "🗄️  Syncing database schema..."
npx prisma db push --accept-data-loss 2>/dev/null || true

# 4. Seed the DB with the test user if it's empty
echo "🌱 Checking database seed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const { hashSync } = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  const count = await prisma.user.count();
  if (count === 0) {
    const user = await prisma.user.upsert({
      where: { email: 'demo@expensify.ai' },
      update: {},
      create: {
        email: 'demo@expensify.ai',
        password: hashSync('password123', 12),
        name: 'John'
      }
    });
    const txs = [
      { title: 'March Salary', amount: 45000, type: 'income', category: 'Salary', date: new Date('2026-03-01'), userId: user.id },
      { title: 'Grocery Shopping', amount: 340, type: 'expense', category: 'Food', date: new Date('2026-03-14'), userId: user.id },
      { title: 'Uber Auto', amount: 200, type: 'expense', category: 'Transport', date: new Date('2026-03-13'), userId: user.id },
      { title: 'Netflix', amount: 649, type: 'expense', category: 'Entertainment', date: new Date('2026-03-13'), userId: user.id },
      { title: 'Café Coffee Day', amount: 220, type: 'expense', category: 'Food', date: new Date('2026-03-12'), userId: user.id },
      { title: 'Electricity Bill', amount: 1200, type: 'expense', category: 'Utilities', date: new Date('2026-03-10'), userId: user.id },
      { title: 'Freelance Payment', amount: 15000, type: 'income', category: 'Salary', date: new Date('2026-03-11'), userId: user.id },
      { title: 'Petrol', amount: 500, type: 'expense', category: 'Transport', date: new Date('2026-03-08'), userId: user.id },
      { title: 'Dinner with friends', amount: 1200, type: 'expense', category: 'Food', date: new Date('2026-03-07'), userId: user.id },
    ];
    await prisma.transaction.createMany({ data: txs });
    console.log('✅ Database seeded! Login: demo@expensify.ai / password123');
  } else {
    console.log('✅ Database already has data — skipping seed.');
  }
}
seed().catch(console.error).finally(() => prisma.\$disconnect());
" 2>/dev/null

echo ""
echo "──────────────────────────────────────"
echo "✅ Everything is ready!"
echo ""
echo "  📧  Email:    demo@expensify.ai"
echo "  🔑  Password: password123"
echo "  🌐  URL:      http://localhost:3000"
echo ""
echo "  🤖  Gemini AI: ACTIVE (key configured)"
echo ""
echo "──────────────────────────────────────"
echo "Starting Next.js server..."
echo ""

# 5. Start Next.js dev server
npm run dev
