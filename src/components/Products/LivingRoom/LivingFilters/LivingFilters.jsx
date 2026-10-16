import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../../../../context/LanguageContext";
import styles from "./LivingFilters.module.css";
import {
  COLOR_HEX,
  RATING_OPTIONS,
  countActive,
  createLabeler,
  getFacets,
  getPriceBounds,
} from "./livingFilterUtils";

const CURRENCY = "₼";
const PRICE_STEP = 10;
const QUICK = [
  { key: "inStockOnly", labelKey: "fInStock" },
  { key: "discountOnly", labelKey: "fSale" },
  { key: "newOnly", labelKey: "fNew" },
];

const Icon = ({ children, size = 16, stroke = 2 }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

const ChevronIcon = ({ open }) => (
  <span className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}>
    <Icon size={18}>
      <path d="M6 9l6 6 6-6" />
    </Icon>
  </span>
);

const CheckIcon = () => (
  <Icon size={13} stroke={3.2}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Icon>
);

const CloseIcon = ({ size = 20 }) => (
  <Icon size={size}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Icon>
);

const StarIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="15"
    height="15"
    aria-hidden="true"
    className={styles.star}
  >
    <path
      d="M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.5l-5.9 3.2 1.2-6.6L2.5 9.5l6.6-.9L12 2.5z"
      fill="currentColor"
    />
  </svg>
);

const Section = ({ title, badge = 0, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className={styles.section}>
      <button
        type="button"
        className={styles.sectionHead}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className={styles.sectionTitle}>
          {title}
          {badge > 0 && <span className={styles.badge}>{badge}</span>}
        </span>
        <ChevronIcon open={open} />
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </section>
  );
};

const Row = ({ checked, onChange, label, count }) => {
  const off = count === 0 && !checked;
  return (
    <label className={`${styles.row} ${off ? styles.rowOff : ""}`}>
      <input
        type="checkbox"
        className={styles.rowInput}
        checked={checked}
        disabled={off}
        onChange={onChange}
      />
      <span className={styles.rowBox}>
        <CheckIcon />
      </span>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowCount}>{count}</span>
    </label>
  );
};

const toggleIn = (list, value) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

const LivingFilters = ({
  products,
  filters,
  onChange,
  onReset,
  resultCount,
  isOpen = false,
  onClose = () => {},
}) => {
  const { t, lang } = useLanguage();
  const seatLabel = (n) => t("lSeatsLabel", { n });
  const bounds = useMemo(() => getPriceBounds(products), [products]);
  const facets = useMemo(
    () => getFacets(products, filters),
    [products, filters],
  );
  const labeler = useMemo(
    () => createLabeler(products, lang),
    [products, lang],
  );
  const activeCount = countActive(filters, bounds);
  const update = (patch) => onChange({ ...filters, ...patch });
  const [lo, hi] = filters.price;
  const [minDraft, setMinDraft] = useState(String(lo));
  const [maxDraft, setMaxDraft] = useState(String(hi));

  useEffect(() => {
    setMinDraft(String(lo));
    setMaxDraft(String(hi));
  }, [lo, hi]);

  const commitDrafts = () => {
    let a = Number(minDraft);
    let b = Number(maxDraft);
    if (Number.isNaN(a)) a = bounds.min;
    if (Number.isNaN(b)) b = bounds.max;
    a = Math.min(Math.max(a, bounds.min), bounds.max);
    b = Math.min(Math.max(b, bounds.min), bounds.max);
    if (a > b) [a, b] = [b, a];
    update({ price: [a, b] });
  };
  const span = bounds.max - bounds.min || 1;
  const leftPct = ((lo - bounds.min) / span) * 100;
  const rightPct = ((hi - bounds.min) / span) * 100;
  const tags = [];
  if (lo !== bounds.min || hi !== bounds.max) {
    tags.push({
      id: "price",
      label: `${lo} – ${hi} ${CURRENCY}`,
      clear: () => update({ price: [bounds.min, bounds.max] }),
    });
  }
  const listTags = (key, format = (v) => v) =>
    filters[key].forEach((v) =>
      tags.push({
        id: `${key}:${v}`,
        label: format(v),
        clear: () => update({ [key]: filters[key].filter((x) => x !== v) }),
      }),
    );
  listTags("sofaTypes", labeler.sofaType);
  listTags("seats", seatLabel);
  listTags("colors", labeler.color);
  listTags("materials", labeler.material);
  listTags("brands");
  if (filters.minRating) {
    tags.push({
      id: "rating",
      label: t("fRatingTag", { n: filters.minRating }),
      clear: () => update({ minRating: 0 }),
    });
  }
  QUICK.forEach(({ key, labelKey }) => {
    if (filters[key])
      tags.push({
        id: key,
        label: t(labelKey),
        clear: () => update({ [key]: false }),
      });
  });
  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}
      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        <header className={styles.header}>
          <h2 className={styles.heading}>{t("fTitle")}</h2>
          <div className={styles.headActions}>
            {activeCount > 0 && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={onReset}
              >
                {t("fClearAll")}
              </button>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label={t("fClose")}
            >
              <CloseIcon />
            </button>
          </div>
        </header>
        <div className={styles.scroll}>
          <div className={styles.quick}>
            {QUICK.map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                aria-pressed={filters[key]}
                className={`${styles.quickBtn} ${filters[key] ? styles.quickOn : ""}`}
                onClick={() => update({ [key]: !filters[key] })}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
          {tags.length > 0 && (
            <ul className={styles.tags} aria-label={t("fSelected")}>
              {tags.map((tag) => (
                <li key={tag.id}>
                  <button
                    type="button"
                    className={styles.tag}
                    onClick={tag.clear}
                    aria-label={t("fRemove", { label: tag.label })}
                  >
                    {tag.label}
                    <CloseIcon size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Section title={t("lSofaType")} badge={filters.sofaTypes.length}>
            <div className={styles.list}>
              {facets.sofaTypes.map(({ value, count }) => (
                <Row
                  key={value}
                  label={labeler.sofaType(value)}
                  count={count}
                  checked={filters.sofaTypes.includes(value)}
                  onChange={() =>
                    update({ sofaTypes: toggleIn(filters.sofaTypes, value) })
                  }
                />
              ))}
            </div>
          </Section>
          <Section title={t("lSeats")} badge={filters.seats.length}>
            <div className={styles.sizes}>
              {facets.seats.map(({ value, count }) => {
                const active = filters.seats.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    disabled={count === 0 && !active}
                    className={`${styles.size} ${active ? styles.sizeActive : ""}`}
                    onClick={() =>
                      update({ seats: toggleIn(filters.seats, value) })
                    }
                  >
                    <span className={styles.sizeValue}>{seatLabel(value)}</span>
                    <span className={styles.sizeCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section
            title={t("price")}
            badge={lo !== bounds.min || hi !== bounds.max ? 1 : 0}
          >
            <div className={styles.range}>
              <div className={styles.rangeTrack} />
              <div
                className={styles.rangeFill}
                style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
              />
              <input
                type="range"
                className={styles.rangeInput}
                min={bounds.min}
                max={bounds.max}
                step={PRICE_STEP}
                value={lo}
                onChange={(e) =>
                  update({
                    price: [
                      Math.min(Number(e.target.value), hi - PRICE_STEP),
                      hi,
                    ],
                  })
                }
                aria-label={t("fMinPrice")}
              />
              <input
                type="range"
                className={styles.rangeInput}
                min={bounds.min}
                max={bounds.max}
                step={PRICE_STEP}
                value={hi}
                onChange={(e) =>
                  update({
                    price: [
                      lo,
                      Math.max(Number(e.target.value), lo + PRICE_STEP),
                    ],
                  })
                }
                aria-label={t("fMaxPrice")}
              />
            </div>
            <div className={styles.priceInputs}>
              <label className={styles.priceField}>
                <span className={styles.srOnly}>{t("fMinPrice")}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={styles.priceInput}
                  value={minDraft}
                  min={bounds.min}
                  max={bounds.max}
                  onChange={(e) => setMinDraft(e.target.value)}
                  onBlur={commitDrafts}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                />
                <span className={styles.priceCurrency}>{CURRENCY}</span>
              </label>
              <span className={styles.priceDash}>–</span>
              <label className={styles.priceField}>
                <span className={styles.srOnly}>{t("fMaxPrice")}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  className={styles.priceInput}
                  value={maxDraft}
                  min={bounds.min}
                  max={bounds.max}
                  onChange={(e) => setMaxDraft(e.target.value)}
                  onBlur={commitDrafts}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                />
                <span className={styles.priceCurrency}>{CURRENCY}</span>
              </label>
            </div>
          </Section>
          <Section title={t("fColor")} badge={filters.colors.length}>
            <div className={styles.swatches}>
              {facets.colors.map(({ value, count }) => {
                const active = filters.colors.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    disabled={count === 0 && !active}
                    className={`${styles.swatchBtn} ${active ? styles.swatchActive : ""}`}
                    onClick={() =>
                      update({ colors: toggleIn(filters.colors, value) })
                    }
                  >
                    <span
                      className={styles.swatch}
                      style={{ background: COLOR_HEX[value] || "#cccccc" }}
                    />
                    <span className={styles.swatchName}>
                      {labeler.color(value)}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section title={t("lMaterial")} badge={filters.materials.length}>
            <div className={styles.list}>
              {facets.materials.map(({ value, count }) => (
                <Row
                  key={value}
                  label={labeler.material(value)}
                  count={count}
                  checked={filters.materials.includes(value)}
                  onChange={() =>
                    update({ materials: toggleIn(filters.materials, value) })
                  }
                />
              ))}
            </div>
          </Section>
          <Section title={t("fBrand")} badge={filters.brands.length}>
            <div className={styles.list}>
              {facets.brands.map(({ value, count }) => (
                <Row
                  key={value}
                  label={value}
                  count={count}
                  checked={filters.brands.includes(value)}
                  onChange={() =>
                    update({ brands: toggleIn(filters.brands, value) })
                  }
                />
              ))}
            </div>
          </Section>
          <Section title={t("fRating")} badge={filters.minRating ? 1 : 0}>
            <div
              className={styles.ratings}
              role="radiogroup"
              aria-label={t("fMinRating")}
            >
              {RATING_OPTIONS.map((r) => {
                const active = filters.minRating === r;
                return (
                  <button
                    key={r}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    className={`${styles.rating} ${active ? styles.ratingActive : ""}`}
                    onClick={() => update({ minRating: active ? 0 : r })}
                  >
                    <StarIcon />
                    {r}+
                  </button>
                );
              })}
            </div>
          </Section>
        </div>
        <footer className={styles.footer}>
          <button type="button" className={styles.applyBtn} onClick={onClose}>
            {t("fShow", { n: resultCount })}
          </button>
        </footer>
      </div>
    </>
  );
};

export default LivingFilters;
