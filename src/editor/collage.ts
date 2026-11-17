/** Berechnet aus Layout + Einstellungen die Geometrie der Collage-Felder (rein, testbar). */
import type { CollageSettings, FrameKind, MaskShape } from '../types/doc';
import type { CollageLayout } from '../content/layouts';
import { fitAspect, insetConvexPolygon, polygonBounds, type Pt } from '../lib/geometry';

export interface SlotGeom {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  shape: MaskShape;
  points?: number[];
  cornerRadius: number;
  frame?: FrameKind;
}

const EPS = 1e-4;

export function computeSlots(layout: CollageLayout, s: CollageSettings, W: number, H: number): SlotGeom[] {
  const unit = Math.min(W, H);
  const m = layout.scatter ? 0 : s.margin * unit;
  const g = layout.scatter ? 0 : s.gap * unit;
  const radius = s.radius * unit;
  const ix = m,
    iy = m,
    iw = Math.max(1, W - 2 * m),
    ih = Math.max(1, H - 2 * m);

  return layout.cells.map((cell) => {
    if (cell.poly) {
      const pts: Pt[] = cell.poly.map(([x, y]) => [ix + x * iw, iy + y * ih]);
      const n = cell.poly.length;
      const insets: number[] = [];
      for (let i = 0; i < n; i++) {
        const a = cell.poly[i]!;
        const b = cell.poly[(i + 1) % n]!;
        const onBoundary =
          (Math.abs(a[0]) < EPS && Math.abs(b[0]) < EPS) ||
          (Math.abs(a[0] - 1) < EPS && Math.abs(b[0] - 1) < EPS) ||
          (Math.abs(a[1]) < EPS && Math.abs(b[1]) < EPS) ||
          (Math.abs(a[1] - 1) < EPS && Math.abs(b[1] - 1) < EPS);
        insets.push(onBoundary ? 0 : g / 2);
      }
      const inset = g > 0 ? insetConvexPolygon(pts, insets) : pts;
      const b = polygonBounds(inset);
      const bw = Math.max(1, b.w),
        bh = Math.max(1, b.h);
      const points: number[] = [];
      for (const [x, y] of inset) points.push((x - b.x) / bw, (y - b.y) / bh);
      return {
        x: b.x + bw / 2,
        y: b.y + bh / 2,
        width: bw,
        height: bh,
        rotation: 0,
        shape: 'polygon' as MaskShape,
        points,
        cornerRadius: radius,
        frame: cell.frame,
      };
    }
    const [nx, ny, nw, nh] = cell.r ?? [0, 0, 1, 1];
    let x = ix + nx * iw;
    let y = iy + ny * ih;
    let w = nw * iw;
    let h = nh * ih;
    if (!layout.scatter && g > 0) {
      const l = nx > EPS ? g / 2 : 0;
      const t = ny > EPS ? g / 2 : 0;
      const r = nx + nw < 1 - EPS ? g / 2 : 0;
      const bt = ny + nh < 1 - EPS ? g / 2 : 0;
      x += l;
      y += t;
      w -= l + r;
      h -= t + bt;
    }
    let rect = { x, y, w: Math.max(1, w), h: Math.max(1, h) };
    if (cell.aspect) {
      // Bei Polaroid-Rahmen bezieht sich das Seitenverhältnis auf die gesamte Karte
      rect = fitAspect(rect, cell.aspect);
    }
    return {
      x: rect.x + rect.w / 2,
      y: rect.y + rect.h / 2,
      width: rect.w,
      height: rect.h,
      rotation: cell.rot ?? 0,
      shape: cell.shape ?? 'rect',
      cornerRadius: (cell.shape ?? 'rect') === 'rect' ? Math.min(radius, rect.w / 2, rect.h / 2) : radius,
      frame: cell.frame,
    };
  });
}
