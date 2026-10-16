import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../shared/components/ProductCard/ProductCard"; // öz yoluna görə düzəlt
import styles from "./Wishlist.module.css";

const HeartBigIcon = () => (
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
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

function Wishlist() {
  const { t, lp } = useLanguage();
  const { items, count } = useWishlist();

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("wishlistTitle")}</h1>
            <p className={styles.subtitle}>{t("wishlistSubtitle")}</p>
          </div>
          {count > 0 && (
            <span className={styles.count}>
              <b>{count}</b> {t("fFound")}
            </span>
          )}
        </header>
        {count === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <HeartBigIcon />
            </div>
            <h2 className={styles.emptyTitle}>{t("wishlistEmptyTitle")}</h2>
            <p className={styles.emptyText}>{t("wishlistEmptyText")}</p>
            <Link to={lp("/products")} className={styles.emptyBtn}>
              {t("wishlistEmptyBtn")}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Wishlist;
