"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Wallet, Mail, Lock, ArrowRight, AlertCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";
import { loadAbsorbersPlugin } from "@tsparticles/plugin-absorbers";
import SignInButton from "@components/login/SignInButton";
import { BTN_PRIMARY, BTN_SOCIAL, PARTICLE_TOP, PARTICLE_BOTTOM } from "../constants/tailwind";

export default function Login() {
  const [init, setInit] = useState(false);
  const [isConverging, setIsConverging] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Initialize Particles Engine
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadTextShape(engine);
      await loadAbsorbersPlugin(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesConfig = useMemo(() => {
    return {
      autoPlay: true,
      background: {
        color: {
          value: "transparent",
        },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: !isConverging,
            mode: "repulse",
          },
        },
        modes: {
          repulse: {
            distance: 100,
            duration: 0.4,
          },
        },
      },
      particles: {
        color: {
          value: ["#3b82f6", "#8b5cf6", "#ec4899", "#ffffff"], // Gemini-like gradient + white
        },
        links: {
          enable: false, // Turn off links for crisp Rupee floating
        },
        move: {
          enable: true,
          random: true,
          speed: isConverging ? 25 : 1.2, // Speed up to fly towards center!
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 50,
        },
        opacity: {
          value: { min: 0.3, max: 0.9 },
          animation: {
            enable: true,
            speed: 1,
            sync: false,
          },
        },
        shape: {
          type: "text",
          options: {
            text: [
              {
                value: "₹",
                font: "Helvetica, Arial, sans-serif",
                weight: "bold",
              },
            ],
          },
        },
        size: {
          value: { min: 10, max: 24 }, // Readable R's
        },
      },
      detectRetina: true,
      absorbers: isConverging
        ? {
            color: "transparent",
            draggable: false,
            opacity: 1,
            destroy: true, // Particles "disappear" into the center
            orbits: false,
            size: {
              value: 40,
              density: 10,
              limit: 100,
            },
            position: {
              x: 50,
              y: 50,
            },
          }
        : undefined,
    };
  }, [isConverging]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      setIsConverging(true);

      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setIsConverging(false);
        setError("Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setIsConverging(false);
      setError("An unexpected error occurred. Please try again.");
      console.error("Login exception:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* 1. Background Particles */}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesConfig}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}

      {/* 2. Abstract Geometric Gemini-style Glowing Orbs */}
      <div
        className={`absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center transition-opacity duration-1000 ${isConverging ? "opacity-0" : "opacity-100"}`}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className={PARTICLE_TOP}
        ></motion.div>

        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className={PARTICLE_BOTTOM}
        ></motion.div>
      </div>

      {/* GIANT RUPEE FORMATION */}
      <AnimatePresence>
        {isConverging && (
          <motion.div
            initial={{ scale: 0, opacity: 0, filter: "blur(40px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            exit={{ scale: 2, opacity: 0, filter: "blur(50px)" }}
            transition={{
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.3, // Brief delay to let absorbers work their magic
            }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute w-[500px] h-[500px] bg-brand-gradient rounded-full blur-[120px] opacity-60 animate-pulse"></div>
            <span className="text-[25rem] md:text-[35rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-violet-200 to-brand drop-shadow-[0_0_100px_rgba(139,92,246,0.9)] z-10 transition-transform hover:scale-105">
              ₹
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The Interactive Glass Form Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isConverging ? 0 : 1, y: isConverging ? -20 : 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md pointer-events-auto"
      >
        <div className="group">
          {/* Logo Header */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-10 cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-brand-gradient rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Wallet className="w-6 h-6 z-10" />
            </motion.div>
            <span className="text-foreground font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              monityai
            </span>
          </Link>

          {/* Form Card */}
          <div className="relative bg-surface/70 dark:bg-surface/40 p-8 sm:p-10 rounded-3xl shadow-2xl border border-border/60 dark:border-white/10 overflow-hidden backdrop-blur-3xl">
            {/* Shimmer / Animated border reflection on hover */}
            <div className="absolute -inset-[1px] bg-brand-gradient rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-700 blur-sm border-0 pointer-events-none -z-10"></div>

            <div className="mb-10 text-center">
              <h2 className="text-3xl font-black text-foreground mb-3 flex items-center justify-center gap-3 tracking-tight">
                <Sparkles className="w-6 h-6 text-brand animate-pulse" />
                Welcome Back
              </h2>
              <p className="text-foreground-muted text-sm font-medium px-4">
                Access your premium AI-driven financial intelligence dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground-muted group-focus-within/input:text-brand transition-colors z-20">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-brand-gradient rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <input
                    id="email-input"
                    type="email"
                    required
                    autoFocus
                    tabIndex={1}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-2xl border border-border/40 bg-background/80 dark:bg-background/50 backdrop-blur-2xl py-4 pl-12 pr-4 text-foreground shadow-sm ring-1 ring-inset ring-border/20 placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/50 sm:text-sm sm:leading-6 relative z-10 transition-all font-medium"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-brand hover:underline transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-foreground-muted group-focus-within/input:text-brand transition-colors z-20">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-brand-gradient rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <input
                    id="password-input"
                    type="password"
                    required
                    tabIndex={2}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-2xl border border-border/40 bg-background/80 dark:bg-background/50 backdrop-blur-2xl py-4 pl-12 pr-4 text-foreground shadow-sm ring-1 ring-inset ring-border/20 placeholder:text-foreground-muted/50 focus:outline-none focus:ring-2 focus:ring-brand/50 sm:text-sm sm:leading-6 relative z-10 transition-all font-mono tracking-widest placeholder:tracking-normal font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Error Message with AnimatePresence */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 shadow-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-6">
                <SignInButton className={BTN_PRIMARY}>
                  Sign In to AI Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </SignInButton>
              </div>
            </form>

            {/* Social Logins */}
            <div className="mt-8">
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.2em]">
                  <span className="bg-surface px-4 text-foreground-muted rounded-full backdrop-blur-md">
                    Secure Connection
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                  className="btn-social"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.63l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </motion.button>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-foreground-muted border-t border-white/5 pt-6">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-brand hover:underline transition-colors ml-1"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
