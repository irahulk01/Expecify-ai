import Link from "next/link";
import { Wallet } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <nav className="relative z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-text-primary font-bold text-lg tracking-tight">
              Expensify AI
            </span>
          </Link>
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              href="/#features"
            >
              Features
            </Link>
            <Link
              className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              href="/#pricing"
            >
              Pricing
            </Link>
            <Link
              className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
              href="/#about"
            >
              About
            </Link>
          </div>
          {/* CTA */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isLoggedIn ? (
              <>
                <Link
                  className="hidden md:block text-text-secondary hover:text-text-primary text-sm font-medium transition-colors"
                  href="/onboarding"
                >
                  Log In
                </Link>
                <Link href="/onboarding">
                  <button className="bg-primary text-white hover:brightness-110 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-95">
                    Get Started
                  </button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <button className="bg-primary text-white hover:brightness-110 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 active:scale-95">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
