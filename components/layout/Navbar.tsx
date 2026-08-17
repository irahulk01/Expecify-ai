import Link from "next/link";
import { Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { auth } from "@/auth";
import styles from "./Navbar.module.css";

export default async function Navbar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className={`group ${styles.logoContainer}`}>
            <div className={styles.logoIcon}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={styles.logoText}>Expecify</span>
          </Link>

          {/* Desktop Menu */}
          <div className={styles.desktopMenu}>
            <Link className={styles.navLink} href="/">
              Home
            </Link>
            <Link className={styles.navLink} href="/#features">
              Features
            </Link>
            <Link className={styles.navLink} href="/#pricing">
              Pricing
            </Link>
            <Link className={styles.navLink} href="/#resources">
              Resources
            </Link>
            <Link className={styles.navLink} href="/#about">
              About Us
            </Link>
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isLoggedIn ? (
              <Link href="/onboarding">
                <button className={styles.btnDark}>Book Trial</button>
              </Link>
            ) : (
              <Link href="/dashboard">
                <button className={styles.btnDark}>Dashboard</button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
