/** Geometrie-Hilfen (rein, testbar). */

export type Pt = [number, number];

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export function rotatePoint(x: number, y: number, deg: number): Pt {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  return [x * c - y * s, x * s + y * c];
}

export function polygonBounds(pts: Pt[]): Rect {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function polygonArea(pts: Pt[]): number {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i]!;
    const [x2, y2] = pts[(i + 1) % pts.length]!;
    a += x1 * y2 - x2 * y1;
  }
  return a / 2;
}

function lineIntersect(p1: Pt, d1: Pt, p2: Pt, d2: Pt): Pt | null {
  const cross = d1[0] * d2[1] - d1[1] * d2[0];
  if (Math.abs(cross) < 1e-9) return null;
  const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / cross;
  return [p1[0] + d1[0] * t, p1[1] + d1[1] * t];
}

/**
 * Verkleinert ein konvexes Polygon. Jede Kante i (pts[i] -> pts[i+1]) wird um insets[i] nach innen verschoben.
 * Funktioniert unabhängig von der Umlaufrichtung.
 */
export function insetConvexPolygon(pts: Pt[], insets: number[]): Pt[] {
  const n = pts.length;
  if (n < 3) return pts.slice();
  const sign = polygonArea(pts) >= 0 ? 1 : -1;
  const lines: { p: Pt; d: Pt }[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[i]!;
    const b = pts[(i + 1) % n]!;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    // Innen-Normale: bei positiver Fläche (y nach unten, Uhrzeigersinn in Bildschirmkoordinaten) (-dy, dx)
    const nx = (-dy / len) * sign;
    const ny = (dx / len) * sign;
    const d = insets[i] ?? 0;
    lines.push({ p: [a[0] + nx * d, a[1] + ny * d], d: [dx, dy] });
  }
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = lines[(i - 1 + n) % n]!;
    const cur = lines[i]!;
    const p = lineIntersect(prev.p, prev.d, cur.p, cur.d);
    out.push(p ?? cur.p);
  }
  return out;
}

/** Passt ein Rechteck mit gegebenem Seitenverhältnis (w/h) zentriert in ein Rechteck ein. */
export function fitAspect(r: Rect, aspect: number): Rect {
  const ra = r.w / r.h;
  if (ra > aspect) {
    const w = r.h * aspect;
    return { x: r.x + (r.w - w) / 2, y: r.y, w, h: r.h };
  }
  const h = r.w / aspect;
  return { x: r.x, y: r.y + (r.h - h) / 2, w: r.w, h };
}

/** Achsenparallele Hülle eines gedrehten Rechtecks (Mittelpunkt-basiert). */
export function rotatedBounds(cx: number, cy: number, w: number, h: number, rotation: number): Rect {
  const corners: Pt[] = [
    [-w / 2, -h / 2],
    [w / 2, -h / 2],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ].map(([x, y]) => {
    const [rx, ry] = rotatePoint(x!, y!, rotation);
    return [rx + cx, ry + cy] as Pt;
  });
  return polygonBounds(corners);
}

export function pointInPolygon(x: number, y: number, pts: Pt[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i]!;
    const [xj, yj] = pts[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Vereinfacht eine Punktfolge (Ramer-Douglas-Peucker). */
export function simplifyPath(pts: Pt[], tolerance: number): Pt[] {
  if (pts.length < 3) return pts.slice();
  const sq = tolerance * tolerance;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack: [number, number][] = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    const [ax, ay] = pts[s]!;
    const [bx, by] = pts[e]!;
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1e-12;
    let maxD = 0;
    let idx = -1;
    for (let i = s + 1; i < e; i++) {
      const [px, py] = pts[i]!;
      const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2));
      const qx = ax + t * dx - px;
      const qy = ay + t * dy - py;
      const d = qx * qx + qy * qy;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > sq && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}
