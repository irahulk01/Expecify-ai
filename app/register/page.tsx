"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Wallet, Mail, Lock, User, ArrowRight, Phone,
  AlertCircle, CheckCircle2, Sparkles, Eye, EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { loadTextShape } from "@tsparticles/shape-text";
import { loadAbsorbersPlugin } from "@tsparticles/plugin-absorbers";

export default function Register() {
  const [init, setInit] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
      await loadTextShape(engine);
      await loadAbsorbersPlugin(engine);
    }).then(() => setInit(true));
  }, []);

  const particlesConfig = useMemo(() => ({
    autoPlay: true,
    background: { color: { value: "transparent" } },
    fpsLimit: 60,
    interactivity: {
      events: { onHover: { enable: true, mode: "repulse" } },
      modes: { repulse: { distance: 80, duration: 0.4 } },
    },
    particles: {
      color: { value: ["#3b82f6", "#8b5cf6", "#ec4899", "#10b981", "#ffffff"] },
      links: { enable: false },
      move: { enable: true, random: true, speed: 1.0, straight: false },
      number: { density: { enable: true, area: 900 }, value: 40 },
      opacity: {
        value: { min: 0.2, max: 0.7 },
        animation: { enable: true, speed: 1, sync: false },
      },
      shape: {
        type: "text",
        options: {
          text: [{ value: "₹", font: "Helvetica, Arial, sans-serif", weight: "bold" }],
        },
      },
      size: { value: { min: 8, max: 20 } },
    },
    detectRetina: true,
  }), []);

  // Password strength
  const getStrength = (pw: string) => {
    if (!pw) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    const map = [
      { label: "Weak", color: "bg-red-500" },
      { label: "Fair", color: "bg-orange-400" },
      { label: "Good", color: "bg-yellow-400" },
      { label: "Strong", color: "bg-green-400" },
      { label: "Very strong", color: "bg-emerald-400" },
    ];
    return { score, ...map[score] };
  };
  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number (min 10 digits).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        // Sign in automatically
        await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        setSuccess(true);
        // Redirect to onboarding chat
        setTimeout(() => {
          router.push("/onboarding");
        }, 1200);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-4 relative overflow-hidden">
      {/* Background Particles */}
      {init && (
        <Particles
          id="tsparticles-register"
          options={particlesConfig}
          className="absolute inset-0 z-0 pointer-events-none"
        />
      )}

      {/* Glowing orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.1, 1] }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute top-[5%] left-[15%] w-[550px] h-[550px] bg-emerald-600/15 rounded-full blur-[140px] mix-blend-screen"
        />
        <motion.div
          animate={{ rotate: -360, scale: [1, 1.2, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[5%] right-[10%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[140px] mix-blend-screen"
        />
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[40%] right-[5%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] mix-blend-screen"
        />
      </div>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background-dark/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Account Created! 🎉
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-slate-400 text-sm"
            >
              Redirecting you to sign in…
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form container */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: success ? 0 : 1, y: success ? -20 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md pointer-events-auto"
      >
        <div className="group">
          {/* Logo */}
          <Link href="/" className="flex items-center justify-center gap-3 mb-8 cursor-pointer">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 bg-linear-to-br from-primary via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/30 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Wallet className="w-6 h-6 z-10" />
            </motion.div>
            <span className="text-white font-bold text-3xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-slate-400">
              Expensify AI
            </span>
          </Link>

          {/* Card */}
          <div className="relative glass-panel p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-2xl">
            {/* Hover glow border */}
            <div className="absolute -inset-[1px] bg-linear-to-r from-emerald-500 via-primary to-purple-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur -z-10 pointer-events-none" />

            <div className="mb-7 text-center">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Create your account
              </h2>
              <p className="text-slate-400 text-sm">
                Join Expensify AI — your smart finance companion.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                  Full Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                  <input
                    type="text"
                    required
                    autoFocus
                    tabIndex={1}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-4 text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm relative z-10"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                  <input
                    type="email"
                    required
                    tabIndex={2}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-4 text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm relative z-10"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                  Phone Number
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-px bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                  <input
                    type="tel"
                    required
                    tabIndex={3}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9+-\s()]/g, ''))}
                    placeholder="+91 98765 43210"
                    className="block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-4 text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm relative z-10 font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                  Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    tabIndex={4}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-11 text-white shadow-inner ring-1 ring-inset ring-white/10 placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm relative z-10 font-mono tracking-widest placeholder:tracking-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors z-20"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Strength bar */}
                {password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 px-1"
                  >
                    <div className="flex gap-1 mb-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i < strength.score ? strength.color : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-[11px] font-medium ${
                      strength.score <= 1 ? "text-red-400" :
                      strength.score === 2 ? "text-yellow-400" :
                      "text-green-400"
                    }`}>
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 ml-1">
                  Confirm Password
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within/input:text-primary transition-colors z-20">
                    <Lock className="h-5 w-5" />
                  </div>
                  <div className="absolute -inset-[1px] bg-linear-to-r from-primary to-purple-600 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-0" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    tabIndex={5}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className={`block w-full rounded-xl border-0 bg-black/40 backdrop-blur-xl py-3.5 pl-11 pr-11 text-white shadow-inner ring-1 ring-inset placeholder:text-slate-600 focus:outline-none focus:ring-0 sm:text-sm relative z-10 font-mono tracking-widest placeholder:tracking-normal transition-all ${
                      confirmPassword && confirmPassword !== password
                        ? "ring-red-500/50"
                        : confirmPassword && confirmPassword === password
                        ? "ring-emerald-500/50"
                        : "ring-white/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors z-20"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {/* Match indicator */}
                  {confirmPassword && (
                    <div className="absolute inset-y-0 right-10 flex items-center z-20 pr-1">
                      {confirmPassword === password ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <p>{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <div className="pt-4">
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  type="submit"
                  tabIndex={6}
                  disabled={loading}
                  className="relative flex items-center justify-center w-full py-3.5 px-4 bg-white text-background-dark rounded-xl font-bold text-sm transition-all shadow-xl hover:shadow-white/20 overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed group/btn"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1s_infinite] pointer-events-none" />
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                      </svg>
                      Creating account…
                    </span>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
            </form>

            <div className="mt-7 text-center text-xs text-slate-500 border-t border-white/5 pt-6">
              Already have an account?{" "}
              <Link href="/login" className="font-bold text-white hover:text-primary transition-colors ml-1">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
