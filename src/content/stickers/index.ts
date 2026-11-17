/** Sticker-Registry. Erweiterbar: neue Sets einfach in STICKERS aufnehmen. */
import { SET_A } from './setA';
import { SET_B } from './setB';
import { SET_C } from './setC';
import type { StickerCategory, StickerDef } from './helpers';

export type { StickerCategory, StickerDef } from './helpers';

export const STICKER_CATEGORIES: { id: StickerCategory; name: string }[] = [
  { id: 'herzen', name: 'Herzen & Liebe' },
  { id: 'blumen', name: 'Blumen & Blätter' },
  { id: 'sterne', name: 'Sterne & Glitzer' },
  { id: 'schleifen', name: 'Schleifen & Bänder' },
  { id: 'party', name: 'Ballons & Geburtstag' },
  { id: 'tiere', name: 'Tiere' },
  { id: 'weihnachten', name: 'Weihnachten' },
  { id: 'ostern', name: 'Ostern' },
  { id: 'herbst', name: 'Herbst, Winter & Halloween' },
  { id: 'sprechblasen', name: 'Sprechblasen' },
  { id: 'pfeile', name: 'Pfeile & Symbole' },
  { id: 'linien', name: 'Dekorative Linien' },
  { id: 'washi', name: 'Washi-Tape' },
  { id: 'papier', name: 'Papierstücke' },
  { id: 'scrapbook', name: 'Scrapbook' },
  { id: 'stempel', name: 'Stempel' },
  { id: 'kronen', name: 'Kronen' },
  { id: 'ornamente', name: 'Rahmenornamente' },
  { id: 'niedlich', name: 'Niedliche Illustrationen' },
];

export const STICKERS: StickerDef[] = [...SET_A, ...SET_B, ...SET_C];

const byId = new Map(STICKERS.map((s) => [s.id, s]));

export function getStickerDef(id: string): StickerDef | undefined {
  return byId.get(id);
}

/** Vollständiges SVG-Dokument eines Stickers mit optionalen Farbüberschreibungen. */
export function stickerSvg(def: StickerDef, colors?: string[], longSide = 1024): string {
  const c = def.colors.map((d, i) => colors?.[i] || d);
  const s = longSide / Math.max(def.w, def.h);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${def.w} ${def.h}" width="${Math.round(def.w * s)}" height="${Math.round(def.h * s)}">${def.draw(c)}</svg>`;
}

const thumbCache = new Map<string, string>();
/** Data-URL für Vorschaubilder in Listen. */
export function stickerThumb(id: string, colors?: string[]): string {
  const key = id + (colors?.join(',') ?? '');
  let v = thumbCache.get(key);
  if (!v) {
    const def = byId.get(id);
    v = def ? 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(stickerSvg(def, colors, 160)) : '';
    thumbCache.set(key, v);
  }
  return v;
}

export function searchStickers(q: string): StickerDef[] {
  const t = q.trim().toLowerCase();
  if (!t) return STICKERS;
  const catNames = new Map(STICKER_CATEGORIES.map((c) => [c.id, c.name.toLowerCase()]));
  return STICKERS.filter((s) => `${s.name} ${s.tags ?? ''} ${catNames.get(s.cat)}`.toLowerCase().includes(t));
}
