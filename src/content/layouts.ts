/**
 * Collage-Raster. Zellen sind normalisiert (0..1) relativ zur Innenfläche (Leinwand minus Außenrand),
 * bei "scatter"-Layouts relativ zur gesamten Leinwand.
 */
import type { FrameKind, MaskShape } from '../types/doc';

export type LayoutStyle = 'raster' | 'asymmetrisch' | 'mosaik' | 'diagonal' | 'formen' | 'polaroid' | 'magazin' | 'scrapbook';

export interface LayoutCell {
  r?: [number, number, number, number];
  poly?: [number, number][];
  shape?: MaskShape;
  rot?: number;
  /** Seitenverhältnis (w/h) in Pixeln, wird in r eingepasst */
  aspect?: number;
  frame?: FrameKind;
}

export interface CollageLayout {
  id: string;
  name: string;
  count: number;
  style: LayoutStyle;
  scatter?: boolean;
  cells: LayoutCell[];
}

export const LAYOUT_STYLE_NAMES: Record<LayoutStyle, string> = {
  raster: 'Raster',
  asymmetrisch: 'Asymmetrisch',
  mosaik: 'Mosaik',
  diagonal: 'Diagonal',
  formen: 'Formen',
  polaroid: 'Polaroid',
  magazin: 'Magazin',
  scrapbook: 'Scrapbook',
};

/** Zeilen mit jeweils `counts[i]` gleich breiten Zellen. */
function rows(counts: number[], weights?: number[]): LayoutCell[] {
  const ws = weights ?? counts.map(() => 1);
  const total = ws.reduce((a, b) => a + b, 0);
  const cells: LayoutCell[] = [];
  let y = 0;
  counts.forEach((n, i) => {
    const h = ws[i]! / total;
    for (let c = 0; c < n; c++) cells.push({ r: [c / n, y, 1 / n, h] });
    y += h;
  });
  return cells;
}

/** Spalten mit jeweils `counts[i]` gleich hohen Zellen. */
function cols(counts: number[], weights?: number[]): LayoutCell[] {
  return rows(counts, weights).map((c) => {
    const [x, y, w, h] = c.r!;
    return { r: [y, x, h, w] as [number, number, number, number] };
  });
}

function grid(rCount: number, cCount: number): LayoutCell[] {
  return rows(new Array(rCount).fill(cCount));
}

let autoId = 0;
function L(name: string, style: LayoutStyle, cells: LayoutCell[], extra: Partial<CollageLayout> = {}): CollageLayout {
  autoId++;
  return { id: extra.id ?? `l${cells.length}-${style}-${autoId}`, name, count: cells.length, style, cells, ...extra };
}

const pol = (x: number, y: number, w: number, h: number, rot: number): LayoutCell => ({
  r: [x, y, w, h],
  rot,
  aspect: 0.84,
  frame: 'polaroid',
});
const tape = (x: number, y: number, w: number, h: number, rot: number, aspect = 1.25): LayoutCell => ({
  r: [x, y, w, h],
  rot,
  aspect,
  frame: 'tape',
});

export const LAYOUTS: CollageLayout[] = [
  // ---------- 1 Foto ----------
  L('Vollbild', 'raster', [{ r: [0, 0, 1, 1] }], { id: 'l1-voll' }),
  L('Kreis', 'formen', [{ r: [0.08, 0.08, 0.84, 0.84], shape: 'circle', aspect: 1 }], { id: 'l1-kreis' }),
  L('Herz', 'formen', [{ r: [0.06, 0.08, 0.88, 0.84], shape: 'heart', aspect: 1.05 }], { id: 'l1-herz' }),
  L('Bogen', 'formen', [{ r: [0.14, 0.05, 0.72, 0.9], shape: 'arch', aspect: 0.78 }], { id: 'l1-bogen' }),
  L('Stern', 'formen', [{ r: [0.06, 0.06, 0.88, 0.88], shape: 'star', aspect: 1 }], { id: 'l1-stern' }),
  L('Polaroid', 'polaroid', [pol(0.13, 0.08, 0.74, 0.84, -3)], { id: 'l1-polaroid', scatter: true }),

  // ---------- 2 Fotos ----------
  L('Nebeneinander', 'raster', cols([1, 1]), { id: 'l2-spalten' }),
  L('Übereinander', 'raster', rows([1, 1]), { id: 'l2-zeilen' }),
  L('Zwei Drittel', 'asymmetrisch', cols([1, 1], [2, 1]), { id: 'l2-asym' }),
  L('Oben groß', 'asymmetrisch', rows([1, 1], [2, 1]), { id: 'l2-asym-h' }),
  L(
    'Diagonal',
    'diagonal',
    [
      { poly: [[0, 0], [0.64, 0], [0.36, 1], [0, 1]] },
      { poly: [[0.64, 0], [1, 0], [1, 1], [0.36, 1]] },
    ],
    { id: 'l2-diagonal' },
  ),
  L(
    'Schräg',
    'diagonal',
    [
      { poly: [[0, 0], [1, 0], [1, 0.38], [0, 0.62]] },
      { poly: [[0, 0.62], [1, 0.38], [1, 1], [0, 1]] },
    ],
    { id: 'l2-schraeg' },
  ),
  L(
    'Zwei Kreise',
    'formen',
    [
      { r: [0, 0.1, 0.5, 0.8], shape: 'circle', aspect: 1 },
      { r: [0.5, 0.1, 0.5, 0.8], shape: 'circle', aspect: 1 },
    ],
    { id: 'l2-kreise' },
  ),
  L(
    'Zwei Herzen',
    'formen',
    [
      { r: [0, 0.12, 0.5, 0.76], shape: 'heart', aspect: 1.05 },
      { r: [0.5, 0.12, 0.5, 0.76], shape: 'heart', aspect: 1.05 },
    ],
    { id: 'l2-herzen' },
  ),
  L('Vorher / Nachher', 'magazin', cols([1, 1]).map((c) => ({ ...c, shape: 'rect' as MaskShape })), { id: 'l2-vorher-nachher' }),
  L('Polaroid-Paar', 'polaroid', [pol(0.04, 0.14, 0.5, 0.66, -6), pol(0.46, 0.2, 0.5, 0.66, 5)], { id: 'l2-polaroid', scatter: true }),

  // ---------- 3 Fotos ----------
  L('Drei Spalten', 'raster', cols([1, 1, 1]), { id: 'l3-spalten' }),
  L('Drei Zeilen', 'raster', rows([1, 1, 1]), { id: 'l3-zeilen' }),
  L('Links groß', 'asymmetrisch', cols([1, 2]), { id: 'l3-links' }),
  L('Oben groß', 'asymmetrisch', rows([1, 2]), { id: 'l3-oben' }),
  L('Rechts groß', 'asymmetrisch', cols([2, 1]), { id: 'l3-rechts' }),
  L('Unten groß', 'asymmetrisch', rows([2, 1]), { id: 'l3-unten' }),
  L('Mitte breit', 'magazin', cols([1, 1, 1], [1, 2, 1]), { id: 'l3-mitte' }),
  L(
    'Magazin',
    'magazin',
    [{ r: [0, 0, 0.64, 1] }, { r: [0.64, 0, 0.36, 0.42] }, { r: [0.64, 0.42, 0.36, 0.58] }],
    { id: 'l3-magazin' },
  ),
  L(
    'Diagonale Streifen',
    'diagonal',
    [
      { poly: [[0, 0], [0.42, 0], [0.24, 1], [0, 1]] },
      { poly: [[0.42, 0], [0.76, 0], [0.58, 1], [0.24, 1]] },
      { poly: [[0.76, 0], [1, 0], [1, 1], [0.58, 1]] },
    ],
    { id: 'l3-diagonal' },
  ),
  L(
    'Keil',
    'diagonal',
    [
      { poly: [[0, 0], [1, 0], [0.5, 0.55]] },
      { poly: [[0, 0], [0.5, 0.55], [0.5, 1], [0, 1]] },
      { poly: [[1, 0], [1, 1], [0.5, 1], [0.5, 0.55]] },
    ],
    { id: 'l3-keil' },
  ),
  L(
    'Drei Kreise',
    'formen',
    [
      { r: [0.18, 0, 0.64, 0.6], shape: 'circle', aspect: 1 },
      { r: [0, 0.56, 0.48, 0.44], shape: 'circle', aspect: 1 },
      { r: [0.52, 0.56, 0.48, 0.44], shape: 'circle', aspect: 1 },
    ],
    { id: 'l3-kreise' },
  ),
  L(
    'Bögen',
    'formen',
    cols([1, 1, 1]).map((c) => ({ ...c, shape: 'arch' as MaskShape })),
    { id: 'l3-boegen' },
  ),
  L('Polaroid-Trio', 'polaroid', [pol(0.03, 0.06, 0.46, 0.5, -7), pol(0.5, 0.1, 0.46, 0.5, 6), pol(0.24, 0.46, 0.5, 0.52, -2)], {
    id: 'l3-polaroid',
    scatter: true,
  }),
  L('Tape-Collage', 'scrapbook', [tape(0.05, 0.05, 0.62, 0.45, -4), tape(0.42, 0.33, 0.54, 0.38, 5), tape(0.08, 0.6, 0.55, 0.36, -2)], {
    id: 'l3-tape',
    scatter: true,
  }),

  // ---------- 4 Fotos ----------
  L('Raster 2×2', 'raster', grid(2, 2), { id: 'l4-raster' }),
  L('Vier Spalten', 'raster', cols([1, 1, 1, 1]), { id: 'l4-spalten' }),
  L('Vier Zeilen', 'raster', rows([1, 1, 1, 1]), { id: 'l4-zeilen' }),
  L('Oben groß', 'asymmetrisch', rows([1, 3], [2, 1]), { id: 'l4-oben' }),
  L('Links groß', 'asymmetrisch', cols([1, 3], [2, 1]), { id: 'l4-links' }),
  L('Unten groß', 'asymmetrisch', rows([3, 1], [1, 2]), { id: 'l4-unten' }),
  L(
    'Mosaik',
    'mosaik',
    [{ r: [0, 0, 0.6, 0.6] }, { r: [0.6, 0, 0.4, 0.6] }, { r: [0, 0.6, 0.4, 0.4] }, { r: [0.4, 0.6, 0.6, 0.4] }],
    { id: 'l4-mosaik' },
  ),
  L(
    'Magazin',
    'magazin',
    [{ r: [0, 0, 1, 0.6] }, { r: [0, 0.6, 0.4, 0.4] }, { r: [0.4, 0.6, 0.3, 0.4] }, { r: [0.7, 0.6, 0.3, 0.4] }],
    { id: 'l4-magazin' },
  ),
  L(
    'Diagonales Kreuz',
    'diagonal',
    [
      { poly: [[0, 0], [1, 0], [0.5, 0.5]] },
      { poly: [[1, 0], [1, 1], [0.5, 0.5]] },
      { poly: [[1, 1], [0, 1], [0.5, 0.5]] },
      { poly: [[0, 1], [0, 0], [0.5, 0.5]] },
    ],
    { id: 'l4-kreuz' },
  ),
  L(
    'Rauten',
    'diagonal',
    [
      { poly: [[0, 0], [0.6, 0], [0.4, 0.5], [0, 0.5]] },
      { poly: [[0.6, 0], [1, 0], [1, 0.5], [0.4, 0.5]] },
      { poly: [[0, 0.5], [0.4, 0.5], [0.6, 1], [0, 1]] },
      { poly: [[0.4, 0.5], [1, 0.5], [1, 1], [0.6, 1]] },
    ],
    { id: 'l4-rauten' },
  ),
  L(
    'Vier Kreise',
    'formen',
    grid(2, 2).map((c) => ({ ...c, shape: 'circle' as MaskShape, aspect: 1 })),
    { id: 'l4-kreise' },
  ),
  L(
    'Herzen',
    'formen',
    grid(2, 2).map((c) => ({ ...c, shape: 'heart' as MaskShape, aspect: 1.05 })),
    { id: 'l4-herzen' },
  ),
  L(
    'Polaroid-Wand',
    'polaroid',
    [pol(0.02, 0.03, 0.47, 0.5, -5), pol(0.51, 0.04, 0.47, 0.5, 4), pol(0.03, 0.48, 0.47, 0.5, 3), pol(0.5, 0.47, 0.47, 0.5, -4)],
    { id: 'l4-polaroid', scatter: true },
  ),
  L(
    'Scrapbook',
    'scrapbook',
    [tape(0.04, 0.04, 0.55, 0.4, -3), tape(0.5, 0.08, 0.46, 0.34, 4, 0.9), tape(0.06, 0.5, 0.42, 0.44, 3, 0.85), tape(0.44, 0.52, 0.52, 0.38, -4)],
    { id: 'l4-scrapbook', scatter: true },
  ),

  // ---------- 5 Fotos ----------
  L('Zwei + Drei', 'raster', rows([2, 3]), { id: 'l5-23' }),
  L('Drei + Zwei', 'raster', rows([3, 2]), { id: 'l5-32' }),
  L('Spalten 2 + 3', 'asymmetrisch', cols([2, 3]), { id: 'l5-c23' }),
  L(
    'Windrad',
    'mosaik',
    [
      { r: [0, 0, 0.66, 0.33] },
      { r: [0.66, 0, 0.34, 0.66] },
      { r: [0.34, 0.33, 0.32, 0.33] },
      { r: [0, 0.33, 0.34, 0.67] },
      { r: [0.34, 0.66, 0.66, 0.34] },
    ],
    { id: 'l5-windrad' },
  ),
  L(
    'Groß + Spalte',
    'magazin',
    [{ r: [0, 0, 0.62, 1] }, { r: [0.62, 0, 0.38, 0.25] }, { r: [0.62, 0.25, 0.38, 0.25] }, { r: [0.62, 0.5, 0.38, 0.25] }, { r: [0.62, 0.75, 0.38, 0.25] }],
    { id: 'l5-spalte' },
  ),
  L(
    'Mitte groß',
    'mosaik',
    [{ r: [0, 0, 0.5, 0.3] }, { r: [0.5, 0, 0.5, 0.3] }, { r: [0, 0.3, 1, 0.4] }, { r: [0, 0.7, 0.5, 0.3] }, { r: [0.5, 0.7, 0.5, 0.3] }],
    { id: 'l5-mitte' },
  ),
  L(
    'Kreis-Blume',
    'formen',
    [
      { r: [0.3, 0.3, 0.4, 0.4], shape: 'circle', aspect: 1 },
      { r: [0.02, 0.02, 0.34, 0.34], shape: 'circle', aspect: 1 },
      { r: [0.64, 0.02, 0.34, 0.34], shape: 'circle', aspect: 1 },
      { r: [0.02, 0.64, 0.34, 0.34], shape: 'circle', aspect: 1 },
      { r: [0.64, 0.64, 0.34, 0.34], shape: 'circle', aspect: 1 },
    ],
    { id: 'l5-kreise' },
  ),
  L(
    'Polaroid-Fächer',
    'polaroid',
    [
      pol(0.02, 0.05, 0.4, 0.44, -8),
      pol(0.31, 0.02, 0.4, 0.44, 2),
      pol(0.58, 0.06, 0.4, 0.44, 9),
      pol(0.12, 0.5, 0.4, 0.46, 5),
      pol(0.5, 0.5, 0.4, 0.46, -6),
    ],
    { id: 'l5-polaroid', scatter: true },
  ),

  // ---------- 6 Fotos ----------
  L('Raster 2×3', 'raster', grid(3, 2), { id: 'l6-raster' }),
  L('Raster 3×2', 'raster', grid(2, 3), { id: 'l6-raster-q' }),
  L('Treppe', 'asymmetrisch', rows([1, 2, 3]), { id: 'l6-treppe' }),
  L(
    'Mosaik',
    'mosaik',
    [
      { r: [0, 0, 0.66, 0.66] },
      { r: [0.66, 0, 0.34, 0.33] },
      { r: [0.66, 0.33, 0.34, 0.33] },
      { r: [0, 0.66, 0.33, 0.34] },
      { r: [0.33, 0.66, 0.33, 0.34] },
      { r: [0.66, 0.66, 0.34, 0.34] },
    ],
    { id: 'l6-mosaik' },
  ),
  L(
    'Magazin',
    'magazin',
    [
      { r: [0, 0, 0.5, 0.5] },
      { r: [0.5, 0, 0.5, 0.25] },
      { r: [0.5, 0.25, 0.25, 0.25] },
      { r: [0.75, 0.25, 0.25, 0.25] },
      { r: [0, 0.5, 0.35, 0.5] },
      { r: [0.35, 0.5, 0.65, 0.5] },
    ],
    { id: 'l6-magazin' },
  ),
  L('Sechs Kreise', 'formen', grid(3, 2).map((c) => ({ ...c, shape: 'circle' as MaskShape, aspect: 1 })), { id: 'l6-kreise' }),
  L(
    'Polaroid-Sammlung',
    'polaroid',
    [
      pol(0.02, 0.02, 0.34, 0.36, -5),
      pol(0.34, 0.03, 0.34, 0.36, 3),
      pol(0.65, 0.02, 0.33, 0.36, -3),
      pol(0.03, 0.42, 0.34, 0.36, 4),
      pol(0.35, 0.44, 0.34, 0.36, -4),
      pol(0.65, 0.43, 0.33, 0.36, 6),
    ],
    { id: 'l6-polaroid', scatter: true },
  ),

  // ---------- 7 Fotos ----------
  L('3 + 1 + 3', 'mosaik', rows([3, 1, 3], [1, 1.4, 1]), { id: 'l7-313' }),
  L('2 + 3 + 2', 'raster', rows([2, 3, 2]), { id: 'l7-232' }),
  L(
    'Mitte groß',
    'magazin',
    [
      { r: [0, 0, 0.25, 0.5] },
      { r: [0, 0.5, 0.25, 0.5] },
      { r: [0.25, 0, 0.5, 0.7] },
      { r: [0.25, 0.7, 0.25, 0.3] },
      { r: [0.5, 0.7, 0.25, 0.3] },
      { r: [0.75, 0, 0.25, 0.5] },
      { r: [0.75, 0.5, 0.25, 0.5] },
    ],
    { id: 'l7-magazin' },
  ),

  // ---------- 8 Fotos ----------
  L('Raster 2×4', 'raster', grid(4, 2), { id: 'l8-raster' }),
  L('Raster 4×2', 'raster', grid(2, 4), { id: 'l8-raster-q' }),
  L('3 + 2 + 3', 'mosaik', rows([3, 2, 3]), { id: 'l8-323' }),
  L(
    'Großes Mosaik',
    'mosaik',
    [
      { r: [0, 0, 0.5, 0.5] },
      { r: [0.5, 0, 0.25, 0.25] },
      { r: [0.75, 0, 0.25, 0.25] },
      { r: [0.5, 0.25, 0.5, 0.25] },
      { r: [0, 0.5, 0.25, 0.5] },
      { r: [0.25, 0.5, 0.25, 0.5] },
      { r: [0.5, 0.5, 0.5, 0.25] },
      { r: [0.5, 0.75, 0.5, 0.25] },
    ],
    { id: 'l8-mosaik' },
  ),

  // ---------- 9 Fotos ----------
  L('Raster 3×3', 'raster', grid(3, 3), { id: 'l9-raster' }),
  L('4 + 1 + 4', 'mosaik', rows([4, 1, 4], [1, 1.6, 1]), { id: 'l9-414' }),
  L(
    'Mitte groß',
    'mosaik',
    [
      { r: [0, 0, 0.25, 0.25] },
      { r: [0.25, 0, 0.5, 0.25] },
      { r: [0.75, 0, 0.25, 0.25] },
      { r: [0, 0.25, 0.25, 0.5] },
      { r: [0.25, 0.25, 0.5, 0.5] },
      { r: [0.75, 0.25, 0.25, 0.5] },
      { r: [0, 0.75, 0.25, 0.25] },
      { r: [0.25, 0.75, 0.5, 0.25] },
      { r: [0.75, 0.75, 0.25, 0.25] },
    ],
    { id: 'l9-mitte' },
  ),

  // ---------- 10 Fotos ----------
  L('3 + 4 + 3', 'raster', rows([3, 4, 3]), { id: 'l10-343' }),
  L('2 + 3 + 3 + 2', 'mosaik', rows([2, 3, 3, 2]), { id: 'l10-2332' }),
  L('Raster 5×2', 'raster', grid(5, 2), { id: 'l10-raster' }),

  // ---------- 11 Fotos ----------
  L('4 + 3 + 4', 'raster', rows([4, 3, 4]), { id: 'l11-434' }),
  L('3 + 2 + 3 + 3', 'mosaik', rows([3, 2, 3, 3]), { id: 'l11-3233' }),

  // ---------- 12 Fotos ----------
  L('Raster 3×4', 'raster', grid(4, 3), { id: 'l12-raster' }),
  L('Raster 4×3', 'raster', grid(3, 4), { id: 'l12-raster-q' }),
  L('Raster 6×2', 'raster', grid(6, 2), { id: 'l12-raster-6' }),
  L(
    'Mosaik',
    'mosaik',
    [
      { r: [0, 0, 0.5, 0.5] },
      ...[0.5, 0.75].flatMap((x) => [0, 0.25].map((y) => ({ r: [x, y, 0.25, 0.25] as [number, number, number, number] }))),
      ...[0, 0.25, 0.5, 0.75].map((x) => ({ r: [x, 0.5, 0.25, 0.25] as [number, number, number, number] })),
      ...[0, 0.25, 0.5].map((x, i) => ({ r: [x, 0.75, i === 2 ? 0.5 : 0.25, 0.25] as [number, number, number, number] })),
    ],
    { id: 'l12-mosaik' },
  ),
];

const byId = new Map(LAYOUTS.map((l) => [l.id, l]));

export function getLayout(id: string): CollageLayout | undefined {
  return byId.get(id);
}

/** Wählt ein passendes Standard-Raster für eine Fotoanzahl. */
export function defaultLayoutFor(count: number): CollageLayout {
  const n = Math.max(1, Math.min(12, count));
  return LAYOUTS.find((l) => l.count === n && (l.style === 'raster' || l.style === 'mosaik' || l.style === 'asymmetrisch')) ?? LAYOUTS.find((l) => l.count === n)!;
}
