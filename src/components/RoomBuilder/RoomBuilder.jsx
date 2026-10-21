import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./RoomBuilder.module.css";
import pro from "./RoomBuilderPro.module.css";
import Room3D from "./Room3D";
import SketchView from "./SketchView";
import { downloadSketch } from "./sketch";
import {
  WALL_LIST,
  clamp,
  parseSize,
  clampOpening,
  openingRect,
  doorGeom,
  blocksSwing,
  swingBox,
  wallLength,
  DEFAULT_OPENINGS,
} from "./roomUtils";
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
const RotateIcon = () => (
  <svg {...iconProps}>
    <path d="M21 12a9 9 0 1 1-3-6.7" />
    <path d="M21 4v5h-5" />
  </svg>
);
const CopyIcon = () => (
  <svg {...iconProps}>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);
const UndoIcon = () => (
  <svg {...iconProps}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </svg>
);
const RedoIcon = () => (
  <svg {...iconProps}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H10a6 6 0 0 0 0 12h3" />
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
const STORAGE_KEY = "embawood:roomBuilder:v3";
const OLD_KEY = "embawood:roomBuilder:v2";
const GRID = 10;
const SNAP_T = 8;
const BAR_W = 320;
const BAR_H = 46;
const BAR_GAP = 8;
const BAR_EDGE = 4;
const MIN_SIDE = 200;
const MAX_SIDE = 800;

const byId = Object.fromEntries(products.map((p) => [p.id, p]));
const sizeById = Object.fromEntries(products.map((p) => [p.id, parseSize(p)]));

const dimsOf = (it) => {
  const s = sizeById[it.id];
  return (it.rot || 0) % 2 ? { ...s, w: s.h, h: s.w } : s;
};

const intersects = (a, b) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

const rectOf = (it) => {
  const d = dimsOf(it);
  return { x: it.x, y: it.y, w: d.w, h: d.h };
};

const findSpot = (items, w, h, room, blockers) => {
  const taken = [...items.map(rectOf), ...blockers];
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
    const raw = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || localStorage.getItem(OLD_KEY),
    );
    if (raw && Array.isArray(raw.items)) {
      const preset = ROOMS.find((r) => r.key === raw.roomKey);
      return {
        ...raw,
        dims: raw.dims || (preset ? { w: preset.w, h: preset.h } : null),
        items: raw.items.filter((i) => byId[i.id]),
        openings: Array.isArray(raw.openings) ? raw.openings : null,
      };
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

const SizeInput = ({ label, value, onCommit }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const n = clamp(
      Math.round(parseInt(draft, 10) || value),
      MIN_SIDE,
      MAX_SIDE,
    );
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };
  return (
    <label className={pro.sizeField}>
      <span>{label}</span>
      <input
        type="number"
        min={MIN_SIDE}
        max={MAX_SIDE}
        step="10"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </label>
  );
};

const GapInput = ({ label, value, max, onCommit }) => {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = () => {
    const parsed = parseInt(draft, 10);
    const n = clamp(Number.isNaN(parsed) ? value : parsed, 0, Math.max(0, max));
    setDraft(String(n));
    if (n !== value) onCommit(n);
  };
  return (
    <label className={pro.gapField}>
      <span>{label}</span>
      <input
        type="number"
        min={0}
        max={Math.max(0, max)}
        step="5"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      />
    </label>
  );
};

const RoomBuilder = () => {
  const { lang, lp, t } = useLanguage();
  const L = lang === "az" ? "Az" : "En";
  const tx = (az, en) => (lang === "az" ? az : en);

  const { addToCart, items: cartItems } = useCart();
  const { showToast } = useToast();

  const saved = useMemo(loadState, []);
  const [dims, setDims] = useState(saved?.dims || { w: 400, h: 500 });
  const [floor, setFloor] = useState(
    isHex(saved?.floor) ? saved.floor : DEFAULT_FLOOR,
  );
  const [wall, setWall] = useState(
    isHex(saved?.wall) ? saved.wall : DEFAULT_WALL,
  );
  const [doc, setDoc] = useState({
    items: saved?.items || [],
    openings: saved?.openings || DEFAULT_OPENINGS,
  });
  const { items, openings } = doc;
  const [selected, setSelected] = useState(null);
  const [selOpen, setSelOpen] = useState(null);
  const [view, setView] = useState("2d");
  const [cat, setCat] = useState("all");
  const [query, setQuery] = useState("");

  const room = dims;
  const floorCss = `repeating-linear-gradient(90deg, rgba(0,0,0,.09) 0 1px, transparent 1px 72px), linear-gradient(180deg, rgba(255,255,255,.1), rgba(0,0,0,.07)), ${floor}`;
  const darkWall = isDarkColor(wall);
  const docRef = useRef(doc);
  docRef.current = doc;
  const past = useRef([]);
  const future = useRef([]);
  const [hist, setHist] = useState({ u: 0, r: 0 });
  const sync = () =>
    setHist({ u: past.current.length, r: future.current.length });
  const snapshot = () => {
    past.current.push(docRef.current);
    if (past.current.length > 60) past.current.shift();
    future.current = [];
    sync();
  };
  const undo = () => {
    if (!past.current.length) return;
    future.current.push(docRef.current);
    setDoc(past.current.pop());
    setSelected(null);
    setSelOpen(null);
    sync();
  };
  const redo = () => {
    if (!future.current.length) return;
    past.current.push(docRef.current);
    setDoc(future.current.pop());
    setSelected(null);
    setSelOpen(null);
    sync();
  };
  const setItems = (fn) => setDoc((d) => ({ ...d, items: fn(d.items) }));
  const setOpenings = (fn) =>
    setDoc((d) => ({ ...d, openings: fn(d.openings) }));
  const act = (fn) => {
    snapshot();
    fn();
  };

  const pickItem = (id) => {
    setSelected(id);
    setSelOpen(null);
  };
  const pickOpening = (id) => {
    setSelOpen(id);
    setSelected(null);
  };

  const stageRef = useRef(null);
  const [stageW, setStageW] = useState(600);
  useEffect(() => {
    if (view !== "2d" || !stageRef.current) return;
    const ro = new ResizeObserver(([e]) => setStageW(e.contentRect.width));
    ro.observe(stageRef.current);
    return () => ro.disconnect();
  }, [view]);
  const scale = stageW / room.w;

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ dims, floor, wall, items, openings }),
      );
    } catch {}
  }, [dims, floor, wall, items, openings]);

  useEffect(() => {
    setDoc((d) => ({
      items: d.items.map((it) => {
        const s = dimsOf(it);
        return {
          ...it,
          x: clamp(it.x, 0, Math.max(0, room.w - s.w)),
          y: clamp(it.y, 0, Math.max(0, room.h - s.h)),
        };
      }),
      openings: d.openings.map((o) => clampOpening(o, room)),
    }));
  }, [room]);

  const zTop = useRef(1);

  const doorBlockers = () =>
    openings.filter((o) => o.type === "door").map((o) => swingBox(o, room));

  const addProduct = (p) => {
    if (!p.inStock) return;
    const sz = sizeById[p.id];
    const blockers = doorBlockers();
    let rot = 0;
    let spot = findSpot(items, sz.w, sz.h, room, blockers);
    if (!spot && !sz.round) {
      spot = findSpot(items, sz.h, sz.w, room, blockers);
      rot = 1;
    }
    if (!spot) {
      showToast({ variant: "info", title: t("rbNoSpace"), image: p.image });
      return;
    }
    const it = {
      uid: uid(),
      id: p.id,
      x: spot.x,
      y: spot.y,
      rot,
      z: ++zTop.current,
    };
    act(() => setItems((prev) => [...prev, it]));
    pickItem(it.uid);
  };

  const remove = (id) => {
    act(() => setItems((prev) => prev.filter((i) => i.uid !== id)));
    setSelected(null);
  };

  const rotate = () => {
    if (!selected) return;
    act(() =>
      setItems((prev) =>
        prev.map((i) => {
          if (i.uid !== selected) return i;
          const next = { ...i, rot: ((i.rot || 0) + 1) % 4 };
          const d = dimsOf(next);
          return {
            ...next,
            x: clamp(next.x, 0, Math.max(0, room.w - d.w)),
            y: clamp(next.y, 0, Math.max(0, room.h - d.h)),
          };
        }),
      ),
    );
  };

  const duplicate = () => {
    const src = items.find((i) => i.uid === selected);
    if (!src) return;
    const d = dimsOf(src);
    const copy = {
      ...src,
      uid: uid(),
      x: clamp(src.x + 20, 0, Math.max(0, room.w - d.w)),
      y: clamp(src.y + 20, 0, Math.max(0, room.h - d.h)),
      z: ++zTop.current,
    };
    act(() => setItems((prev) => [...prev, copy]));
    pickItem(copy.uid);
  };

  const nudge = (dx, dy) => {
    act(() =>
      setItems((prev) =>
        prev.map((i) => {
          if (i.uid !== selected) return i;
          const d = dimsOf(i);
          return {
            ...i,
            x: clamp(i.x + dx, 0, Math.max(0, room.w - d.w)),
            y: clamp(i.y + dy, 0, Math.max(0, room.h - d.h)),
          };
        }),
      ),
    );
  };

  const moveItem = (uidToMove, x, y) =>
    act(() =>
      setItems((prev) =>
        prev.map((i) => (i.uid === uidToMove ? { ...i, x, y } : i)),
      ),
    );

  const addOpening = (type) => {
    const counts = Object.fromEntries(WALL_LIST.map((w) => [w, 0]));
    openings.forEach((o) => (counts[o.wall] += 1));
    const wallName = WALL_LIST.reduce((best, w) =>
      counts[w] < counts[best] ? w : best,
    );
    const len = type === "door" ? 90 : 120;
    const o = clampOpening(
      {
        id: uid(),
        type,
        wall: wallName,
        pos: (wallLength(wallName, room) - len) / 2,
        len,
        flip: false,
      },
      room,
    );
    act(() => setOpenings((prev) => [...prev, o]));
    pickOpening(o.id);
  };

  const removeOpening = (id) => {
    act(() => setOpenings((prev) => prev.filter((o) => o.id !== id)));
    setSelOpen(null);
  };

  const patchOpening = (id, patch, record = false) => {
    const run = () =>
      setOpenings((prev) =>
        prev.map((o) =>
          o.id === id ? clampOpening({ ...o, ...patch }, room) : o,
        ),
      );
    if (record) act(run);
    else run();
  };

  const openDrag = useRef(null);
  const onOpenDown = (e, o) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    pickOpening(o.id);
    openDrag.current = { id: o.id, moved: false };
  };
  const onOpenMove = (e, o) => {
    const d = openDrag.current;
    if (!d || d.id !== o.id || !stageRef.current) return;
    if (!d.moved) {
      snapshot();
      d.moved = true;
    }
    const r = stageRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / scale;
    const py = (e.clientY - r.top) / scale;
    const dist = { top: py, bottom: room.h - py, left: px, right: room.w - px };
    const wallName = WALL_LIST.reduce((best, w) =>
      dist[w] < dist[best] ? w : best,
    );
    const along = wallName === "top" || wallName === "bottom" ? px : py;
    const pos = Math.round((along - o.len / 2) / 5) * 5;
    setOpenings((prev) =>
      prev.map((x) =>
        x.id === o.id ? clampOpening({ ...x, wall: wallName, pos }, room) : x,
      ),
    );
  };
  const onOpenUp = () => {
    openDrag.current = null;
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
  const keyRef = useRef(null);
  keyRef.current = (e) => {
    if (/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    const k = e.key.toLowerCase();
    const mod = e.ctrlKey || e.metaKey;
    if (mod && k === "z") {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
      return;
    }
    if (mod && k === "y") {
      e.preventDefault();
      redo();
      return;
    }
    if (view === "sketch") return;
    if (mod && k === "d" && selected) {
      e.preventDefault();
      duplicate();
      return;
    }
    if (selOpen && (k === "delete" || k === "backspace")) {
      removeOpening(selOpen);
      return;
    }
    if (!selected) return;
    if (k === "delete" || k === "backspace") remove(selected);
    else if (k === "r") rotate();
    else if (k.startsWith("arrow")) {
      e.preventDefault();
      const step = e.shiftKey ? 20 : 5;
      if (k === "arrowleft") nudge(-step, 0);
      if (k === "arrowright") nudge(step, 0);
      if (k === "arrowup") nudge(0, -step);
      if (k === "arrowdown") nudge(0, step);
    }
  };
  useEffect(() => {
    const f = (e) => keyRef.current(e);
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, []);
  const drag = useRef(null);

  const onDown = (e, it) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    pickItem(it.uid);
    const z = ++zTop.current;
    setItems((prev) => prev.map((i) => (i.uid === it.uid ? { ...i, z } : i)));
    drag.current = {
      uid: it.uid,
      sx: e.clientX,
      sy: e.clientY,
      ox: it.x,
      oy: it.y,
      moved: false,
    };
  };

  const snapPos = (nx, ny, size, id) => {
    const xs = [0, room.w - size.w];
    const ys = [0, room.h - size.h];
    items.forEach((o) => {
      if (o.uid === id) return;
      const r = rectOf(o);
      xs.push(r.x - size.w, r.x + r.w, r.x, r.x + r.w - size.w);
      ys.push(r.y - size.h, r.y + r.h, r.y, r.y + r.h - size.h);
    });
    const pick = (v, cands) => {
      let best = null;
      let bd = SNAP_T + 1;
      cands.forEach((c) => {
        const dd = Math.abs(c - v);
        if (dd < bd) {
          bd = dd;
          best = c;
        }
      });
      return best;
    };
    const sx = pick(nx, xs);
    const sy = pick(ny, ys);
    return {
      x: sx != null ? sx : Math.round(nx / GRID) * GRID,
      y: sy != null ? sy : Math.round(ny / GRID) * GRID,
    };
  };

  const onMove = (e, it) => {
    const d = drag.current;
    if (!d || d.uid !== it.uid) return;
    if (!d.moved) {
      snapshot();
      d.moved = true;
    }
    const size = dimsOf(it);
    const rawX = d.ox + (e.clientX - d.sx) / scale;
    const rawY = d.oy + (e.clientY - d.sy) / scale;
    const s = snapPos(
      clamp(rawX, 0, Math.max(0, room.w - size.w)),
      clamp(rawY, 0, Math.max(0, room.h - size.h)),
      size,
      it.uid,
    );
    const nx = clamp(s.x, 0, Math.max(0, room.w - size.w));
    const ny = clamp(s.y, 0, Math.max(0, room.h - size.h));
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

  const blockedDoors = useMemo(() => {
    const set = new Set();
    openings
      .filter((o) => o.type === "door")
      .forEach((o) => {
        if (items.some((it) => blocksSwing(rectOf(it), o, room))) set.add(o.id);
      });
    return set;
  }, [items, openings, room]);

  const total = items.reduce((s, i) => s + byId[i.id].price, 0);
  const savedAmount = items.reduce(
    (s, i) => s + (byId[i.id].oldPrice - byId[i.id].price),
    0,
  );
  const counts = items.reduce(
    (m, i) => ((m[i.id] = (m[i.id] || 0) + 1), m),
    {},
  );

  const usedArea = items.reduce((s, i) => {
    const d = dimsOf(i);
    return s + (d.round ? (Math.PI * d.w * d.w) / 4 : d.w * d.h);
  }, 0);
  const fillPct = Math.round((usedArea / (room.w * room.h)) * 100);

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
  const items3d = useMemo(
    () =>
      items.map((it) => {
        const d = dimsOf(it);
        const s0 = sizeById[it.id];
        const p = byId[it.id];
        return {
          uid: it.uid,
          x: it.x,
          y: it.y,
          w: d.w,
          h: d.h,
          w0: s0.w,
          h0: s0.h,
          rot: it.rot || 0,
          z: d.z,
          round: d.round,
          shape: (p.tableShapeEn || "").toLowerCase(),
          seats: p.seats,
          chairs: p.chairsCount,
          colorName: p.colorEn,
          model: p.model,
          image: p.image,
          category: p.category,
        };
      }),
    [items],
  );

  const labels3d = useMemo(
    () => ({
      top: tx("Üstdən", "Top"),
      iso: tx("İzometrik", "Isometric"),
      front: tx("Önündən", "Front"),
      auto: tx("Avto-fırlat", "Auto-rotate"),
      help: tx(
        "Mebelə toxun: seç və sürüşdür · fırlatmaq üçün boş yerdən sürüşdür",
        "Tap furniture to select and drag · drag empty space to rotate",
      ),
      rotate: tx("Çevir (R)", "Rotate (R)"),
      duplicate: tx("Kopyala", "Duplicate"),
      addCart: t("rbAddOne"),
      del: t("rbDel"),
    }),
    [lang, t],
  );

  const sketchLabels = useMemo(
    () => ({
      title: tx("Otaq eskizi", "Room sketch"),
      room: tx("Otaq", "Room"),
      date: new Date().toLocaleDateString(lang === "az" ? "az-AZ" : "en-GB"),
      legend: tx("Mebel siyahısı", "Furniture list"),
      total: tx("Cəmi", "Total"),
      oneMeter: "1 m",
      fill: tx("Döşəmənin doluluğu", "Floor filled"),
      empty: tx("Mebel əlavə edilməyib", "No furniture added"),
    }),
    [lang],
  );

  const sketchData = useMemo(() => {
    const nums = {};
    const legend = [];
    items.forEach((it) => {
      if (nums[it.id]) {
        legend[nums[it.id] - 1].qty += 1;
        return;
      }
      const p = byId[it.id];
      const s = sizeById[it.id];
      nums[it.id] = legend.length + 1;
      legend.push({
        num: legend.length + 1,
        name: p[`name${L}`],
        size: s.round ? `Ø ${s.w} × h ${s.z} cm` : `${s.w}×${s.h}×${s.z} cm`,
        qty: 1,
        unit: p.price,
      });
    });
    return {
      room,
      floor,
      openings,
      items: items.map((it) => {
        const d = dimsOf(it);
        return {
          x: it.x,
          y: it.y,
          w: d.w,
          h: d.h,
          round: d.round,
          num: nums[it.id],
        };
      }),
      legend: legend.map((r) => ({ ...r, price: `${fmt(r.unit * r.qty)} ₼` })),
      total: `${fmt(total)} ₼`,
      fillPct,
    };
  }, [items, openings, room, floor, L, total, fillPct]);

  const openLabel = (o) => {
    const same = openings.filter((x) => x.type === o.type);
    const n = same.findIndex((x) => x.id === o.id) + 1;
    return `${o.type === "door" ? tx("Qapı", "Door") : tx("Pəncərə", "Window")} ${n}`;
  };
  const wallNames = {
    top: tx("Yuxarı divar", "Top wall"),
    right: tx("Sağ divar", "Right wall"),
    bottom: tx("Aşağı divar", "Bottom wall"),
    left: tx("Sol divar", "Left wall"),
  };

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
                        className={
                          room.w === r.w && room.h === r.h
                            ? styles.segActive
                            : ""
                        }
                        onClick={() => setDims({ w: r.w, h: r.h })}
                      >
                        {r.w / 100}×{r.h / 100} {unitM}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.group}>
                  <span className={styles.label}>
                    {tx("Ölçü (sm)", "Size (cm)")}
                  </span>
                  <div className={pro.sizeRow}>
                    <SizeInput
                      label={tx("En", "W")}
                      value={room.w}
                      onCommit={(w) => setDims((d) => ({ ...d, w }))}
                    />
                    <span>×</span>
                    <SizeInput
                      label={tx("Uz.", "L")}
                      value={room.h}
                      onCommit={(h) => setDims((d) => ({ ...d, h }))}
                    />
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
            <div className={`${styles.panel} ${pro.toolbar}`}>
              <div className={styles.seg}>
                {[
                  ["2d", "2D"],
                  ["3d", "3D"],
                  ["sketch", tx("Eskiz", "Sketch")],
                ].map(([k, label]) => (
                  <button
                    key={k}
                    className={view === k ? styles.segActive : ""}
                    onClick={() => setView(k)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className={pro.tools}>
                <button
                  type="button"
                  className={pro.toolBtn}
                  onClick={undo}
                  disabled={!hist.u}
                  title="Ctrl+Z"
                >
                  <UndoIcon />
                </button>
                <button
                  type="button"
                  className={pro.toolBtn}
                  onClick={redo}
                  disabled={!hist.r}
                  title="Ctrl+Shift+Z"
                >
                  <RedoIcon />
                </button>
                <button
                  type="button"
                  className={pro.toolBtn}
                  onClick={rotate}
                  disabled={!sel || view === "sketch"}
                  title="R"
                >
                  <RotateIcon /> {tx("Çevir", "Rotate")}
                </button>
                <button
                  type="button"
                  className={pro.toolBtn}
                  onClick={duplicate}
                  disabled={!sel || view === "sketch"}
                  title="Ctrl+D"
                >
                  <CopyIcon /> {tx("Kopyala", "Duplicate")}
                </button>
                <button
                  type="button"
                  className={pro.toolBtn}
                  onClick={() => downloadSketch(sketchData, sketchLabels)}
                >
                  {tx("Eskiz (PNG)", "Sketch (PNG)")}
                </button>
              </div>
            </div>
            <div className={`${styles.panel} ${pro.openPanel}`}>
              <div className={pro.openHead}>
                <span className={styles.label}>
                  {tx("Qapı və pəncərələr", "Doors & windows")}
                </span>
                <div className={pro.openAdd}>
                  <button
                    type="button"
                    className={pro.toolBtn}
                    onClick={() => addOpening("window")}
                  >
                    + {tx("Pəncərə", "Window")}
                  </button>
                  <button
                    type="button"
                    className={pro.toolBtn}
                    onClick={() => addOpening("door")}
                  >
                    + {tx("Qapı", "Door")}
                  </button>
                </div>
              </div>

              {openings.length === 0 ? (
                <span className={styles.muted}>
                  {tx("Qapı və ya pəncərə yoxdur", "No doors or windows")}
                </span>
              ) : (
                <ul className={pro.openList}>
                  {openings.map((o) => {
                    const wl = wallLength(o.wall, room);
                    const isDoor = o.type === "door";
                    const free = Math.max(0, wl - o.len);
                    const horizWall = o.wall === "top" || o.wall === "bottom";
                    const startLabel = horizWall
                      ? tx("Soldan", "From left")
                      : tx("Yuxarıdan", "From top");
                    const endLabel = horizWall
                      ? tx("Sağdan", "From right")
                      : tx("Aşağıdan", "From bottom");
                    const startGap = Math.round(o.pos);
                    const endGap = Math.round(wl - o.pos - o.len);
                    return (
                      <li
                        key={o.id}
                        className={`${pro.openRow} ${selOpen === o.id ? pro.openRowSel : ""}`}
                        onClick={() => pickOpening(o.id)}
                      >
                        <span className={pro.openName}>
                          {openLabel(o)}
                          {blockedDoors.has(o.id) && " ⚠"}
                        </span>
                        <select
                          value={o.wall}
                          onChange={(e) =>
                            patchOpening(o.id, { wall: e.target.value }, true)
                          }
                          aria-label={tx("Divar", "Wall")}
                        >
                          {WALL_LIST.map((w) => (
                            <option key={w} value={w}>
                              {wallNames[w]}
                            </option>
                          ))}
                        </select>
                        <div className={pro.posCell}>
                          <label>
                            {tx("Yer", "Position")}
                            <input
                              type="range"
                              min={0}
                              max={free}
                              step={5}
                              value={o.pos}
                              onPointerDown={snapshot}
                              onChange={(e) =>
                                patchOpening(o.id, { pos: +e.target.value })
                              }
                            />
                          </label>
                          <div className={pro.gapRow}>
                            <GapInput
                              label={`${startLabel} (${unitCm})`}
                              value={startGap}
                              max={free}
                              onCommit={(n) =>
                                patchOpening(o.id, { pos: n }, true)
                              }
                            />
                            <GapInput
                              label={`${endLabel} (${unitCm})`}
                              value={endGap}
                              max={free}
                              onCommit={(n) =>
                                patchOpening(
                                  o.id,
                                  { pos: wl - o.len - n },
                                  true,
                                )
                              }
                            />
                          </div>
                        </div>
                        <label>
                          {tx("En", "Width")}: {o.len} {unitCm}
                          <input
                            type="range"
                            min={isDoor ? 70 : 50}
                            max={isDoor ? 140 : 300}
                            step={5}
                            value={o.len}
                            onPointerDown={snapshot}
                            onChange={(e) =>
                              patchOpening(o.id, { len: +e.target.value })
                            }
                          />
                        </label>
                        <span className={pro.rowBtns}>
                          {isDoor && (
                            <button
                              type="button"
                              className={pro.miniBtn}
                              title={tx("Menteşəni dəyiş", "Flip hinge")}
                              aria-label={tx("Menteşəni dəyiş", "Flip hinge")}
                              onClick={(e) => {
                                e.stopPropagation();
                                patchOpening(o.id, { flip: !o.flip }, true);
                              }}
                            >
                              <RotateIcon />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`${pro.miniBtn} ${pro.miniDanger}`}
                            title={t("rbDel")}
                            aria-label={t("rbDel")}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeOpening(o.id);
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            {view === "2d" && (
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
                      onPointerDown={() => {
                        setSelected(null);
                        setSelOpen(null);
                      }}
                    >
                      <div className={styles.grid} />

                      <svg
                        className={`${pro.layer} ${pro.layerBelow}`}
                        viewBox={`0 0 ${room.w} ${room.h}`}
                        preserveAspectRatio="none"
                      >
                        {openings.map((o) => {
                          const r = openingRect(o, room);
                          const isDoor = o.type === "door";
                          const g = isDoor ? doorGeom(o, room) : null;
                          const bad = blockedDoors.has(o.id);
                          return (
                            <g
                              key={o.id}
                              className={`${pro.opening} ${selOpen === o.id ? pro.openSel : ""}`}
                              onPointerDown={(e) => onOpenDown(e, o)}
                              onPointerMove={(e) => onOpenMove(e, o)}
                              onPointerUp={onOpenUp}
                              onPointerCancel={onOpenUp}
                            >
                              {isDoor && (
                                <>
                                  <path
                                    className={`${pro.swing} ${bad ? pro.swingBad : ""}`}
                                    d={`M ${g.hinge[0]} ${g.hinge[1]} L ${g.leaf[0]} ${g.leaf[1]} A ${o.len} ${o.len} 0 0 ${g.sweep} ${g.free[0]} ${g.free[1]} Z`}
                                  />
                                  <line
                                    className={pro.leaf}
                                    x1={g.hinge[0]}
                                    y1={g.hinge[1]}
                                    x2={g.leaf[0]}
                                    y2={g.leaf[1]}
                                  />
                                </>
                              )}
                              <rect
                                x={r.x - 4}
                                y={r.y - 4}
                                width={r.w + 8}
                                height={r.h + 8}
                                fill="transparent"
                              />
                              <rect
                                className={isDoor ? pro.doorBand : pro.winBand}
                                x={r.x}
                                y={r.y}
                                width={r.w}
                                height={r.h}
                                rx={2}
                              />
                            </g>
                          );
                        })}
                      </svg>

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
                          >
                            {selected === it.uid && (
                              <span className={pro.dimTag}>
                                {d.round ? `Ø ${d.w}` : `${d.w}×${d.h}`}{" "}
                                {unitCm}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {sel && (
                        <svg
                          className={`${pro.layer} ${pro.layerAbove} ${pro.measure}`}
                          viewBox={`0 0 ${room.w} ${room.h}`}
                          preserveAspectRatio="none"
                        >
                          {(() => {
                            const r = rectOf(sel);
                            const cx = r.x + r.w / 2;
                            const cy = r.y + r.h / 2;
                            const segs = [
                              { x1: 0, y1: cy, x2: r.x, y2: cy, v: r.x },
                              {
                                x1: r.x + r.w,
                                y1: cy,
                                x2: room.w,
                                y2: cy,
                                v: room.w - r.x - r.w,
                              },
                              { x1: cx, y1: 0, x2: cx, y2: r.y, v: r.y },
                              {
                                x1: cx,
                                y1: r.y + r.h,
                                x2: cx,
                                y2: room.h,
                                v: room.h - r.y - r.h,
                              },
                            ];
                            return segs
                              .filter((s) => s.v >= 1)
                              .map((s, i) => (
                                <g key={i}>
                                  <line
                                    x1={s.x1}
                                    y1={s.y1}
                                    x2={s.x2}
                                    y2={s.y2}
                                  />
                                  <text
                                    x={(s.x1 + s.x2) / 2}
                                    y={(s.y1 + s.y2) / 2 - 3 / scale}
                                    textAnchor="middle"
                                    fontSize={11 / scale}
                                    strokeWidth={3 / scale}
                                  >
                                    {Math.round(s.v)}
                                  </text>
                                </g>
                              ));
                          })()}
                        </svg>
                      )}
                      {sel && barPos && (
                        <div
                          className={styles.actions}
                          style={barPos}
                          role="toolbar"
                          aria-label={selProduct[`name${L}`]}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <span className={styles.actionsName}>
                            {selProduct[`name${L}`]}
                          </span>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={rotate}
                            aria-label={tx("Çevir (R)", "Rotate (R)")}
                            title={tx("Çevir (R)", "Rotate (R)")}
                          >
                            <RotateIcon />
                          </button>
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={duplicate}
                            aria-label={tx("Kopyala", "Duplicate")}
                            title={tx("Kopyala", "Duplicate")}
                          >
                            <CopyIcon />
                          </button>
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
            )}
            {view === "3d" && (
              <Room3D
                room={room}
                floor={floor}
                wall={wall}
                items={items3d}
                openings={openings}
                labels={labels3d}
                selected={selected}
                selectedName={selProduct ? selProduct[`name${L}`] : ""}
                onSelect={pickItem}
                onMoveEnd={moveItem}
                onRotate={rotate}
                onDuplicate={duplicate}
                onDelete={() => selected && remove(selected)}
                onAddToCart={() => sel && addOne(sel.id)}
              />
            )}
            {view === "sketch" && (
              <SketchView data={sketchData} labels={sketchLabels} />
            )}

            <div className={styles.statusBar}>
              <span className={styles.muted}>
                {t("rbYourRoom")}: {room.w / 100}×{room.h / 100} {unitM} ·{" "}
                {tx("Doluluq", "Filled")}: {fillPct}%
              </span>
              {overlapping.size > 0 && (
                <span className={styles.warn}>⚠ {t("rbOverlap")}</span>
              )}
              {blockedDoors.size > 0 && (
                <span className={styles.warn}>
                  ⚠{" "}
                  {tx(
                    "Mebel qapının açılmasına mane olur",
                    "Furniture blocks a door swing",
                  )}
                </span>
              )}
              {fillPct > 60 && (
                <span className={styles.warn}>
                  ⚠ {tx("Otaq çox doludur", "The room is crowded")}
                </span>
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
                  act(() => setItems(() => []));
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
                  const s = sizeById[p.id];
                  const size = s.round
                    ? `Ø ${s.w} × h ${s.z} ${unitCm}`
                    : `${s.w}×${s.h}×${s.z} ${unitCm}`;
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
