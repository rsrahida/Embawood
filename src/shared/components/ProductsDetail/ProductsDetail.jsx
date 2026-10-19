import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useCart } from "../../../context/CartContext";
import { useToast } from "../Toast/ToastProvider";
import { getCurrentUser } from "../../../utils/auth";
import { products, getProductById } from "../../../data/products";
import styles from "./ProductsDetail.module.css";

const Heart = ({ filled }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill={filled ? "#e53935" : "none"}
    stroke={filled ? "#e53935" : "currentColor"}
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);
const Cart = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
    <path d="M2 3h3l2.7 12.4a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 7H6" />
  </svg>
);
const Shield = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6z" />
    <path d="M8.5 12l2.5 2.5L15.5 10" />
  </svg>
);
const Card = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="M3 10h18M7 15h4" />
  </svg>
);
const Truck = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 6h11v10H2zM13 9h4l3 3v4h-7" />
    <circle cx="7" cy="18" r="1.8" />
    <circle cx="17" cy="18" r="1.8" />
  </svg>
);

const Stars = ({ value, size = 18 }) => (
  <span
    className={styles.stars}
    style={{ fontSize: size }}
    aria-label={`${value}/5`}
  >
    <span className={styles.starsBg}>★★★★★</span>
    <span className={styles.starsFg} style={{ width: `${(value / 5) * 100}%` }}>
      ★★★★★
    </span>
  </span>
);

const COLOR_HEX = [
  ["qəhvəyi", "#8b4a35"],
  ["brown", "#8b4a35"],
  ["krem", "#e9e1d6"],
  ["cream", "#e9e1d6"],
  ["bej", "#d9cbb5"],
  ["beige", "#d9cbb5"],
  ["kərpic", "#b4452c"],
  ["brick", "#b4452c"],
  ["qara", "#1f1f1f"],
  ["black", "#1f1f1f"],
  ["ağ", "#f4f4f2"],
  ["white", "#f4f4f2"],
  ["boz-mavi", "#6f8394"],
  ["grey-blue", "#6f8394"],
  ["boz", "#9a9a9a"],
  ["grey", "#9a9a9a"],
  ["tünd mavi", "#1f3a63"],
  ["dark blue", "#1f3a63"],
  ["mavi", "#3c78c4"],
  ["blue", "#3c78c4"],
  ["zeytun", "#6b7a3a"],
  ["olive", "#6b7a3a"],
  ["sarı", "#d9a621"],
  ["yellow", "#d9a621"],
  ["bordo", "#6e1f2f"],
  ["burgundy", "#6e1f2f"],
  ["narıncı", "#d9702b"],
  ["orange", "#d9702b"],
  ["taxta", "#b98a58"],
  ["wood", "#b98a58"],
  ["qoz", "#5b3b25"],
  ["walnut", "#5b3b25"],
];
const getHex = (name = "") => {
  const n = name.toLowerCase();
  const hit = COLOR_HEX.find(([k]) => n.includes(k));
  return hit ? hit[1] : "#cccccc";
};
const splitColors = (name = "") =>
  name
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

const INSTALLMENT_TERMS = [6, 12, 18];
const DEFAULT_TERM = 12;
const TERM_RATES = { 6: 0, 12: 0, 18: 0 };

const formatMoney = (n) =>
  n.toLocaleString("az-AZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ProductsDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { lang, t, lp } = useLanguage();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { items: cartItems, addToCart } = useCart();
  const { showToast } = useToast();
  const isAz = lang === "az";
  const pick = (p, key) => (isAz ? p[`${key}Az`] : p[`${key}En`]);
  const product = getProductById(id);
  const wished = product ? isInWishlist(product.id) : false;
  const [activeImg, setActiveImg] = useState(0);
  const [size, setSize] = useState(null);
  const [colorIdx, setColorIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("specs");
  const [justAdded, setJustAdded] = useState(false);
  const [term, setTerm] = useState(DEFAULT_TERM);
  const addedTimer = useRef(null);

  useEffect(() => {
    setActiveImg(0);
    setColorIdx(0);
    setQty(1);
    setTab("specs");
    setSize(null);
    setJustAdded(false);
    setTerm(DEFAULT_TERM);
  }, [id]);

  useEffect(() => () => clearTimeout(addedTimer.current), []);

  const similar = useMemo(() => {
    if (!product) return [];
    return products
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, 3);
  }, [product]);
  if (!product) {
    return (
      <div className={styles.notFound}>
        <h2>{t("pdNotFound")}</h2>
        <Link to={`/${lang}/products`} className={styles.backLink}>
          {t("pdBack")}
        </Link>
      </div>
    );
  }

  const name = pick(product, "name");
  const dimension = pick(product, "dimensions");
  const unit = t("pdUnitCm");
  const sizes =
    product.category === "bedroom" || product.category === "mattresses"
      ? [...new Set([dimension, `160 x 200 ${unit}`, `180 x 200 ${unit}`])]
          .filter(
            (s) =>
              s === dimension || s.startsWith("160") || s.startsWith("180"),
          )
          .slice(0, 2)
          .sort()
      : [dimension];
  const selectedSize = size ?? dimension;

  const colors = splitColors(pick(product, "color"));
  const hasDiscount = product.discount > 0 && product.oldPrice > product.price;
  const saved = product.oldPrice - product.price;
  const maxQty = Math.max(1, product.stock);
  const totalPrice = product.price * qty;
  const rate = TERM_RATES[term] || 0;
  const totalWithRate = totalPrice * (1 + rate);
  const monthly = totalWithRate / term;
  const crops = [
    { objectPosition: "center", transform: "scale(1)" },
    { objectPosition: "30% 60%", transform: "scale(1.35)" },
    { objectPosition: "70% 20%", transform: "scale(2)" },
  ];

  const specRows = [
    [t("pdLblMaterial"), pick(product, "material")],
    [t("pdLblColor"), pick(product, "color")],
    [t("pdLblSize"), dimension],
    [t("pdLblBrand"), product.brand],
    product.bedTypeAz && [t("pdLblType"), pick(product, "bedType")],
    product.sofaTypeAz && [t("pdLblType"), pick(product, "sofaType")],
    product.seats && [t("pdLblSeats"), product.seats],
    product.tableShapeAz && [t("pdLblShape"), pick(product, "tableShape")],
    product.chairsCount && [t("pdLblChairs"), product.chairsCount],
    product.heightAz && [t("pdLblHeight"), pick(product, "height")],
    product.firmnessAz && [t("pdLblFirmness"), pick(product, "firmness")],
    product.mattressTypeAz && [t("pdLblType"), pick(product, "mattressType")],
    [t("pdLblWarranty"), pick(product, "warranty")],
  ].filter(Boolean);

  const handleAddToCart = () => {
    if (!product.inStock) return;

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

    const inCart = cartItems.find((i) => i.id === product.id)?.qty || 0;
    if (inCart + qty > product.stock) {
      showToast({
        variant: "danger",
        title: isAz ? "Stok kifayət etmir" : "Not enough stock",
        message: isAz
          ? `Səbətdə artıq ${inCart} ədəd var. Maksimum ${product.stock} ədəd əlavə etmək olar.`
          : `You already have ${inCart} in your cart. Maximum is ${product.stock}.`,
      });
      return;
    }

    addToCart(product, qty);
    showToast({
      variant: "success",
      title: isAz ? "Səbətə əlavə olundu" : "Added to cart",
      message: qty > 1 ? `${name} × ${qty}` : name,
      image: product.image,
    });

    setJustAdded(true);
    clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 1800);
  };

  const handleWish = () => {
    toggleWishlist(product);
  };

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.top}>
          <section className={styles.gallery}>
            <div className={styles.mainImg}>
              {hasDiscount && (
                <span className={styles.badgeDiscount}>
                  -{product.discount}%
                </span>
              )}
              <button
                type="button"
                className={styles.wishRound}
                onClick={handleWish}
                aria-label={t("pdAddWish")}
              >
                <Heart filled={wished} />
              </button>
              <img src={product.image} alt={name} style={crops[activeImg]} />
            </div>
            <div className={styles.thumbs}>
              {crops.map((c, i) => (
                <button
                  type="button"
                  key={i}
                  className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={product.image} alt="" style={c} />
                </button>
              ))}
            </div>
          </section>
          <section className={styles.info}>
            <h1 className={styles.title}>{name}</h1>
            <div className={styles.ratingRow}>
              <Stars value={product.rating} />
              <span className={styles.ratingText}>
                {product.rating} ({product.reviewsCount} {t("pdReviews")})
              </span>
            </div>
            <div className={styles.priceRow}>
              <span className={styles.price}>{product.price} ₼</span>
              {hasDiscount && (
                <span className={styles.oldPrice}>{product.oldPrice} ₼</span>
              )}
              {hasDiscount && (
                <span className={styles.saved}>
                  {saved} ₼ {t("pdSave")}
                </span>
              )}
            </div>
            <p className={styles.shortDesc}>{pick(product, "description")}</p>
            <div
              className={`${styles.stock} ${product.inStock ? styles.inStock : styles.noStock}`}
            >
              <i />
              {product.inStock ? (
                <>
                  <span>{t("pdInStock")}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.stockCount}>
                    {product.stock} {t("pdPcs")}
                  </span>
                </>
              ) : (
                <span>{t("pdOutOfStock")}</span>
              )}
            </div>
            <div className={styles.option}>
              <span className={styles.optLabel}>{t("pdSize")}</span>
              <div className={styles.optBody}>
                {sizes.map((s) => (
                  <button
                    type="button"
                    key={s}
                    className={`${styles.sizeBtn} ${selectedSize === s ? styles.sizeActive : ""}`}
                    onClick={() => setSize(s)}
                  >
                    {s.replace(/ x /g, " × ")}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.option}>
              <span className={styles.optLabel}>{t("pdColor")}</span>
              <div className={styles.optBody}>
                {colors.map((c, i) => (
                  <button
                    type="button"
                    key={c}
                    title={c}
                    className={`${styles.swatch} ${colorIdx === i ? styles.swatchActive : ""}`}
                    onClick={() => setColorIdx(i)}
                  >
                    <span style={{ background: getHex(c) }} />
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.option}>
              <span className={styles.optLabel}>{t("pdQty")}</span>
              <div className={styles.optBody}>
                <div className={styles.qty}>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    type="button"
                    onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                    disabled={qty >= maxQty}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
            {product.inStock && (
              <div className={styles.installment}>
                <div className={styles.instHead}>
                  <span className={styles.instTitle}>{t("pdInstallment")}</span>
                  <span className={styles.instBadge}>
                    {Math.round(rate * 100)}%
                  </span>
                </div>

                <div className={styles.instTerms}>
                  {INSTALLMENT_TERMS.map((m) => (
                    <button
                      type="button"
                      key={m}
                      className={`${styles.termBtn} ${term === m ? styles.termActive : ""}`}
                      onClick={() => setTerm(m)}
                    >
                      {m} {t("pdMonthShort")}
                    </button>
                  ))}
                </div>

                <div className={styles.instResult}>
                  <div>
                    <span className={styles.instLabel}>
                      {t("pdMonthlyPay")}
                    </span>
                    <b className={styles.instAmount}>
                      {formatMoney(monthly)} ₼
                      <small> / {t("pdMonthShort")}</small>
                    </b>
                  </div>
                  <span className={styles.instTotal}>
                    {t("pdTotal")}: {formatMoney(totalWithRate)} ₼
                  </span>
                </div>
              </div>
            )}
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.addCart}
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                <Cart />
                {justAdded ? t("pdAdded") : t("pdAddCart")}
              </button>
              <button
                type="button"
                className={`${styles.addWish} ${wished ? styles.addWishActive : ""}`}
                onClick={handleWish}
              >
                <Heart filled={wished} />
                {wished ? t("pdInWish") : t("pdAddWish")}
              </button>
            </div>
            <div className={styles.perks}>
              <div className={styles.perk}>
                <Shield />
                <span>
                  {pick(product, "warranty")} {t("pdWarranty")}
                </span>
              </div>
              <div className={styles.perk}>
                <Card />
                <span>{t("pdSecure")}</span>
              </div>
              <div className={styles.perk}>
                <Truck />
                <span>{t("pdDelivery")}</span>
              </div>
            </div>
            <hr className={styles.divider} />
          </section>
        </div>
        <div className={styles.bottom}>
          <section className={styles.aboutBox}>
            <h2 className={styles.sectionTitle}>{t("pdAbout")}</h2>
            <div className={styles.tabs}>
              <button
                type="button"
                className={tab === "specs" ? styles.tabActive : ""}
                onClick={() => setTab("specs")}
              >
                {t("pdSpecs")}
              </button>
              <button
                type="button"
                className={tab === "delivery" ? styles.tabActive : ""}
                onClick={() => setTab("delivery")}
              >
                {t("pdDelTab")}
              </button>
            </div>
            {tab === "specs" ? (
              <div className={styles.aboutGrid}>
                <table className={styles.specTable}>
                  <tbody>
                    {specRows.map(([k, v], i) => (
                      <tr key={`${k}-${i}`}>
                        <td>{k}</td>
                        <td>{String(v).replace(/ x /g, " × ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.deliveryText}>
                <p>{t("pdDelText")}</p>
                <p>
                  {pick(product, "warranty")} — {t("pdWarText")}
                </p>
              </div>
            )}
          </section>
          <aside className={styles.similar}>
            <h2 className={styles.sectionTitle}>{t("pdSimilar")}</h2>
            <div className={styles.similarGrid}>
              {similar.map((p) => (
                <Link
                  to={`/${lang}/product/${p.id}`}
                  key={p.id}
                  className={styles.card}
                >
                  <div className={styles.cardImg}>
                    {p.isNew && (
                      <span className={styles.cardNew}>{t("pdIsNew")}</span>
                    )}
                    {!p.isNew && p.discount > 0 && (
                      <span className={styles.cardDiscount}>
                        -{p.discount}%
                      </span>
                    )}
                    <img src={p.image} alt={pick(p, "name")} />
                  </div>
                  <div className={styles.cardBody}>
                    <h3>{pick(p, "name")}</h3>
                    <div className={styles.cardPrice}>
                      <b>{p.price} ₼</b>
                      {p.discount > 0 && <s>{p.oldPrice} ₼</s>}
                      {p.discount > 0 && !p.isNew && <em>-{p.discount}%</em>}
                      {p.isNew && (
                        <em className={styles.newPill}>{t("pdIsNew")}</em>
                      )}
                    </div>
                    <div className={styles.cardRating}>
                      <span>★</span> {p.rating} ({p.reviewsCount}{" "}
                      {t("pdReviews")})
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

export default ProductsDetail;
