import styles from "./Features.module.css";
import { Sparkles, TrendingUp, Shield, Activity, DollarSign } from "lucide-react";

export default function Features() {
  return (
    <section className={styles.featuresSection} id="features">
      <div className={styles.container}>
        <div className={styles.headerGrid}>
          <h2 className={styles.title}>
            Unlock Premium Benefits with <br className="hidden md:block" /> Our Advanced Features.
          </h2>
          <p className={styles.subtitle}>
            Orbix is your personal finance management software that helps you securely connect all
            your bank accounts, track your expenses, and manage budgets seamlessly.
          </p>
        </div>

        <div className={styles.bentoGrid}>
          {/* Card 1 */}
          <div className={`${styles.card} ${styles.item1}`}>
            <h3 className={styles.cardTitle}>AI-Powered Assistance</h3>
            <p className={styles.cardDesc}>
              Orbix is trained on millions of financial data points to instantly deliver
              personalized insights.
            </p>
            <div className={`${styles.cardVisual} p-4 flex flex-col justify-between min-h-[150px]`}>
              <div className="flex justify-between items-center text-text-secondary text-xs font-bold">
                <span>Monthly Savings</span>
                <span className="text-brand flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +12%
                </span>
              </div>
              <div className="h-16 w-full flex items-end gap-1 px-1">
                <svg viewBox="0 0 100 30" className="w-full h-full stroke-brand fill-brand/10">
                  <path
                    d="M0,30 L0,20 Q10,10 20,25 T40,15 T60,20 T80,5 T100,10 L100,30 Z"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className={`${styles.card} ${styles.item2}`}>
            <h3 className={styles.cardTitle}>Exclusive Features</h3>
            <p className={styles.cardDesc}>
              Unlock advanced tools like automated analytics, smart categorization, and more.
            </p>
            <div
              className={`${styles.cardVisual} min-h-[150px] relative bg-brand/10 border-brand/20 overflow-hidden flex items-center justify-center`}
            >
              <div className="absolute top-4 left-4 bg-brand text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg shadow-brand/30">
                Unlock all features ✨
              </div>
              {/* Decorative Circles */}
              <div className="w-24 h-24 rounded-full border-4 border-brand/20 opacity-50 absolute -bottom-4 -right-4" />
              <div className="w-16 h-16 rounded-full bg-brand/10 absolute top-8 right-8" />
            </div>
          </div>

          {/* Card 3 */}
          <div className={`${styles.card} ${styles.item3}`}>
            <h3 className={styles.cardTitle}>Growth rate</h3>
            <p className={styles.cardDesc}>
              The growth rate is a crucial metric in financial management that measures the increase
              over a given period.
            </p>
            <div className={`${styles.cardVisual} min-h-[150px] p-4 flex flex-col justify-end`}>
              <div className="flex justify-end mb-2">
                <span className="text-xl font-black text-brand">38%</span>
              </div>
              <div className="flex items-end gap-2 h-16">
                {[20, 30, 25, 45, 60, 50, 75, 90, 80, 100].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-surface-hover hover:bg-brand transition-colors rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className={`${styles.card} ${styles.item4}`}>
            <h3 className={styles.cardTitle}>Ad-Free Experience</h3>
            <p className={styles.cardDesc}>
              Experience an uninterrupted environment free of distractions, ensuring smooth
              navigation.
            </p>
            <div className={`${styles.cardVisual} p-4 min-h-[150px]`}>
              <div className="bg-surface rounded-xl p-3 border border-border shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-text-primary font-black italic">
                    VISA
                  </div>
                </div>
                <div className="text-xs text-text-secondary">**** **** **** 2719</div>
              </div>
              <div className="flex gap-2 mt-4">
                <div className="h-8 flex-1 bg-brand rounded-lg" />
                <div className="h-8 flex-1 bg-surface-hover rounded-lg border border-border" />
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className={`${styles.card} ${styles.item5}`}>
            <h3 className={styles.cardTitle}>Activity Manager Tools or Frameworks</h3>
            <p className={styles.cardDesc}>
              An activity manager tool that offers solutions designed to stream routines.
            </p>
            <div
              className={`${styles.cardVisual} min-h-[150px] p-6 grid grid-cols-2 gap-4 bg-background`}
            >
              <div className="bg-surface rounded-xl p-4 border border-border shadow-sm">
                <div className="text-xs text-text-secondary font-bold mb-1">Total Balance</div>
                <div className="text-2xl font-black">
                  $4,329<span className="text-sm text-text-secondary">.00</span>
                </div>
              </div>
              <div className="bg-surface rounded-xl p-4 border border-border shadow-sm flex items-center justify-center">
                <Activity className="w-8 h-8 text-brand opacity-50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
