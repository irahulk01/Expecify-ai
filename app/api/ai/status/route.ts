import { NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function GET() {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ connected: false, error: "API Key is missing." }, { status: 200 });
    }

    const groq = new Groq({ apiKey });

    // Test the API with a tiny prompt to verify key validity
    await groq.chat.completions.create({
      messages: [{ role: "user", content: "hello" }],
      model: "openai/gpt-oss-20b",
      max_tokens: 5,
    });

    return NextResponse.json({ connected: true }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        connected: false,
        error: (err as Error)?.message || "Failed to connect to Groq API.",
      },
      { status: 200 }
    ); // Status 200 so the frontend fetch doesn't throw
  }
}
