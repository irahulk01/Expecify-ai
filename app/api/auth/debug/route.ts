import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    console.log("Debug Auth API: Checking", email);

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found or uses OAuth",
        },
        { status: 404 }
      );
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        reason: "INVALID_PASSWORD",
        hashInDb: user.password.substring(0, 10) + "...",
      });
    }

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, reason: "ERROR", message: err.message });
  }
}
