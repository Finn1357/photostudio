import { describe, expect, it } from 'vitest';
import { LAYOUTS, defaultLayoutFor, getLayout } from '../content/layouts';
import { computeSlots } from './collage';
import { insetConvexPolygon, polygonArea, simplifyPath, fitAspect } from '../lib/geometry';

describe('Geometrie', () => {
  it('verkleinert konvexe Polygone nach innen', () => {
    const sq: [number, number][] = [
      [0, 0],
      [100, 0],
      [100, 100],
      [0, 100],
    ];
    const inset = insetConvexPolygon(sq, [10, 10, 10, 10]);
    expect(inset[0]![0]).toBeCloseTo(10);
    expect(inset[0]![1]).toBeCloseTo(10);
    expect(Math.abs(polygonArea(inset))).toBeCloseTo(6400);
  });
  it('passt Seitenverhältnisse ein', () => {
    const r = fitAspect({ x: 0, y: 0, w: 200, h: 100 }, 1);
    expect(r).toEqual({ x: 50, y: 0, w: 100, h: 100 });
  });
  it('vereinfacht Pfade', () => {
    const pts: [number, number][] = Array.from({ length: 50 }, (_, i) => [i, 0]);
    expect(simplifyPath(pts, 0.1).length).toBe(2);
  });
});

describe('Collage-Raster', () => {
  it('bietet Raster für 1 bis 12 Fotos in vielen Stilen', () => {
    for (let n = 1; n <= 12; n++) expect(LAYOUTS.some((l) => l.count === n)).toBe(true);
    expect(LAYOUTS.length).toBeGreaterThanOrEqual(60);
    const styles = new Set(LAYOUTS.map((l) => l.style));
    for (const s of ['raster', 'asymmetrisch', 'mosaik', 'diagonal', 'formen', 'polaroid', 'magazin', 'scrapbook']) expect(styles.has(s as never)).toBe(true);
    expect(new Set(LAYOUTS.map((l) => l.id)).size).toBe(LAYOUTS.length);
  });

  it('alle Felder liegen innerhalb der Leinwand', () => {
    for (const l of LAYOUTS) {
      const slots = computeSlots(l, { layoutId: l.id, gap: 0.02, margin: 0.02, radius: 0.01 }, 2400, 1800);
      expect(slots.length).toBe(l.count);
      for (const s of slots) {
        expect(s.width).toBeGreaterThan(0);
        expect(s.height).toBeGreaterThan(0);
        if (!s.rotation) {
          expect(s.x - s.width / 2).toBeGreaterThanOrEqual(-0.5);
          expect(s.y - s.height / 2).toBeGreaterThanOrEqual(-0.5);
          expect(s.x + s.width / 2).toBeLessThanOrEqual(2400.5);
          expect(s.y + s.height / 2).toBeLessThanOrEqual(1800.5);
        }
      }
    }
  });

  it('Rechteck-Raster ohne Abstand füllen die Fläche lückenlos', () => {
    for (const l of LAYOUTS.filter((x) => !x.scatter && x.cells.every((c) => c.r && !c.aspect && !c.shape))) {
      const slots = computeSlots(l, { layoutId: l.id, gap: 0, margin: 0, radius: 0 }, 1000, 1000);
      const area = slots.reduce((a, s) => a + s.width * s.height, 0);
      expect(area, l.id).toBeCloseTo(1_000_000, -3);
    }
  });

  it('Abstand verkleinert Felder, Außenrand bleibt frei', () => {
    const l = getLayout('l4-raster')!;
    const [a] = computeSlots(l, { layoutId: l.id, gap: 0.02, margin: 0.05, radius: 0 }, 1000, 1000);
    expect(a!.x - a!.width / 2).toBeCloseTo(50);
    expect(a!.width).toBeCloseTo((900 - 20) / 2);
  });

  it('wählt passende Standardraster', () => {
    expect(defaultLayoutFor(5).count).toBe(5);
    expect(defaultLayoutFor(40).count).toBe(12);
    expect(defaultLayoutFor(0).count).toBe(1);
  });
});
