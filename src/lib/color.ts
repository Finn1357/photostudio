/** Farb-Hilfen. */

export function hexToRgb(hex: string): [number, number, number] {
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return [0, 0, 0];
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

export const lighten = (c: string, t: number) => mix(c, '#ffffff', t);
export const darken = (c: string, t: number) => mix(c, '#000000', t);

export function rgba(hex: string, a: number): string {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export const isLight = (hex: string) => luminance(hex) > 0.45;

/** Kuratierte Farbpalette für Farbwähler. */
export const PALETTE: string[] = [
  '#ffffff', '#f7f3ee', '#efe6da', '#d9c7b0', '#a68a6d', '#6b5443', '#3a2e27', '#000000',
  '#1f1f1f', '#4a4a4a', '#8a8a8a', '#c9c9c9',
  '#fde2e4', '#f9b9c6', '#f28aa5', '#e2546f', '#c2185b', '#8e1d3c',
  '#ffe5d0', '#ffc59e', '#ff9a7a', '#f2643d', '#d9480f',
  '#fff3c4', '#ffe08a', '#f7c948', '#e0a526', '#b7791f',
  '#e3f4dc', '#bfe3b4', '#8fcf8f', '#5aa469', '#2f7a4b', '#1d4d33', '#9caf88', '#6b7f5b',
  '#dff3f6', '#a8dfe8', '#6cc3d5', '#3a9fbf', '#1f6f99', '#183a63', '#0f2341',
  '#e8e3fb', '#c9bdf2', '#a08be3', '#7a5cc9', '#53389e',
  '#c9a24b', '#d4af37', '#b88a44', '#e6c27a', '#c0c0c0',
];
