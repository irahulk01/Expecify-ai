// auth.ts — NextAuth v5 configuration
import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

const providers: Provider[] = [
  Credentials({
    name: "Credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      try {
        const rawEmail = (credentials.email as string).trim();
        const cleanEmail = rawEmail.toLowerCase();
        console.log(`[AUTH] Attempting login for: ${rawEmail}`);

        let user = await prisma.user.findUnique({
          where: { email: rawEmail },
        });

        if (!user) {
          user = await prisma.user.findFirst({
            where: { email: { equals: cleanEmail, mode: "insensitive" } },
          });
        }

        if (!user) {
          console.warn(`[AUTH_FAILED] User not found in DB: ${cleanEmail}`);
          return null;
        }

        if (!user.password) {
          console.warn(`[AUTH_FAILED] User has no password set: ${cleanEmail}`);
          return null;
        }

        const isValid = await compare(credentials.password as string, user.password);

        if (!isValid) {
          console.warn(`[AUTH_FAILED] Password mismatch for: ${cleanEmail}`);
          return null;
        }

        console.log(`[AUTH_SUCCESS] Logged in: ${user.email} (${user.id})`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      } catch (err) {
        console.error("[AUTH_ERROR] Exception in authorize():", err);
        return null;
      }
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.APPLE_CLIENT_ID,
      clientSecret: process.env.APPLE_CLIENT_SECRET,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
