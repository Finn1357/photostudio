import { describe, expect, it } from 'vitest';
import { applyAdjustments, buildColorMatrix, DEFAULT_ADJUST, FILTER_PRESETS, IDENTITY, isIdentity, presetAdjust, type PixelData } from './filters';

function img(w: number, h: number, rgb: [number, number, number]): PixelData {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < data.length; i += 4) {
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = 255;
  }
  return { data, width: w, height: h };
}

describe('Filter', () => {
  it('Standardwerte sind neutral', () => {
    expect(isIdentity(DEFAULT_ADJUST)).toBe(true);
    expect(buildColorMatrix(DEFAULT_ADJUST)).toEqual(IDENTITY);
    const p = img(4, 4, [120, 80, 40]);
    applyAdjustments(p, DEFAULT_ADJUST);
    expect([...p.data.slice(0, 4)]).toEqual([120, 80, 40, 255]);
  });

  it('Helligkeit hellt auf, Schwarzweiß entsättigt', () => {
    const p = img(2, 2, [100, 100, 100]);
    applyAdjustments(p, { ...DEFAULT_ADJUST, brightness: 50 });
    expect(p.data[0]).toBeGreaterThan(100);
    const q = img(2, 2, [200, 50, 50]);
    applyAdjustments(q, { ...DEFAULT_ADJUST, grayscale: 100 });
    expect(Math.abs(q.data[0]! - q.data[1]!)).toBeLessThan(2);
    expect(Math.abs(q.data[1]! - q.data[2]!)).toBeLessThan(2);
  });

  it('Wärme verschiebt nach Rot/Gelb', () => {
    const p = img(2, 2, [128, 128, 128]);
    applyAdjustments(p, { ...DEFAULT_ADJUST, warmth: 80 });
    expect(p.data[0]!).toBeGreaterThan(p.data[2]!);
  });

  it('Vignette dunkelt Ränder stärker ab als die Mitte', () => {
    const p = img(41, 41, [200, 200, 200]);
    applyAdjustments(p, { ...DEFAULT_ADJUST, vignette: 100 });
    const center = p.data[(20 * 41 + 20) * 4]!;
    const corner = p.data[0]!;
    expect(corner).toBeLessThan(center);
  });

  it('Weichzeichnen glättet harte Kanten', () => {
    const p = img(200, 200, [0, 0, 0]);
    for (let y = 0; y < 200; y++) for (let x = 100; x < 200; x++) p.data[(y * 200 + x) * 4] = 255;
    applyAdjustments(p, { ...DEFAULT_ADJUST, blur: 100 });
    const row = 100 * 200 * 4;
    expect(p.data[row + 98 * 4]!).toBeGreaterThan(0);
    expect(p.data[row + 101 * 4]!).toBeLessThan(255);
  });

  it('Presets sind vollständig und setzen den Namen', () => {
    expect(FILTER_PRESETS.length).toBeGreaterThanOrEqual(12);
    const a = presetAdjust('vintage', { ...DEFAULT_ADJUST, rotate90: 1 });
    expect(a.preset).toBe('vintage');
    expect(a.rotate90).toBe(1);
    expect(a.sepia).toBeGreaterThan(0);
  });
});
