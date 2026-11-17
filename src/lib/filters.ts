/**
 * Bildfilter als reine Pixelfunktionen.
 * Werden identisch für die Editor-Vorschau und den hochaufgelösten Export verwendet.
 */
import type { Adjustments } from '../types/doc';

export interface PixelData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

/** 4x5-Farbmatrix (Zeilen R,G,B,A; Spalten R,G,B,A,Offset) in 0..1-Einheiten. */
export type ColorMatrix = number[];

export const IDENTITY: ColorMatrix = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

export const DEFAULT_ADJUST: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  hue: 0,
  exposure: 0,
  fade: 0,
  grayscale: 0,
  sepia: 0,
  blur: 0,
  sharpen: 0,
  vignette: 0,
  rotate90: 0,
};

const COLOR_KEYS: (keyof Adjustments)[] = ['brightness', 'contrast', 'saturation', 'warmth', 'hue', 'exposure', 'fade', 'grayscale', 'sepia'];

export function isIdentity(a: Adjustments): boolean {
  return (
    COLOR_KEYS.every((k) => !a[k]) && !a.blur && !a.sharpen && !a.vignette
  );
}

/** Multipliziert zwei Farbmatrizen: Ergebnis = b ∘ a (erst a, dann b). */
export function multiply(a: ColorMatrix, b: ColorMatrix): ColorMatrix {
  const out = new Array<number>(20).fill(0);
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 5; c++) {
      let v = 0;
      for (let k = 0; k < 4; k++) v += b[r * 5 + k]! * a[k * 5 + c]!;
      if (c === 4) v += b[r * 5 + 4]!;
      out[r * 5 + c] = v;
    }
  }
  return out;
}

const LR = 0.2126,
  LG = 0.7152,
  LB = 0.0722;

function saturationMatrix(s: number): ColorMatrix {
  const sr = (1 - s) * LR,
    sg = (1 - s) * LG,
    sb = (1 - s) * LB;
  return [sr + s, sg, sb, 0, 0, sr, sg + s, sb, 0, 0, sr, sg, sb + s, 0, 0, 0, 0, 0, 1, 0];
}

function hueMatrix(deg: number): ColorMatrix {
  const r = (deg * Math.PI) / 180;
  const c = Math.cos(r),
    s = Math.sin(r);
  return [
    0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0, 0,
    0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0, 0,
    0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function lerpMatrix(a: ColorMatrix, b: ColorMatrix, t: number): ColorMatrix {
  return a.map((v, i) => v + (b[i]! - v) * t);
}

const SEPIA: ColorMatrix = [0.393, 0.769, 0.189, 0, 0, 0.349, 0.686, 0.168, 0, 0, 0.272, 0.534, 0.131, 0, 0, 0, 0, 0, 1, 0];
const GRAY: ColorMatrix = saturationMatrix(0);

/** Baut aus den Anpassungen eine einzige Farbmatrix. */
export function buildColorMatrix(a: Adjustments): ColorMatrix {
  let m = IDENTITY.slice();
  if (a.exposure) {
    const f = Math.pow(2, a.exposure / 100);
    m = multiply(m, [f, 0, 0, 0, 0, 0, f, 0, 0, 0, 0, 0, f, 0, 0, 0, 0, 0, 1, 0]);
  }
  if (a.brightness) {
    const o = (a.brightness / 100) * 0.35;
    m = multiply(m, [1, 0, 0, 0, o, 0, 1, 0, 0, o, 0, 0, 1, 0, o, 0, 0, 0, 1, 0]);
  }
  if (a.contrast) {
    const f = a.contrast >= 0 ? 1 + (a.contrast / 100) * 1.2 : 1 + (a.contrast / 100) * 0.85;
    const o = 0.5 * (1 - f);
    m = multiply(m, [f, 0, 0, 0, o, 0, f, 0, 0, o, 0, 0, f, 0, o, 0, 0, 0, 1, 0]);
  }
  if (a.saturation) {
    const s = a.saturation >= 0 ? 1 + (a.saturation / 100) * 1.2 : 1 + a.saturation / 100;
    m = multiply(m, saturationMatrix(s));
  }
  if (a.warmth) {
    const w = a.warmth / 100;
    m = multiply(m, [1 + w * 0.18, 0, 0, 0, w * 0.02, 0, 1 + w * 0.04, 0, 0, 0, 0, 0, 1 - w * 0.2, 0, -w * 0.02, 0, 0, 0, 1, 0]);
  }
  if (a.hue) m = multiply(m, hueMatrix(a.hue));
  if (a.sepia) m = multiply(m, lerpMatrix(IDENTITY, SEPIA, a.sepia / 100));
  if (a.grayscale) m = multiply(m, lerpMatrix(IDENTITY, GRAY, a.grayscale / 100));
  if (a.fade) {
    const f = a.fade / 100;
    const k = 1 - f * 0.28;
    const o = f * 0.16;
    m = multiply(m, [k, 0, 0, 0, o, 0, k, 0, 0, o, 0, 0, k, 0, o, 0, 0, 0, 1, 0]);
  }
  return m;
}

export function applyColorMatrix(img: PixelData, m: ColorMatrix): void {
  const d = img.data;
  const [m0, m1, m2, , m4, m5, m6, m7, , m9, m10, m11, m12, , m14] = m as [
    number, number, number, number, number, number, number, number, number, number, number, number, number, number, number,
  ];
  const o0 = m4 * 255,
    o1 = m9 * 255,
    o2 = m14 * 255;
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i]!,
      g = d[i + 1]!,
      b = d[i + 2]!;
    d[i] = m0 * r + m1 * g + m2 * b + o0;
    d[i + 1] = m5 * r + m6 * g + m7 * b + o1;
    d[i + 2] = m10 * r + m11 * g + m12 * b + o2;
  }
}

/** Separierbarer Box-Blur (ein Durchgang) auf allen vier Kanälen. */
function boxBlurPass(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number, horizontal: boolean) {
  const len = horizontal ? w : h;
  const lines = horizontal ? h : w;
  const stride = horizontal ? 4 : w * 4;
  const lineStride = horizontal ? w * 4 : 4;
  const div = 2 * r + 1;
  for (let line = 0; line < lines; line++) {
    const base = line * lineStride;
    for (let ch = 0; ch < 4; ch++) {
      let acc = 0;
      for (let k = -r; k <= r; k++) {
        const idx = Math.min(len - 1, Math.max(0, k));
        acc += src[base + idx * stride + ch]!;
      }
      for (let i = 0; i < len; i++) {
        dst[base + i * stride + ch] = acc / div;
        const outIdx = Math.max(0, i - r);
        const inIdx = Math.min(len - 1, i + r + 1);
        acc += src[base + inIdx * stride + ch]! - src[base + outIdx * stride + ch]!;
      }
    }
  }
}

/** Annähernd gaußscher Weichzeichner (3 Box-Durchgänge). */
export function blur(img: PixelData, radius: number): void {
  const r = Math.max(0, Math.round(radius));
  if (r < 1) return;
  const { width: w, height: h } = img;
  const tmp = new Uint8ClampedArray(img.data.length);
  const rr = Math.max(1, Math.round(r / Math.sqrt(3)));
  for (let pass = 0; pass < 3; pass++) {
    boxBlurPass(img.data, tmp, w, h, rr, true);
    boxBlurPass(tmp, img.data, w, h, rr, false);
  }
}

/** Unscharf maskieren. amount 0..1 */
export function sharpen(img: PixelData, amount: number): void {
  if (amount <= 0) return;
  const copy: PixelData = { data: new Uint8ClampedArray(img.data), width: img.width, height: img.height };
  blur(copy, Math.max(1, Math.round(Math.min(img.width, img.height) / 800)));
  const d = img.data;
  const b = copy.data;
  const k = amount * 1.6;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = d[i]! + (d[i]! - b[i]!) * k;
    d[i + 1] = d[i + 1]! + (d[i + 1]! - b[i + 1]!) * k;
    d[i + 2] = d[i + 2]! + (d[i + 2]! - b[i + 2]!) * k;
  }
}

/** Vignette: dunkelt Ränder ab. amount 0..1 */
export function vignette(img: PixelData, amount: number): void {
  if (amount <= 0) return;
  const { width: w, height: h, data: d } = img;
  const cx = w / 2,
    cy = h / 2;
  const maxD = Math.hypot(cx, cy);
  for (let y = 0; y < h; y++) {
    const dy = (y - cy) / maxD;
    for (let x = 0; x < w; x++) {
      const dx = (x - cx) / maxD;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const t = Math.max(0, Math.min(1, (dist - 0.45) / 0.55));
      const f = 1 - amount * 0.85 * t * t * (3 - 2 * t);
      const i = (y * w + x) * 4;
      d[i] = d[i]! * f;
      d[i + 1] = d[i + 1]! * f;
      d[i + 2] = d[i + 2]! * f;
    }
  }
}

/** Wendet alle Pixel-Anpassungen in der richtigen Reihenfolge an. */
export function applyAdjustments(img: PixelData, a: Adjustments): void {
  const minSide = Math.min(img.width, img.height);
  if (COLOR_KEYS.some((k) => a[k])) applyColorMatrix(img, buildColorMatrix(a));
  if (a.blur > 0) blur(img, (a.blur / 100) * minSide * 0.03);
  if (a.sharpen > 0) sharpen(img, a.sharpen / 100);
  if (a.vignette > 0) vignette(img, a.vignette / 100);
}

export interface FilterPreset {
  id: string;
  name: string;
  adjust: Partial<Adjustments>;
}

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'original', name: 'Original', adjust: {} },
  { id: 'hell', name: 'Hell', adjust: { exposure: 18, contrast: -6, saturation: 6 } },
  { id: 'lebendig', name: 'Lebendig', adjust: { saturation: 38, contrast: 14 } },
  { id: 'warm', name: 'Warm', adjust: { warmth: 42, saturation: 8, brightness: 4 } },
  { id: 'kuehl', name: 'Kühl', adjust: { warmth: -40, saturation: -4, brightness: 2 } },
  { id: 'sonnig', name: 'Sonnig', adjust: { warmth: 30, exposure: 12, saturation: 16, vignette: 18 } },
  { id: 'pastell', name: 'Pastell', adjust: { fade: 45, saturation: -18, brightness: 10, contrast: -18 } },
  { id: 'matt', name: 'Matt', adjust: { fade: 60, contrast: -10, saturation: -10 } },
  { id: 'vintage', name: 'Vintage', adjust: { sepia: 35, fade: 35, contrast: -6, vignette: 35, warmth: 18 } },
  { id: 'retro', name: 'Retro', adjust: { hue: -8, saturation: -18, warmth: 26, fade: 28, contrast: 10 } },
  { id: 'film', name: 'Film', adjust: { contrast: 18, saturation: -16, fade: 22, warmth: 8, vignette: 22 } },
  { id: 'sepia', name: 'Sepia', adjust: { sepia: 85, contrast: 6 } },
  { id: 'sw', name: 'Schwarzweiß', adjust: { grayscale: 100, contrast: 12 } },
  { id: 'noir', name: 'Noir', adjust: { grayscale: 100, contrast: 45, exposure: -8, vignette: 40 } },
  { id: 'silber', name: 'Silber', adjust: { grayscale: 100, fade: 35, brightness: 6 } },
  { id: 'rosa', name: 'Rosé', adjust: { hue: -10, warmth: 12, fade: 25, saturation: -6, brightness: 6 } },
  { id: 'mint', name: 'Mint', adjust: { hue: 12, warmth: -18, fade: 20, brightness: 6 } },
  { id: 'dramatisch', name: 'Dramatisch', adjust: { contrast: 40, saturation: -8, vignette: 45, exposure: -6 } },
  { id: 'traum', name: 'Traum', adjust: { blur: 6, brightness: 12, fade: 30, saturation: -6 } },
  { id: 'scharf', name: 'Klar', adjust: { sharpen: 55, contrast: 10, saturation: 8 } },
];

export function presetAdjust(presetId: string, base: Adjustments): Adjustments {
  const p = FILTER_PRESETS.find((f) => f.id === presetId);
  return { ...DEFAULT_ADJUST, rotate90: base.rotate90, ...(p?.adjust ?? {}), preset: presetId };
}
