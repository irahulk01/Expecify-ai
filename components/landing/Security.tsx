import styles from "./Security.module.css";
import { Shield, Lock, Activity, LineChart } from "lucide-react";

export default function Security() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Security and Compliance</h2>
          <p className={styles.subtitle}>
            We prioritize protecting your data with bank-level security protocols and compliance
            with financial industry regulations to keep your data safe.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Left: Features */}
          <div className={styles.featuresList}>
            <div className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Uses Bank-Level Security</h3>
                <p className={styles.featureDesc}>
                  Your data is secured with 256-bit encryption and strict policies, ensuring no
                  unauthorized access to your private data.
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Fully Ad-Supported (Optional)</h3>
                <p className={styles.featureDesc}>
                  Enjoy a seamless experience with targeted or no-ad plans, allowing you to focus on
                  your financial health.
                </p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.iconWrapper}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className={styles.featureTitle}>Analytics Manager</h3>
                <p className={styles.featureDesc}>
                  Track spending habits and improve your savings directly from our secure dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className={styles.visualContainer}>
            <div className={styles.blob}></div>

            <div className={styles.mockupCard}>
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center">
                    <LineChart className="w-5 h-5 text-brand" />
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary font-bold">My Profile</div>
                    <div className="text-lg font-black text-text-primary">Net Balance</div>
                  </div>
                </div>
              </div>

              <div className="h-32 w-full flex items-end gap-1 mb-6">
                <svg viewBox="0 0 100 30" className="w-full h-full stroke-brand fill-transparent">
                  <path
                    d="M0,25 L10,20 L20,28 L30,15 L40,18 L50,5 L60,10 L70,2 L80,15 L90,10 L100,20"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <div className="flex gap-4">
                <div className="h-10 flex-1 bg-surface-hover rounded-lg border border-border" />
                <div className="h-10 flex-[2] bg-text-primary rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
