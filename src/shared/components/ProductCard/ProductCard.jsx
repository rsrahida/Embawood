import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./ProductCard.module.css";

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
  </svg>
);

const TEXT = {
  az: {
    reviews: "rəy",
    addToCart: "Səbətə əlavə et",
    outOfStock: "Stokda yoxdur",
    isNew: "Yeni",
    wishlist: "Seçilmişlərə əlavə et",
  },
  en: {
    reviews: "reviews",
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    isNew: "New",
    wishlist: "Add to wishlist",
  },
};

// ₼ simvolu: Azərbaycan manatı
const CURRENCY = "₼";

// Skeleton neçə millisaniyə görünsün
const SKELETON_DELAY = 2000;

const ProductCardSkeleton = () => (
  <article className={styles.card} aria-busy="true" aria-live="polite">
    <div className={`${styles.media} ${styles.skeleton}`} />

    <div className={styles.body}>
      <div className={`${styles.skeletonLine} ${styles.skeleton}`} style={{ width: "85%", height: 18 }} />
      <div className={`${styles.skeletonLine} ${styles.skeleton}`} style={{ width: "55%", height: 18 }} />
      <div className={`${styles.skeletonLine} ${styles.skeleton}`} style={{ width: "40%", height: 14 }} />
      <div className={`${styles.skeletonLine} ${styles.skeleton}`} style={{ width: "35%", height: 26, marginTop: 4 }} />

      <div className={styles.actions}>
        <div className={`${styles.skeletonSquare} ${styles.skeleton}`} />
        <div className={`${styles.skeletonBtn} ${styles.skeleton}`} />
      </div>
    </div>
  </article>
);

function ProductCard({ product, lang = "az" }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (!product) return null;
  if (loading) return <ProductCardSkeleton />;

  const t = TEXT[lang] ?? TEXT.az;
  const isAz = lang === "az";

  const name = isAz ? product.nameAz : product.nameEn;
  const { id, image, price, oldPrice, discount, rating, reviewsCount, inStock, isNew } = product;

  const hasDiscount = discount > 0 && oldPrice > price;

  // Statik handler-lər (sonra wishlist / cart context-ə bağlanacaq)
  const handleWishlist = () => {};
  const handleAddToCart = () => {};

  return (
    <article className={`${styles.card} ${!inStock ? styles.outOfStock : ""}`}>
      <div className={styles.media}>
        <img src={image} alt={name} className={styles.image} loading="lazy" />

        <div className={styles.badges}>
          {hasDiscount && <span className={styles.discountBadge}>-{discount}%</span>}
          {isNew && !hasDiscount && <span className={styles.newBadge}>{t.isNew}</span>}
        </div>

        <button
          type="button"
          className={styles.wishlistFloat}
          onClick={handleWishlist}
          aria-label={t.wishlist}
        >
          <HeartIcon />
        </button>

        {!inStock && <span className={styles.stockLabel}>{t.outOfStock}</span>}
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>
          <Link to={`/product/${id}`} className={styles.link}>
            {name}
          </Link>
        </h3>

        <div className={styles.rating}>
          <span className={styles.star}>
            <StarIcon />
          </span>
          <span className={styles.ratingValue}>{rating}</span>
          <span className={styles.reviews}>
            ({reviewsCount} {t.reviews})
          </span>
        </div>

        <div className={styles.prices}>
          <span className={styles.price}>
            {price} {CURRENCY}
          </span>
          {hasDiscount && (
            <span className={styles.oldPrice}>
              {oldPrice} {CURRENCY}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.wishlistBtn}
            onClick={handleWishlist}
            aria-label={t.wishlist}
          >
            <HeartIcon />
          </button>
          <button
            type="button"
            className={styles.cartBtn}
            onClick={handleAddToCart}
            disabled={!inStock}
          >
            <CartIcon />
            <span>{inStock ? t.addToCart : t.outOfStock}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;