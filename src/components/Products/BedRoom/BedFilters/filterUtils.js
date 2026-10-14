export const COLOR_HEX = {
  Qəhvəyi: "#6b4a3a",
  Krem: "#efe3cf",
  Bej: "#d9c3a5",
  Ağ: "#ffffff",
  "Kərpic qırmızısı": "#a8452b",
  Qara: "#1d1d1d",
  "Boz-mavi": "#7d8fa0",
  "Tünd mavi": "#1f3a5f",
};

export const RATING_OPTIONS = [4.5, 4, 3.5];

export const SORT_OPTIONS = [
  { value: "default", label: "Standart" },
  { value: "price-asc", label: "Qiymət: ucuzdan bahaya" },
  { value: "price-desc", label: "Qiymət: bahadan ucuza" },
  { value: "rating", label: "Ən yüksək reytinq" },
  { value: "discount", label: "Ən böyük endirim" },
];

export const splitColors = (colorAz = "") =>
  colorAz
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

export const getPriceBounds = (products) => {
  if (!products.length) return { min: 0, max: 0 };
  const prices = products.map((p) => p.price);
  return {
    min: Math.floor(Math.min(...prices) / 10) * 10,
    max: Math.ceil(Math.max(...prices) / 10) * 10,
  };
};

export const getDefaultFilters = (products) => {
  const { min, max } = getPriceBounds(products);
  return {
    price: [min, max],
    brands: [],
    bedTypes: [],
    sizes: [],
    colors: [],
    minRating: 0,
    inStockOnly: false,
    discountOnly: false,
    newOnly: false,
  };
};

const countBy = (items, getKeys) => {
  const map = new Map();
  items.forEach((item) => {
    getKeys(item).forEach((key) => map.set(key, (map.get(key) || 0) + 1));
  });
  return [...map.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

const FACET_GROUPS = {
  brands: (p) => [p.brand],
  bedTypes: (p) => [p.bedTypeAz],
  sizes: (p) => [p.dimensionsAz],
  colors: (p) => splitColors(p.colorAz),
};

export const getFacets = (products, filters = getDefaultFilters(products)) => {
  const result = {};
  Object.entries(FACET_GROUPS).forEach(([key, getKeys]) => {
    const order = countBy(products, getKeys); // sabit sıra üçün
    const base = applyFilters(products, { ...filters, [key]: [] });
    const counts = new Map(
      countBy(base, getKeys).map((o) => [o.value, o.count]),
    );
    result[key] = order.map(({ value }) => ({
      value,
      count: counts.get(value) || 0,
    }));
  });
  return result;
};

export const applyFilters = (products, f) =>
  products.filter((p) => {
    if (p.price < f.price[0] || p.price > f.price[1]) return false;
    if (f.brands.length && !f.brands.includes(p.brand)) return false;
    if (f.bedTypes.length && !f.bedTypes.includes(p.bedTypeAz)) return false;
    if (f.sizes.length && !f.sizes.includes(p.dimensionsAz)) return false;
    if (
      f.colors.length &&
      !splitColors(p.colorAz).some((c) => f.colors.includes(c))
    )
      return false;
    if (f.minRating && p.rating < f.minRating) return false;
    if (f.inStockOnly && !p.inStock) return false;
    if (f.discountOnly && !(p.discount > 0)) return false;
    if (f.newOnly && !p.isNew) return false;
    return true;
  });

export const sortProducts = (products, sort) => {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.price - b.price);
    case "price-desc":
      return list.sort((a, b) => b.price - a.price);
    case "rating":
      return list.sort(
        (a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount,
      );
    case "discount":
      return list.sort((a, b) => b.discount - a.discount);
    default:
      return list;
  }
};

export const countActive = (f, bounds) =>
  (f.price[0] !== bounds.min || f.price[1] !== bounds.max ? 1 : 0) +
  f.brands.length +
  f.bedTypes.length +
  f.sizes.length +
  f.colors.length +
  (f.minRating ? 1 : 0) +
  (f.inStockOnly ? 1 : 0) +
  (f.discountOnly ? 1 : 0) +
  (f.newOnly ? 1 : 0);

const sizeToParam = (v) =>
  v
    .replace(/\s*x\s*/gi, "x")
    .replace(/\s*sm$/i, "")
    .replace(/\s+/g, "");

export const buildSearchParams = (filters, sort, products) => {
  const bounds = getPriceBounds(products);
  const p = new URLSearchParams();

  if (filters.price[0] !== bounds.min)
    p.set("minPrice", String(filters.price[0]));
  if (filters.price[1] !== bounds.max)
    p.set("maxPrice", String(filters.price[1]));

  filters.brands.forEach((v) => p.append("brand", v));
  filters.bedTypes.forEach((v) => p.append("type", v));
  filters.sizes.forEach((v) => p.append("size", sizeToParam(v)));
  filters.colors.forEach((v) => p.append("color", v));

  if (filters.minRating) p.set("rating", String(filters.minRating));
  if (filters.inStockOnly) p.set("stock", "1");
  if (filters.discountOnly) p.set("sale", "1");
  if (filters.newOnly) p.set("new", "1");
  if (sort && sort !== "default") p.set("sort", sort);

  return p;
};

export const parseSearchParams = (params, products) => {
  const defaults = getDefaultFilters(products);
  const bounds = getPriceBounds(products);
  const facets = getFacets(products, defaults);

  const pick = (key, options, toParam = (v) => v) => {
    const valid = new Map(options.map((o) => [toParam(o.value), o.value]));
    return [...new Set(params.getAll(key))]
      .map((v) => valid.get(v))
      .filter(Boolean);
  };

  const num = (key, fallback) => {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  };

  let lo = Math.min(
    Math.max(num("minPrice", bounds.min), bounds.min),
    bounds.max,
  );
  let hi = Math.min(
    Math.max(num("maxPrice", bounds.max), bounds.min),
    bounds.max,
  );
  if (lo > hi) [lo, hi] = [hi, lo];

  const rating = num("rating", 0);
  const sortParam = params.get("sort");

  return {
    filters: {
      price: [lo, hi],
      brands: pick("brand", facets.brands),
      bedTypes: pick("type", facets.bedTypes),
      sizes: pick("size", facets.sizes, sizeToParam),
      colors: pick("color", facets.colors),
      minRating: RATING_OPTIONS.includes(rating) ? rating : 0,
      inStockOnly: params.get("stock") === "1",
      discountOnly: params.get("sale") === "1",
      newOnly: params.get("new") === "1",
    },
    sort: SORT_OPTIONS.some((o) => o.value === sortParam)
      ? sortParam
      : "default",
  };
};
