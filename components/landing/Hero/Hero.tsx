"use client";

import { HeroHeader } from "./HeroHeader";
import { HeroChat } from "./HeroChat";

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] bg-background text-text-primary transition-colors overflow-hidden py-16 md:py-24 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand/10 dark:bg-brand/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/10 dark:bg-cyan-500/20 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[400px] h-[400px] bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
        <HeroHeader />
        <HeroChat />
      </div>
    </section>
  );
}
