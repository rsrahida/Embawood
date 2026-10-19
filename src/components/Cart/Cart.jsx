import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";
import styles from "./Cart.module.css";

const CURRENCY = "₼";

const CartBigIcon = () => (
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
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
);

const TrashIcon = () => (
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
    <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 10v6M14 10v6" />
  </svg>
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const BackIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);

const formatPrice = (value) =>
  Number.isInteger(value) ? value : value.toFixed(2);

function Cart() {
  const {
    items,
    count,
    total,
    totalQty,
    updateQty,
    removeFromCart,
    clearCart,
  } = useCart();
  const { lang, lp, t } = useLanguage();
  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      (item.oldPrice > item.price ? item.oldPrice : item.price) * item.qty,
    0,
  );
  const savings = subtotal - total;

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <header className={styles.head}>
          <div>
            <h1 className={styles.title}>{t("cart")}</h1>
            <p className={styles.subtitle}>{t("cartSubtitle")}</p>
          </div>
          {count > 0 && (
            <span className={styles.count}>
              <b>{count}</b> {t("cartProductsCount")}
            </span>
          )}
        </header>
        {count === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <CartBigIcon />
            </div>
            <h2 className={styles.emptyTitle}>{t("cartEmptyTitle")}</h2>
            <p className={styles.emptyText}>{t("cartEmptyText")}</p>
            <Link to={lp("/products")} className={styles.emptyBtn}>
              {t("cartBrowse")}
            </Link>
          </div>
        ) : (
          <div className={styles.layout}>
            <div className={styles.listCol}>
              <div className={styles.listHead}>
                <Link to={lp("/products")} className={styles.backLink}>
                  <BackIcon />
                  {t("cartContinue")}
                </Link>
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearCart}
                >
                  {t("cartClear")}
                </button>
              </div>
              <ul className={styles.list}>
                {items.map((item) => {
                  const name = lang === "az" ? item.nameAz : item.nameEn;
                  const hasDiscount = item.oldPrice > item.price;
                  const percent = hasDiscount
                    ? Math.round((1 - item.price / item.oldPrice) * 100)
                    : 0;
                  return (
                    <li key={item.id} className={styles.item}>
                      <Link
                        to={lp(`/product/${item.id}`)}
                        className={styles.thumbWrap}
                        aria-label={name}
                      >
                        <img
                          src={item.image}
                          alt={name}
                          className={styles.thumb}
                        />
                        {hasDiscount && (
                          <span className={styles.badge}>-{percent}%</span>
                        )}
                      </Link>{" "}
                      <div className={styles.info}>
                        <Link
                          to={lp(`/product/${item.id}`)}
                          className={styles.name}
                        >
                          {name}
                        </Link>
                        <div className={styles.unit}>
                          <span className={styles.unitPrice}>
                            {formatPrice(item.price)} {CURRENCY}
                          </span>
                          {hasDiscount && (
                            <span className={styles.oldPrice}>
                              {formatPrice(item.oldPrice)} {CURRENCY}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.qty}>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty - 1)}
                          aria-label={t("cartDecrease")}
                        >
                          −
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.id, item.qty + 1)}
                          aria-label={t("cartIncrease")}
                        >
                          +
                        </button>
                      </div>
                      <div className={styles.lineWrap}>
                        <span className={styles.lineTotal}>
                          {formatPrice(item.price * item.qty)} {CURRENCY}
                        </span>
                        {item.qty > 1 && (
                          <span className={styles.lineSub}>
                            {item.qty} × {formatPrice(item.price)} {CURRENCY}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.remove}
                        onClick={() => removeFromCart(item.id)}
                        aria-label={t("cartRemove")}
                        title={t("cartRemove")}
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>{" "}
            <aside className={styles.summary}>
              <h2 className={styles.summaryTitle}>{t("cartSummaryTitle")}</h2>
              <div className={styles.rows}>
                <div className={styles.summaryRow}>
                  <span>
                    {t("products")} ({totalQty})
                  </span>
                  <span>
                    {formatPrice(subtotal)} {CURRENCY}
                  </span>
                </div>
                {savings > 0 && (
                  <div className={`${styles.summaryRow} ${styles.savingRow}`}>
                    <span>{t("cartDiscount")}</span>
                    <span>
                      −{formatPrice(savings)} {CURRENCY}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.totalRow}>
                <span>{t("cartTotal")}</span>
                <b>
                  {formatPrice(total)} {CURRENCY}
                </b>
              </div>
              {savings > 0 && (
                <p className={styles.savingNote}>
                  {t("cartSaveNote", {
                    amount: `${formatPrice(savings)} ${CURRENCY}`,
                  })}
                </p>
              )}
              <button type="button" className={styles.checkoutBtn}>
                <span>{t("cartCheckout")}</span>
                <ArrowIcon />
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export default Cart;
