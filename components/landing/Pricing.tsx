"use client";

import { useState, useEffect } from "react";
import styles from "./Pricing.module.css";
import { Globe } from "lucide-react";
import { PricingCard } from "./PricingCard";

type Currency = "INR" | "USD";

interface PlanPrice {
  symbol: string;
  starter: string;
  premium: string;
  pro: string;
  period: string;
}

const PRICING_DATA: Record<Currency, PlanPrice> = {
  INR: {
    symbol: "₹",
    starter: "299",
    premium: "799",
    pro: "1,999",
    period: "/month",
  },
  USD: {
    symbol: "$",
    starter: "10",
    premium: "25",
    pro: "70",
    period: "/month",
  },
};

export default function Pricing() {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [isAutoDetected, setIsAutoDetected] = useState(false);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Asia/Kolkata") || tz.includes("Asia/Calcutta")) {
        setCurrency("INR");
        setIsAutoDetected(true);
      }
    } catch {
      // Fallback
    }

    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_code) {
          if (data.country_code === "IN") {
            setCurrency("INR");
          } else {
            setCurrency("USD");
          }
          setIsAutoDetected(true);
        }
      })
      .catch(() => {
        // Silently keep timezone or fallback default
      });
  }, []);

  const prices = PRICING_DATA[currency];

  return (
    <section className={styles.section} id="pricing">
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Pricing & Plans</h2>
          <p className={styles.subtitle}>
            Choose a plan that fits your needs. Whether you are an individual tracking personal
            finances or a business managing team expenses, we have you covered.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 p-1.5 rounded-full bg-surface border border-border shadow-sm">
            <span className="text-xs font-bold text-text-secondary px-2 flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-brand" />
              Location:{" "}
              {isAutoDetected
                ? currency === "INR"
                  ? "India (Auto)"
                  : "Global (Auto)"
                : "Auto-detecting..."}
            </span>
            <div className="flex bg-background rounded-full p-0.5 border border-border">
              <button
                onClick={() => setCurrency("INR")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  currency === "INR"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                ₹ INR
              </button>
              <button
                onClick={() => setCurrency("USD")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                  currency === "USD"
                    ? "bg-brand text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                $ USD
              </button>
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          <PricingCard
            planName="Starter Plan"
            priceSymbol={prices.symbol}
            priceAmount={prices.starter}
            period={prices.period}
            description="For individuals seeking essential tracking tools, budget analysis, and goal setting capabilities."
            features={[
              "10 linked bank accounts",
              "Standard budget categorizations",
              "Monthly expense reports",
              "Advanced insights and priority settings",
            ]}
            buttonText="GET STARTED"
          />

          <PricingCard
            planName="Premium Plan"
            priceSymbol={prices.symbol}
            priceAmount={prices.premium}
            period={prices.period}
            description="Ideal for users who require detailed analytics, custom insights, and full automation features."
            features={[
              "25 linked bank accounts",
              "Real-time AI categorization",
              "Weekly financial reviews",
              "Advanced integrations via APIs",
            ]}
            buttonText="START FREE TRIAL"
            isHighlighted
          />

          <PricingCard
            planName="Pro Plan"
            priceSymbol={prices.symbol}
            priceAmount={prices.pro}
            period={prices.period}
            description="Perfect for businesses needing unlimited access, custom dashboards, and team collaboration."
            features={[
              "Unlimited linked accounts",
              "Dedicated financial data analysis",
              "Custom reporting tools and exports",
              "Premium 24/7 support",
            ]}
            buttonText="GET STARTED"
          />
        </div>
      </div>
    </section>
  );
}
