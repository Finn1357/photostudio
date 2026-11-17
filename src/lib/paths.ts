/**
 * Pfad-Funktionen für Masken (Fotoausschnitte) und Formen.
 * Arbeiten gegen eine minimale Kontext-Schnittstelle, damit sie sowohl mit
 * Konva-Kontexten als auch mit nativen Canvas-Kontexten funktionieren.
 */
import type { MaskShape, ShapeKind } from '../types/doc';
import { rng } from './util';

export interface PathCtx {
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  bezierCurveTo(a: number, b: number, c: number, d: number, e: number, f: number): void;
  quadraticCurveTo(a: number, b: number, c: number, d: number): void;
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void;
  closePath(): void;
}

const K = 0.5522847498;

export function ellipsePath(ctx: PathCtx, x: number, y: number, w: number, h: number) {
  const rx = w / 2,
    ry = h / 2,
    cx = x + rx,
    cy = y + ry;
  ctx.moveTo(cx + rx, cy);
  ctx.bezierCurveTo(cx + rx, cy + ry * K, cx + rx * K, cy + ry, cx, cy + ry);
  ctx.bezierCurveTo(cx - rx * K, cy + ry, cx - rx, cy + ry * K, cx - rx, cy);
  ctx.bezierCurveTo(cx - rx, cy - ry * K, cx - rx * K, cy - ry, cx, cy - ry);
  ctx.bezierCurveTo(cx + rx * K, cy - ry, cx + rx, cy - ry * K, cx + rx, cy);
  ctx.closePath();
}

export function roundRectPath(ctx: PathCtx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  if (rr <= 0.01) {
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    return;
  }
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.arcTo(x + w, y, x + w, y + rr, rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.arcTo(x + w, y + h, x + w - rr, y + h, rr);
  ctx.lineTo(x + rr, y + h);
  ctx.arcTo(x, y + h, x, y + h - rr, rr);
  ctx.lineTo(x, y + rr);
  ctx.arcTo(x, y, x + rr, y, rr);
  ctx.closePath();
}

/** Polygon mit optional abgerundeten Ecken. pts in absoluten Koordinaten. */
export function polygonPath(ctx: PathCtx, pts: [number, number][], r = 0) {
  const n = pts.length;
  if (n < 3) return;
  if (r <= 0.01) {
    ctx.moveTo(pts[0]![0], pts[0]![1]);
    for (let i = 1; i < n; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
    ctx.closePath();
    return;
  }
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[n - 1]!, pts[0]!);
  ctx.moveTo(start[0], start[1]);
  for (let i = 0; i < n; i++) {
    const p = pts[i]!;
    const next = pts[(i + 1) % n]!;
    const prev = pts[(i - 1 + n) % n]!;
    const maxR = Math.min(Math.hypot(p[0] - prev[0], p[1] - prev[1]), Math.hypot(next[0] - p[0], next[1] - p[1])) / 2;
    ctx.arcTo(p[0], p[1], next[0], next[1], Math.min(r, maxR));
  }
  ctx.closePath();
}

/** Glatter geschlossener Pfad durch Punkte (Catmull-Rom → Bézier). */
export function smoothClosedPath(ctx: PathCtx, pts: [number, number][]) {
  const n = pts.length;
  if (n < 3) return;
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]!;
    const p1 = pts[i]!;
    const p2 = pts[(i + 1) % n]!;
    const p3 = pts[(i + 2) % n]!;
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6,
      p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6,
      p2[1] - (p3[1] - p1[1]) / 6,
      p2[0],
      p2[1],
    );
  }
  ctx.closePath();
}

export function heartPath(ctx: PathCtx, x: number, y: number, w: number, h: number) {
  const X = (v: number) => x + v * w;
  const Y = (v: number) => y + v * h;
  ctx.moveTo(X(0.5), Y(0.26));
  ctx.bezierCurveTo(X(0.5), Y(0.22), X(0.43), Y(0.02), X(0.25), Y(0.02));
  ctx.bezierCurveTo(X(0.05), Y(0.02), X(0.0), Y(0.2), X(0.0), Y(0.32));
  ctx.bezierCurveTo(X(0.0), Y(0.58), X(0.28), Y(0.76), X(0.5), Y(0.98));
  ctx.bezierCurveTo(X(0.72), Y(0.76), X(1.0), Y(0.58), X(1.0), Y(0.32));
  ctx.bezierCurveTo(X(1.0), Y(0.2), X(0.95), Y(0.02), X(0.75), Y(0.02));
  ctx.bezierCurveTo(X(0.57), Y(0.02), X(0.5), Y(0.22), X(0.5), Y(0.26));
  ctx.closePath();
}

export function starPoints(x: number, y: number, w: number, h: number, spikes = 5, inner = 0.48): [number, number][] {
  const pts: [number, number][] = [];
  const cx = x + w / 2,
    cy = y + h / 2 + h * 0.04;
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? 0.5 : 0.5 * inner;
    const a = -Math.PI / 2 + (i * Math.PI) / spikes;
    pts.push([cx + Math.cos(a) * r * w * 1.02, cy + Math.sin(a) * r * h * 1.06]);
  }
  return pts;
}

export function regularPolygon(x: number, y: number, w: number, h: number, n: number, rot = -Math.PI / 2): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = rot + (i * 2 * Math.PI) / n;
    pts.push([x + w / 2 + (Math.cos(a) * w) / 2, y + h / 2 + (Math.sin(a) * h) / 2]);
  }
  return pts;
}

export function archPath(ctx: PathCtx, x: number, y: number, w: number, h: number) {
  const r = Math.min(w / 2, h);
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + r);
  ctx.bezierCurveTo(x, y + r - r * K, x + w / 2 - r * K, y, x + w / 2, y);
  ctx.bezierCurveTo(x + w / 2 + r * K, y, x + w, y + r - r * K, x + w, y + r);
  ctx.lineTo(x + w, y + h);
  ctx.closePath();
}

export function flowerPath(ctx: PathCtx, x: number, y: number, w: number, h: number, petals = 8) {
  const cx = x + w / 2,
    cy = y + h / 2;
  const pts: [number, number][] = [];
  const steps = petals * 12;
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = 0.5 * (0.86 + 0.14 * Math.cos(a * petals));
    pts.push([cx + Math.cos(a) * r * w, cy + Math.sin(a) * r * h]);
  }
  ctx.moveTo(pts[0]![0], pts[0]![1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i]![0], pts[i]![1]);
  ctx.closePath();
}

export function blobPath(ctx: PathCtx, x: number, y: number, w: number, h: number, seed = 7) {
  const r = rng(seed);
  const n = 8;
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rad = 0.42 + r() * 0.08;
    pts.push([x + w / 2 + Math.cos(a) * rad * w, y + h / 2 + Math.sin(a) * rad * h]);
  }
  smoothClosedPath(ctx, pts);
}

/** Zeichnet eine Maskenform in das Rechteck (x, y, w, h). */
export function traceMaskShape(
  ctx: PathCtx,
  shape: MaskShape | ShapeKind,
  x: number,
  y: number,
  w: number,
  h: number,
  opts: { radius?: number; points?: number[] } = {},
) {
  const r = opts.radius ?? 0;
  switch (shape) {
    case 'circle':
      return ellipsePath(ctx, x, y, w, h);
    case 'heart':
      return heartPath(ctx, x, y, w, h);
    case 'star':
      return polygonPath(ctx, starPoints(x, y, w, h), r * 0.3);
    case 'hexagon':
      return polygonPath(ctx, regularPolygon(x, y, w, h, 6, 0), r);
    case 'diamond':
      return polygonPath(ctx, regularPolygon(x, y, w, h, 4), r);
    case 'triangle':
      return polygonPath(
        ctx,
        [
          [x + w / 2, y],
          [x + w, y + h],
          [x, y + h],
        ],
        r,
      );
    case 'arch':
      return archPath(ctx, x, y, w, h);
    case 'flower':
      return flowerPath(ctx, x, y, w, h);
    case 'blob':
      return blobPath(ctx, x, y, w, h);
    case 'polygon':
    case 'custom': {
      const p = opts.points ?? [];
      const pts: [number, number][] = [];
      for (let i = 0; i + 1 < p.length; i += 2) pts.push([x + p[i]! * w, y + p[i + 1]! * h]);
      if (pts.length < 3) return roundRectPath(ctx, x, y, w, h, r);
      if (shape === 'custom') return smoothClosedPath(ctx, pts);
      return polygonPath(ctx, pts, r);
    }
    case 'line':
    case 'arrow':
    case 'rect':
    default:
      return roundRectPath(ctx, x, y, w, h, r);
  }
}

/** Erzeugt einen zerrissenen (gezackten) Rand als Punktliste um ein Rechteck. */
export function tornRectPoints(x: number, y: number, w: number, h: number, amp: number, seed: number, step?: number): [number, number][] {
  const r = rng(seed);
  const s = step ?? Math.max(4, Math.min(w, h) / 28);
  const pts: [number, number][] = [];
  const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(2, Math.round(len / s));
    for (let i = 0; i < n; i++) {
      const t = i / n;
      const j = (r() - 0.35) * amp;
      pts.push([x1 + (x2 - x1) * t + nx * j, y1 + (y2 - y1) * t + ny * j]);
    }
  };
  edge(x, y, x + w, y, 0, -1);
  edge(x + w, y, x + w, y + h, 1, 0);
  edge(x + w, y + h, x, y + h, 0, 1);
  edge(x, y + h, x, y, -1, 0);
  return pts;
}
