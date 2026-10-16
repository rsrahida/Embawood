import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../../../shared/components/ProductCard/ProductCard";
import { getProductsByCategory } from "../../../data/products";
import { useLanguage } from "../../../context/LanguageContext";
import Mattressfilters from "./Mattressfilters/Mattressfilters";
import {
  SORT_OPTIONS,
  applyFilters,
  buildSearchParams,
  countActive,
  getDefaultFilters,
  getPriceBounds,
  parseSearchParams,
  sortProducts,
} from "./Mattressfilters/Mattressfilterutils";
import styles from "./Mattresses.module.css";

const FilterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

const Mattresses = () => {
  const { t } = useLanguage();
  const allProducts = useMemo(() => getProductsByCategory("mattresses"), []);
  const bounds = useMemo(() => getPriceBounds(allProducts), [allProducts]);
  const [searchParams, setSearchParams] = useSearchParams();
  const { filters, sort } = useMemo(
    () => parseSearchParams(searchParams, allProducts),
    [searchParams, allProducts],
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const updateUrl = (nextFilters, nextSort = sort) =>
    setSearchParams(buildSearchParams(nextFilters, nextSort, allProducts), {
      replace: true,
    });
  const visibleProducts = useMemo(
    () => sortProducts(applyFilters(allProducts, filters), sort),
    [allProducts, filters, sort],
  );
  const activeCount = countActive(filters, bounds);
  const resetFilters = () => updateUrl(getDefaultFilters(allProducts), sort);

  return (
    <section className={styles.page}>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <Mattressfilters
            products={allProducts}
            filters={filters}
            onChange={(next) => updateUrl(next)}
            onReset={resetFilters}
            resultCount={visibleProducts.length}
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
          />
        </aside>
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <button
              type="button"
              className={styles.filterToggle}
              onClick={() => setDrawerOpen(true)}
            >
              <FilterIcon />
              {t("fTitle")}
              {activeCount > 0 && (
                <span className={styles.toggleBadge}>{activeCount}</span>
              )}
            </button>
            <p className={styles.resultCount}>
              <strong>{visibleProducts.length}</strong> {t("fFound")}
            </p>
            <label className={styles.sort}>
              <span className={styles.sortLabel}>{t("fSortBy")}</span>
              <select
                className={styles.sortSelect}
                value={sort}
                onChange={(e) => updateUrl(filters, e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {visibleProducts.length > 0 ? (
            <div className={styles.grid}>
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>{t("fEmptyTitle")}</p>
              <p className={styles.emptyText}>{t("mEmptyText")}</p>
              <button
                type="button"
                className={styles.emptyBtn}
                onClick={resetFilters}
              >
                {t("fClear")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Mattresses;
