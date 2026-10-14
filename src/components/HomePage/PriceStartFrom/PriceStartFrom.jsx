import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { categories, products } from "../../../data/products";
import styles from "./PriceStartFrom.module.css";

const CATEGORY_LABELS = {
  bedroom: "catNameBedroom",
  "living-room": "catNameLivingRoom",
  "tables-chairs": "catNameTablesChairs",
  mattresses: "catNameMattresses",
};

const CATEGORY_PATHS = {
  "tables-chairs": "tables",
};

const PriceStartFrom = () => {
  const { lp, t } = useLanguage();
  const items = useMemo(
    () =>
      categories
        .map((category) => {
          const list = products.filter(
            (product) => product.category === category.key && product.inStock,
          );

          if (list.length === 0) return null;

          const cheapest = list.reduce((min, product) =>
            product.price < min.price ? product : min,
          );

          return {
            key: category.key,
            fallbackName: category.name,
            price: cheapest.price,
            image: cheapest.image,
          };
        })
        .filter(Boolean),
    [],
  );

  const getName = (item) => {
    const labelKey = CATEGORY_LABELS[item.key];
    return labelKey ? t(labelKey) : item.fallbackName;
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t("budgetTitle")}</h2>
        <p className={styles.subtitle}>{t("budgetSubtitle")}</p>
      </div>
      <div className={styles.grid}>
        {items.map((item) => {
          const name = getName(item);
          return (
            <Link
              key={item.key}
              to={lp(`/products/${CATEGORY_PATHS[item.key] ?? item.key}`)}
              className={styles.card}
            >
              <img
                src={item.image}
                alt={name}
                className={styles.image}
                loading="lazy"
                draggable="false"
              />
              <div className={styles.top}>
                <h3 className={styles.name}>{name}</h3>
                <span className={styles.arrow} aria-hidden="true">
                  <ArrowUpRight />
                </span>
              </div>
              <p className={styles.price}>
                {t("startingFromPrefix")}
                <strong>{item.price} AZN</strong>
                {t("startingFromSuffix")}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default PriceStartFrom;
