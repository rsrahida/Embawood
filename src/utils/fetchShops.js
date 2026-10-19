const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const CACHE_KEY = "embawood_shops_v2";
const CACHE_TTL = 24 * 60 * 60 * 1000;
const AZ_BBOX = { s: 38.3, w: 44.7, n: 41.95, e: 50.9 };
const NAME_RE = /emba\s?-?\s?wood|ембавуд|эмбавуд/i;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const distM = (a, b) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

const CITY_MAP = {
  baku: "Bakı",
  bakı: "Bakı",
  baki: "Bakı",
  "bakı şəhəri": "Bakı",
  ganja: "Gəncə",
  gəncə: "Gəncə",
  gence: "Gəncə",
  sumgait: "Sumqayıt",
  sumqayıt: "Sumqayıt",
  sumqayit: "Sumqayıt",
  mingachevir: "Mingəçevir",
  mingəçevir: "Mingəçevir",
  shirvan: "Şirvan",
  şirvan: "Şirvan",
  lankaran: "Lənkəran",
  lənkəran: "Lənkəran",
  shaki: "Şəki",
  şəki: "Şəki",
  sheki: "Şəki",
  aghjabadi: "Ağcabədi",
  ağcabədi: "Ağcabədi",
};
const cleanCity = (raw) => {
  if (!raw) return null;
  const c = raw.replace(/\s+(city|şəhəri|rayonu|district)$/i, "").trim();
  return CITY_MAP[c.toLowerCase()] || c;
};

const pad = (n) => String(n ?? 0).padStart(2, "0");

const formatOsmHours = (v) => {
  if (!v) return null;
  const m = v.trim().match(/^Mo-Su\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/i);
  return m ? `${m[1]}–${m[2]}` : v;
};

const buildAddress = (tags = {}) =>
  tags["addr:full"] ||
  [tags["addr:street"], tags["addr:housenumber"]].filter(Boolean).join(", ");

const fromOverpass = async (signal) => {
  const { s, w, n, e } = AZ_BBOX;
  const query = `
[out:json][timeout:30];
(
  nwr["name"~"emba\\\\s?-?wood",i](${s},${w},${n},${e});
  nwr["brand"~"emba\\\\s?-?wood",i](${s},${w},${n},${e});
  nwr["operator"~"emba\\\\s?-?wood",i](${s},${w},${n},${e});
);
out center tags;`;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  const data = await res.json();

  return (data.elements || [])
    .filter((el) => {
      const t = el.tags || {};
      return !(t.industrial || t.landuse || t.man_made || t.craft);
    })
    .map((el) => ({
      name: el.tags?.name || el.tags?.brand || "Embawood",
      city: cleanCity(el.tags?.["addr:city"]),
      address: buildAddress(el.tags),
      phone: el.tags?.phone || el.tags?.["contact:phone"] || null,
      hours: formatOsmHours(el.tags?.opening_hours),
      lat: el.lat ?? el.center?.lat,
      lng: el.lon ?? el.center?.lon,
    }))
    .filter((x) => x.lat != null && x.lng != null);
};

const fromNominatim = async (signal) => {
  const out = [];

  for (const q of ["Embawood", "Embawood mağazası"]) {
    const params = new URLSearchParams({
      q,
      countrycodes: "az",
      format: "jsonv2",
      addressdetails: "1",
      limit: "40",
      "accept-language": "az",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      { signal },
    );
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);
    const rows = await res.json();
    rows.forEach((r) => {
      const label = `${r.name || ""} ${r.display_name || ""}`;
      if (!NAME_RE.test(label)) return;
      const a = r.address || {};
      out.push({
        name: r.name || "Embawood",
        city: cleanCity(a.city || a.town || a.village || a.county || a.state),
        address: [a.road, a.house_number].filter(Boolean).join(", "),
        phone: null,
        hours: null,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
      });
    });
    await sleep(1100);
  }
  return out;
};

const fromArcGis = async (signal) => {
  const params = new URLSearchParams({
    SingleLine: "Embawood",
    countryCode: "AZ",
    outFields: "PlaceName,Place_addr,LongLabel,City,Region,Phone",
    maxLocations: "50",
    forStorage: "false",
    f: "json",
  });
  const res = await fetch(
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?${params}`,
    { signal },
  );
  if (!res.ok) throw new Error(`ArcGIS ${res.status}`);
  const data = await res.json();
  if (data.error)
    throw new Error(`ArcGIS: ${data.error.message || data.error.code}`);

  return (data.candidates || [])
    .filter((c) => c.location && NAME_RE.test(c.attributes?.PlaceName || ""))
    .map((c) => ({
      name: c.attributes.PlaceName,
      city: cleanCity(c.attributes.City || c.attributes.Region),
      address: c.attributes.Place_addr || c.attributes.LongLabel || "",
      phone: c.attributes.Phone || null,
      hours: null,
      lat: c.location.y,
      lng: c.location.x,
    }));
};

const googleAddress = (p) =>
  (p.formattedAddress || "").replace(/,?\s*Azərbaycan$/i, "");

const googleHours = (oh) => {
  const day = new Date().getDay();
  const p = oh?.periods?.find((x) => x.open?.day === day);
  if (!p) return null;
  if (!p.close) return "24 saat";
  return `${pad(p.open.hour)}:${pad(p.open.minute)}–${pad(p.close.hour)}:${pad(p.close.minute)}`;
};

const fromGoogle = async (signal) => {
  if (!GOOGLE_KEY) return [];
  const out = [];
  let pageToken;
  for (let i = 0; i < 3; i++) {
    const res = await fetch(
      "https://places.googleapis.com/v1/places:searchText",
      {
        method: "POST",
        signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_KEY,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location,places.addressComponents,places.nationalPhoneNumber,places.regularOpeningHours,nextPageToken",
        },
        body: JSON.stringify({
          textQuery: "Embawood",
          languageCode: "az",
          regionCode: "AZ",
          pageSize: 20,
          locationRestriction: {
            rectangle: {
              low: { latitude: AZ_BBOX.s, longitude: AZ_BBOX.w },
              high: { latitude: AZ_BBOX.n, longitude: AZ_BBOX.e },
            },
          },
          ...(pageToken && { pageToken }),
        }),
      },
    );
    if (!res.ok) throw new Error(`Google ${res.status}`);
    const data = await res.json();
    (data.places || []).forEach((p) => {
      if (!NAME_RE.test(p.displayName?.text || "") || !p.location) return;
      const comp = (t) =>
        p.addressComponents?.find((c) => c.types?.includes(t))?.longText;
      out.push({
        name: p.displayName.text,
        city: cleanCity(
          comp("locality") ||
            comp("administrative_area_level_2") ||
            comp("administrative_area_level_1"),
        ),
        address: googleAddress(p),
        phone: p.nationalPhoneNumber || null,
        hours: googleHours(p.regularOpeningHours),
        lat: p.location.latitude,
        lng: p.location.longitude,
      });
    });
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return out;
};

const mergeShops = (lists) => {
  const merged = [];
  lists.flat().forEach((item) => {
    const dup = merged.find((m) => distM(m, item) <= 150);
    if (dup) {
      ["city", "address", "phone", "hours"].forEach((k) => {
        if (!dup[k] && item[k]) dup[k] = item[k];
      });
    } else {
      merged.push({ ...item });
    }
  });
  return merged.map((m, i) => ({
    ...m,
    id: `${m.lat.toFixed(5)},${m.lng.toFixed(5)}`,
    name: m.name || `Embawood ${i + 1}`,
  }));
};

const fillMissingCities = async (shops, signal) => {
  for (const shop of shops) {
    if (shop.city) continue;
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        lat: shop.lat,
        lon: shop.lng,
        zoom: "10",
        "accept-language": "az",
      });
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?${params}`,
        { signal },
      );
      if (res.ok) {
        const a = (await res.json()).address || {};
        shop.city = cleanCity(
          a.city || a.town || a.village || a.county || a.state,
        );
      }
    } catch (err) {
      if (err.name === "AbortError") throw err;
    }
    shop.city = shop.city || "Digər";
    await sleep(1100);
  }
  return shops;
};

export const fetchShops = async (signal) => {
  try {
    const cached = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
    if (
      cached &&
      cached.shops?.length &&
      Date.now() - cached.time < CACHE_TTL
    ) {
      return cached.shops;
    }
  } catch {}

  const sources = [
    ["Google", fromGoogle],
    ["Overpass (OSM)", fromOverpass],
    ["Nominatim (OSM)", fromNominatim],
    ["ArcGIS", fromArcGis],
  ];

  const settled = await Promise.allSettled(sources.map(([, fn]) => fn(signal)));

  const report = settled.map((r, i) => ({
    mənbə: sources[i][0],
    nəticə: r.status === "fulfilled" ? r.value.length : "XƏTA",
    təfərrüat:
      r.status === "rejected" ? String(r.reason?.message || r.reason) : "",
  }));
  console.info("[Embawood mağazaları] mənbələr:");
  console.table(report);

  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");

  if (settled.every((r) => r.status === "rejected")) {
    throw new Error("Heç bir mənbədən məlumat alınmadı. Konsola (F12) baxın.");
  }

  const lists = settled
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value);
  const shops = await fillMissingCities(mergeShops(lists), signal);

  if (shops.length) {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ time: Date.now(), shops }),
      );
    } catch {}
  }
  return shops;
};
