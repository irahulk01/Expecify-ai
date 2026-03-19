import Link from "next/link";
import { PlayCircle, ShoppingCart, Car, TrendingDown, Lightbulb, ArrowUp } from "lucide-react";
import { auth } from "@/auth";

export default async function Hero() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <section className="relative pt-20 pb-32 overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-4xl mx-auto mb-16 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-border text-primary text-xs font-bold mb-6 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            New: WhatsApp Integration is live
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-text-primary tracking-tight leading-tight mb-6">
            Where adding expenses <br />
            <span className="text-transparent bg-clip-text bg-(--ai-gradient)">
              feels effortless
            </span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10 font-medium">
            Stop hoarding receipts. Just type{" "}
            <span className="text-text-primary font-bold italic">
              &quot;Paid 340 for 300g mutton&quot;
            </span>{" "}
            and let our AI categorize, track, and analyze your spending
            instantly.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={isLoggedIn ? "/dashboard" : "/onboarding"} className="w-full sm:w-auto">
              <button className="w-full px-8 py-4 bg-primary hover:brightness-110 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/30 hover:-translate-y-1 active:scale-95">
                {isLoggedIn ? "Go to Dashboard" : "Start Tracking Free"}
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-surface border border-border hover:bg-background text-text-primary rounded-xl font-bold text-lg transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group shadow-sm">
              <PlayCircle className="text-primary group-hover:scale-110 transition-transform w-[24px] h-[24px]" />
              See How It Works
            </button>
          </div>
        </div>
        {/* 3D/Glass Elements Visualization */}
        <div className="relative h-[400px] md:h-[500px] w-full max-w-5xl mx-auto perspective-1000">
          {/* Floating Card 1 (Left) */}
          <div className="absolute left-[5%] top-[20%] md:left-[10%] bg-surface border border-border p-4 rounded-2xl w-48 animate-float z-20 hidden md:block transform -rotate-6 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-600">
                <ShoppingCart className="w-[20px] h-[20px]" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-bold">Grocery</p>
                <p className="text-sm font-black text-text-primary">₹340.00</p>
              </div>
            </div>
            <div className="h-1 w-full bg-background rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 w-[60%]"></div>
            </div>
          </div>
          {/* Floating Card 2 (Right) */}
          <div className="absolute right-[5%] bottom-[30%] md:right-[10%] bg-surface border border-border p-4 rounded-2xl w-56 animate-float-delayed z-20 hidden md:block transform rotate-3 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-600">
                <Car className="w-[20px] h-[20px]" />
              </div>
              <div>
                <p className="text-xs text-text-secondary font-bold">Transport</p>
                <p className="text-sm font-black text-text-primary">₹200.00</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[10px] text-success bg-success/10 px-2 py-1 rounded-md w-fit font-bold">
              <TrendingDown className="w-[12px] h-[12px]" />
              12% less than last week
            </div>
          </div>
          {/* AI Insight Bubble (Top Right) */}
          <div className="absolute right-[15%] top-[5%] bg-(--ai-gradient) text-white p-4 rounded-2xl rounded-bl-none shadow-xl shadow-primary/20 max-w-[220px] animate-float-slow z-30 hidden lg:block">
            <div className="flex items-start gap-2">
              <Lightbulb className="text-yellow-300 w-[18px] h-[18px] mt-1 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">
                Hey! You’re spending 22% more on food delivery this month.
                Maybe cook tonight?
              </p>
            </div>
          </div>
          {/* Central Phone/App Mockup Container */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-full max-w-2xl bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl relative transition-colors">
              {/* Header Bar */}
              <div className="h-12 border-b border-border flex items-center px-6 gap-2">
                <div className="w-3 h-3 rounded-full bg-error/30"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                <div className="w-3 h-3 rounded-full bg-success/30"></div>
              </div>
              {/* App Interface */}
              <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-background/50">
                <div className="w-full max-w-md">
                  <label className="block text-sm font-bold text-text-secondary mb-2 ml-1">
                    Add new expense
                  </label>
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-(--ai-gradient) rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-background border border-border rounded-xl p-1 transition-colors">
                      <input
                        className="block w-full rounded-lg border-0 bg-surface/50 py-4 px-5 text-text-primary shadow-sm ring-1 ring-inset ring-border placeholder:text-text-secondary focus:ring-2 focus:ring-inset focus:ring-primary sm:text-lg sm:leading-6 font-display font-medium"
                        readOnly
                        type="text"
                        value="Paid 340 for 300g mutton"
                      />
                      <div className="absolute right-3 top-3 bottom-3 aspect-square bg-primary rounded-lg flex items-center justify-center cursor-pointer hover:brightness-110 transition-all">
                        <ArrowUp className="text-white w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  {/* Auto-detected Tags */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <span className="inline-flex items-center rounded-md bg-green-400/10 px-2 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-400/20">
                      Grocery
                    </span>
                    <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20">
                      Today
                    </span>
                    <span className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-400 ring-1 ring-inset ring-purple-400/20">
                      ₹340
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
