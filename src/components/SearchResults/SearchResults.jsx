import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import products from "../../data/products";
import { searchProducts } from "../../utils/searchProducts";
import ProductCard from "../../shared/components/ProductCard/ProductCard"; // öz yoluna görə düzəlt
import styles from "./SearchResults.module.css";

const SearchIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="48"
    height="48"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </svg>
);

function SearchResults() {
  const { t, lp } = useLanguage();
  const [params] = useSearchParams();
  const query = (params.get("q") || "").trim();

  const results = useMemo(() => searchProducts(products, query), [query]);

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("searchResultsTitle")}</h1>
            {query && (
              <p className={styles.subtitle}>
                {t("searchResultsFor")} “<b>{query}</b>”
              </p>
            )}
          </div>
          {results.length > 0 && (
            <span className={styles.count}>
              <b>{results.length}</b> {t("fFound")}
            </span>
          )}
        </header>
        {results.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <SearchIcon />
            </div>
            <h2 className={styles.emptyTitle}>{t("searchEmptyTitle")}</h2>
            <p className={styles.emptyText}>{t("searchEmptyText")}</p>
            <Link to={lp("/products")} className={styles.emptyBtn}>
              {t("wishlistEmptyBtn")}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default SearchResults;
