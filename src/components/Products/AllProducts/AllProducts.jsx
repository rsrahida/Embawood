import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import products from "../../../data/products";
import ProductCard from "../../../shared/components/ProductCard/ProductCard";
import styles from "./AllProducts.module.css";

const BREAKPOINTS = [
  { query: "(min-width: 1201px)", cols: 4 },
  { query: "(min-width: 821px)", cols: 3 },
  { query: "(min-width: 361px)", cols: 2 },
];
const PER_PAGE_BY_COLS = { 4: 16, 3: 12, 2: 8, 1: 6 };
const SWIPE_THRESHOLD = 50;

const getColumns = () => {
  if (typeof window === "undefined" || !window.matchMedia) return 4;
  const hit = BREAKPOINTS.find((b) => window.matchMedia(b.query).matches);
  return hit ? hit.cols : 1;
};

function useColumns() {
  const [cols, setCols] = useState(getColumns);

  useEffect(() => {
    const lists = BREAKPOINTS.map((b) => window.matchMedia(b.query));
    const update = () => setCols(getColumns());
    lists.forEach((l) => l.addEventListener("change", update));
    update();
    return () => lists.forEach((l) => l.removeEventListener("change", update));
  }, []);

  return cols;
}

const ArrowIcon = ({ dir }) => (
  <svg
    viewBox="0 0 24 24"
    width="22"
    height="22"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transform: dir === "left" ? "rotate(180deg)" : "none" }}
  >
    <path d="M9 5l7 7-7 7" />
  </svg>
);

function AllProducts() {
  const { t } = useLanguage();
  const cols = useColumns();
  const perPage = PER_PAGE_BY_COLS[cols];
  const [firstItem, setFirstItem] = useState(0);
  const touch = useRef(null);

  const slides = useMemo(() => {
    const out = [];
    for (let i = 0; i < products.length; i += perPage) {
      out.push(products.slice(i, i + perPage));
    }
    return out;
  }, [perPage]);

  const total = slides.length;
  const page = Math.max(
    0,
    Math.min(total - 1, Math.floor(firstItem / perPage)),
  );
  const goTo = (n) =>
    setFirstItem(Math.max(0, Math.min(total - 1, n)) * perPage);

  const onTouchStart = (e) => {
    const p = e.touches[0];
    touch.current = { x: p.clientX, y: p.clientY };
  };

  const onTouchEnd = (e) => {
    if (!touch.current) return;
    const p = e.changedTouches[0];
    const dx = p.clientX - touch.current.x;
    const dy = p.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) {
      goTo(page + (dx < 0 ? 1 : -1));
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("allTitle")}</h1>
            <p className={styles.subtitle}>{t("allSubtitle")}</p>
          </div>
          <span className={styles.count}>
            <b>{products.length}</b> {t("fFound")}
          </span>
        </header>

        <div className={styles.slider} style={{ "--cols": cols }}>
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label={t("prevSlide")}
          >
            <ArrowIcon dir="left" />
          </button>

          <div
            className={styles.viewport}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className={styles.track}
              style={{ transform: `translateX(-${page * 100}%)` }}
            >
              {slides.map((group, index) => (
                <div
                  key={index}
                  className={styles.slide}
                  aria-hidden={index !== page}
                >
                  <div className={styles.grid}>
                    {group.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        tabbable={index === page}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={`${styles.nav} ${styles.navNext}`}
            onClick={() => goTo(page + 1)}
            disabled={page === total - 1}
            aria-label={t("nextSlide")}
          >
            <ArrowIcon dir="right" />
          </button>
        </div>

        <footer className={styles.pager}>
          <div className={styles.dots}>
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`${styles.dot} ${index === page ? styles.dotActive : ""}`}
                onClick={() => goTo(index)}
                aria-label={`${t("goToSlide")} ${index + 1}`}
                aria-current={index === page}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <span className={styles.pageInfo}>
            {t("pageLabel", { n: page + 1, total })}
          </span>
        </footer>
      </div>
    </section>
  );
}

export default AllProducts;
