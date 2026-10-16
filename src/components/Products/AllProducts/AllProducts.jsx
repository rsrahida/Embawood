import { useMemo, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";
import products from "../../../data/products";
import ProductCard from "../../../shared/components/ProductCard/ProductCard";
import styles from "./AllProducts.module.css";

const PER_PAGE = 16;

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
  const [page, setPage] = useState(0);
  const slides = useMemo(() => {
    const out = [];
    for (let i = 0; i < products.length; i += PER_PAGE) {
      out.push(products.slice(i, i + PER_PAGE));
    }
    return out;
  }, []);

  const total = slides.length;
  const goTo = (n) => setPage(Math.max(0, Math.min(total - 1, n)));

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
        <div className={styles.slider}>
          <button
            type="button"
            className={`${styles.nav} ${styles.navPrev}`}
            onClick={() => goTo(page - 1)}
            disabled={page === 0}
            aria-label={t("prevSlide")}
          >
            <ArrowIcon dir="left" />
          </button>

          <div className={styles.viewport}>
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
