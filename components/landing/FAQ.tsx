import styles from "./FAQ.module.css";
import { Plus } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      q: "How easy is it to set up an account with Orbix?",
      a: "Setup takes just a few minutes. Connect your bank securely via Plaid, and Orbix will instantly begin categorizing your past and future transactions automatically.",
    },
    {
      q: "How do I connect my bank account?",
      a: "Navigate to the dashboard and click 'Connect Bank'. We use bank-level encryption, ensuring your credentials are never stored on our servers.",
    },
    {
      q: "Is my data safe?",
      a: "Absolutely. We employ 256-bit AES encryption and undergo regular compliance audits to guarantee the security of your financial data.",
    },
    {
      q: "Can I track joint accounts?",
      a: "Yes, you can connect multiple accounts from different banks, including joint accounts, and view them all from a single unified dashboard.",
    },
    {
      q: "Can I connect multiple accounts?",
      a: "Yes! Our Premium and Pro plans support connecting 25 to unlimited accounts respectively.",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.leftContent}>
            <div className={styles.tagline}>Need Support?</div>
            <h2 className={styles.title}>We have 24/7 support available.</h2>
            <button className={styles.btnSupport}>Contact Us</button>
          </div>

          <div className={styles.faqContainer}>
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-surface border border-border rounded-2xl transition-all hover:border-brand/50 open:border-brand/50"
              >
                <summary className="flex justify-between items-center p-6 cursor-pointer list-none font-bold text-text-primary text-lg">
                  {faq.q}
                  <Plus className="w-5 h-5 text-text-secondary transition-transform group-open:rotate-45 group-open:text-brand" />
                </summary>
                <div className="px-6 pb-6 text-sm text-text-secondary leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
