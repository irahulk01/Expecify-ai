import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No audio file provided" }, { status: 400 });

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing Groq API Key" }, { status: 500 });
    
    const groq = new Groq({ apiKey });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      language: "en",
      // Giving Whisper a prompt with common brand names drastically improves recognition accuracy for them
      prompt: "Transaction, context, expenses, India. Brands: Zepto, Zomato, Swiggy, Blinkit, Ola, Uber, Rapido, Paytm, UPI, PhonePe, Myntra, Flipkart, Amazon, Nykaa, BigBasket, MakeMyTrip.",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err: unknown) {
    console.error("[POST /api/ai/transcribe]", err);
    return NextResponse.json({ error: (err as Error)?.message || "Transcription failed" }, { status: 500 });
  }
}
