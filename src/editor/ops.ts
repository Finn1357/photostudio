/**
 * Reine Dokument-Operationen. Jede Funktion gibt ein neues Dokument zurück (unveränderliche Updates),
 * damit Undo/Redo über einfache Schnappschüsse funktioniert.
 */
import type { CollageSettings, DesignDoc, DesignElement, PhotoElement } from '../types/doc';
import { getLayout, defaultLayoutFor } from '../content/layouts';
import { computeSlots } from './collage';
import { newPhoto, SOFT_SHADOW } from './factory';
import { uid, rng } from '../lib/util';

export const DEFAULT_COLLAGE: Omit<CollageSettings, 'layoutId'> = { gap: 0.014, margin: 0.014, radius: 0 };

type Patch<T> = Partial<T> | ((el: T) => T);

export function getElement(doc: DesignDoc, id: string | null | undefined): DesignElement | undefined {
  if (!id) return undefined;
  return doc.elements.find((e) => e.id === id);
}

export function updateElement<T extends DesignElement = DesignElement>(doc: DesignDoc, id: string, patch: Patch<T>): DesignDoc {
  let changed = false;
  const elements = doc.elements.map((e) => {
    if (e.id !== id) return e;
    changed = true;
    return typeof patch === 'function' ? (patch as (el: T) => T)(e as T) : ({ ...e, ...patch } as DesignElement);
  });
  return changed ? { ...doc, elements } : doc;
}

export function addElement(doc: DesignDoc, el: DesignElement, index?: number): DesignDoc {
  const elements = doc.elements.slice();
  if (index === undefined || index < 0 || index > elements.length) elements.push(el);
  else elements.splice(index, 0, el);
  return { ...doc, elements };
}

/** Entfernt ein Element. Collage-Felder werden nur geleert, damit das Raster erhalten bleibt. */
export function removeElement(doc: DesignDoc, id: string): DesignDoc {
  const el = getElement(doc, id);
  if (!el) return doc;
  if (el.type === 'photo' && el.slot !== undefined && doc.collage) {
    return updateElement<PhotoElement>(doc, id, { assetId: null, crop: { cx: 0.5, cy: 0.5, zoom: 1 }, mask: [] });
  }
  return { ...doc, elements: doc.elements.filter((e) => e.id !== id) };
}

export function cloneElement(el: DesignElement, offset = 0): DesignElement {
  const copy = JSON.parse(JSON.stringify(el)) as DesignElement;
  copy.id = uid(el.id.charAt(0));
  copy.x += offset;
  copy.y += offset;
  copy.locked = false;
  if (copy.type === 'photo') delete copy.slot;
  return copy;
}

export function duplicateElement(doc: DesignDoc, id: string): { doc: DesignDoc; id: string | null } {
  const idx = doc.elements.findIndex((e) => e.id === id);
  if (idx < 0) return { doc, id: null };
  const copy = cloneElement(doc.elements[idx]!, Math.min(doc.width, doc.height) * 0.03);
  return { doc: addElement(doc, copy, idx + 1), id: copy.id };
}

export function moveLayer(doc: DesignDoc, id: string, dir: 'up' | 'down' | 'top' | 'bottom'): DesignDoc {
  const idx = doc.elements.findIndex((e) => e.id === id);
  if (idx < 0) return doc;
  const elements = doc.elements.slice();
  const [el] = elements.splice(idx, 1);
  let to = idx;
  if (dir === 'up') to = Math.min(elements.length, idx + 1);
  if (dir === 'down') to = Math.max(0, idx - 1);
  if (dir === 'top') to = elements.length;
  if (dir === 'bottom') to = 0;
  elements.splice(to, 0, el!);
  return { ...doc, elements };
}

export function reorderLayer(doc: DesignDoc, id: string, toIndex: number): DesignDoc {
  const idx = doc.elements.findIndex((e) => e.id === id);
  if (idx < 0) return doc;
  const elements = doc.elements.slice();
  const [el] = elements.splice(idx, 1);
  elements.splice(Math.max(0, Math.min(elements.length, toIndex)), 0, el!);
  return { ...doc, elements };
}

export function slotPhotos(doc: DesignDoc): PhotoElement[] {
  return doc.elements
    .filter((e): e is PhotoElement => e.type === 'photo' && e.slot !== undefined)
    .sort((a, b) => a.slot! - b.slot!);
}

/** Überträgt die berechnete Raster-Geometrie auf alle Collage-Felder. */
export function relayout(doc: DesignDoc): DesignDoc {
  if (!doc.collage) return doc;
  const layout = getLayout(doc.collage.layoutId);
  if (!layout) return doc;
  const geoms = computeSlots(layout, doc.collage, doc.width, doc.height);
  const elements = doc.elements.map((e) => {
    if (e.type !== 'photo' || e.slot === undefined) return e;
    const g = geoms[e.slot];
    if (!g) return e;
    const next: PhotoElement = {
      ...e,
      x: g.x,
      y: g.y,
      width: g.width,
      height: g.height,
      rotation: g.rotation,
      cornerRadius: g.cornerRadius,
    };
    if (g.points) {
      next.shape = 'polygon';
      next.points = g.points;
    }
    return next;
  });
  return { ...doc, elements };
}

/** Wendet ein Raster an und übernimmt vorhandene Bilder in der bisherigen Reihenfolge. */
export function applyLayout(doc: DesignDoc, layoutId: string, settings?: Partial<CollageSettings>): DesignDoc {
  const layout = getLayout(layoutId);
  if (!layout) return doc;
  const collage: CollageSettings = { ...DEFAULT_COLLAGE, ...(doc.collage ?? {}), ...settings, layoutId };
  const old = slotPhotos(doc);
  const contents = [
    ...old.map((p) => ({ assetId: p.assetId, crop: p.crop, adjust: p.adjust, mask: p.mask })),
    ...doc.overflow.map((a) => ({ assetId: a as string | null, crop: { cx: 0.5, cy: 0.5, zoom: 1 }, adjust: undefined, mask: [] })),
  ].filter((c, i) => c.assetId || i < old.length);
  const filled = contents.filter((c) => c.assetId);
  const styleSrc = old.find((p) => p.frame.kind === 'none') ?? old[0];
  const geoms = computeSlots(layout, collage, doc.width, doc.height);
  const insertAt = Math.max(
    0,
    doc.elements.findIndex((e) => e.type === 'photo' && e.slot !== undefined),
  );
  const remaining = doc.elements.filter((e) => !(e.type === 'photo' && e.slot !== undefined));
  const newSlots: PhotoElement[] = geoms.map((g, i) => {
    const c = filled[i];
    const p = newPhoto({
      x: g.x,
      y: g.y,
      width: g.width,
      height: g.height,
      rotation: g.rotation,
      shape: g.shape,
      points: g.points,
      cornerRadius: g.cornerRadius,
      slot: i,
      placeholder: i % 6,
      assetId: c?.assetId ?? null,
      crop: c?.crop ?? { cx: 0.5, cy: 0.5, zoom: 1 },
      mask: c?.mask ?? [],
    });
    if (c?.adjust) p.adjust = c.adjust;
    if (g.frame) {
      p.frame = { kind: g.frame, color: '#ffffff', accent: '#f3d9a4', thickness: 0.5 };
      p.shadow = { ...SOFT_SHADOW };
    } else if (styleSrc && styleSrc.frame.kind === 'none') {
      p.border = { ...styleSrc.border };
      p.shadow = { ...styleSrc.shadow };
    }
    return p;
  });
  const overflow = filled.slice(geoms.length).map((c) => c.assetId!) as string[];
  const elements = remaining.slice();
  elements.splice(Math.min(insertAt, elements.length), 0, ...newSlots);
  return { ...doc, collage, elements, overflow };
}

export function setCollageSettings(doc: DesignDoc, patch: Partial<CollageSettings>): DesignDoc {
  if (!doc.collage) return doc;
  return relayout({ ...doc, collage: { ...doc.collage, ...patch } });
}

/** Freies Foto in sinnvoller Größe (Bildseitenverhältnis beibehalten). */
export function fitPhotoBox(imgW: number, imgH: number, W: number, H: number, frac = 0.55): { width: number; height: number } {
  const maxW = W * frac,
    maxH = H * frac;
  const s = Math.min(maxW / imgW, maxH / imgH);
  return { width: imgW * s, height: imgH * s };
}

export interface PlacedAsset {
  id: string;
  width: number;
  height: number;
}

/** Füllt leere Fotofelder (in Reihenfolge) und legt überzählige Bilder als freie Fotos an. */
export function placePhotos(doc: DesignDoc, assets: PlacedAsset[], seed = Date.now()): { doc: DesignDoc; ids: string[] } {
  let next = doc;
  const ids: string[] = [];
  const r = rng(seed);
  const empties = () =>
    next.elements
      .map((e, i) => ({ e, i }))
      .filter((x): x is { e: PhotoElement; i: number } => x.e.type === 'photo' && !x.e.assetId)
      .sort((a, b) => (a.e.slot ?? 1000 + a.i) - (b.e.slot ?? 1000 + b.i));
  for (const a of assets) {
    const target = empties()[0];
    if (target) {
      next = updateElement<PhotoElement>(next, target.e.id, { assetId: a.id, crop: { cx: 0.5, cy: 0.5, zoom: 1 }, mask: [] });
      ids.push(target.e.id);
      continue;
    }
    const box = fitPhotoBox(a.width, a.height, next.width, next.height, 0.5);
    const p = newPhoto({
      ...box,
      x: next.width * (0.35 + r() * 0.3),
      y: next.height * (0.35 + r() * 0.3),
      rotation: (r() - 0.5) * 10,
      assetId: a.id,
      border: { width: Math.min(next.width, next.height) * 0.012, color: '#ffffff' },
      shadow: { ...SOFT_SHADOW },
    });
    next = addElement(next, p);
    ids.push(p.id);
  }
  return { doc: next, ids };
}

export function swapPhotos(doc: DesignDoc, aId: string, bId: string): DesignDoc {
  const a = getElement(doc, aId);
  const b = getElement(doc, bId);
  if (!a || !b || a.type !== 'photo' || b.type !== 'photo' || aId === bId) return doc;
  const pick = (p: PhotoElement) => ({ assetId: p.assetId, crop: p.crop, adjust: p.adjust, mask: p.mask });
  const ca = pick(a),
    cb = pick(b);
  let next = updateElement<PhotoElement>(doc, aId, cb);
  next = updateElement<PhotoElement>(next, bId, ca);
  return next;
}

function scaleElement(el: DesignElement, sx: number, sy: number): DesignElement {
  const s = Math.sqrt(sx * sy);
  const base = { ...el, x: el.x * sx, y: el.y * sy, width: el.width * s, height: el.height * s };
  switch (base.type) {
    case 'text':
      return { ...base, fontSize: base.fontSize * s, stroke: { ...base.stroke, width: base.stroke.width * s } };
    case 'photo':
      return { ...base, cornerRadius: base.cornerRadius * s, border: { ...base.border, width: base.border.width * s } };
    case 'shape':
      return { ...base, strokeWidth: base.strokeWidth * s, cornerRadius: base.cornerRadius * s };
    case 'drawing':
      return {
        ...base,
        strokes: base.strokes.map((st) => ({ ...st, width: st.width * s, points: st.points.map((v) => v * s) })),
      };
    default:
      return base;
  }
}

/** Wechselt das Format und passt vorhandene Elemente proportional an. */
export function changeFormat(doc: DesignDoc, formatId: string, width: number, height: number): DesignDoc {
  const sx = width / doc.width,
    sy = height / doc.height;
  const elements = doc.elements.map((e) => scaleElement(e, sx, sy));
  return relayout({ ...doc, formatId, width, height, elements });
}

/** Erstellt eine neue Collage mit passendem Raster für die gegebenen Bilder. */
export function collageForAssets(doc: DesignDoc, assets: PlacedAsset[]): DesignDoc {
  const layout = defaultLayoutFor(assets.length);
  const withLayout = applyLayout({ ...doc, elements: doc.elements.filter((e) => !(e.type === 'photo' && e.slot !== undefined)) }, layout.id);
  return placePhotos(withLayout, assets).doc;
}

/** Alle Asset-IDs, auf die ein Dokument verweist. */
export function referencedAssets(doc: DesignDoc): Set<string> {
  const ids = new Set<string>(doc.overflow);
  if (doc.background.fill.kind === 'image') ids.add(doc.background.fill.assetId);
  for (const e of doc.elements) {
    if (e.type === 'photo' && e.assetId) ids.add(e.assetId);
    if (e.type === 'sticker' && e.assetId) ids.add(e.assetId);
  }
  return ids;
}
