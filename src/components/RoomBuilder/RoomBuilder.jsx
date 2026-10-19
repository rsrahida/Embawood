import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./RoomBuilder.module.css";
import products, { categories } from "../../data/products";
import { useLanguage } from "../../context/LanguageContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../shared/components/Toast/ToastProvider";

const iconProps = {
  viewBox: "0 0 24 24",
  width: 18,
  height: 18,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

const CartIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
);

const EyeIcon = () => (
  <svg {...iconProps}>
    <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg {...iconProps}>
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

const ROOMS = [
  { key: "s", w: 300, h: 400 },
  { key: "m", w: 400, h: 500 },
  { key: "l", w: 500, h: 600 },
];

const DEFAULT_FLOOR = "#d8b78a";
const DEFAULT_WALL = "#f4f1ea";
const isHex = (v) => typeof v === "string" && /^#[0-9a-f]{6}$/i.test(v);
const STORAGE_KEY = "embawood:roomBuilder:v2";
const GRID = 10;
const BAR_W = 240;
const BAR_H = 46;
const BAR_GAP = 8;
const BAR_EDGE = 4;

const byId = Object.fromEntries(products.map((p) => [p.id, p]));

const parseSize = (p) => {
  const s = p.dimensionsEn || "";
  const d = s.match(/Ø\s*(\d+)/);
  if (d) return { w: +d[1], h: +d[1], round: true };
  const m = s.match(/(\d+)\s*x\s*(\d+)/);
  if (m) return { w: +m[1], h: +m[2], round: false };
  return { w: 100, h: 100, round: false };
};

const dimsOf = (it) => {
  const s = parseSize(byId[it.id]);
  return it.rot ? { ...s, w: s.h, h: s.w } : s;
};

const intersects = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const rectOf = (it) => ({ x: it.x, y: it.y, ...dimsOf(it) });

const findSpot = (items, w, h, room) => {
  const taken = items.map(rectOf);
  for (let y = 0; y <= room.h - h; y += 20) {
    for (let x = 0; x <= room.w - w; x += 20) {
      const r = { x, y, w, h };
      if (!taken.some((t) => intersects(r, t))) return { x, y };
    }
  }
  return null;
};

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n) => new Intl.NumberFormat("az-AZ").format(Math.round(n));

const loadState = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (raw && Array.isArray(raw.items)) {
      return { ...raw, items: raw.items.filter((i) => byId[i.id]) };
    }
  } catch {}
  return null;
};

const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const rgbToHex = (r, g, b) =>
  "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
const isDarkColor = (h) => {
  const [r, g, b] = hexToRgb(h);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
};

const ColorField = ({ label, value, onChange }) => {
  const rgb = hexToRgb(value);
  const setChannel = (i, raw) => {
    const n = Math.max(0, Math.min(255, parseInt(raw, 10) || 0));
    const next = [...rgb];
    next[i] = n;
    onChange(rgbToHex(...next));
  };
  return (
    <div className={styles.group}>
      <span className={styles.label}>{label}</span>
      <div className={styles.colorField}>
        <input
          type="color"
          className={styles.picker}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
        />
        {["R", "G", "B"].map((ch, i) => (
          <label key={ch} className={styles.channel}>
            <span>{ch}</span>
            <input
              type="number"
              min="0"
              max="255"
              value={rgb[i]}
              onChange={(e) => setChannel(i, e.target.value)}
            />
          </label>
        ))}
      </div>
    </div>
  );
};

const RoomBuilder = () => {
  const { lang, lp, t } = useLanguage();
  const L = lang === "az" ? "Az" : "En";

  const { addToCart, items: cartItems } = useCart();
  const { showToast } = useToast();

  const saved = useMemo(loadState, []);
  const [roomKey, setRoomKey] = useState(saved?.roomKey || "m");
  const [floor, setFloor] = useState(
    isHex(saved?.floor) ? saved.floor : DEFAULT_FLOOR,
  );
  const [wall, setWall] = useState(
    isHex(saved?.wall) ? saved.wall : DEFAULT_WALL,
  );
  const [items, setItems] = useState(saved?.items || []);
  const [selected, setSelected] = useState(null);
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const room = ROOMS.find((r) => r.key === roomKey);
  const floorCss = `repeating-linear-gradient(90deg, rgba(0,0,0,.09) 0 1px, transparent 1px 72px), linear-gradient(180deg, rgba(255,255,255,.1), rgba(0,0,0,.07)), ${floor}`;
  const darkWall = isDarkColor(wall);

  const stageRef = useRef(null);
  const [stageW, setStageW] = useState(600);
  useEffect(() => {
    if (!stageRef.current) return;
    const ro = new ResizeObserver(([e]) => setStageW(e.contentRect.width));
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, []);
  const scale = stageW / room.w;

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ roomKey, floor, wall, items }),
      );
    } catch {}
  }, [roomKey, floor, wall, items]);

  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        const d = dimsOf(it);
        return {
          ...it,
          x: Math.max(0, Math.min(it.x, room.w - d.w)),
          y: Math.max(0, Math.min(it.y, room.h - d.h)),
        };
      }),
    );
  }, [room]);

  const zTop = useRef(1);

  const addProduct = (p) => {
    if (!p.inStock) return;
    const sz = parseSize(p);
    const spot = findSpot(items, sz.w, sz.h, room);
    if (!spot) {
      showToast({ variant: "info", title: t("rbNoSpace"), image: p.image });
      return;
    }
    const it = {
      uid: uid(),
      id: p.id,
      x: spot.x,
      y: spot.y,
      rot: 0,
      z: ++zTop.current,
    };
    setItems((prev) => [...prev, it]);
    setSelected(it.uid);
  };

  const remove = (id) => {
    setItems((prev) => prev.filter((i) => i.uid !== id));
    setSelected(null);
  };

  const cartQtyOf = (id) => cartItems.find((i) => i.id === id)?.qty || 0;

  const addToCartSafe = (product, qty) => {
    const free = Math.max(0, product.stock - cartQtyOf(product.id));
    const n = Math.min(qty, free);
    if (n > 0) addToCart(product, n);
    return n;
  };

  const addOne = (id) => {
    const p = byId[id];
    if (addToCartSafe(p, 1)) {
      showToast({
        variant: "success",
        title: t("pdAdded"),
        message: p[`name${L}`],
        image: p.image,
        actionLabel: t("rbViewCart"),
        actionTo: lp("/cart"),
      });
    } else {
      showToast({
        variant: "danger",
        title: t("rbStockLimit"),
        message: p[`name${L}`],
        image: p.image,
      });
    }
  };

  const addAllToCart = () => {
    let added = 0;
    let skipped = 0;
    let firstImage;
    Object.entries(counts).forEach(([id, qty]) => {
      const n = addToCartSafe(byId[id], qty);
      if (n && !firstImage) firstImage = byId[id].image;
      added += n;
      skipped += qty - n;
    });
    if (!added) {
      showToast({ variant: "danger", title: t("rbStockLimit") });
      return;
    }
    showToast({
      variant: "success",
      title: t("rbAddedN", { n: added }),
      message: skipped ? t("rbSkipped", { n: skipped }) : undefined,
      image: firstImage,
      actionLabel: t("rbViewCart"),
      actionTo: lp("/cart"),
      duration: 4500,
    });
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!selected || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === "Delete" || e.key === "Backspace") remove(selected);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, room]);

  const drag = useRef(null);

  const onDown = (e, it) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setSelected(it.uid);
    const z = ++zTop.current;
    setItems((prev) => prev.map((i) => (i.uid === it.uid ? { ...i, z } : i)));
    drag.current = {
      uid: it.uid,
      sx: e.clientX,
      sy: e.clientY,
      ox: it.x,
      oy: it.y,
    };
  };

  const onMove = (e, it) => {
    const d = drag.current;
    if (!d || d.uid !== it.uid) return;
    const size = dimsOf(it);
    let nx = d.ox + (e.clientX - d.sx) / scale;
    let ny = d.oy + (e.clientY - d.sy) / scale;
    nx = Math.max(0, Math.min(nx, room.w - size.w));
    ny = Math.max(0, Math.min(ny, room.h - size.h));
    setItems((prev) =>
      prev.map((i) => (i.uid === it.uid ? { ...i, x: nx, y: ny } : i)),
    );
  };

  const onUp = () => {
    drag.current = null;
  };

  const overlapping = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (intersects(rectOf(items[i]), rectOf(items[j]))) {
          set.add(items[i].uid);
          set.add(items[j].uid);
        }
      }
    }
    return set;
  }, [items]);

  const total = items.reduce((s, i) => s + byId[i.id].price, 0);
  const savedAmount = items.reduce(
    (s, i) => s + (byId[i.id].oldPrice - byId[i.id].price),
    0,
  );

  const counts = items.reduce(
    (m, i) => ((m[i.id] = (m[i.id] || 0) + 1), m),
    {},
  );

  const list = products.filter((p) => {
    if (cat !== "all" && p.category !== cat) return false;
    const q = query.trim().toLowerCase();
    return !q || (p[`name${L}`] || "").toLowerCase().includes(q);
  });

  const sel = items.find((i) => i.uid === selected);
  const selProduct = sel ? byId[sel.id] : null;
  const selDims = sel ? dimsOf(sel) : null;

  const barPos = (() => {
    if (!sel) return null;
    const width = Math.min(BAR_W, stageW - BAR_EDGE * 2);
    const stageH = room.h * scale;
    const cx = (sel.x + selDims.w / 2) * scale;
    const left = Math.max(
      BAR_EDGE,
      Math.min(cx - width / 2, stageW - width - BAR_EDGE),
    );
    const above = sel.y * scale - BAR_H - BAR_GAP;
    const below = (sel.y + selDims.h) * scale + BAR_GAP;
    let top;
    if (above >= BAR_EDGE) top = above;
    else if (below + BAR_H <= stageH - BAR_EDGE) top = below;
    else top = sel.y * scale + BAR_GAP;
    return { left, top, width };
  })();

  const unitM = t("rbM");
  const unitCm = t("pdUnitCm");

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.panel}>
              <div className={styles.controls}>
                <div className={styles.group}>
                  <span className={styles.label}>{t("rbRoom")}</span>
                  <div className={styles.seg}>
                    {ROOMS.map((r) => (
                      <button
                        key={r.key}
                        className={roomKey === r.key ? styles.segActive : ""}
                        onClick={() => setRoomKey(r.key)}
                      >
                        {r.w / 100}×{r.h / 100} {unitM}
                      </button>
                    ))}
                  </div>
                </div>

                <ColorField
                  label={t("rbFloor")}
                  value={floor}
                  onChange={setFloor}
                />
                <ColorField
                  label={t("rbWall")}
                  value={wall}
                  onChange={setWall}
                />
              </div>
            </div>

            <div
              className={`${styles.stageCard} ${darkWall ? styles.stageDark : ""}`}
              style={{ background: wall, "--wall": wall }}
            >
              <div
                className={styles.rulerGrid}
                style={{ "--aspect": room.w / room.h }}
              >
                <span />
                <div className={styles.rulerTop}>
                  <i>
                    {room.w / 100} {unitM}
                  </i>
                </div>
                <div className={styles.rulerLeft}>
                  <i>
                    {room.h / 100} {unitM}
                  </i>
                </div>

                <div className={styles.stageWrap}>
                  <div
                    ref={stageRef}
                    className={styles.stage}
                    style={{
                      height: room.h * scale,
                      background: floorCss,
                      "--grid": `${GRID * 5 * scale}px`,
                    }}
                    onPointerDown={() => setSelected(null)}
                  >
                    <div className={styles.grid} />
                    <div className={styles.window} />
                    <div className={styles.door} />

                    {items.length === 0 && (
                      <div className={styles.hint}>
                        <span className={styles.hintIcon}>+</span>
                        {t("rbEmpty")}
                      </div>
                    )}

                    {items.map((it) => {
                      const p = byId[it.id];
                      const d = dimsOf(it);
                      const bad = overlapping.has(it.uid);
                      return (
                        <div
                          key={it.uid}
                          className={`${styles.item} ${selected === it.uid ? styles.itemSel : ""} ${
                            bad ? styles.itemBad : ""
                          }`}
                          style={{
                            left: it.x * scale,
                            top: it.y * scale,
                            width: d.w * scale,
                            height: d.h * scale,
                            zIndex: it.z,
                            borderRadius: d.round ? "50%" : 12,
                            backgroundImage: `url(${p.image})`,
                          }}
                          onPointerDown={(e) => onDown(e, it)}
                          onPointerMove={(e) => onMove(e, it)}
                          onPointerUp={onUp}
                          onPointerCancel={onUp}
                        />
                      );
                    })}

                    {/* Seçilmiş mebelin üstündə: səbət · bax · sil */}
                    {sel && barPos && (
                      <div
                        className={styles.actions}
                        style={barPos}
                        role="toolbar"
                        aria-label={selProduct[`name${L}`]}
                        onPointerDown={(e) => e.stopPropagation()}
                      >
                        <span className={styles.actionsName}>
                          {selProduct[`name${L}`]} · {selDims.w}×{selDims.h}
                        </span>
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => addOne(sel.id)}
                          aria-label={t("rbAddOne")}
                          title={t("rbAddOne")}
                        >
                          <CartIcon />
                        </button>
                        <Link
                          to={lp(`/product/${sel.id}`)}
                          className={styles.actionBtn}
                          aria-label={t("rbDetail")}
                          title={t("rbDetail")}
                        >
                          <EyeIcon />
                        </Link>
                        <button
                          type="button"
                          className={`${styles.actionBtn} ${styles.actionDanger}`}
                          onClick={() => remove(sel.uid)}
                          aria-label={t("rbDel")}
                          title={t("rbDel")}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.statusBar}>
              <span className={styles.muted}>
                {t("rbYourRoom")}: {room.w / 100}×{room.h / 100} {unitM}
              </span>
              {overlapping.size > 0 && (
                <span className={styles.warn}>⚠ {t("rbOverlap")}</span>
              )}
            </div>
          </div>

          <aside className={styles.aside}>
            <div className={styles.summary}>
              <div className={styles.sumHead}>
                <span className={styles.muted}>
                  {t("cartTotal")} · {items.length} {t("rbItems")}
                </span>
                <div className={styles.price}>{fmt(total)} ₼</div>
                {savedAmount > 0 && (
                  <span className={styles.saved}>
                    {t("rbSaved")}: {fmt(savedAmount)} ₼
                  </span>
                )}
              </div>

              <button
                className={styles.primary}
                disabled={!items.length}
                onClick={addAllToCart}
              >
                {t("rbToCart")}
                {items.length > 0 && ` (${items.length})`}
              </button>
              <button
                className={styles.linkBtn}
                disabled={!items.length}
                onClick={() => {
                  setItems([]);
                  setSelected(null);
                }}
              >
                {t("rbClear")}
              </button>
            </div>

            <div className={styles.catalog}>
              <input
                className={styles.search}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("rbSearch")}
              />
              <div className={styles.tabs}>
                <button
                  className={cat === "all" ? styles.tabActive : ""}
                  onClick={() => setCat("all")}
                >
                  {t("rbAll")}
                </button>
                {categories.map((c) => (
                  <button
                    key={c.key}
                    className={cat === c.key ? styles.tabActive : ""}
                    onClick={() => setCat(c.key)}
                  >
                    {c[`name${L}`]}
                  </button>
                ))}
              </div>

              <ul className={styles.list}>
                {list.map((p) => {
                  const s = parseSize(p);
                  const size = s.round
                    ? `Ø ${s.w} ${unitCm}`
                    : `${s.w}×${s.h} ${unitCm}`;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        className={styles.row}
                        disabled={!p.inStock}
                        onClick={() => addProduct(p)}
                        title={p.inStock ? t("rbAdd") : t("outOfStock")}
                      >
                        <img
                          className={styles.rowImg}
                          src={p.image}
                          alt=""
                          loading="lazy"
                        />
                        <span className={styles.rowInfo}>
                          <strong>{p[`name${L}`]}</strong>
                          <span className={styles.meta}>
                            {p.inStock ? size : t("outOfStock")}
                            {counts[p.id] ? (
                              <em className={styles.inRoomTag}>
                                {counts[p.id]} {t("rbInRoom")}
                              </em>
                            ) : null}
                            {cartQtyOf(p.id) > 0 && (
                              <em className={styles.inCartTag}>
                                {cartQtyOf(p.id)} {t("rbInCart")}
                              </em>
                            )}
                          </span>
                        </span>
                        <span className={styles.rowPrice}>
                          <b>{fmt(p.price)} ₼</b>
                          {p.discount > 0 && (
                            <span className={styles.oldLine}>
                              <s>{fmt(p.oldPrice)}</s>
                              <i>-{p.discount}%</i>
                            </span>
                          )}
                        </span>
                        <span className={styles.plus}>+</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default RoomBuilder;
