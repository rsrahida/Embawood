import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../Toast/ToastProvider";
import { getCurrentUser } from "../../../utils/auth";
import styles from "./ProductCard.module.css";

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    width="20"
    height="20"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const CartIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z" />
  </svg>
);

const CURRENCY = "₼";
const SKELETON_DELAY = 2000;

const ProductCardSkeleton = () => (
  <article className={styles.card} aria-busy="true" aria-live="polite">
    <div className={`${styles.media} ${styles.skeleton}`} />

    <div className={styles.body}>
      <div
        className={`${styles.skeletonLine} ${styles.skeleton}`}
        style={{ width: "30%", height: 12 }}
      />
      <div
        className={`${styles.skeletonLine} ${styles.skeleton}`}
        style={{ width: "85%", height: 18 }}
      />
      <div
        className={`${styles.skeletonLine} ${styles.skeleton}`}
        style={{ width: "45%", height: 14 }}
      />
      <div className={styles.bottom}>
        <div
          className={`${styles.skeletonLine} ${styles.skeleton}`}
          style={{ width: "40%", height: 26 }}
        />
        <div className={`${styles.skeletonSquare} ${styles.skeleton}`} />
      </div>
    </div>
  </article>
);

function ProductCard({ product, tabbable = true }) {
  const { lang, t, lp } = useLanguage();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), SKELETON_DELAY);
    return () => clearTimeout(timer);
  }, []);

  if (!product) return null;
  if (loading) return <ProductCardSkeleton />;

  const isAz = lang === "az";

  const name = isAz ? product.nameAz : product.nameEn;
  const category = isAz ? product.categoryNameAz : product.categoryNameEn;
  const {
    id,
    image,
    price,
    oldPrice,
    discount,
    rating,
    reviewsCount,
    inStock,
    isNew,
  } = product;

  const liked = isInWishlist(id);
  const hasDiscount = discount > 0 && oldPrice > price;
  const tab = tabbable ? 0 : -1;

  const handleAddToCart = () => {
    if (!inStock) return;
    if (!getCurrentUser()) {
      showToast({
        variant: "info",
        title: isAz ? "Hesabınıza daxil olun" : "Please log in",
        message: isAz
          ? "Məhsulu səbətə əlavə etmək üçün hesabınıza giriş edin."
          : "Log in to your account to add products to your cart.",
        actionLabel: isAz ? "Daxil ol" : "Log in",
        actionTo: `${lp("/login")}?redirect=${encodeURIComponent(
          location.pathname + location.search,
        )}`,
      });
      return;
    }

    addToCart(product);
    showToast({
      variant: "success",
      title: isAz ? "Səbətə əlavə olundu" : "Added to cart",
      message: name,
      image,
    });
  };

  return (
    <article className={`${styles.card} ${!inStock ? styles.outOfStock : ""}`}>
      <div className={styles.media}>
        <Link
          to={lp(`/product/${id}`)}
          className={styles.imageLink}
          tabIndex={tab}
          aria-label={name}
        >
          <img src={image} alt={name} className={styles.image} loading="lazy" />
        </Link>
        <div className={styles.badges}>
          {hasDiscount && (
            <span className={styles.discountBadge}>-{discount}%</span>
          )}
          {isNew && <span className={styles.newBadge}>{t("fNew")}</span>}
        </div>
        <button
          type="button"
          tabIndex={tab}
          className={`${styles.wishlistFloat} ${liked ? styles.liked : ""}`}
          onClick={() => toggleWishlist(product)}
          aria-pressed={liked}
          aria-label={t("addToWishlist")}
        >
          <HeartIcon filled={liked} />
        </button>
        {!inStock && (
          <span className={styles.stockLabel}>{t("outOfStock")}</span>
        )}
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{category}</span>
        <h3 className={styles.name}>
          <Link
            to={lp(`/product/${id}`)}
            className={styles.link}
            tabIndex={tab}
          >
            {name}
          </Link>
        </h3>
        <div className={styles.rating}>
          <span className={styles.star}>
            <StarIcon />
          </span>
          <span className={styles.ratingValue}>{rating}</span>
          <span className={styles.reviews}>
            ({reviewsCount} {t("reviewsLabel")})
          </span>
        </div>
        <div className={styles.bottom}>
          <div className={styles.prices}>
            {hasDiscount && (
              <span className={styles.oldPrice}>
                {oldPrice} {CURRENCY}
              </span>
            )}
            <span className={styles.price}>
              {price} {CURRENCY}
            </span>
          </div>
          <button
            type="button"
            tabIndex={tab}
            className={styles.cartBtn}
            onClick={handleAddToCart}
            disabled={!inStock}
            aria-label={inStock ? t("addToCart") : t("outOfStock")}
            title={inStock ? t("addToCart") : t("outOfStock")}
          >
            <CartIcon />
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;
