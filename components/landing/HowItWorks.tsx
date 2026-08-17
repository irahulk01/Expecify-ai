import styles from "./HowItWorks.module.css";
import { UserPlus, LayoutDashboard, Target } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>How It Works Step-by-Step Guide</h2>
          <div>
            <p className={styles.description}>
              Our process is designed to be smooth and user-friendly, guiding you from setting up an
              account to having a detailed breakdown of your finances.
            </p>
            <button className={styles.btnTrial}>Free Trial</button>
          </div>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconInner}>
                <UserPlus className="w-6 h-6" />
              </div>
            </div>
            <h3 className={styles.stepTitle}>
              Sign Up and Connect
              <br />
              YOUR ACCOUNT
            </h3>
            <p className={styles.stepDesc}>
              Easily and safely securely connect your bank accounts or enter manually in one click.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconInner}>
                <LayoutDashboard className="w-6 h-6" />
              </div>
            </div>
            <h3 className={styles.stepTitle}>
              Track and Categorize
              <br />
              AUTOMATICALLY
            </h3>
            <p className={styles.stepDesc}>
              Transactions are categorized for you automatically tracking your expenses.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconInner}>
                <Target className="w-6 h-6" />
              </div>
            </div>
            <h3 className={styles.stepTitle}>
              Manage Budgets
              <br />
              AND GOALS
            </h3>
            <p className={styles.stepDesc}>
              Set budgets and track them to refine your spending and savings targets.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
