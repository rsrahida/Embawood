export const CEILING = 270;
export const WALL_T = 12;
export const WALL_LIST = ["top", "right", "bottom", "left"];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const parseSize = (p) => {
  const en = p.dimensionsEn || "";
  let w = 100;
  let h = 100;
  let z = null;
  let round = false;

  const circle = en.match(/Ø\s*(\d+)/);
  if (circle) {
    w = h = +circle[1];
    round = true;
  } else {
    const m = en.match(/(\d+)\s*x\s*(\d+)(?:\s*x\s*(\d+))?/);
    if (m) {
      w = +m[1];
      h = +m[2];
      if (m[3]) z = +m[3];
    }
  }

  const hm = en.match(/\bh\s*(\d+)/i);
  if (hm) z = +hm[1];

  if (z == null) {
    const mh = (p.heightEn || "").match(/(\d+)/);
    z = mh ? +mh[1] : p.category === "bedroom" ? 45 : 50;
  }
  return { w, h, z, round };
};

export const wallLength = (wall, room) =>
  wall === "top" || wall === "bottom" ? room.w : room.h;

export const clampOpening = (o, room) => {
  const wl = wallLength(o.wall, room);
  const len = Math.min(o.len, wl);
  return { ...o, len, pos: clamp(o.pos, 0, wl - len) };
};

export const DEFAULT_OPENINGS = [
  { id: "w1", type: "window", wall: "top", pos: 70, len: 130 },
  { id: "d1", type: "door", wall: "bottom", pos: 230, len: 90, flip: false },
];

export const openingRect = (o, room, t = WALL_T) => {
  switch (o.wall) {
    case "top":
      return { x: o.pos, y: 0, w: o.len, h: t };
    case "bottom":
      return { x: o.pos, y: room.h - t, w: o.len, h: t };
    case "left":
      return { x: 0, y: o.pos, w: t, h: o.len };
    default:
      return { x: room.w - t, y: o.pos, w: t, h: o.len };
  }
};

const wallBase = (o, room) => {
  switch (o.wall) {
    case "top":
      return { p: [o.pos, 0], u: [1, 0], n: [0, 1] };
    case "bottom":
      return { p: [o.pos, room.h], u: [1, 0], n: [0, -1] };
    case "left":
      return { p: [0, o.pos], u: [0, 1], n: [1, 0] };
    default:
      return { p: [room.w, o.pos], u: [0, 1], n: [-1, 0] };
  }
};

export const doorGeom = (o, room) => {
  const { p, u, n } = wallBase(o, room);
  const a = [p[0], p[1]];
  const b = [p[0] + u[0] * o.len, p[1] + u[1] * o.len];
  const hinge = o.flip ? b : a;
  const free = o.flip ? a : b;
  const leaf = [hinge[0] + n[0] * o.len, hinge[1] + n[1] * o.len];
  const va = [leaf[0] - hinge[0], leaf[1] - hinge[1]];
  const vb = [free[0] - hinge[0], free[1] - hinge[1]];
  const cross = va[0] * vb[1] - va[1] * vb[0];
  return { hinge, free, leaf, sweep: cross > 0 ? 1 : 0 };
};

export const swingBox = (o, room) => {
  switch (o.wall) {
    case "top":
      return { x: o.pos, y: 0, w: o.len, h: o.len };
    case "bottom":
      return { x: o.pos, y: room.h - o.len, w: o.len, h: o.len };
    case "left":
      return { x: 0, y: o.pos, w: o.len, h: o.len };
    default:
      return { x: room.w - o.len, y: o.pos, w: o.len, h: o.len };
  }
};

export const blocksSwing = (r, o, room) => {
  const b = swingBox(o, room);
  const x1 = Math.max(r.x, b.x);
  const y1 = Math.max(r.y, b.y);
  const x2 = Math.min(r.x + r.w, b.x + b.w);
  const y2 = Math.min(r.y + r.h, b.y + b.h);
  if (x1 >= x2 || y1 >= y2) return false;
  const { hinge } = doorGeom(o, room);
  const cx = clamp(hinge[0], x1, x2);
  const cy = clamp(hinge[1], y1, y2);
  return Math.hypot(cx - hinge[0], cy - hinge[1]) < o.len;
};
