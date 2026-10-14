import React from "react";
import { ShieldCheck, Truck, BadgePercent, CreditCard } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import styles from "./ServiceFeatures.module.css";

const features = [
  {
    id: "warranty",
    icon: ShieldCheck,
    title: "featWarrantyTitle",
    text: "featWarrantyText",
  },
  {
    id: "delivery",
    icon: Truck,
    title: "featDeliveryTitle",
    text: "featDeliveryText",
  },
  {
    id: "credit",
    icon: BadgePercent,
    title: "featCreditTitle",
    text: "featCreditText",
  },
  {
    id: "payment",
    icon: CreditCard,
    title: "featPaymentTitle",
    text: "featPaymentText",
  },
];

const ServiceFeatures = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{t("featuresTitle")}</h2>
        <p className={styles.subheading}>{t("featuresSubtitle")}</p>
      </div>
      <ul className={styles.grid}>
        {features.map(({ id, icon: Icon, title, text }) => (
          <li key={id} className={styles.card}>
            <span className={styles.icon} aria-hidden="true">
              <Icon strokeWidth={1.7} />
            </span>
            <h3 className={styles.title}>{t(title)}</h3>
            <p className={styles.text}>{t(text)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ServiceFeatures;