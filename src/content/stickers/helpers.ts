/** SVG-Bausteine für die eigenen Sticker. */
import { rng } from '../../lib/util';

export type StickerCategory =
  | 'herzen'
  | 'blumen'
  | 'sterne'
  | 'schleifen'
  | 'party'
  | 'tiere'
  | 'weihnachten'
  | 'ostern'
  | 'herbst'
  | 'sprechblasen'
  | 'pfeile'
  | 'linien'
  | 'washi'
  | 'papier'
  | 'scrapbook'
  | 'stempel'
  | 'kronen'
  | 'ornamente'
  | 'niedlich';

export interface StickerDef {
  id: string;
  name: string;
  cat: StickerCategory;
  tags?: string;
  w: number;
  h: number;
  /** Standardfarben (umfärbbare Slots) */
  colors: string[];
  draw: (c: string[]) => string;
}

export const f = (n: number) => (Math.round(n * 100) / 100).toString();

/** Herzpfad zentriert bei (cx, cy) mit Breite s. */
export function heartD(cx: number, cy: number, s: number): string {
  const k = s / 100;
  const X = (v: number) => f(cx + v * k);
  const Y = (v: number) => f(cy + v * k);
  return `M${X(0)} ${Y(-22)} C${X(0)} ${Y(-28)} ${X(-10)} ${Y(-46)} ${X(-27)} ${Y(-46)} C${X(-46)} ${Y(-46)} ${X(-50)} ${Y(-28)} ${X(-50)} ${Y(-18)} C${X(-50)} ${Y(6)} ${X(-24)} ${Y(24)} ${X(0)} ${Y(46)} C${X(24)} ${Y(24)} ${X(50)} ${Y(6)} ${X(50)} ${Y(-18)} C${X(50)} ${Y(-28)} ${X(46)} ${Y(-46)} ${X(27)} ${Y(-46)} C${X(10)} ${Y(-46)} ${X(0)} ${Y(-28)} ${X(0)} ${Y(-22)}Z`;
}

export function starPts(cx: number, cy: number, R: number, r: number, n = 5, rotDeg = 0): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = -Math.PI / 2 + (i * Math.PI) / n + (rotDeg * Math.PI) / 180;
    pts.push(`${f(cx + Math.cos(a) * rad)},${f(cy + Math.sin(a) * rad)}`);
  }
  return pts.join(' ');
}

/** Vierzackiges Funkeln. */
export function sparkleD(cx: number, cy: number, r: number): string {
  const k = r * 0.18;
  return `M${f(cx)} ${f(cy - r)} Q${f(cx + k)} ${f(cy - k)} ${f(cx + r)} ${f(cy)} Q${f(cx + k)} ${f(cy + k)} ${f(cx)} ${f(cy + r)} Q${f(cx - k)} ${f(cy + k)} ${f(cx - r)} ${f(cy)} Q${f(cx - k)} ${f(cy - k)} ${f(cx)} ${f(cy - r)}Z`;
}

/** Gezackter Papierrand als Polygonpunkte. */
export function tornPts(x: number, y: number, w: number, h: number, amp: number, seed: number, step = 7, edges = [true, true, true, true]): string {
  const r = rng(seed);
  const pts: string[] = [];
  const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number, jag: boolean) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(2, Math.round(len / step));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const j = jag ? (r() - 0.3) * amp : 0;
      pts.push(`${f(x1 + (x2 - x1) * t + nx * j)},${f(y1 + (y2 - y1) * t + ny * j)}`);
    }
  };
  edge(x, y, x + w, y, 0, -1, edges[0]!);
  edge(x + w, y, x + w, y + h, 1, 0, edges[1]!);
  edge(x + w, y + h, x, y + h, 0, 1, edges[2]!);
  edge(x, y + h, x, y, -1, 0, edges[3]!);
  return pts.join(' ');
}

/** Blütenblätter als Ellipsen um einen Mittelpunkt. */
export function petals(cx: number, cy: number, n: number, dist: number, rx: number, ry: number, fill: string, rot = 0, extra = ''): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 360) / n;
    s += `<ellipse cx="${f(cx)}" cy="${f(cy - dist)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}" transform="rotate(${f(a)} ${f(cx)} ${f(cy)})" ${extra}/>`;
  }
  return s;
}

/** Blatt (spitz) von (x, y) in Richtung angle. */
export function leaf(x: number, y: number, len: number, wid: number, angle: number, fill: string, vein?: string): string {
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(angle)})"><path d="M0 0 C${f(wid)} ${f(-len * 0.25)} ${f(wid)} ${f(-len * 0.75)} 0 ${f(-len)} C${f(-wid)} ${f(-len * 0.75)} ${f(-wid)} ${f(-len * 0.25)} 0 0Z" fill="${fill}"/>${
    vein ? `<path d="M0 0 L0 ${f(-len * 0.92)}" stroke="${vein}" stroke-width="${f(wid * 0.12)}" stroke-linecap="round" opacity="0.7"/>` : ''
  }</g>`;
}

/** Leicht unruhige Linie (handgezeichnet). */
export function wobble(points: [number, number][], seed: number, amp = 1.2): string {
  const r = rng(seed);
  let d = `M${f(points[0]![0])} ${f(points[0]![1])}`;
  for (let i = 1; i < points.length; i++) {
    const [x, y] = points[i]!;
    const [px, py] = points[i - 1]!;
    d += ` Q${f((x + px) / 2 + (r() - 0.5) * amp * 2)} ${f((y + py) / 2 + (r() - 0.5) * amp * 2)} ${f(x)} ${f(y)}`;
  }
  return d;
}

/** Washi-Tape-Streifen mit gezackten Enden. */
export function washiStrip(fill: string, pattern: string, seed: number, w = 400, h = 90): string {
  const r = rng(seed);
  const left: string[] = [];
  const right: string[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const y = (i / n) * h;
    left.push(`${f(6 + (i % 2 === 0 ? 0 : 6) + r() * 3)},${f(y)}`);
    right.push(`${f(w - 6 - (i % 2 === 0 ? 0 : 6) - r() * 3)},${f(h - y)}`);
  }
  const poly = [...left, ...right].join(' ');
  return `<defs><clipPath id="wc"><polygon points="${poly}"/></clipPath></defs><g clip-path="url(#wc)" opacity="0.88"><rect width="${w}" height="${h}" fill="${fill}"/>${pattern}<rect width="${w}" height="${h}" fill="#ffffff" opacity="0.08"/></g>`;
}
