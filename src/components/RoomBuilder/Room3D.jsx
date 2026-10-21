import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { CEILING } from "./roomUtils";
import styles from "./Room3D.module.css";

const WALL_THICK = 10;
const DEFAULT_RGB = [200, 188, 168];
const SNAP = 5;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

const colorCache = new Map();
const sampleColor = (url) => {
  if (!colorCache.has(url)) {
    colorCache.set(
      url,
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          try {
            const S = 48;
            const c = document.createElement("canvas");
            c.width = c.height = S;
            const g = c.getContext("2d");
            g.drawImage(img, 0, 0, S, S);
            const d = g.getImageData(0, 0, S, S).data;
            let r = 0;
            let gg = 0;
            let b = 0;
            let n = 0;
            for (let y = Math.floor(S * 0.2); y < S * 0.85; y++) {
              for (let x = Math.floor(S * 0.1); x < S * 0.9; x++) {
                const i = (y * S + x) * 4;
                const R = d[i];
                const G = d[i + 1];
                const B = d[i + 2];
                const mx = Math.max(R, G, B);
                const mn = Math.min(R, G, B);
                const lum = 0.299 * R + 0.587 * G + 0.114 * B;
                if (lum > 225 && mx - mn < 18) continue;
                r += R;
                gg += G;
                b += B;
                n++;
              }
            }
            resolve(n > 20 ? [r / n, gg / n, b / n] : DEFAULT_RGB);
          } catch {
            resolve(DEFAULT_RGB);
          }
        };
        img.onerror = () => resolve(DEFAULT_RGB);
        img.src = url;
      }),
    );
  }
  return colorCache.get(url);
};

const rgbColor = (a) =>
  new THREE.Color(
    `rgb(${Math.round(a[0])},${Math.round(a[1])},${Math.round(a[2])})`,
  );

const gltfLoader = new GLTFLoader();
const modelCache = new Map();
const loadModel = (url) => {
  if (!modelCache.has(url)) modelCache.set(url, gltfLoader.loadAsync(url));
  return modelCache.get(url);
};

const mat = (color, rough = 0.85) =>
  new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.02 });

const block = (group, w, h, d, x, yBottom, z, r, material) => {
  const rad = Math.max(
    0.01,
    Math.min(r, w / 2 - 0.01, h / 2 - 0.01, d / 2 - 0.01),
  );
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, rad), material);
  m.position.set(x, yBottom + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
};

const cyl = (group, rx, rz, h, x, yBottom, z, material, seg = 48) => {
  const m = new THREE.Mesh(
    new THREE.CylinderGeometry(0.5, 0.5, h, seg),
    material,
  );
  m.scale.set(rx * 2, 1, rz * 2);
  m.position.set(x, yBottom + h / 2, z);
  m.castShadow = true;
  m.receiveShadow = true;
  group.add(m);
  return m;
};

const tint = (color, to, t) =>
  new THREE.Color(color).lerp(new THREE.Color(to), t);

const buildBed = (w, d, hgt, color) => {
  const g = new THREE.Group();
  const frame = mat(color, 0.95);
  const bedding = mat("#f3efe8", 0.95);
  const frameH = hgt * 0.5;
  const mattH = hgt - frameH;
  const headH = Math.max(100, hgt + 55);

  block(g, w, frameH, d, 0, 0, 0, 7, frame);
  block(g, w + 2, headH, 12, 0, 0, -d / 2 + 6, 10, frame);
  block(g, w - 6, mattH, d - 16, 0, frameH, 5, 5, bedding);
  [-1, 1].forEach((s) =>
    block(
      g,
      w * 0.4,
      13,
      34,
      s * w * 0.22,
      hgt,
      -d / 2 + 36,
      6,
      mat("#f8f5ef", 0.95),
    ),
  );
  block(
    g,
    w - 4,
    3,
    d * 0.38,
    0,
    hgt,
    d / 2 - d * 0.19 - 4,
    1.5,
    mat(tint(color, "#ffffff", 0.45), 0.95),
  );
  return g;
};

const buildSofa = (w, d, hgt, seats, color) => {
  const g = new THREE.Group();
  const body = mat(color, 0.9);
  const cushion = mat(tint(color, "#ffffff", 0.08), 0.95);
  const feet = mat("#2b2b2b", 0.6);
  const armW = 18;
  const baseTop = 5 + hgt * 0.4;

  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([sx, sz]) =>
    block(g, 5, 5, 5, sx * (w / 2 - 8), 0, sz * (d / 2 - 8), 1, feet),
  );
  block(g, w, hgt * 0.4, d, 0, 5, 0, 7, body);
  [-1, 1].forEach((s) =>
    block(g, armW, hgt * 0.7 - 5, d, s * (w / 2 - armW / 2), 5, 0, 8, body),
  );
  block(g, w - armW * 2, hgt - 5, 24, 0, 5, -d / 2 + 12, 9, body);

  const n = Math.max(1, Math.min(seats || 3, 5));
  const inner = w - armW * 2;
  const cw = inner / n;
  for (let i = 0; i < n; i++) {
    block(
      g,
      cw - 2,
      14,
      d - 24 - 2,
      -inner / 2 + cw * (i + 0.5),
      baseTop,
      12,
      6,
      cushion,
    );
  }
  return g;
};

const buildChair = (color) => {
  const g = new THREE.Group();
  const m = mat(color, 0.9);
  const legM = mat("#3a2e26", 0.7);
  block(g, 42, 5, 42, 0, 43, 0, 2, m);
  block(g, 42, 40, 4, 0, 48, -19, 2, m);
  [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].forEach(([sx, sz]) => block(g, 3.5, 43, 3.5, sx * 18, 0, sz * 18, 1, legM));
  return g;
};

const buildTable = (it, topColor, chairColor) => {
  const g = new THREE.Group();
  const w = it.w0;
  const d = it.h0;
  const hgt = it.z;
  const topM = mat(topColor, 0.55);
  const legM = mat(tint(topColor, "#000000", 0.35), 0.7);
  const rounded = it.round || it.shape === "oval";

  if (rounded) {
    cyl(g, w / 2, d / 2, 4, 0, hgt - 4, 0, topM);
    cyl(g, 8, 8, hgt - 4, 0, 0, 0, legM, 24);
    cyl(g, w * 0.22, d * 0.22, 3, 0, 0, 0, legM, 32);
  } else {
    block(g, w, 4, d, 0, hgt - 4, 0, 1.5, topM);
    [
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ].forEach(([sx, sz]) =>
      block(g, 6, hgt - 4, 6, sx * (w / 2 - 8), 0, sz * (d / 2 - 8), 1, legM),
    );
  }

  const n = it.chairs || 4;
  const spots = [];
  if (rounded) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.PI / n;
      spots.push([Math.cos(a) * (w / 2 + 2), Math.sin(a) * (d / 2 + 2)]);
    }
  } else {
    const ends = n >= 6 ? 2 : 0;
    const sides = n - ends;
    const a = Math.ceil(sides / 2);
    const b = sides - a;
    [
      [a, -1],
      [b, 1],
    ].forEach(([k, s]) => {
      for (let i = 0; i < k; i++) {
        spots.push([-w / 2 + (w * (i + 0.5)) / k, s * (d / 2 + 6)]);
      }
    });
    if (ends) {
      spots.push([-(w / 2 + 6), 0]);
      spots.push([w / 2 + 6, 0]);
    }
  }
  spots.forEach(([px, pz]) => {
    const c = buildChair(chairColor);
    c.position.set(px, 0, pz);
    c.rotation.y = Math.atan2(-px, -pz);
    g.add(c);
  });
  return g;
};

const buildMattress = (w, d, hgt, color) => {
  const g = new THREE.Group();
  block(g, w, hgt, d, 0, 0, 0, 6, mat(tint(color, "#ffffff", 0.65), 0.95));
  block(g, w + 0.6, 2.4, d + 0.6, 0, hgt * 0.45, 0, 1, mat(color, 0.9));
  return g;
};

const tableTopColor = (name = "") => {
  const n = name.toLowerCase();
  if (/dark|walnut/.test(n)) return "#4a3426";
  if (/^(white|cream)/.test(n)) return "#efeae0";
  if (/^black/.test(n)) return "#2b2b2b";
  return "#c8a77c";
};

const buildFurniture = (it, rgb) => {
  const color = rgbColor(rgb);
  switch (it.category) {
    case "bedroom":
      return buildBed(it.w0, it.h0, it.z, color);
    case "living-room":
      return buildSofa(it.w0, it.h0, it.z, it.seats, color);
    case "tables-chairs":
      return buildTable(it, tableTopColor(it.colorName), color);
    case "mattresses":
      return buildMattress(it.w0, it.h0, it.z, color);
    default: {
      const g = new THREE.Group();
      block(g, it.w0, it.z, it.h0, 0, 0, 0, 4, mat(color));
      return g;
    }
  }
};

const buildWall = (side, room, openings, wallMat) => {
  const horiz = side === "top" || side === "bottom";
  const len = horiz ? room.w : room.h;
  const T = WALL_THICK;
  const list = openings.filter((o) => o.wall === side);
  const localStart = (o) => {
    if (side === "bottom") return room.w - (o.pos + o.len);
    if (side === "left") return room.h - (o.pos + o.len);
    return o.pos;
  };

  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.lineTo(len, 0);
  shape.lineTo(len, CEILING);
  shape.lineTo(0, CEILING);
  shape.lineTo(0, 0);
  list.forEach((o) => {
    const a = localStart(o);
    const y0 = o.type === "window" ? 95 : 0.5;
    const y1 = o.type === "window" ? 215 : 210;
    const p = new THREE.Path();
    p.moveTo(a, y0);
    p.lineTo(a, y1);
    p.lineTo(a + o.len, y1);
    p.lineTo(a + o.len, y0);
    p.lineTo(a, y0);
    shape.holes.push(p);
  });

  const g = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: T, bevelEnabled: false }),
    wallMat,
  );
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  g.add(mesh);

  const frameM = mat("#ffffff", 0.5);
  const glassM = new THREE.MeshPhysicalMaterial({
    color: 0xbfe3f5,
    transparent: true,
    opacity: 0.35,
    roughness: 0.05,
    side: THREE.DoubleSide,
  });
  const doorM = mat("#7b5a3c", 0.7);
  const bar = (w, h, x, y) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 6), frameM);
    m.position.set(x, y, T / 2);
    g.add(m);
  };
  list.forEach((o) => {
    const a = localStart(o);
    const cx = a + o.len / 2;
    if (o.type === "window") {
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(o.len, 120), glassM);
      glass.position.set(cx, 155, T / 2);
      g.add(glass);
      bar(o.len, 5, cx, 217);
      bar(o.len, 5, cx, 93);
      bar(5, 124, a, 155);
      bar(5, 124, a + o.len, 155);
      bar(3, 120, cx, 155);
    } else {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(o.len - 2, 208, 4),
        doorM,
      );
      door.position.set(cx, 104.5, T / 2);
      door.castShadow = true;
      g.add(door);
      const knob = new THREE.Mesh(
        new THREE.SphereGeometry(2.6, 16, 16),
        mat("#d4b36a", 0.3),
      );
      knob.position.set(a + o.len - 8, 100, T / 2 + 4);
      g.add(knob);
    }
  });

  switch (side) {
    case "top":
      g.position.set(-room.w / 2, 0, -room.h / 2 - T);
      break;
    case "bottom":
      g.rotation.y = Math.PI;
      g.position.set(room.w / 2, 0, room.h / 2 + T);
      break;
    case "left":
      g.rotation.y = Math.PI / 2;
      g.position.set(-room.w / 2 - T, 0, room.h / 2);
      break;
    default:
      g.rotation.y = -Math.PI / 2;
      g.position.set(room.w / 2 + T, 0, -room.h / 2);
  }
  return g;
};

const NORMALS = {
  top: new THREE.Vector3(0, 0, -1),
  bottom: new THREE.Vector3(0, 0, 1),
  left: new THREE.Vector3(-1, 0, 0),
  right: new THREE.Vector3(1, 0, 0),
};

const seeded = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const floorTexture = (hex, w, h) => {
  const rnd = seeded(7);
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const g = c.getContext("2d");
  g.fillStyle = hex;
  g.fillRect(0, 0, 512, 512);
  const plank = 512 / 10;
  for (let i = 0; i < 10; i++) {
    g.fillStyle =
      rnd() > 0.5
        ? `rgba(255,255,255,${rnd() * 0.07})`
        : `rgba(0,0,0,${rnd() * 0.07})`;
    g.fillRect(i * plank, 0, plank, 512);
    g.fillStyle = "rgba(0,0,0,.18)";
    g.fillRect(i * plank, 0, 2, 512);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(w / 180, h / 180);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

const disposeTree = (obj) => {
  obj.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        if (m.map) m.map.dispose();
        m.dispose();
      });
    }
  });
};

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
const CartIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M2 3h3l2.7 12.4a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L21 7H6" />
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

const Room3D = ({
  room,
  floor,
  wall,
  items,
  openings,
  labels,
  selected = null,
  selectedName = "",
  onSelect,
  onMoveEnd,
  onRotate,
  onDuplicate,
  onDelete,
  onAddToCart,
}) => {
  const mountRef = useRef(null);
  const barRef = useRef(null);
  const three = useRef({});
  const [colors, setColors] = useState({});
  const [auto, setAuto] = useState(false);
  const itemsRef = useRef(items);
  const roomRef = useRef(room);
  const selectedRef = useRef(selected);
  const cb = useRef({});
  itemsRef.current = items;
  roomRef.current = room;
  selectedRef.current = selected;
  cb.current = { onSelect, onMoveEnd };

  useEffect(() => {
    let alive = true;
    const urls = [...new Set(items.map((i) => i.image))];
    urls.forEach((u) => {
      sampleColor(u).then((c) => {
        if (alive) setColors((p) => (p[u] ? p : { ...p, [u]: c }));
      });
    });
    return () => {
      alive = false;
    };
  }, [items]);

  const placeCamera = (kind) => {
    const { camera, controls } = three.current;
    if (!camera) return;
    const dist = Math.max(room.w, room.h) * 1.6;
    controls.target.set(0, 40, 0);
    if (kind === "top") camera.position.set(0, dist * 1.5, 0.01);
    else if (kind === "front") camera.position.set(0, dist * 0.5, dist * 1.05);
    else camera.position.set(dist * 0.55, dist * 0.85, dist * 0.75);
    controls.update();
  };

  useEffect(() => {
    const el = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 10, 8000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const dom = renderer.domElement;
    const holders = new Map();
    const selBox = new THREE.Box3();
    const helper = new THREE.Box3Helper(selBox, 0x6cb944);
    helper.material.depthTest = false;
    helper.renderOrder = 999;
    helper.visible = false;
    scene.add(helper);

    let controls = null;
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const tmp = new THREE.Vector3();
    let drag = null;
    let tap = null;

    const setRay = (e) => {
      const r = dom.getBoundingClientRect();
      ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      ray.setFromCamera(ndc, camera);
    };

    const pick = () => {
      const hit = ray.intersectObjects([...holders.values()], true)[0];
      if (!hit) return null;
      let o = hit.object;
      while (o && !o.userData.uid) o = o.parent;
      return o ? { uid: o.userData.uid, point: hit.point } : null;
    };

    const onDown = (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      setRay(e);
      const hit = pick();
      if (!hit) {
        tap = { x: e.clientX, y: e.clientY };
        return;
      }
      const holder = holders.get(hit.uid);
      const item = itemsRef.current.find((i) => i.uid === hit.uid);
      if (!holder || !item) return;

      cb.current.onSelect?.(hit.uid);
      selectedRef.current = hit.uid;

      plane.constant = -hit.point.y;
      const p0 = new THREE.Vector3();
      if (!ray.ray.intersectPlane(plane, p0)) return;

      drag = {
        uid: hit.uid,
        item,
        holder,
        offX: holder.position.x - p0.x,
        offZ: holder.position.z - p0.z,
        sx: e.clientX,
        sy: e.clientY,
        x: item.x,
        y: item.y,
        moved: false,
        wasAuto: controls.autoRotate,
      };
      controls.enabled = false;
      controls.autoRotate = false;
      try {
        dom.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onMove = (e) => {
      if (drag) {
        if (
          !drag.moved &&
          Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 4
        )
          return;
        setRay(e);
        const p = new THREE.Vector3();
        if (!ray.ray.intersectPlane(plane, p)) return;
        const rm = roomRef.current;
        const it = drag.item;
        const rawX = p.x + drag.offX - it.w / 2 + rm.w / 2;
        const rawY = p.z + drag.offZ - it.h / 2 + rm.h / 2;
        const x = clamp(
          Math.round(rawX / SNAP) * SNAP,
          0,
          Math.max(0, rm.w - it.w),
        );
        const y = clamp(
          Math.round(rawY / SNAP) * SNAP,
          0,
          Math.max(0, rm.h - it.h),
        );
        drag.moved = true;
        drag.x = x;
        drag.y = y;
        drag.holder.position.set(
          x + it.w / 2 - rm.w / 2,
          0,
          y + it.h / 2 - rm.h / 2,
        );
        dom.style.cursor = "grabbing";
        return;
      }
      if (e.pointerType === "mouse" && e.buttons === 0) {
        setRay(e);
        dom.style.cursor = pick() ? "pointer" : "";
      }
    };

    const onUp = (e) => {
      if (drag) {
        controls.enabled = true;
        controls.autoRotate = drag.wasAuto;
        try {
          dom.releasePointerCapture(e.pointerId);
        } catch {}
        if (drag.moved) cb.current.onMoveEnd?.(drag.uid, drag.x, drag.y);
        dom.style.cursor = "";
        drag = null;
        return;
      }
      if (tap) {
        if (Math.hypot(e.clientX - tap.x, e.clientY - tap.y) < 5) {
          cb.current.onSelect?.(null);
        }
        tap = null;
      }
    };

    dom.addEventListener("pointerdown", onDown);
    dom.addEventListener("pointermove", onMove);
    dom.addEventListener("pointerup", onUp);
    dom.addEventListener("pointercancel", onUp);
    controls = new OrbitControls(camera, dom);
    controls.enableDamping = true;
    controls.maxPolarAngle = Math.PI / 2.02;
    controls.minDistance = 150;
    controls.maxDistance = 3000;

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    three.current = {
      scene,
      camera,
      renderer,
      controls,
      holders,
      walls: [],
      half: 250,
    };
    placeCamera("iso");

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      controls.update();
      const { walls, half } = three.current;
      walls.forEach(({ group, normal }) => {
        group.visible = normal.dot(camera.position) < half * 0.9;
      });
      const sel = holders.get(selectedRef.current);
      const bar = barRef.current;
      if (sel) {
        selBox.setFromObject(sel);
        selBox.expandByScalar(2);
        helper.visible = !selBox.isEmpty();
        if (bar) {
          tmp.set(
            (selBox.min.x + selBox.max.x) / 2,
            selBox.max.y,
            (selBox.min.z + selBox.max.z) / 2,
          );
          tmp.project(camera);
          if (tmp.z < 1) {
            const w = el.clientWidth;
            const h = el.clientHeight;
            const px = clamp(
              (tmp.x * 0.5 + 0.5) * w,
              120,
              Math.max(120, w - 120),
            );
            const py = clamp((-tmp.y * 0.5 + 0.5) * h - 12, 104, h - 8);
            bar.style.display = "flex";
            bar.style.transform = `translate(${px}px, ${py}px) translate(-50%, -100%)`;
          } else {
            bar.style.display = "none";
          }
        }
      } else {
        helper.visible = false;
        if (bar) bar.style.display = "none";
      }

      renderer.render(scene, camera);
    };
    loop();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener("pointerdown", onDown);
      dom.removeEventListener("pointermove", onMove);
      dom.removeEventListener("pointerup", onUp);
      dom.removeEventListener("pointercancel", onUp);
      controls.dispose();
      disposeTree(scene);
      renderer.dispose();
      if (renderer.domElement.parentNode === el)
        el.removeChild(renderer.domElement);
      three.current = {};
    };
  }, []);

  useEffect(() => {
    if (three.current.controls) three.current.controls.autoRotate = auto;
    if (three.current.controls) three.current.controls.autoRotateSpeed = 1.6;
  }, [auto]);
  useEffect(() => {
    placeCamera("iso");
  }, [room.w, room.h]);

  useEffect(() => {
    const { scene, holders } = three.current;
    if (!scene) return undefined;
    const content = new THREE.Group();
    let alive = true;
    holders.clear();

    const tex = floorTexture(floor, room.w, room.h);
    const floorMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(room.w, room.h),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
    );
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    content.add(floorMesh);

    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wall),
      roughness: 0.95,
    });
    const walls = ["top", "right", "bottom", "left"].map((side) => {
      const group = buildWall(side, room, openings, wallMat);
      content.add(group);
      return { group, normal: NORMALS[side] };
    });
    three.current.walls = walls;
    three.current.half = Math.max(room.w, room.h) / 2;

    content.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 1.0));
    const sun = new THREE.DirectionalLight(0xffffff, 1.5);
    const reach = Math.max(room.w, room.h);
    sun.position.set(reach * 0.5, reach * 1.1, reach * 0.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -reach;
    sun.shadow.camera.right = reach;
    sun.shadow.camera.top = reach;
    sun.shadow.camera.bottom = -reach;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far = reach * 4;
    sun.shadow.bias = -0.0006;
    content.add(sun);

    items.forEach((it) => {
      const holder = new THREE.Group();
      holder.userData.uid = it.uid;
      holder.position.set(
        it.x + it.w / 2 - room.w / 2,
        0,
        it.y + it.h / 2 - room.h / 2,
      );
      holder.rotation.y = -(it.rot || 0) * (Math.PI / 2);
      const rgb = colors[it.image] || DEFAULT_RGB;
      const proc = buildFurniture(it, rgb);
      holder.add(proc);
      content.add(holder);
      holders.set(it.uid, holder);
      if (it.model) {
        loadModel(it.model)
          .then((gltf) => {
            if (!alive) return;
            const m = gltf.scene.clone(true);
            const box = new THREE.Box3().setFromObject(m);
            const size = box.getSize(new THREE.Vector3());
            const ctr = box.getCenter(new THREE.Vector3());
            const wrap = new THREE.Group();
            m.position.set(-ctr.x, -box.min.y, -ctr.z);
            wrap.add(m);
            wrap.scale.set(
              it.w0 / (size.x || 1),
              it.z / (size.y || 1),
              it.h0 / (size.z || 1),
            );
            m.traverse((o) => {
              if (o.isMesh) {
                o.castShadow = true;
                o.receiveShadow = true;
              }
            });
            holder.remove(proc);
            holder.add(wrap);
          })
          .catch(() => {});
      }
    });

    scene.add(content);
    return () => {
      alive = false;
      holders.clear();
      scene.remove(content);
      disposeTree(content);
      tex.dispose();
    };
  }, [room, floor, wall, items, openings, colors]);

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => placeCamera("top")}>
          {labels.top}
        </button>
        <button type="button" onClick={() => placeCamera("iso")}>
          {labels.iso}
        </button>
        <button type="button" onClick={() => placeCamera("front")}>
          {labels.front}
        </button>
        <button
          type="button"
          className={auto ? styles.on : ""}
          onClick={() => setAuto((a) => !a)}
        >
          {labels.auto}
        </button>
        <span className={styles.helpText}>{labels.help}</span>
      </div>

      <div ref={mountRef} className={styles.viewport} />
      <div
        ref={barRef}
        className={styles.bar}
        role="toolbar"
        aria-label={selectedName}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span className={styles.barName}>{selectedName}</span>
        <button
          type="button"
          className={styles.barBtn}
          onClick={() => onRotate?.()}
          title={labels.rotate}
          aria-label={labels.rotate}
        >
          <RotateIcon />
        </button>
        <button
          type="button"
          className={styles.barBtn}
          onClick={() => onDuplicate?.()}
          title={labels.duplicate}
          aria-label={labels.duplicate}
        >
          <CopyIcon />
        </button>
        <button
          type="button"
          className={styles.barBtn}
          onClick={() => onAddToCart?.()}
          title={labels.addCart}
          aria-label={labels.addCart}
        >
          <CartIcon />
        </button>
        <button
          type="button"
          className={`${styles.barBtn} ${styles.barDanger}`}
          onClick={() => onDelete?.()}
          title={labels.del}
          aria-label={labels.del}
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default Room3D;
