const normalize = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/ə/g, "e")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const searchProducts = (products, query, limit = Infinity) => {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];

  const fullQuery = tokens.join(" ");

  return products
    .map((product) => {
      const names = normalize(`${product.nameAz} ${product.nameEn}`);
      const haystack = normalize(
        [
          product.nameAz,
          product.nameEn,
          product.categoryNameAz,
          product.categoryNameEn,
          product.brand,
          product.colorAz,
          product.colorEn,
        ].join(" "),
      );

      if (!tokens.every((token) => haystack.includes(token))) return null;

      let score = 0;
      if (names.includes(fullQuery)) score += 10;
      if (names.startsWith(fullQuery)) score += 5;
      tokens.forEach((token) => {
        if (names.includes(token)) score += 2;
      });

      return { product, score };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
};
