import { useEffect, useMemo, useState } from "react";
import styles from "./BedFilters.module.css";
import {
  COLOR_HEX,
  RATING_OPTIONS,
  countActive,
  getFacets,
  getPriceBounds,
} from "./filterUtils";

const CURRENCY = "₼";
const PRICE_STEP = 10;

const QUICK = [
  { key: "inStockOnly", label: "Stokda var" },
  { key: "discountOnly", label: "Endirimli" },
  { key: "newOnly", label: "Yeni" },
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

const BedFilters = ({
  products,
  filters,
  onChange,
  onReset,
  resultCount,
  isOpen = false,
  onClose = () => {},
}) => {
  const bounds = useMemo(() => getPriceBounds(products), [products]);
  const facets = useMemo(
    () => getFacets(products, filters),
    [products, filters],
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
  const listTags = (key) =>
    filters[key].forEach((v) =>
      tags.push({
        id: `${key}:${v}`,
        label: v,
        clear: () => update({ [key]: filters[key].filter((x) => x !== v) }),
      }),
    );
  listTags("sizes");
  listTags("bedTypes");
  listTags("colors");
  listTags("brands");
  if (filters.minRating) {
    tags.push({
      id: "rating",
      label: `${filters.minRating}+ reytinq`,
      clear: () => update({ minRating: 0 }),
    });
  }
  QUICK.forEach(({ key, label }) => {
    if (filters[key])
      tags.push({ id: key, label, clear: () => update({ [key]: false }) });
  });

  return (
    <>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ""}`}>
        <header className={styles.header}>
          <h2 className={styles.heading}>Filtrlər</h2>
          <div className={styles.headActions}>
            {activeCount > 0 && (
              <button
                type="button"
                className={styles.resetBtn}
                onClick={onReset}
              >
                Hamısını sil
              </button>
            )}
            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Filtrləri bağla"
            >
              <CloseIcon />
            </button>
          </div>
        </header>
        <div className={styles.scroll}>
          <div className={styles.quick}>
            {QUICK.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                aria-pressed={filters[key]}
                className={`${styles.quickBtn} ${filters[key] ? styles.quickOn : ""}`}
                onClick={() => update({ [key]: !filters[key] })}
              >
                {label}
              </button>
            ))}
          </div>
          {tags.length > 0 && (
            <ul className={styles.tags} aria-label="Seçilmiş filtrlər">
              {tags.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    className={styles.tag}
                    onClick={t.clear}
                    aria-label={`${t.label} filtrini sil`}
                  >
                    {t.label}
                    <CloseIcon size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Section title="Ölçü" badge={filters.sizes.length}>
            <div className={styles.sizes}>
              {facets.sizes.map(({ value, count }) => {
                const active = filters.sizes.includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={active}
                    disabled={count === 0 && !active}
                    className={`${styles.size} ${active ? styles.sizeActive : ""}`}
                    onClick={() =>
                      update({ sizes: toggleIn(filters.sizes, value) })
                    }
                  >
                    <span className={styles.sizeValue}>{value}</span>
                    <span className={styles.sizeCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section title="Çarpayı növü" badge={filters.bedTypes.length}>
            <div className={styles.list}>
              {facets.bedTypes.map(({ value, count }) => (
                <Row
                  key={value}
                  label={value}
                  count={count}
                  checked={filters.bedTypes.includes(value)}
                  onChange={() =>
                    update({ bedTypes: toggleIn(filters.bedTypes, value) })
                  }
                />
              ))}
            </div>
          </Section>
          <Section
            title="Qiymət"
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
                aria-label="Minimum qiymət"
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
                aria-label="Maksimum qiymət"
              />
            </div>
            <div className={styles.priceInputs}>
              <label className={styles.priceField}>
                <span className={styles.srOnly}>Minimum qiymət</span>
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
                <span className={styles.srOnly}>Maksimum qiymət</span>
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
          <Section title="Rəng" badge={filters.colors.length}>
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
                    <span className={styles.swatchName}>{value}</span>
                  </button>
                );
              })}
            </div>
          </Section>
          <Section
            title="Brend"
            badge={filters.brands.length}
            defaultOpen={false}
          >
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
          <Section
            title="Reytinq"
            badge={filters.minRating ? 1 : 0}
            defaultOpen={false}
          >
            <div
              className={styles.ratings}
              role="radiogroup"
              aria-label="Minimum reytinq"
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
            {resultCount} məhsula bax
          </button>
        </footer>
      </div>
    </>
  );
};

export default BedFilters;
