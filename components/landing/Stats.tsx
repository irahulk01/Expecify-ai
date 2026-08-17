export default function Stats() {
  return (
    <section className="py-20 border-t border-border transition-colors bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-surface backdrop-blur-sm border border-border shadow-sm">
            <div className="text-3xl md:text-4xl font-black text-text-primary mb-2">50K+</div>
            <div className="text-sm text-text-secondary uppercase tracking-widest font-bold">
              Active Users
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-surface backdrop-blur-sm border border-border shadow-sm">
            <div className="text-3xl md:text-4xl font-black text-text-primary mb-2">2M+</div>
            <div className="text-sm text-text-secondary uppercase tracking-widest font-bold">
              Expenses Tracked
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-surface backdrop-blur-sm border border-border shadow-sm">
            <div className="text-3xl md:text-4xl font-black text-text-primary mb-2">₹10Cr+</div>
            <div className="text-sm text-text-secondary uppercase tracking-widest font-bold">
              Money Saved
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-surface backdrop-blur-sm border border-border shadow-sm">
            <div className="text-3xl md:text-4xl font-black text-text-primary mb-2">4.9/5</div>
            <div className="text-sm text-text-secondary uppercase tracking-widest font-bold">
              App Rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
