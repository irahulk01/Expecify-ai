export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Groq } from "groq-sdk";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { messages, image, autoAdd } = await req.json();
    const message = messages[messages.length - 1].content;

    const apiKey = process.env.GROQ_API_KEY;
    let responseText = "";
    let dataAction = null;

    if (!apiKey) {
      responseText = getRuleBasedResponse(message);
    } else {
      const groq = new Groq({ apiKey });

      // Fetch user data and debts in parallel
      const [user, debts] = await Promise.all([
        prisma.user.findUnique({
          where: { id: session.user.id },
          include: {
            transactions: { orderBy: { date: "desc" }, take: 30 },
          },
        }),
        prisma.debt.findMany({
          where: { userId: session.user.id },
        }),
      ]);

      const txContext =
        user?.transactions
          ?.map(
            (t: any) =>
              `[ID: ${t.id}] ${t.date.toLocaleDateString()} - ${t.title} - ${t.category} - ₹${t.amount}`
          )
          .join("\n") || "No recent transactions.";

      const salaryContext = user?.salaryDate
        ? `Salary Date: ${user.salaryDate}`
        : "Salary Date: Not set.";
      const goalContext = user?.goal ? `Financial Goal: ${user.goal}` : "Goal: Not set.";
      const debtContext =
        (debts || [])
          .map(
            (d: any) =>
              `[Debt ID: ${d.id}] ${d.title} (${d.category}): Total ₹${d.totalAmount}, Remaining ₹${d.remainingAmount}`
          )
          .join("\n") || "No active debts.";

      const groqMessages = messages
        .filter((m: any) => m.role === "user" || m.role === "assistant")
        .map((m: any, index: number, arr: any[]) => {
          if (index === arr.length - 1 && image && m.role === "user") {
            return {
              role: m.role,
              content: [
                {
                  type: "text",
                  text: m.content || "Extract items from this receipt/checkout screenshot.",
                },
                { type: "image_url", image_url: { url: image } },
              ],
            };
          }
          return m;
        });

      const modelToUse = image ? "llama-3.2-11b-vision-preview" : "openai/gpt-oss-20b";

      const autoAddInstruction =
        autoAdd !== false
          ? "- CRITICAL: Auto-Add is ON. You MUST immediately extract the items, display the table, and append the JSON block 'info={...}' to log the transaction."
          : "- CRITICAL: Auto-Add is OFF. DO NOT append the JSON block to log the transaction yet. Display the Markdown table, show the total, and ask the user 'Would you like me to log this expense?'.";

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are monityai.com, a professional financial assistant. 
Your goal is to help users manage their finances by extracting actions from natural language.

User Financial Context:
- Salary Date: ${salaryContext}
- Financial Goal: ${goalContext}
- Active Debts:
${debtContext}
- Recent Transactions:
${txContext}

DIAGNOSTIC & LOGGING:
- If a user mentions a number without context (e.g., "55000"), look at the history. If you just asked about a debt or expense, assume it's for that.
- If context is completely missing, ask the user: "What is this ₹55,000 for..."
- If the user provides an IMAGE (receipt, screenshot, checkout cart), DO NOT ask for more context. Extract the items and the total price.
- If the text just says "checkout", look at the total amount in the image.
${autoAddInstruction}

FORMATTING RULES (CRITICAL):
- If the user provides a receipt or an image of items, ALWAYS output a beautiful Markdown table summarizing the items (e.g. | Item | Price |) before logging the transaction.
- Use emojis generously (🛒, 💸, 🧾, ✨) to make your response engaging and visually appealing.
- Be concise but friendly and professional.

CAPABILITIES & JSON ACTIONS:
To perform an action, you MUST append a JSON block 'info={...}' at the very end of your message.

1. **Log Transaction**: info={"action":"add_transaction","title":"...","amount":123.0,"type":"expense|income","category":"..."}
2. **Update Profile**: info={"action":"update_user","goal":"...","salaryDate":"..."}
3. **Add New Debt / EMI**: info={"action":"add_debt","title":"...","category":"Loan|Credit Card|EMI","totalAmount":1000,"paidAmount":0} (CRITICAL: If user says "EMI of X for Y months", calculate totalAmount = X * Y. Do NOT use add_transaction for creating an EMI, use add_debt instead.)
4. **Record Debt Payment**: info={"action":"update_debt_payment","id":"debt_id_here","paymentAmount":123.0}
5. **Update Account Balance**: info={"action":"update_account_balance","name":"Account Name","balance":123.0} (Use this for "Update my balance to..." or "Set my cash balance to...")
6. **Add Savings Goal**: info={"action":"add_goal","title":"...","targetAmount":1000,"currentAmount":0}
7. **Override Dashboard Metric**: info={"action":"override_metric","metric":"balance|income|spent|debt|savings","value":5000}

CRITICAL RULES:
- ALWAYS extract amounts as numbers. Do NOT include commas in the JSON numbers.
- If you record an action, start your response with "✅".
- If you are unsure, do NOT guess. Ask for clarification.
- Never output more than one info block.`,
          },
          ...groqMessages,
        ],
        model: modelToUse,
      });

      responseText = completion.choices[0].message.content || "";
      console.log("[AI_RAW_RESPONSE]", responseText);

      // Process actions - more robust regex
      const infoMatch = responseText.match(/info\s*=\s*(\{[\s\S]*?\})/i);
      if (infoMatch) {
        try {
          const parsed = JSON.parse(infoMatch[1]);
          const p = prisma as any;
          const accountModel = p.account || p.Account;
          const debtModel = p.debt || p.Debt;
          const transactionModel = p.transaction || p.Transaction;
          const userModel = p.user || p.User;

          let actionSuccess = false;
          let actionMessage = "";

          if (parsed.action === "add_transaction") {
            const amount = Number(parsed.amount);
            if (amount > 0) {
              const tx = await prisma.transaction.create({
                data: {
                  userId: session.user.id,
                  title: parsed.title,
                  amount: amount,
                  type: parsed.type,
                  category: parsed.category,
                },
              });
              actionSuccess = true;
              actionMessage = `Logged: ${tx.title} (₹${tx.amount})`;
            } else {
              actionSuccess = false;
              actionMessage = "Invalid amount: Entry must be greater than 0.";
            }
          } else if (parsed.action === "update_user") {
            const params: Record<string, string> = {};
            if (parsed.salaryDate) params.salaryDate = String(parsed.salaryDate);
            if (parsed.goal) params.goal = String(parsed.goal);

            if (Object.keys(params).length > 0) {
              await prisma.user.update({
                where: { id: session.user.id },
                data: params,
              });
              actionSuccess = true;
              actionMessage = "Profile updated";
            }
          } else if (parsed.action === "add_goal") {
            const goalModel = p.goal || p.Goal;
            if (goalModel) {
              const target = Number(parsed.targetAmount);
              const current = Number(parsed.currentAmount || 0);
              if (target > 0) {
                await goalModel.create({
                  data: {
                    userId: session.user.id,
                    title: parsed.title || "Savings Goal",
                    targetAmount: target,
                    currentAmount: current,
                  },
                });
                actionSuccess = true;
                actionMessage = `Saved Goal: ${parsed.title} (Target: ₹${target.toLocaleString("en-IN")})`;
              } else {
                actionSuccess = false;
                actionMessage = "Invalid amount: Target must be greater than 0.";
              }
            }
          } else if (parsed.action === "add_debt" && debtModel) {
            const total = Number(parsed.totalAmount);
            if (total > 0) {
              const paid = Number(parsed.paidAmount || 0);
              const remaining = Math.max(0, total - paid);

              await debtModel.create({
                data: {
                  userId: session.user.id,
                  title: String(parsed.title),
                  category: String(parsed.category || "Loan"),
                  totalAmount: total,
                  remainingAmount: remaining,
                },
              });
              actionSuccess = true;
              actionMessage = `Saved Debt: ${parsed.title} (₹${remaining.toLocaleString("en-IN")} remaining)`;
            } else {
              actionSuccess = false;
              actionMessage = "Invalid total amount: Debt must be greater than 0.";
            }
          } else if (parsed.action === "update_debt_payment" && parsed.id) {
            const paymentAmount = Number(parsed.paymentAmount);
            const debtModel = p.debt || p.Debt;

            if (debtModel) {
              const debt = await debtModel.findUnique({
                where: { id: parsed.id },
              });

              if (debt && paymentAmount > 0) {
                const newAmount = Math.max(0, debt.remainingAmount - paymentAmount);
                await debtModel.update({
                  where: { id: debt.id },
                  data: { remainingAmount: newAmount },
                });

                if (transactionModel) {
                  await transactionModel.create({
                    data: {
                      userId: session.user.id,
                      title: `Payment: ${debt.title}`,
                      amount: paymentAmount,
                      type: "expense",
                      category: "Debt",
                    },
                  });
                }
                actionSuccess = true;
                actionMessage = `Payment recorded for ${debt.title}`;
              } else {
                actionSuccess = false;
                actionMessage = "Debt not found or invalid payment amount.";
              }
            } else {
              actionSuccess = false;
              actionMessage = "Invalid payment or internal error.";
            }
          } else if (parsed.action === "update_account_balance") {
            const balance = Number(parsed.balance);
            if (accountModel) {
              // Better matching: if name is "primary balance" or similar, try to find "Primary" or "UPI"
              const searchName = parsed.name?.toLowerCase() || "";
              let account = null;

              const allAccounts = await accountModel.findMany({
                where: { userId: session.user.id },
              });

              if (searchName) {
                account = allAccounts.find(
                  (a: any) =>
                    a.name.toLowerCase().includes(searchName) ||
                    searchName.includes(a.name.toLowerCase()) ||
                    (searchName.includes("primary") && a.name.toLowerCase().includes("primary"))
                );
              }

              if (!account) {
                // Fallback: pick the one with "Primary" in name, or just the first one if searching for "primary|cash|account"
                if (
                  searchName.includes("primary") ||
                  searchName.includes("account") ||
                  !searchName
                ) {
                  account =
                    allAccounts.find((a: any) => a.name.toLowerCase().includes("primary")) ||
                    allAccounts[0];
                }
              }

              if (account) {
                await accountModel.update({
                  where: { id: account.id },
                  data: { balance: balance },
                });
                actionSuccess = true;
                actionMessage = `Updated balance for ${account.name}: ₹${balance.toLocaleString("en-IN")}`;
              } else {
                // Create if not exists
                await accountModel.create({
                  data: {
                    userId: session.user.id,
                    name: parsed.name || "Primary Account",
                    balance: balance,
                    type: "Bank",
                  },
                });
                actionSuccess = true;
                actionMessage = `Created account ${parsed.name || "Primary Account"} with balance ₹${balance.toLocaleString("en-IN")}`;
              }
            }
          } else if (parsed.action === "override_metric") {
            const metric = parsed.metric;
            const value = Number(parsed.value);
            const uId = session.user.id;

            if (metric === "balance" && accountModel) {
              const allAccounts = await accountModel.findMany({ where: { userId: uId } });
              const currentTotal = allAccounts.reduce((s: number, a: any) => s + a.balance, 0);
              const diff = value - currentTotal;
              if (diff !== 0) {
                let primary =
                  allAccounts.find((a: any) => a.name.toLowerCase().includes("primary")) ||
                  allAccounts[0];
                if (primary) {
                  await accountModel.update({
                    where: { id: primary.id },
                    data: { balance: primary.balance + diff },
                  });
                } else {
                  await accountModel.create({
                    data: { userId: uId, name: "Primary Balance", balance: value, type: "Bank" },
                  });
                }
              }
              actionSuccess = true;
              actionMessage = `Total Balance overridden to ₹${value.toLocaleString("en-IN")}`;
            } else if (metric === "income" && transactionModel) {
              // The dashboard calculates income/spent over a 30-day window
              const d = new Date();
              d.setDate(d.getDate() - 30);
              const allInc = await transactionModel.findMany({
                where: { userId: uId, type: "income", date: { gte: d } },
              });
              const curInc = allInc.reduce((s: number, t: any) => s + t.amount, 0);
              const diff = value - curInc;
              if (diff !== 0) {
                await transactionModel.create({
                  data: {
                    userId: uId,
                    title: "Income Adjustment",
                    amount: diff,
                    type: "income",
                    category: "Adjustment",
                    date: new Date(),
                  },
                });
              }
              actionSuccess = true;
              actionMessage = `Monthly Income overridden to ₹${value.toLocaleString("en-IN")}`;
            } else if (metric === "spent" && transactionModel) {
              // The dashboard calculates income/spent over a 30-day window
              const d = new Date();
              d.setDate(d.getDate() - 30);
              const allExp = await transactionModel.findMany({
                where: { userId: uId, type: "expense", date: { gte: d } },
              });
              const curExp = allExp.reduce((s: number, t: any) => s + t.amount, 0);
              const diff = value - curExp;
              if (diff !== 0) {
                await transactionModel.create({
                  data: {
                    userId: uId,
                    title: "Expense Adjustment",
                    amount: diff,
                    type: "expense",
                    category: "Adjustment",
                    date: new Date(),
                  },
                });
              }
              actionSuccess = true;
              actionMessage = `Total Spent overridden to ₹${value.toLocaleString("en-IN")}`;
            } else if (metric === "debt" && p.debt) {
              const dModel = p.debt || p.Debt;
              const allDebts = await dModel.findMany({ where: { userId: uId } });
              const curDebt = allDebts.reduce((s: number, d: any) => s + d.remainingAmount, 0);
              const diff = value - curDebt;
              if (diff !== 0) {
                if (allDebts.length > 0) {
                  const first = allDebts[0];
                  await dModel.update({
                    where: { id: first.id },
                    data: { remainingAmount: Math.max(0, first.remainingAmount + diff) },
                  });
                } else {
                  await dModel.create({
                    data: {
                      userId: uId,
                      title: "Debt Adjustment",
                      category: "Loan",
                      totalAmount: value,
                      remainingAmount: value,
                    },
                  });
                }
              }
              actionSuccess = true;
              actionMessage = `Total Debt overridden to ₹${value.toLocaleString("en-IN")}`;
            } else if (metric === "savings" && p.goal) {
              const gModel = p.goal || p.Goal;
              const allGoals = await gModel.findMany({ where: { userId: uId } });
              const curSav = allGoals.reduce((s: number, g: any) => s + g.currentAmount, 0);
              const diff = value - curSav;
              if (diff !== 0) {
                if (allGoals.length > 0) {
                  const first = allGoals[0];
                  await gModel.update({
                    where: { id: first.id },
                    data: { currentAmount: Math.max(0, first.currentAmount + diff) },
                  });
                } else {
                  await gModel.create({
                    data: {
                      userId: uId,
                      title: "Savings Adjustment",
                      targetAmount: value,
                      currentAmount: value,
                    },
                  });
                }
              }
              actionSuccess = true;
              actionMessage = `Savings Goals overridden to ₹${value.toLocaleString("en-IN")}`;
            }
          }
          if (actionSuccess) {
            console.log(`[AI_ACTION_SUCCESS] ${actionMessage}`);
          }

          dataAction = parsed;
          const cleanResponse = responseText.replace(/info=\s*\{[\s\S]*?\}/, "").trim();

          if (actionSuccess) {
            responseText = `✅ **${actionMessage}**\n\n${cleanResponse}`;
          } else {
            responseText = cleanResponse;
          }
        } catch (e) {
          console.error("Action error:", e);
          responseText = `⚠️ **System Error**: I understood your request but couldn't save the data. \n\n ${responseText.replace(/info=\s*\{[\s\S]*?\}/, "").trim()}`;
        }
      }
    }

    return NextResponse.json({
      content: responseText,
      action: dataAction,
    });
  } catch (error) {
    console.error("[CHAT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function getRuleBasedResponse(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("hello") || m.includes("hi"))
    return "Hello! I'm your financial assistant. How can I help you today?";
  if (m.includes("spent") || m.includes("buy") || m.includes("bought")) {
    return "I can help you log that. Please tell me the amount and category (e.g., 'I spent 500 on Food').";
  }
  return "I'm here to help track your expenses, incomes, and debts. I've enabled basic rule-based logic while the AI brain is warming up.";
}
