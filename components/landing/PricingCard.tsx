import styles from "./Pricing.module.css";
import { CheckCircle2 } from "lucide-react";

interface PricingCardProps {
  planName: string;
  priceSymbol: string;
  priceAmount: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  isHighlighted?: boolean;
}

export function PricingCard({
  planName,
  priceSymbol,
  priceAmount,
  period,
  description,
  features,
  buttonText,
  isHighlighted = false,
}: PricingCardProps) {
  if (isHighlighted) {
    return (
      <div className={`${styles.card} ${styles.cardHighlighted}`}>
        <div className={`${styles.planName} ${styles.planNameHighlighted}`}>{planName}</div>
        <div className={`${styles.price} ${styles.priceHighlighted}`}>
          {priceSymbol}
          {priceAmount}
          <span className={`${styles.period} ${styles.periodHighlighted}`}>{period}</span>
        </div>
        <p className={`${styles.desc} ${styles.descHighlighted}`}>{description}</p>
        <div className={styles.featuresList}>
          {features.map((feature, idx) => (
            <div key={idx} className={`${styles.featureItem} ${styles.featureItemHighlighted}`}>
              <CheckCircle2 className="w-5 h-5 text-white" /> {feature}
            </div>
          ))}
        </div>
        <button className={`${styles.btn} ${styles.btnSolid}`}>{buttonText}</button>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.planName}>{planName}</div>
      <div className={`${styles.price} text-text-primary`}>
        {priceSymbol}
        {priceAmount}
        <span className={`${styles.period} text-text-secondary`}>{period}</span>
      </div>
      <p className={styles.desc}>{description}</p>
      <div className={styles.featuresList}>
        {features.map((feature, idx) => (
          <div key={idx} className={styles.featureItem}>
            <CheckCircle2 className="w-5 h-5 text-brand" /> {feature}
          </div>
        ))}
      </div>
      <button className={`${styles.btn} ${styles.btnOutline}`}>{buttonText}</button>
    </div>
  );
}
