import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    return NextResponse.json(
      {
        success: false,
        reason: "MISSING_CREDENTIALS",
        message: "Email and password query parameters are required. Example: /api/auth/debug?email=user@example.com&password=yourpassword",
      },
      { status: 400 }
    );
  }

  return handleDebugCheck(email, password);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          reason: "MISSING_CREDENTIALS",
          message: "Email and password fields are required in JSON body.",
        },
        { status: 400 }
      );
    }

    return handleDebugCheck(email, password);
  } catch (err: any) {
    return NextResponse.json({ success: false, reason: "INVALID_JSON", error: err?.message }, { status: 400 });
  }
}

async function handleDebugCheck(email: string, password: string) {
  const targetEmail = email.trim();
  const dbUrl = process.env.DATABASE_URL || "";
  const dbHostMasked = dbUrl ? dbUrl.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") : "NOT_SET";

  console.log(`[AUTH_DEBUG] Connecting to DB: ${dbHostMasked}`);
  console.log(`[AUTH_DEBUG] Target Email: ${targetEmail}`);

  try {
    // 1. Check total users count to verify DB connection works
    const totalUsers = await prisma.user.count();
    console.log(`[AUTH_DEBUG] Total users in DB: ${totalUsers}`);

    // 2. Find target user
    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      console.log(`[AUTH_DEBUG] ❌ User not found: ${targetEmail}`);
      return NextResponse.json({
        success: false,
        dbConnected: true,
        totalUsersInDb: totalUsers,
        dbHostMasked,
        userFound: false,
        reason: "USER_NOT_FOUND",
        message: `No user record found for email: ${targetEmail}`,
      }, { status: 404 });
    }

    if (!user.password) {
      console.log(`[AUTH_DEBUG] ❌ User has no password (OAuth user): ${targetEmail}`);
      return NextResponse.json({
        success: false,
        dbConnected: true,
        totalUsersInDb: totalUsers,
        dbHostMasked,
        userFound: true,
        hasPassword: false,
        reason: "NO_PASSWORD_SET",
        message: `User exists (${user.name}) but has no password set (likely registered via Google/OAuth)`,
      });
    }

    // 3. Verify bcrypt password
    const isValid = await compare(password, user.password);
    console.log(`[AUTH_DEBUG] Bcrypt compare result for ${targetEmail}: ${isValid}`);

    if (!isValid) {
      console.log(`[AUTH_DEBUG] ❌ Password mismatch for ${targetEmail}`);
      return NextResponse.json({
        success: false,
        dbConnected: true,
        totalUsersInDb: totalUsers,
        dbHostMasked,
        userFound: true,
        hasPassword: true,
        passwordMatch: false,
        reason: "INVALID_PASSWORD",
        message: "Password does not match the hashed password in the database",
      });
    }

    console.log(`[AUTH_DEBUG] ✅ SUCCESS: User ${targetEmail} authenticated successfully!`);
    return NextResponse.json({
      success: true,
      dbConnected: true,
      totalUsersInDb: totalUsers,
      dbHostMasked,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboardingCompleted: user.onboardingCompleted,
      },
      passwordMatch: true,
      message: "Database connected and credentials authenticated successfully!",
    });
  } catch (err: any) {
    console.error("[AUTH_DEBUG] 💥 Database/Auth error:", err);
    return NextResponse.json({
      success: false,
      dbConnected: false,
      dbHostMasked,
      error: err?.message || String(err),
      reason: "DB_CONNECTION_ERROR",
      message: "Failed to connect to Prisma database",
    }, { status: 500 });
  }
}
