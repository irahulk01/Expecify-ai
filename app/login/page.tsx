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
              }
            ]
          }
        },
        size: {
          value: { min: 10, max: 24 }, // Readable R's
        },
      },
      detectRetina: true,
      absorbers: isConverging ? {
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
          y: 50
        }
      } : undefined,
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
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-4 relative overflow-hidden">
      {/* 1. Background Particles */}
      {init && (
        <Particles
          id="tsparticles"
          options={particlesConfig}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}

      {/* 2. Abstract Geometric Gemini-style Glowing Orbs */}
      <div className={`absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center transition-opacity duration-1000 ${isConverging ? "opacity-0" : "opacity-100"}`}>
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
          className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[150px] mix-blend-screen"
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
          className="absolute bottom-[10%] right-[15%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[150px] mix-blend-screen"
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
              delay: 0.3 // Brief delay to let absorbers work their magic
            }}
            className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute w-[500px] h-[500px] bg-linear-to-tr from-primary via-purple-500 to-pink-500 rounded-full blur-[120px] opacity-60 animate-pulse"></div>
            <span className="text-[25rem] md:text-[35rem] leading-none font-black text-transparent bg-clip-text bg-linear-to-b from-white via-purple-200 to-primary drop-shadow-[0_0_100px_rgba(168,85,247,0.9)] z-10 transition-transform hover:scale-105">
              ₹
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. The Interactive Glass Form Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: isConverging ? 0 : 1, y: isConverging ? -30 : 0, scale: isConverging ? 0.95 : 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md perspective-1000 pointer-events-auto"
      >
        <div className="group">
          {/* Logo Header */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-10 cursor-pointer">
            <motion.div 
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-linear-to-br from-primary via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <Wallet className="w-6 h-6 z-10" />
            </motion.div>
            <span className="text-white font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
              Expensify AI
            </span>
          </Link>

          {/* Form Card */}
          <div className="relative glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-2xl">
            {/* Shimmer / Animated border reflection on hover */}
            <div className="absolute -inset-[1px] bg-linear-to-r from-primary via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur border-0 pointer-events-none -z-10"></div>
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                Welcome Back
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Authenticate to access your AI financial dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <input
                    id="email-input"
                    type="email"
                    required
                    autoFocus
                    tabIndex={1}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-4 text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6 relative z-10 transition-all"
                    placeholder="enter email"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium text-primary hover:text-purple-400 transition-colors">
                    Forgot?
                  </a>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0"></div>
                  <input
                    id="password-input"
                    type="password"
                    required
                    tabIndex={2}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-4 text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm sm:leading-6 relative z-10 transition-all font-mono tracking-widest placeholder:tracking-normal"
                    placeholder="password"
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
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3 shadow-lg">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <div className="pt-6">
                <motion.button
                  id="login-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="relative flex items-center justify-center w-full py-3.5 px-4 bg-white text-background-dark rounded-xl font-bold text-sm transition-all shadow-xl hover:shadow-white/20 group/btn overflow-hidden"
                >
                  {/* Subtle sweep effect on hover */}
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none"></div>
                  
                  Sign In to AI Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
             </div>

            </form>

            <div className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-white/5 pt-6">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-bold text-primary dark:text-white hover:underline transition-colors ml-1">
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
