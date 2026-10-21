import { doorGeom } from "./roomUtils";

const PAPER = "#fbfaf5";
const INK = "#1b2b3a";
const ACC = "#64b043";
const MUTED = "#6b7780";
const FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";
const ROW_H = 48;

export const sketchSize = (data) => {
  const { room, legend } = data;
  const s = Math.min(760 / room.w, 640 / room.h);
  const pw = room.w * s;
  const ph = room.h * s;
  const ox = 130;
  const oy = 190;
  const W = Math.round(ox + pw + 80 + 440 + 40);
  const legendH = oy + 90 + Math.max(legend.length, 1) * ROW_H + 130;
  const H = Math.round(Math.max(oy + ph + 130, legendH));
  return { s, pw, ph, ox, oy, W, H };
};

const hatchPattern = (ctx) => {
  const c = document.createElement("canvas");
  c.width = c.height = 8;
  const g = c.getContext("2d");
  g.strokeStyle = "rgba(100,176,67,.35)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(0, 8);
  g.lineTo(8, 0);
  g.moveTo(-2, 2);
  g.lineTo(2, -2);
  g.moveTo(6, 10);
  g.lineTo(10, 6);
  g.stroke();
  return ctx.createPattern(c, "repeat");
};

const fit = (ctx, text, max) => {
  if (ctx.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > max)
    t = t.slice(0, -1);
  return t + "…";
};

const dimLine = (ctx, x1, y1, x2, y2, text, vertical) => {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  const t = 7;
  if (vertical) {
    ctx.moveTo(x1 - t, y1);
    ctx.lineTo(x1 + t, y1);
    ctx.moveTo(x2 - t, y2);
    ctx.lineTo(x2 + t, y2);
  } else {
    ctx.moveTo(x1, y1 - t);
    ctx.lineTo(x1, y1 + t);
    ctx.moveTo(x2, y2 - t);
    ctx.lineTo(x2, y2 + t);
  }
  ctx.stroke();
  ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
  if (vertical) ctx.rotate(-Math.PI / 2);
  ctx.font = `600 14px ${FONT}`;
  const w = ctx.measureText(text).width + 14;
  ctx.fillStyle = PAPER;
  ctx.fillRect(-w / 2, -10, w, 20);
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 0, 1);
  ctx.restore();
};

export const drawSketch = (canvas, data, L, ratio = 1) => {
  const { room, openings, items, legend } = data;
  const { s, pw, ph, ox, oy, W, H } = sketchSize(data);
  canvas.width = W * ratio;
  canvas.height = H * ratio;
  const ctx = canvas.getContext("2d");
  ctx.scale(ratio, ratio);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 14, W - 28, H - 28);

  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = INK;
  ctx.font = `700 30px ${FONT}`;
  ctx.fillText(L.title, 40, 70);
  ctx.fillStyle = MUTED;
  ctx.font = `14px ${FONT}`;
  ctx.fillText(
    `${L.room}: ${room.w / 100} × ${room.h / 100} m  ·  ${L.date}`,
    40,
    96,
  );

  ctx.save();
  ctx.beginPath();
  ctx.rect(ox, oy, pw, ph);
  ctx.clip();
  ctx.fillStyle = `${data.floor}40`;
  ctx.fillRect(ox, oy, pw, ph);
  if (s * 10 >= 4) {
    ctx.strokeStyle = "rgba(0,0,0,.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let cm = 0; cm <= room.w; cm += 10) {
      ctx.moveTo(ox + cm * s, oy);
      ctx.lineTo(ox + cm * s, oy + ph);
    }
    for (let cm = 0; cm <= room.h; cm += 10) {
      ctx.moveTo(ox, oy + cm * s);
      ctx.lineTo(ox + pw, oy + cm * s);
    }
    ctx.stroke();
  }
  ctx.strokeStyle = "rgba(0,0,0,.14)";
  ctx.beginPath();
  for (let cm = 0; cm <= room.w; cm += 50) {
    ctx.moveTo(ox + cm * s, oy);
    ctx.lineTo(ox + cm * s, oy + ph);
  }
  for (let cm = 0; cm <= room.h; cm += 50) {
    ctx.moveTo(ox, oy + cm * s);
    ctx.lineTo(ox + pw, oy + cm * s);
  }
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.strokeRect(ox - 4, oy - 4, pw + 8, ph + 8);

  const P = ([x, y]) => [ox + x * s, oy + y * s];
  const gap = (o) => {
    const t = 8;
    switch (o.wall) {
      case "top":
        return [ox + o.pos * s, oy - t, o.len * s, t];
      case "bottom":
        return [ox + o.pos * s, oy + ph, o.len * s, t];
      case "left":
        return [ox - t, oy + o.pos * s, t, o.len * s];
      default:
        return [ox + pw, oy + o.pos * s, t, o.len * s];
    }
  };
  openings.forEach((o) => {
    const [gx, gy, gw, gh] = gap(o);
    ctx.fillStyle = o.type === "window" ? "#d7ecf8" : PAPER;
    ctx.fillRect(gx, gy, gw, gh);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.5;
    if (o.type === "window") {
      ctx.strokeRect(gx, gy, gw, gh);
      ctx.beginPath();
      if (gw > gh) {
        ctx.moveTo(gx, gy + gh / 2);
        ctx.lineTo(gx + gw, gy + gh / 2);
      } else {
        ctx.moveTo(gx + gw / 2, gy);
        ctx.lineTo(gx + gw / 2, gy + gh);
      }
      ctx.stroke();
    } else {
      const g = doorGeom(o, room);
      const [hx, hy] = P(g.hinge);
      const [lx, ly] = P(g.leaf);
      const [fx, fy] = P(g.free);
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(hx, hy);
      ctx.lineTo(lx, ly);
      ctx.stroke();
      ctx.lineWidth = 1.2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(
        hx,
        hy,
        o.len * s,
        Math.atan2(ly - hy, lx - hx),
        Math.atan2(fy - hy, fx - hx),
        g.sweep === 0,
      );
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });

  dimLine(ctx, ox, oy - 36, ox + pw, oy - 36, `${room.w / 100} m`, false);
  dimLine(ctx, ox - 36, oy, ox - 36, oy + ph, `${room.h / 100} m`, true);

  const hatch = hatchPattern(ctx);
  items.forEach((it) => {
    const x = ox + it.x * s;
    const y = oy + it.y * s;
    const w = it.w * s;
    const h = it.h * s;
    ctx.beginPath();
    if (it.round)
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    else ctx.roundRect(x, y, w, h, 4);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.fillStyle = hatch;
    ctx.fill();
    ctx.strokeStyle = ACC;
    ctx.lineWidth = 2;
    ctx.stroke();

    const r = Math.min(13, Math.min(w, h) / 3);
    const cx = x + w / 2;
    const cy = y + h / 2;
    ctx.fillStyle = ACC;
    ctx.beginPath();
    ctx.arc(cx, cy - (w > 60 && h > 50 ? 6 : 0), r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `700 ${Math.round(r * 1.05)}px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(it.num), cx, cy - (w > 60 && h > 50 ? 6 : 0) + 1);
    if (w > 60 && h > 50) {
      ctx.fillStyle = INK;
      ctx.font = `600 12px ${FONT}`;
      ctx.fillText(`${it.w}×${it.h}`, cx, cy + r + 8);
    }
  });

  const sy = oy + ph + 52;
  ctx.strokeStyle = INK;
  ctx.fillStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ox, sy);
  ctx.lineTo(ox + 100 * s, sy);
  ctx.moveTo(ox, sy - 6);
  ctx.lineTo(ox, sy + 6);
  ctx.moveTo(ox + 100 * s, sy - 6);
  ctx.lineTo(ox + 100 * s, sy + 6);
  ctx.stroke();
  ctx.font = `600 13px ${FONT}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(L.oneMeter, ox + 100 * s + 12, sy);

  const lx = ox + pw + 80;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = INK;
  ctx.font = `700 20px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(L.legend, lx, oy + 6);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(lx, oy + 20);
  ctx.lineTo(lx + 440, oy + 20);
  ctx.stroke();

  if (!legend.length) {
    ctx.fillStyle = MUTED;
    ctx.font = `14px ${FONT}`;
    ctx.fillText(L.empty, lx, oy + 56);
  }
  legend.forEach((row, i) => {
    const ry = oy + 34 + i * ROW_H;
    ctx.fillStyle = ACC;
    ctx.beginPath();
    ctx.arc(lx + 14, ry + 20, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = `700 13px ${FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(row.num), lx + 14, ry + 21);

    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = INK;
    ctx.font = `600 14px ${FONT}`;
    ctx.fillText(fit(ctx, row.name, 270), lx + 38, ry + 17);
    ctx.fillStyle = MUTED;
    ctx.font = `12px ${FONT}`;
    ctx.fillText(`${row.size}  ·  ×${row.qty}`, lx + 38, ry + 35);
    ctx.fillStyle = INK;
    ctx.font = `700 14px ${FONT}`;
    ctx.textAlign = "right";
    ctx.fillText(row.price, lx + 440, ry + 26);

    ctx.strokeStyle = "rgba(0,0,0,.1)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(lx, ry + ROW_H - 2);
    ctx.lineTo(lx + 440, ry + ROW_H - 2);
    ctx.stroke();
  });

  const ty = oy + 34 + Math.max(legend.length, 1) * ROW_H + 30;
  ctx.fillStyle = INK;
  ctx.font = `700 20px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(L.total, lx, ty);
  ctx.textAlign = "right";
  ctx.fillStyle = ACC;
  ctx.fillText(data.total, lx + 440, ty);
  ctx.fillStyle = MUTED;
  ctx.font = `13px ${FONT}`;
  ctx.textAlign = "left";
  ctx.fillText(`${L.fill}: ${data.fillPct}%`, lx, ty + 28);

  ctx.fillStyle = MUTED;
  ctx.font = `12px ${FONT}`;
  ctx.fillText("Embawood · " + L.title, 40, H - 32);
};

const makeCanvas = (data, L, ratio) => {
  const c = document.createElement("canvas");
  drawSketch(c, data, L, ratio);
  return c;
};

export const downloadSketch = (data, L, filename = "otaq-eskizi.png") => {
  makeCanvas(data, L, 2).toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }, "image/png");
};
