import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { categories, products } from "../../../data/products";
import styles from "./MostLoved.module.css";

const PER_CATEGORY = 2;
const AUTOPLAY_DELAY = 4000;
const productPath = (product) => `/product/${product.id}`;
const getMostLoved = () => {
  const byCategory = categories.map((category) =>
    products
      .filter((p) => p.category === category.key && p.inStock)
      .sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount)
      .slice(0, PER_CATEGORY),
  );

  const result = [];
  for (let i = 0; i < PER_CATEGORY; i += 1) {
    byCategory.forEach((list) => {
      if (list[i]) result.push(list[i]);
    });
  }
  return result;
};

const MostLoved = () => {
  const { lp, t, lang } = useLanguage();
  const items = useMemo(getMostLoved, []);
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const getName = (product) =>
    lang === "en" ? product.nameEn : product.nameAz;

  const scrollByCard = useCallback((direction) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector("li");
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = card ? card.offsetWidth + gap : track.clientWidth * 0.8;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    const atStart = track.scrollLeft <= 4;

    if (direction > 0 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction < 0 && atStart) {
      track.scrollTo({ left: track.scrollWidth, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * step, behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    if (paused) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const timer = setInterval(() => scrollByCard(1), AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [paused, scrollByCard]);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{t("lovedTitle")}</h2>
        <p className={styles.subheading}>{t("lovedSubtitle")}</p>
      </div>
      <div
        className={styles.wrapper}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowLeft}`}
          onClick={() => scrollByCard(-1)}
          aria-label={t("prevSlide")}
        >
          <ChevronLeft />
        </button>
        <ul className={styles.track} ref={trackRef}>
          {items.map((product) => (
            <li key={product.id} className={styles.slide}>
              <Link to={lp(productPath(product))} className={styles.card}>
                <div className={styles.media}>
                  {product.discount > 0 && (
                    <span className={styles.discount}>
                      -{product.discount}%
                    </span>
                  )}
                  <img
                    src={product.image}
                    alt={getName(product)}
                    className={styles.image}
                    loading="lazy"
                    draggable="false"
                  />
                </div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{getName(product)}</h3>
                  <p className={styles.rating}>
                    <Star aria-hidden="true" />
                    <strong>{product.rating}</strong>
                    <span>
                      ({product.reviewsCount} {t("reviewsLabel")})
                    </span>
                  </p>
                  <p className={styles.prices}>
                    <span className={styles.price}>{product.price} AZN</span>
                    {product.discount > 0 && (
                      <span className={styles.oldPrice}>
                        {product.oldPrice} AZN
                      </span>
                    )}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className={`${styles.arrow} ${styles.arrowRight}`}
          onClick={() => scrollByCard(1)}
          aria-label={t("nextSlide")}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
};

export default MostLoved;
