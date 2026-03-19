import { Wand2, MessageSquare, ChartLine } from "lucide-react";

export default function Features() {
  return (
    <section id="features" className="py-24 bg-background relative transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-text-primary mb-6">
            Smarter spending, <br />
            <span className="text-text-secondary opacity-50">simpler tracking.</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl font-medium">
            Our AI doesn&apos;t just record numbers. It understands context, habits,
            and helps you make better financial decisions without the guilt
            trip.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="group bg-surface border border-border rounded-2xl p-8 hover:bg-background transition-all hover:border-primary/30 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wand2 className="w-[120px] h-[120px] text-primary" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform duration-300">
              <Wand2 className="w-[28px] h-[28px]" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">
              Auto-Categorization
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm font-medium">
              AI automatically sorts your expenses into categories instantly.
              No more manual tagging or scrolling through dropdowns.
            </p>
          </div>
          {/* Feature 2 */}
          <div className="group bg-surface border border-border rounded-2xl p-8 hover:bg-background transition-all hover:border-primary/30 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageSquare className="w-[120px] h-[120px] text-purple-500" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare className="w-[28px] h-[28px]" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">
              Natural Language
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm font-medium">
              Just text your expenses like you&apos;re talking to a friend. &quot;Lunch
              with mom 40 dollars&quot; is all you need to type.
            </p>
          </div>
          {/* Feature 3 */}
          <div className="group bg-surface border border-border rounded-2xl p-8 hover:bg-background transition-all hover:border-primary/30 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <ChartLine className="w-[120px] h-[120px] text-cyan-500" />
            </div>
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <ChartLine className="w-[28px] h-[28px]" />
            </div>
            <h3 className="text-xl font-bold text-text-primary mb-3">
              Smart Insights
            </h3>
            <p className="text-text-secondary leading-relaxed text-sm font-medium">
              Get playful nudges when you&apos;re overspending on takeout, and
              celebrations when you hit your savings goals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
