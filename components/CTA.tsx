import Link from "next/link";
import { auth } from "@/auth";

export default async function CTA() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <section id="pricing" className="py-20 bg-background transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-(--ai-gradient) px-6 py-16 md:px-16 text-center shadow-2xl shadow-primary/20">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[80px]"></div>
          
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
              Ready to master your money?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto font-medium">
              Join thousands of others who have switched to effortless AI tracking.
              Start your journey today.
            </p>
            <Link href={isLoggedIn ? "/dashboard" : "/onboarding"}>
              <button className="bg-white text-primary hover:bg-slate-100 px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-105 active:scale-95">
                {isLoggedIn ? "Go to Dashboard" : "Start Tracking Free"}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
