export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Groq } from "groq-sdk";

export async function POST(req: NextRequest) {
  try {
    let userId: string | undefined = undefined;
    try {
      const session = await auth();
      userId = session?.user?.id;
    } catch {
      // Guest or unauthenticated landing page demo user
    }

    const { messages, demoCount = 0 } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    // Demo limit enforcement for unauthenticated users (Max 10 demo queries)
    if (!userId && demoCount >= 10) {
      const encoder = new TextEncoder();
      const limitMessage = `🚀 **Demo Limit Reached (10/10)**\n\nYou've experienced 10 interactive AI demo questions! Create your free account now to unlock unlimited automatic expense tracking, debt management, and real-time bank ledger sync.`;

      const customStream = new ReadableStream({
        async start(controller) {
          const words = limitMessage.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise((r) => setTimeout(r, 15));
          }
          controller.close();
        },
      });

      return new Response(customStream, {
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
      });
    }

    const lastMessage = messages[messages.length - 1]?.content || "";
    const apiKey = process.env.GROQ_API_KEY;

    let txContext = "No recent transactions logged.";
    let salaryContext = "Salary Date: Not set.";
    let goalContext = "Goal: Not set.";
    let debtContext = "No active debts.";

    if (userId) {
      const [user, debts] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: { transactions: { orderBy: { date: "desc" }, take: 15 } },
        }),
        prisma.debt.findMany({ where: { userId } }),
      ]);

      if (user) {
        txContext =
          user.transactions
            .map(
              (t: any) =>
                `[${t.date.toLocaleDateString()}] ${t.title} (${t.category}): ₹${t.amount} [${t.type}]`
            )
            .join("\n") || txContext;
        salaryContext = user.salaryDate ? `Salary Date: ${user.salaryDate}` : salaryContext;
        goalContext = user.goal ? `Financial Goal: ₹${user.goal}` : goalContext;
      }
      if (debts && debts.length > 0) {
        debtContext = debts
          .map((d: any) => `${d.title}: ₹${d.remainingAmount} remaining of ₹${d.totalAmount}`)
          .join("\n");
      }
    }

    // System prompt for strict financial-only assistant
    const systemPrompt = `You are Expecify AI (monityai.com), a dedicated personal finance & expense tracking assistant.

CRITICAL SCOPE RULE (STRICT ENFORCEMENT):
- You MUST ONLY answer questions related to personal finance, expenses, income, budgeting, debt management, savings, and money management.
- DO NOT answer random trivia, general knowledge, history, geography, coding, politics, or unrelated topics (e.g. "Who is Mahatma Gandhi?", "Capital of France").
- If the user asks ANY non-financial or off-topic question, you MUST DECLINE politely with this EXACT message:
  "🔒 I am Expecify AI, your dedicated financial assistant! I can only help with expense tracking, budgeting, income, debts, and money management. Try asking: *Spent ₹450 on Dinner* or *What is my safe-to-spend balance?* 🚀"

User Financial Context:
- ${salaryContext}
- ${goalContext}
- Active Debts: ${debtContext}
- Recent Transactions:
${txContext}

Formatting Instructions:
- Format transaction confirmations clearly:
  ✅ **Transaction Logged Successfully**
  • **Amount:** ₹350
  • **Category:** Food & Dining 🍕
  • **Status:** Confirmed
- DO NOT use markdown tables or pipe (|) characters. Use clean bold bullet lists.
- Format currency with ₹ (INR). Be extremely fast and concise.`;

    const encoder = new TextEncoder();

    if (apiKey) {
      try {
        const groq = new Groq({ apiKey });
        const formattedMessages = messages.filter(
          (m: any) => m.role === "user" || m.role === "assistant"
        );

        const groqStream = await groq.chat.completions.create({
          model: "openai/gpt-oss-20b",
          messages: [{ role: "system", content: systemPrompt }, ...formattedMessages],
          stream: true,
        });

        const stream = new ReadableStream({
          async start(controller) {
            for await (const chunk of groqStream) {
              const content = chunk.choices[0]?.delta?.content || "";
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        });
      } catch (err) {
        console.warn("[GROQ_STREAM_FALLBACK] Groq call failed, serving fallback stream.", err);
      }
    }

    // Fallback simulated stream for offline / dev demo
    const fallbackResponse = getSimulatedResponse(lastMessage);
    const customStream = new ReadableStream({
      async start(controller) {
        const words = fallbackResponse.split(" ");
        for (const word of words) {
          controller.enqueue(encoder.encode(word + " "));
          await new Promise((r) => setTimeout(r, 20));
        }
        controller.close();
      },
    });

    return new Response(customStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error: any) {
    console.error("[STREAM_AI_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Streaming Error", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

function getSimulatedResponse(input: string): string {
  const text = input.toLowerCase();

  // Strict check for off-topic non-financial questions
  const isFinancial =
    text.includes("spent") ||
    text.includes("buy") ||
    text.includes("bought") ||
    text.includes("lunch") ||
    text.includes("food") ||
    text.includes("dinner") ||
    text.includes("coffee") ||
    text.includes("rupees") ||
    text.includes("₹") ||
    text.includes("salary") ||
    text.includes("income") ||
    text.includes("balance") ||
    text.includes("budget") ||
    text.includes("debt") ||
    text.includes("bill") ||
    text.includes("emi") ||
    text.includes("pay") ||
    text.includes("savings") ||
    text.includes("goal") ||
    /\d+/.test(text);

  if (
    !isFinancial &&
    (text.includes("who") ||
      text.includes("what") ||
      text.includes("where") ||
      text.includes("why") ||
      text.includes("gandhi") ||
      text.includes("president") ||
      text.includes("capital") ||
      text.includes("code") ||
      text.includes("history"))
  ) {
    return `🔒 **Expecify AI Focus Notice**\n\nI am **Expecify AI**, your dedicated personal finance assistant! I can only assist with expense tracking, budgeting, income, debts, and money management.\n\nTry asking:\n• **Log Expense:** *"Spent ₹450 on Dinner"*\n• **Check Balance:** *"What is my safe-to-spend balance?"*\n• **Set Salary:** *"Set salary date to 1st"* 🚀`;
  }

  if (
    text.includes("lunch") ||
    text.includes("food") ||
    text.includes("dinner") ||
    text.includes("coffee") ||
    text.includes("spent") ||
    text.includes("₹") ||
    /\d+/.test(text)
  ) {
    const match = input.match(/(\d+)/);
    const amount = match ? match[1] : "350";
    return `✅ **Transaction Logged Successfully**\n\n• **Amount:** ₹${Number(amount).toLocaleString("en-IN")}\n• **Category:** Food & Dining 🍕\n• **Status:** Confirmed\n\nYour updated monthly spending has been calculated. What else can I help you track today? ✨`;
  }

  if (text.includes("salary") || text.includes("income")) {
    return `✨ **Salary & Income Summary**\n\n• **Monthly Inflow:** ₹85,000\n• **Safe-to-Spend Balance:** ₹52,500\n• **Status:** Active & Tracked\n\nYou have ₹52,500 remaining safe-to-spend after upcoming bills and savings targets! 🚀`;
  }

  if (text.includes("balance") || text.includes("budget") || text.includes("safe")) {
    return `📊 **Safe-to-Spend Balance Summary**\n\n• **Current Bank Balance:** ₹64,200\n• **Upcoming Bills:** ₹11,700\n• **Remaining Safe-to-Spend:** ₹52,500\n\nYou are on track for your monthly budget goal! 🎯`;
  }

  return `Hello! 👋 I'm **Expecify AI**, your dedicated money companion.\n\n• **Log Expenses:** Spent 350 on Dinner\n• **Track Balance:** What is my safe-to-spend balance?\n• **Manage Salary:** Set salary date to 1st\n\nTry typing a financial query below!`;
}
