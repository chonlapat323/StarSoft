import { gaussian, mulberry32 } from "./math";

export type ShapeContext = {
  halfW: number;
  halfH: number;
  fontFamily: string;
};

type Generator = (out: Float32Array, count: number, rand: () => number, ctx: ShapeContext) => void;

type Vec3 = [number, number, number];

function rotate([x, y, z]: Vec3, rx: number, ry: number, rz: number): Vec3 {
  const cx = Math.cos(rx), sx = Math.sin(rx);
  const y1 = y * cx - z * sx;
  const z1 = y * sx + z * cx;
  const cy = Math.cos(ry), sy = Math.sin(ry);
  const x2 = x * cy + z1 * sy;
  const z2 = -x * sy + z1 * cy;
  const cz = Math.cos(rz), sz = Math.sin(rz);
  return [x2 * cz - y1 * sz, x2 * sz + y1 * cz, z2];
}

function put(out: Float32Array, i: number, p: Vec3, member: number) {
  out[i * 4] = p[0];
  out[i * 4 + 1] = p[1];
  out[i * 4 + 2] = p[2];
  out[i * 4 + 3] = member;
}

const sphere: Generator = (out, count, rand) => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    if (rand() > 0.74) { put(out, i, [0, 0, 0], 0); continue; }
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    const R = 3.1 + gaussian(rand) * 0.05;
    put(out, i, [Math.cos(t) * r * R, y * R, Math.sin(t) * r * R], 1);
  }
};

const galaxy: Generator = (out, count, rand) => {
  const arms = 3;
  for (let i = 0; i < count; i++) {
    if (rand() > 0.8) { put(out, i, [0, 0, 0], 0); continue; }
    let p: Vec3;
    if (rand() < 0.14) {
      p = [gaussian(rand) * 0.45, gaussian(rand) * 0.3, gaussian(rand) * 0.45];
    } else {
      const r = Math.pow(rand(), 0.7) * 4.8 + 0.3;
      const arm = Math.floor(rand() * arms);
      const a = (arm / arms) * Math.PI * 2 + r * 1.25 + (gaussian(rand) * 0.32) / (r * 0.35 + 0.4);
      p = [Math.cos(a) * r, gaussian(rand) * 0.08 * (1 + 1 / r), Math.sin(a) * r];
    }
    put(out, i, rotate(p, -1.05, 0, 0.38), 1);
  }
};

const ring: Generator = (out, count, rand) => {
  for (let i = 0; i < count; i++) {
    const roll = rand();
    if (roll > 0.78) { put(out, i, [0, 0, 0], 0); continue; }
    const outer = roll > 0.62;
    const R = outer ? 4.4 + gaussian(rand) * 0.05 : 3.1 + Math.abs(gaussian(rand)) * 0.32;
    const a = rand() * Math.PI * 2;
    const p: Vec3 = [Math.cos(a) * R, gaussian(rand) * (outer ? 0.015 : 0.04), Math.sin(a) * R];
    put(out, i, rotate(p, -1.32, 0, -0.18), 1);
  }
};

const lattice: Generator = (out, count, rand) => {
  const cols = 44, rows = 26, w = 10, h = 6;
  for (let i = 0; i < count; i++) {
    if (rand() > 0.78) { put(out, i, [0, 0, 0], 0); continue; }
    const cx = Math.floor(rand() * cols), cy = Math.floor(rand() * rows);
    const along = rand() < 0.5;
    const t = rand();
    const gx = along ? (cx + t) / cols : cx / cols;
    const gy = along ? cy / rows : (cy + t) / rows;
    const x = (gx - 0.5) * w;
    const z = (gy - 0.5) * h;
    const y = Math.sin(x * 0.7) * Math.cos(z * 0.9) * 0.45;
    put(out, i, rotate([x, y, z], 0.95, -0.3, 0), 1);
  }
};

const helix: Generator = (out, count, rand) => {
  const L = 10, radius = 1.05, turns = 3.2;
  for (let i = 0; i < count; i++) {
    const roll = rand();
    if (roll > 0.8) { put(out, i, [0, 0, 0], 0); continue; }
    let p: Vec3;
    if (roll < 0.14) {
      const k = Math.floor(rand() * 36) / 36;
      const a = k * turns * Math.PI * 2;
      const s = rand() * 2 - 1;
      p = [(k - 0.5) * L, Math.cos(a) * radius * s, Math.sin(a) * radius * s];
    } else {
      const k = rand();
      const a = k * turns * Math.PI * 2 + (rand() < 0.5 ? 0 : Math.PI);
      const j = gaussian(rand) * 0.05;
      p = [(k - 0.5) * L, Math.cos(a) * (radius + j), Math.sin(a) * (radius + j)];
    }
    put(out, i, rotate(p, 0.35, 0.25, 0.12), 1);
  }
};

function text(word: string): Generator {
  return (out, count, rand, ctx) => {
    const W = 1600, H = 420;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext("2d", { willReadFrequently: true });
    if (!c) return;
    let size = 320;
    const font = (s: number) => `600 ${s}px ${ctx.fontFamily}`;
    c.font = font(size);
    const measured = c.measureText(word).width;
    if (measured > W * 0.94) size *= (W * 0.94) / measured;
    c.font = font(size);
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillStyle = "#fff";
    c.fillText(word, W / 2, H / 2);

    const img = c.getImageData(0, 0, W, H).data;
    const px: number[] = [];
    for (let y = 0; y < H; y += 2) {
      for (let x = 0; x < W; x += 2) {
        if (img[(y * W + x) * 4 + 3] > 120) px.push(x, y);
      }
    }
    if (px.length === 0) return;
    const worldW = 12.5;
    const n = px.length / 2;
    for (let i = 0; i < count; i++) {
      if (rand() > 0.7) { put(out, i, [0, 0, 0], 0); continue; }
      const k = Math.floor(rand() * n) * 2;
      const x = ((px[k] + rand() * 2 - W / 2) / W) * worldW;
      const y = (-(px[k + 1] + rand() * 2 - H / 2) / W) * worldW;
      put(out, i, [x, y, gaussian(rand) * 0.06], 1);
    }
  };
}

// Soft clusters on a unit ring; the shader scales the ring to the viewport and rotates it so clusters orbit the content.
const drift: Generator = (out, count, rand) => {
  const K = 7;
  const clusters = Array.from({ length: K }, (_, k) => {
    const a = (k / K) * Math.PI * 2 + (rand() - 0.5) * 0.6;
    const rr = 0.9 + rand() * 0.22;
    return {
      c: [Math.cos(a) * rr, Math.sin(a) * rr, (rand() * 2 - 1) * 0.2] as Vec3,
      r: 0.05 + rand() * 0.08,
      stretch: 1 + rand() * 1.6,
      rot: rand() * Math.PI,
    };
  });
  for (let i = 0; i < count; i++) {
    if (rand() > 0.56) { put(out, i, [0, 0, 0], 0); continue; }
    const k = clusters[Math.floor(rand() * K)];
    const ox = gaussian(rand) * k.r * k.stretch, oy = gaussian(rand) * k.r, oz = gaussian(rand) * k.r * 0.7;
    const c = Math.cos(k.rot), s = Math.sin(k.rot);
    put(out, i, [k.c[0] + ox * c - oy * s, k.c[1] + ox * s + oy * c, k.c[2] + oz], 1);
  }
};

const GENERATORS: Record<string, Generator> = { drift, sphere, galaxy, ring, lattice, helix };

function fitToView(out: Float32Array, count: number, ctx: ShapeContext) {
  let ex = 0, ey = 0;
  for (let i = 0; i < count; i++) {
    if (out[i * 4 + 3] === 0) continue;
    ex = Math.max(ex, Math.abs(out[i * 4]));
    ey = Math.max(ey, Math.abs(out[i * 4 + 1]));
  }
  if (ex === 0) return;
  const s = Math.min(1, (ctx.halfW * 0.9) / ex, (ctx.halfH * 0.8) / ey);
  if (s >= 1) return;
  for (let i = 0; i < count * 4; i++) {
    if (i % 4 !== 3) out[i] *= s;
  }
}

export function buildShape(key: string, out: Float32Array, count: number, ctx: ShapeContext) {
  const gen = key.startsWith("text:") ? text(key.slice(5)) : GENERATORS[key] ?? drift;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  gen(out, count, mulberry32(hash), ctx);
  if (key !== "drift") fitToView(out, count, ctx);
}

export function shapeDefaults(key: string) {
  if (key === "drift") return { strength: 1.1, flow: 0.6 };
  if (key.startsWith("text:")) return { strength: 4.2, flow: 0.25 };
  return { strength: 2.6, flow: 0.34 };
}

export type ShapeMotion = { spinY: number; spinZ: number; sx: number; sy: number; sz: number };

export function shapeMotion(key: string, t: number, halfW: number, halfH: number, out: ShapeMotion) {
  out.spinY = 0;
  out.spinZ = 0;
  out.sx = out.sy = out.sz = 1;
  if (key === "drift") {
    out.spinZ = t * 0.025;
    out.sx = halfW * 0.74;
    out.sy = halfH * 0.66;
    out.sz = 8;
  } else if (key.startsWith("text:")) {
    out.spinY = Math.sin(t * 0.35) * 0.06;
  } else if (key === "lattice") {
    out.spinY = Math.sin(t * 0.2) * 0.18;
  } else if (key === "helix" || key === "ring" || key === "galaxy") {
    out.spinY = Math.sin(t * 0.17) * 0.3;
  } else {
    out.spinY = t * 0.1;
  }
  return out;
}
