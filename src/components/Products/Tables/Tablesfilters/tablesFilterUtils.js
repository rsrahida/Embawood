export const COLOR_HEX = {
  Wood: "#b08358",
  "Light wood": "#d8b98a",
  "Dark wood": "#5a3d2b",
  "Dark walnut": "#4a3224",
  Brown: "#6b4a3a",
  "Olive green": "#6b7a3a",
  White: "#ffffff",
  Cream: "#efe3cf",
  Beige: "#d9c3a5",
  Black: "#1d1d1d",
  Grey: "#9aa0a6",
  "Grey-orange": "#b8896b",
};

export const RATING_OPTIONS = [4.5, 4, 3.5];

export const SORT_OPTIONS = [
  { value: "default", labelKey: "sortDefault" },
  { value: "price-asc", labelKey: "sortPriceAsc" },
  { value: "price-desc", labelKey: "sortPriceDesc" },
  { value: "rating", labelKey: "sortRating" },
  { value: "discount", labelKey: "sortDiscount" },
];

const splitParts = (value = "") =>
  value
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);

const firstPart = (value = "") => value.split(",")[0].trim();
export const getColorKeys = (p) => splitParts(p.colorEn);
export const getMainMaterialKey = (p) => firstPart(p.materialEn);
export const getShapeKey = (p) => p.tableShapeEn;
export const createLabeler = (products, lang) => {
  const colors = new Map();
  const shapes = new Map();
  const materials = new Map();

  products.forEach((p) => {
    const colorEn = splitParts(p.colorEn);
    const colorAz = splitParts(p.colorAz);
    colorEn.forEach((key, i) => {
      if (!colors.has(key)) colors.set(key, { az: colorAz[i] ?? key, en: key });
    });

    if (!shapes.has(p.tableShapeEn)) {
      shapes.set(p.tableShapeEn, { az: p.tableShapeAz, en: p.tableShapeEn });
    }

    const matEn = firstPart(p.materialEn);
    if (!materials.has(matEn)) {
      materials.set(matEn, { az: firstPart(p.materialAz), en: matEn });
    }
  });

  const pick = (entry, fallback) => entry?.[lang] ?? fallback;

  return {
    color: (key) => pick(colors.get(key), key),
    shape: (key) => pick(shapes.get(key), key),
    material: (key) => pick(materials.get(key), key),
  };
};

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
    shapes: [],
    chairs: [],
    colors: [],
    materials: [],
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
    .sort(
      (a, b) =>
        b.count - a.count || String(a.value).localeCompare(String(b.value)),
    );
};

const FACET_GROUPS = {
  brands: (p) => [p.brand],
  shapes: (p) => [getShapeKey(p)],
  chairs: (p) => [p.chairsCount],
  colors: (p) => getColorKeys(p),
  materials: (p) => [getMainMaterialKey(p)],
};

export const getFacets = (products, filters = getDefaultFilters(products)) => {
  const result = {};
  Object.entries(FACET_GROUPS).forEach(([key, getKeys]) => {
    const order = countBy(products, getKeys); // sabit sıra üçün
    if (key === "chairs") order.sort((a, b) => a.value - b.value); // 4, 6
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
    if (f.shapes.length && !f.shapes.includes(getShapeKey(p))) return false;
    if (f.chairs.length && !f.chairs.includes(p.chairsCount)) return false;
    if (f.colors.length && !getColorKeys(p).some((c) => f.colors.includes(c)))
      return false;
    if (f.materials.length && !f.materials.includes(getMainMaterialKey(p)))
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
  f.shapes.length +
  f.chairs.length +
  f.colors.length +
  f.materials.length +
  (f.minRating ? 1 : 0) +
  (f.inStockOnly ? 1 : 0) +
  (f.discountOnly ? 1 : 0) +
  (f.newOnly ? 1 : 0);

export const buildSearchParams = (filters, sort, products) => {
  const bounds = getPriceBounds(products);
  const p = new URLSearchParams();

  if (filters.price[0] !== bounds.min)
    p.set("minPrice", String(filters.price[0]));
  if (filters.price[1] !== bounds.max)
    p.set("maxPrice", String(filters.price[1]));

  filters.brands.forEach((v) => p.append("brand", v));
  filters.shapes.forEach((v) => p.append("shape", v));
  filters.chairs.forEach((v) => p.append("chairs", String(v)));
  filters.colors.forEach((v) => p.append("color", v));
  filters.materials.forEach((v) => p.append("material", v));

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
      .filter((v) => v !== undefined);
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
      shapes: pick("shape", facets.shapes),
      chairs: pick("chairs", facets.chairs, String),
      colors: pick("color", facets.colors),
      materials: pick("material", facets.materials),
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
