/**
 * Bildimport: Dekodieren (inkl. EXIF-Ausrichtung durch den Browser), Verkleinern auf sichere
 * Größen für Mobile Safari, Speichern von Original und Vorschau in IndexedDB.
 */
import type { AssetRecord } from '../types/doc';
import { putAsset } from './db';
import { sanitizeSvg } from './svgSanitize';
import { uid } from './util';

/** Max. Kantenlänge des gespeicherten Originals (Canvas-Grenze iOS). */
export const ORIGINAL_MAX = 4096;
export const ORIGINAL_MAX_AREA = 16_000_000;
/** Max. Kantenlänge der Editor-Vorschau. */
export const PREVIEW_MAX = 1280;

export class ImportError extends Error {}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new ImportError('Das Bild konnte nicht gelesen werden.'));
    img.src = url;
  });
}

/** Dekodiert eine Bilddatei. <img> wendet die EXIF-Ausrichtung in aktuellen Browsern automatisch an. */
export async function decodeImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImageFromUrl(url);
    if (!img.naturalWidth || !img.naturalHeight) throw new ImportError('Das Bild ist leer.');
    try {
      await img.decode();
    } catch {
      /* bereits geladen */
    }
    return img;
  } finally {
    // URL erst nach dem Zeichnen freigeben – das Bild bleibt dekodiert im Speicher
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/** Gibt den Speicher eines Canvas frei (wichtig auf iOS). */
export function releaseCanvas(c: HTMLCanvasElement | null | undefined) {
  if (!c) return;
  c.width = 1;
  c.height = 1;
}

export function canvasToBlob(c: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    c.toBlob((b) => (b ? resolve(b) : reject(new Error('Bild konnte nicht erzeugt werden (Speicher?).'))), type, quality);
  });
}

function fitSize(w: number, h: number, maxSide: number, maxArea = Infinity): { w: number; h: number } {
  let s = Math.min(1, maxSide / Math.max(w, h));
  if (w * h * s * s > maxArea) s = Math.sqrt(maxArea / (w * h));
  return { w: Math.max(1, Math.round(w * s)), h: Math.max(1, Math.round(h * s)) };
}

async function renderScaled(img: CanvasImageSource, w: number, h: number, tw: number, th: number, type: string, q: number): Promise<Blob> {
  // Schrittweises Verkleinern für bessere Qualität bei starkem Downscaling
  let src: CanvasImageSource = img;
  let cw = w,
    ch = h;
  const temps: HTMLCanvasElement[] = [];
  while (cw / 2 > tw && ch / 2 > th) {
    cw = Math.round(cw / 2);
    ch = Math.round(ch / 2);
    const t = createCanvas(cw, ch);
    const tctx = t.getContext('2d')!;
    tctx.imageSmoothingQuality = 'high';
    tctx.drawImage(src, 0, 0, cw, ch);
    temps.push(t);
    src = t;
  }
  const c = createCanvas(tw, th);
  const ctx = c.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(src, 0, 0, tw, th);
  temps.forEach(releaseCanvas);
  try {
    return await canvasToBlob(c, type, q);
  } finally {
    releaseCanvas(c);
  }
}

function mayHaveAlpha(mime: string): boolean {
  return /png|webp|gif|svg/i.test(mime);
}

/** Nur 'image/*': iOS wandelt HEIC dann automatisch in JPEG um (kompatibelste Variante). */
export const ACCEPTED_IMAGE_TYPES = 'image/*';

/** Importiert eine Bilddatei als Foto- oder Sticker-Asset. */
export async function importImageFile(file: File | Blob, kind: AssetRecord['kind'] = 'photo'): Promise<AssetRecord> {
  const mime = file.type || 'image/jpeg';
  if (mime === 'image/svg+xml' || (file instanceof File && /\.svg$/i.test(file.name))) {
    const text = await file.text();
    const { svg, width, height } = sanitizeSvg(text);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    // Sicherheitsprüfung: lässt sich das bereinigte SVG laden?
    await decodeImage(blob);
    const rec: AssetRecord = { id: uid('a'), kind, mime: 'image/svg+xml', width, height, blob, preview: blob, createdAt: Date.now() };
    await putAsset(rec);
    return rec;
  }
  let img: HTMLImageElement;
  try {
    img = await decodeImage(file);
  } catch {
    const isHeic = /heic|heif/i.test(mime) || (file instanceof File && /\.(heic|heif)$/i.test(file.name));
    throw new ImportError(
      isHeic
        ? 'HEIC-Bilder werden von diesem Browser nicht unterstützt. Tipp: In der iPhone-Fotoauswahl werden Bilder normalerweise automatisch als JPEG übergeben.'
        : 'Dieses Bildformat wird nicht unterstützt.',
    );
  }
  const w = img.naturalWidth,
    h = img.naturalHeight;
  const alpha = mayHaveAlpha(mime);
  const outType = alpha ? 'image/png' : 'image/jpeg';
  const full = fitSize(w, h, ORIGINAL_MAX, ORIGINAL_MAX_AREA);
  const prev = fitSize(w, h, PREVIEW_MAX);
  const blob = await renderScaled(img, w, h, full.w, full.h, outType, 0.93);
  const preview = await renderScaled(img, w, h, prev.w, prev.h, alpha ? 'image/png' : 'image/jpeg', 0.86);
  const rec: AssetRecord = {
    id: uid('a'),
    kind,
    mime: outType,
    width: full.w,
    height: full.h,
    blob,
    preview,
    createdAt: Date.now(),
  };
  await putAsset(rec);
  return rec;
}

export interface ImportResult {
  assets: AssetRecord[];
  errors: string[];
}

/** Importiert mehrere Dateien nacheinander (speicherschonend) mit Fortschritt. */
export async function importFiles(
  files: File[],
  onProgress?: (done: number, total: number) => void,
  kind: AssetRecord['kind'] = 'photo',
): Promise<ImportResult> {
  const assets: AssetRecord[] = [];
  const errors: string[] = [];
  let done = 0;
  onProgress?.(0, files.length);
  for (const f of files) {
    try {
      assets.push(await importImageFile(f, kind));
    } catch (e) {
      errors.push(`${f.name || 'Bild'}: ${e instanceof Error ? e.message : 'Unbekannter Fehler'}`);
    }
    done++;
    onProgress?.(done, files.length);
  }
  return { assets, errors };
}

/** Öffnet die Fotoauswahl des Systems. Muss direkt aus einer Benutzeraktion aufgerufen werden. */
export function pickFiles(opts: { multiple?: boolean; camera?: boolean; accept?: string } = {}): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = opts.accept ?? ACCEPTED_IMAGE_TYPES;
    if (opts.multiple) input.multiple = true;
    if (opts.camera) input.setAttribute('capture', 'environment');
    input.style.position = 'fixed';
    input.style.left = '-1000px';
    input.style.opacity = '0';
    let settled = false;
    const finish = (files: File[]) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(files);
    };
    input.addEventListener('change', () => finish(Array.from(input.files ?? [])));
    input.addEventListener('cancel', () => finish([]));
    document.body.appendChild(input);
    input.click();
  });
}
