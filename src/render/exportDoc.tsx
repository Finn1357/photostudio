/**
 * Rendert ein Dokument außerhalb des Editors in beliebiger Auflösung.
 * Verwendet exakt dieselben Komponenten wie der Editor → Export entspricht der Ansicht.
 */
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Group, Layer, Stage } from 'react-konva';
import type Konva from 'konva';
import type { DesignDoc } from '../types/doc';
import { DocumentNodes } from './Nodes';
import { bgAdjust, loadAsset, loadPattern, loadPhoto, loadPlaceholder, loadSticker, loadTexture, releaseFullQuality, type Quality } from '../lib/images';
import { ensureFonts } from '../lib/fonts';
import { canvasToBlob, releaseCanvas } from '../lib/assets';
import { maxExportScale } from '../content/formats';
import { nextFrame } from '../lib/util';

/** Lädt alle Bilder, Muster und Schriften, die das Dokument benötigt. */
export async function prepareDocAssets(doc: DesignDoc, quality: Quality): Promise<void> {
  const tasks: Promise<unknown>[] = [];
  const fonts: { family: string; bold: boolean; italic: boolean }[] = [];
  const bg = doc.background;
  if (bg.fill.kind === 'image') tasks.push(loadPhoto({ assetId: bg.fill.assetId, adjust: bgAdjust(bg.blur, bg.brightness, bg.saturation), mask: [] }, quality));
  if (bg.fill.kind === 'pattern') tasks.push(loadPattern(bg.fill.patternId, bg.fill.colors));
  if (bg.fill.kind === 'texture') tasks.push(loadTexture(bg.fill.textureId, bg.fill.tint));
  for (const el of doc.elements) {
    if (el.hidden) continue;
    if (el.type === 'photo') {
      if (el.assetId) tasks.push(loadPhoto({ assetId: el.assetId, adjust: el.adjust, mask: el.mask }, quality));
      else tasks.push(loadPlaceholder(el.placeholder ?? 0));
    } else if (el.type === 'sticker') {
      if (el.stickerId) tasks.push(loadSticker(el.stickerId, el.colors));
      else if (el.assetId) tasks.push(loadAsset(el.assetId, quality));
    } else if (el.type === 'text') {
      fonts.push({ family: el.fontFamily, bold: el.bold, italic: el.italic });
    }
  }
  // Fotos nacheinander verarbeiten wäre speicherschonender; Promise.all ist hier ok,
  // da die Pipeline intern pro Bild arbeitet und große Bilder einzeln dekodiert.
  await Promise.all([...tasks, ensureFonts(fonts)]);
}

export interface RenderOptions {
  /** Ausgabepixel pro Leinwand-Einheit */
  scale: number;
  quality: Quality;
  /** Hintergrund weglassen (PNG mit Transparenz) */
  transparent?: boolean;
  /** Weißer Untergrund für JPEG */
  opaque?: boolean;
}

let queue: Promise<unknown> = Promise.resolve();

/** Serialisiert Render-Aufträge, um Speicherspitzen auf dem iPhone zu vermeiden. */
function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

export function renderDocToCanvas(docIn: DesignDoc, opts: RenderOptions): Promise<HTMLCanvasElement> {
  return enqueue(async () => {
    const doc: DesignDoc = opts.transparent ? { ...docIn, background: { ...docIn.background, fill: { kind: 'none' } } } : docIn;
    const scale = Math.min(opts.scale, maxExportScale(doc.width, doc.height));
    await prepareDocAssets(doc, opts.quality);
    const k = Math.min(1, 200 / Math.max(doc.width, doc.height));
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;overflow:hidden;pointer-events:none;';
    document.body.appendChild(container);
    const root = createRoot(container);
    let stage: Konva.Stage | null = null;
    try {
      flushSync(() => {
        root.render(
          <Stage
            width={Math.ceil(doc.width * k)}
            height={Math.ceil(doc.height * k)}
            ref={(s) => {
              stage = s;
            }}
            listening={false}
          >
            <Layer listening={false}>
              <Group scaleX={k} scaleY={k}>
                <DocumentNodes doc={doc} opts={{ quality: opts.quality, editor: false, viewScale: scale, opaqueBase: !!opts.opaque }} />
              </Group>
            </Layer>
          </Stage>,
        );
      });
      // react-konva baut den Baum ggf. asynchron auf – kurz warten, bis alle Knoten existieren
      const expected = doc.elements.length;
      for (let i = 0; i < 30; i++) {
        await nextFrame();
        const s = stage as Konva.Stage | null;
        if (s && s.find('.element').length >= expected) break;
      }
      const s = stage as Konva.Stage | null;
      if (!s) throw new Error('Renderer konnte nicht gestartet werden.');
      const canvas = s.toCanvas({ pixelRatio: scale / k, x: 0, y: 0, width: doc.width * k, height: doc.height * k }) as HTMLCanvasElement;
      return canvas;
    } finally {
      root.unmount();
      container.remove();
      if (opts.quality === 'full') releaseFullQuality();
    }
  });
}

export async function renderDocToBlob(doc: DesignDoc, opts: RenderOptions & { type: 'image/png' | 'image/jpeg'; jpegQuality?: number }): Promise<Blob> {
  const canvas = await renderDocToCanvas(doc, { ...opts, opaque: opts.type === 'image/jpeg' });
  try {
    return await canvasToBlob(canvas, opts.type, opts.type === 'image/jpeg' ? (opts.jpegQuality ?? 0.92) : undefined);
  } finally {
    releaseCanvas(canvas);
  }
}

export async function renderThumbnail(doc: DesignDoc, size = 420): Promise<Blob> {
  return renderDocToBlob(doc, { scale: size / Math.max(doc.width, doc.height), quality: 'preview', type: 'image/jpeg', jpegQuality: 0.82 });
}
