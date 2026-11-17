/**
 * Bildquellen-Pipeline mit Caches.
 * - Fotos: Asset laden (Vorschau oder Original) → drehen → Filter → Radiermaske
 * - Sticker, Muster, Texturen, Platzhalter
 * Komponenten abonnieren Änderungen über `subscribe` und lesen synchron über `peek*`.
 */
import type { Adjustments, MaskStroke } from '../types/doc';
import { getAsset } from './db';
import { applyAdjustments, isIdentity } from './filters';
import { createCanvas, decodeImage, releaseCanvas } from './assets';
import { stableKey } from './util';
import { getStickerDef, stickerSvg } from '../content/stickers';
import { patternSvg } from '../content/patterns';
import { renderTexture } from '../content/textures';
import { renderPlaceholder } from '../content/placeholders';

export type Quality = 'preview' | 'full';
export type Source = HTMLImageElement | HTMLCanvasElement;

type Entry = { value: Source | null; promise: Promise<Source | null>; used: number; quality: Quality | 'static'; error?: boolean };

const cache = new Map<string, Entry>();
const listeners = new Set<() => void>();
let version = 0;
let notifyScheduled = false;

function notify() {
  if (notifyScheduled) return;
  notifyScheduled = true;
  queueMicrotask(() => {
    notifyScheduled = false;
    version++;
    listeners.forEach((l) => l());
  });
}

export function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function getVersion(): number {
  return version;
}

function track(key: string, quality: Entry['quality'], make: () => Promise<Source | null>): Entry {
  const existing = cache.get(key);
  if (existing) {
    existing.used = performance.now();
    return existing;
  }
  const entry: Entry = { value: null, promise: Promise.resolve(null), used: performance.now(), quality };
  entry.promise = make()
    .then((v) => {
      entry.value = v;
      notify();
      return v;
    })
    .catch((e) => {
      console.warn('Bild konnte nicht geladen werden', key, e);
      entry.error = true;
      notify();
      return null;
    });
  cache.set(key, entry);
  evict();
  return entry;
}

const MAX_PREVIEW_ENTRIES = 48;

function evict() {
  const previews = [...cache.entries()].filter(([, e]) => e.quality === 'preview' && e.value);
  if (previews.length <= MAX_PREVIEW_ENTRIES) return;
  previews.sort((a, b) => a[1].used - b[1].used);
  for (const [k, e] of previews.slice(0, previews.length - MAX_PREVIEW_ENTRIES)) {
    if (e.value instanceof HTMLCanvasElement) releaseCanvas(e.value);
    cache.delete(k);
  }
}

/** Gibt alle Originalauflösungs-Einträge frei (nach dem Export). */
export function releaseFullQuality() {
  for (const [k, e] of cache) {
    if (e.quality === 'full') {
      if (e.value instanceof HTMLCanvasElement) releaseCanvas(e.value);
      cache.delete(k);
    }
  }
}

// ---------- Assets ----------

function assetKey(assetId: string, quality: Quality) {
  return `asset|${assetId}|${quality}`;
}

export function loadAsset(assetId: string, quality: Quality): Promise<Source | null> {
  return track(assetKey(assetId, quality), quality, async () => {
    const rec = await getAsset(assetId);
    if (!rec) return null;
    return decodeImage(quality === 'full' ? rec.blob : rec.preview);
  }).promise;
}

export function peekAsset(assetId: string, quality: Quality): Source | null {
  return track(assetKey(assetId, quality), quality, async () => {
    const rec = await getAsset(assetId);
    if (!rec) return null;
    return decodeImage(quality === 'full' ? rec.blob : rec.preview);
  }).value;
}

// ---------- Fotos mit Bearbeitung ----------

export interface PhotoSourceSpec {
  assetId: string;
  adjust: Adjustments;
  mask: MaskStroke[];
}

function photoKey(spec: PhotoSourceSpec, quality: Quality) {
  const { preset: _p, ...adj } = spec.adjust;
  return `photo|${spec.assetId}|${quality}|${stableKey([adj, spec.mask])}`;
}

function needsProcessing(spec: PhotoSourceSpec) {
  return spec.adjust.rotate90 !== 0 || !isIdentity(spec.adjust) || spec.mask.length > 0;
}

export function applyMask(canvas: HTMLCanvasElement, mask: MaskStroke[]) {
  if (!mask.length) return;
  const w = canvas.width,
    h = canvas.height;
  const m = createCanvas(w, h);
  const mctx = m.getContext('2d')!;
  mctx.fillStyle = '#000';
  mctx.fillRect(0, 0, w, h);
  mctx.lineCap = 'round';
  mctx.lineJoin = 'round';
  const minSide = Math.min(w, h);
  for (const s of mask) {
    mctx.globalCompositeOperation = s.mode === 'erase' ? 'destination-out' : 'source-over';
    mctx.strokeStyle = '#000';
    mctx.fillStyle = '#000';
    mctx.lineWidth = Math.max(1, s.size * minSide);
    const p = s.points;
    if (p.length < 2) continue;
    mctx.beginPath();
    if (p.length === 2) {
      mctx.arc(p[0]! * w, p[1]! * h, mctx.lineWidth / 2, 0, Math.PI * 2);
      mctx.fill();
      continue;
    }
    mctx.moveTo(p[0]! * w, p[1]! * h);
    for (let i = 2; i + 1 < p.length; i += 2) mctx.lineTo(p[i]! * w, p[i + 1]! * h);
    mctx.stroke();
  }
  const ctx = canvas.getContext('2d')!;
  ctx.globalCompositeOperation = 'destination-in';
  ctx.drawImage(m, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
  releaseCanvas(m);
}

async function buildPhoto(spec: PhotoSourceSpec, quality: Quality): Promise<Source | null> {
  const base = await loadAsset(spec.assetId, quality);
  if (!base) return null;
  if (!needsProcessing(spec)) return base;
  const bw = base instanceof HTMLImageElement ? base.naturalWidth : base.width;
  const bh = base instanceof HTMLImageElement ? base.naturalHeight : base.height;
  const rot = spec.adjust.rotate90;
  const swap = rot % 2 === 1;
  const c = createCanvas(swap ? bh : bw, swap ? bw : bh);
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.save();
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((rot * Math.PI) / 2);
  ctx.drawImage(base, -bw / 2, -bh / 2);
  ctx.restore();
  if (!isIdentity(spec.adjust)) {
    const data = ctx.getImageData(0, 0, c.width, c.height);
    applyAdjustments(data, spec.adjust);
    ctx.putImageData(data, 0, 0);
  }
  applyMask(c, spec.mask);
  return c;
}

/** Laufende Vorschau-Berechnung pro Asset – nur die neueste Anfrage wird ausgeführt. */
const latestRequest = new Map<string, string>();

export function peekPhoto(spec: PhotoSourceSpec, quality: Quality): Source | null {
  if (!needsProcessing(spec)) return peekAsset(spec.assetId, quality);
  const key = photoKey(spec, quality);
  const existing = cache.get(key);
  if (existing) {
    existing.used = performance.now();
    return existing.value;
  }
  latestRequest.set(spec.assetId + quality, key);
  return track(key, quality, async () => {
    // kurze Verzögerung bündelt schnelle Schieberegler-Änderungen
    if (quality === 'preview') await new Promise((r) => setTimeout(r, 16));
    if (quality === 'preview' && latestRequest.get(spec.assetId + quality) !== key) {
      cache.delete(key);
      return null;
    }
    return buildPhoto(spec, quality);
  }).value;
}

export function loadPhoto(spec: PhotoSourceSpec, quality: Quality): Promise<Source | null> {
  if (!needsProcessing(spec)) return loadAsset(spec.assetId, quality);
  return track(photoKey(spec, quality), quality, () => buildPhoto(spec, quality)).promise;
}

export function sourceSize(s: Source): { w: number; h: number } {
  if (s instanceof HTMLImageElement) return { w: s.naturalWidth || s.width, h: s.naturalHeight || s.height };
  return { w: s.width, h: s.height };
}

// ---------- Sticker ----------

function svgToImage(svg: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('SVG konnte nicht geladen werden'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

function stickerKey(id: string, colors?: string[]) {
  return `sticker|${id}|${colors?.join(',') ?? ''}`;
}

function makeSticker(id: string, colors?: string[]) {
  return async () => {
    const def = getStickerDef(id);
    if (!def) return null;
    return svgToImage(stickerSvg(def, colors));
  };
}

export function peekSticker(id: string, colors?: string[]): Source | null {
  return track(stickerKey(id, colors), 'static', makeSticker(id, colors)).value;
}

export function loadSticker(id: string, colors?: string[]): Promise<Source | null> {
  return track(stickerKey(id, colors), 'static', makeSticker(id, colors)).promise;
}

// ---------- Muster & Texturen ----------

function patternKey(id: string, colors: string[]) {
  return `pattern|${id}|${colors.join(',')}`;
}

/** Muster werden gerastert, damit createPattern zuverlässig funktioniert. */
async function rasterPattern(id: string, colors: string[]): Promise<Source> {
  const img = await svgToImage(patternSvg(id, colors));
  const c = createCanvas(img.naturalWidth || 256, img.naturalHeight || 256);
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

export function peekPattern(id: string, colors: string[]): Source | null {
  return track(patternKey(id, colors), 'static', () => rasterPattern(id, colors)).value;
}

export function loadPattern(id: string, colors: string[]): Promise<Source | null> {
  return track(patternKey(id, colors), 'static', () => rasterPattern(id, colors)).promise;
}

function textureKey(id: string, tint: string | null) {
  return `texture|${id}|${tint ?? ''}`;
}

export function peekTexture(id: string, tint: string | null): Source | null {
  return track(textureKey(id, tint), 'static', async () => {
    await new Promise((r) => setTimeout(r, 0));
    return renderTexture(id, tint, 1024);
  }).value;
}

export function loadTexture(id: string, tint: string | null): Promise<Source | null> {
  return track(textureKey(id, tint), 'static', async () => renderTexture(id, tint, 1024)).promise;
}

export function peekPlaceholder(i: number): Source | null {
  return track(`placeholder|${i % 6}`, 'static', async () => renderPlaceholder(i % 6, 640)).value;
}

export function loadPlaceholder(i: number): Promise<Source | null> {
  return track(`placeholder|${i % 6}`, 'static', async () => renderPlaceholder(i % 6, 640)).promise;
}

/** Hintergrundbild mit eigenen Anpassungen (Weichzeichnen, Helligkeit, Sättigung). */
export function bgAdjust(blur: number, brightness: number, saturation: number): Adjustments {
  return {
    brightness,
    saturation,
    blur,
    contrast: 0,
    warmth: 0,
    hue: 0,
    exposure: 0,
    fade: 0,
    grayscale: 0,
    sepia: 0,
    sharpen: 0,
    vignette: 0,
    rotate90: 0,
  };
}
