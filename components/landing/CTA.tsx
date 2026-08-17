"use client";

import styles from "./CTA.module.css";

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className={styles.card}>
        <div className={styles.blob}></div>

        <h2 className={styles.title}>Ready to Take Charge of Your Finances</h2>
        <p className={styles.subtitle}>
          Try our 7-day free trial, no credit card required. Experience the ultimate financial
          management tool for your business or personal use.
        </p>

        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            placeholder="Enter your Email address"
            className={styles.input}
            required
          />
          <button type="submit" className={styles.btn}>
            Subscribe Now
          </button>
        </form>
      </div>
    </section>
  );
}
