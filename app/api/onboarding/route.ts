import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";
import { auth } from "@/auth";

// The onboarding system prompt — friendly, conversational, data-collecting
const ONBOARDING_PROMPT = `You are Expensify AI, a warm and friendly financial assistant.
You are running a 5-step onboarding flow for a new user. Ask exactly ONE question at a time and WAIT for the user's answer. Do not ask the next question until the user has answered the current one. Give a brief, encouraging acknowledgement before asking the next question.

Step 1 – Income: Ask "What is your approximate monthly income or salary?"
Step 2 – Credit Card Spending: Ask "Do you have any credit cards? If yes, how much have you spent so far this month?"
Step 3 – Major Expenses: Ask "What are some major expenses you've had this month? (for example rent, groceries, transport, subscriptions etc.)"
Step 4 – Investments or Savings: Ask "Do you invest or save money monthly? For example SIP, mutual funds, or savings."
Step 5 – Financial Goal: Ask "What is your main goal with this app?" (Examples: track expenses, save more money, reduce unnecessary spending)

Rules:
- Be warm, encouraging, and conversational — not robotic
- Use ₹ for currency

Once the user has answered Step 5, end with: "Great! I have everything I need. Let me get your dashboard ready for you! 🎉" 
AND output a JSON block on its own line exactly like this:
ONBOARD:{"income":{"amount":<number>,"title":"<title>"},"transactions":[{"title":"<name>","amount":<number>,"type":"<expense>","category":"<category>"}],"investments":[{"title":"<name>","amount":<number>}],"goal":"<user goal>"}

Categories inside transactions: Food, Transport, Entertainment, Utilities, Shopping, Health, Education, Travel, Other, Credit Card.
Do NOT include the ONBOARD JSON until you have collected answers for all 5 steps!`;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.onboardingCompleted) {
    return NextResponse.json({ completed: true });
  }

  const history = user.onboardingState ? JSON.parse(user.onboardingState) : [];
  return NextResponse.json({ completed: false, history, userName: user.name || "there" });
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = session.user.id;

    const { message, history = [], userName } = await req.json();

    const apiKey = process.env.GROQ_API_KEY;
    let responseText: string;

    // Build the first message if history is empty (welcome greeting)
    const isFirstMessage = history.length === 0 && !message;
    if (isFirstMessage) {
      responseText = `Hey ${userName || "there"}! 👋 Welcome to **Expensify AI** — I'm so excited you're here!\n\nTo get your dashboard ready, I just need a couple of quick details. Let's start with the fun part — **what's your monthly income or salary?** (Just a rough number is totally fine!)`;
      
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingState: JSON.stringify([{ role: "assistant", content: responseText }]) },
      });

      return NextResponse.json({ reply: responseText, done: false });
    }

    if (!apiKey) {
      // Simple fallback without Gemini
      responseText = getFallbackResponse(message, history.length);
    } else {
      const groq = new Groq({ apiKey });

      const messages = [
        { role: "system", content: ONBOARDING_PROMPT },
        ...history.map((h: { role: string; content: string }) => ({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content || " ",
        })),
        { role: "user", content: message },
      ];

      const result = await groq.chat.completions.create({
        messages: messages as Parameters<typeof groq.chat.completions.create>[0]["messages"],
        model: "llama-3.3-70b-versatile",
      });

      responseText = result.choices[0]?.message?.content || "";
    }

    // Check if Gemini signaled it's done collecting data
    const onboardMatch = responseText.match(/ONBOARD:(\{[\s\S]+?\})\s*$/m);
    if (onboardMatch) {
      try {
        const parsed = JSON.parse(onboardMatch[1]);

        // Save transactions to DB
        const txsToCreate = parsed.transactions || [];
        if (txsToCreate.length > 0) {
          await prisma.transaction.createMany({
            data: txsToCreate.map((t: { title: string; amount: number; type: string; category: string }) => ({
              userId,
              title: t.title,
              amount: Number(t.amount) || 0,
              type: t.type || "expense",
              category: t.category || "Other",
              date: new Date(),
            })),
          });
        }

        // Save Income
        if (parsed.income && parsed.income.amount) {
          await prisma.transaction.create({
            data: {
              userId,
              title: parsed.income.title || "Monthly Salary",
              amount: Number(parsed.income.amount),
              type: "income",
              category: "Salary",
              date: new Date(),
            }
          });
        }

        // Save Investments
        const investmentsToCreate = parsed.investments || [];
        if (investmentsToCreate.length > 0) {
          await prisma.transaction.createMany({
            data: investmentsToCreate.map((i: { title: string; amount: number }) => ({
              userId,
              title: i.title || "Investment",
              amount: Number(i.amount) || 0,
              type: "expense",
              category: "Investment",
              date: new Date(),
            })),
          });
        }

        // Mark user as onboarding done + save goal
        await prisma.user.update({
          where: { id: userId },
          data: { 
            onboardingCompleted: true,
            onboardingState: null,
            goal: parsed.goal || "Track expenses",
          },
        });

        const cleanReply = responseText.replace(/ONBOARD:\{[\s\S]+?\}\s*$/m, "").trim();
        return NextResponse.json({ reply: cleanReply, done: true });
      } catch (e) {
        console.error("[ONBOARD parse error]", e);
      }
    }

    // Save intermediate matching state
    const newHistory = [
      ...history,
      { role: "user", content: message },
      { role: "assistant", content: responseText }
    ];
    await prisma.user.update({
      where: { id: userId },
      data: { onboardingState: JSON.stringify(newHistory) },
    });

    return NextResponse.json({ reply: responseText, done: false });
  } catch (err: unknown) {
    console.error("[POST /api/onboarding]", err);
    return NextResponse.json({ 
      error: (err as Error)?.message || "Service error." 
    }, { status: 500 });
  }
}

// Minimal rule-based fallback
function getFallbackResponse(message: string, step: number): string {
  const lower = message.toLowerCase();
  const amount = message.match(/\d[\d,]*/)?.[0];

  if (step <= 1) {
    return `That's great! ₹${amount || "that amount"} is a solid income 💪 Secondly, do you have any credit cards? If yes, how much have you spent on them this month?`;
  }
  if (step <= 3) {
    return "Got it! What are some major expenses you've had this month? (for example rent, groceries, transport, subscriptions etc.)";
  }
  if (step <= 5) {
    return "Do you invest or save money monthly? For example SIP, mutual funds, or savings.";
  }
  if (step <= 7) {
    return "What is your main goal with this app?";
  }
  
  const income = 50000;
  return "Great! I have everything I need. Let me get your dashboard ready for you! 🎉\\n\\nONBOARD:{\"income\":{\"amount\":" + income + ",\"title\":\"Monthly Salary\"},\"transactions\":[{\"title\":\"Credit Card\",\"amount\":5000,\"type\":\"expense\",\"category\":\"Credit Card\"},{\"title\":\"Rent\",\"amount\":15000,\"type\":\"expense\",\"category\":\"Rent\"}],\"investments\":[{\"title\":\"Mutual Funds\",\"amount\":5000}],\"goal\":\"Save Money\"}";
}
