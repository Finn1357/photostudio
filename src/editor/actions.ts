/** Höhere Editor-Aktionen, die von Werkzeugleisten und Gesten aufgerufen werden. */
import type { DesignElement, PhotoElement, ShapeKind, StickerElement, TextElement } from '../types/doc';
import { useEditor, commit } from './store';
import {
  addElement,
  cloneElement,
  duplicateElement,
  getElement,
  moveLayer,
  placePhotos,
  removeElement,
  updateElement,
} from './ops';
import { newShape, newSticker, newText } from './factory';
import { importFiles, pickFiles } from '../lib/assets';
import { toast, useToasts } from '../ui/toast';
import { getStickerDef } from '../content/stickers';
import { primeKeyboard } from '../lib/keyboard';
import { DEFAULT_ADJUST } from '../lib/filters';

const st = () => useEditor.getState();

export function selected(): DesignElement | undefined {
  const s = st();
  return s.doc ? getElement(s.doc, s.selectedId) : undefined;
}

export async function importAndPlace(files: File[], target: { replaceId?: string; background?: boolean; sticker?: boolean } = {}) {
  if (!files.length) return;
  const tid = useToasts.getState().show(files.length > 1 ? `Bilder werden importiert … 0/${files.length}` : 'Bild wird importiert …', 'progress');
  try {
    const res = await importFiles(
      files,
      (done, total) => useToasts.getState().update(tid, { text: total > 1 ? `Bilder werden importiert … ${done}/${total}` : 'Bild wird importiert …', progress: done / total }),
      target.sticker ? 'sticker' : 'photo',
    );
    useToasts.getState().dismiss(tid);
    if (res.errors.length) toast(res.errors.join('\n'), 'error', 6000);
    if (!res.assets.length) return;
    const s = st();
    if (!s.doc) return;
    if (target.background) {
      const a = res.assets[0]!;
      commit((d) => ({ ...d, background: { ...d.background, fill: { kind: 'image', assetId: a.id }, scale: 1, offsetX: 0, offsetY: 0 } }));
      return;
    }
    if (target.sticker) {
      const a = res.assets[0]!;
      const d = s.doc;
      const size = Math.min(d.width, d.height) * 0.35;
      const k = size / Math.max(a.width, a.height);
      const el = newSticker({ x: d.width / 2, y: d.height / 2, width: a.width * k, height: a.height * k, assetId: a.id });
      commit((doc) => addElement(doc, el));
      s.select(el.id);
      return;
    }
    if (target.replaceId) {
      const a = res.assets[0]!;
      commit((d) =>
        updateElement<PhotoElement>(d, target.replaceId!, { assetId: a.id, crop: { cx: 0.5, cy: 0.5, zoom: 1 }, mask: [], adjust: { ...DEFAULT_ADJUST } }),
      );
      s.select(target.replaceId);
      const rest = res.assets.slice(1);
      if (rest.length) commit((d) => placePhotos(d, rest).doc);
      return;
    }
    let ids: string[] = [];
    commit((d) => {
      const r = placePhotos(d, res.assets);
      ids = r.ids;
      return r.doc;
    });
    if (ids.length === 1) s.select(ids[0]!);
    toast(res.assets.length === 1 ? 'Foto eingefügt' : `${res.assets.length} Fotos eingefügt`, 'success', 1600);
  } catch (e) {
    useToasts.getState().dismiss(tid);
    toast(e instanceof Error ? e.message : 'Import fehlgeschlagen', 'error', 5000);
  }
}

/** Muss direkt aus einem Tipp-Ereignis aufgerufen werden (iOS-Vorgabe). */
export function pickPhotos(opts: { camera?: boolean; replaceId?: string; background?: boolean; multiple?: boolean } = {}) {
  void pickFiles({ multiple: opts.multiple ?? (!opts.replaceId && !opts.background), camera: opts.camera }).then((files) =>
    importAndPlace(files, { replaceId: opts.replaceId, background: opts.background }),
  );
}

export function pickCustomSticker() {
  void pickFiles({ accept: 'image/png,image/svg+xml,image/webp,.svg,.png' }).then((files) => importAndPlace(files, { sticker: true }));
}

export function addText(preset?: Partial<TextElement>, edit = true) {
  const s = st();
  if (!s.doc) return;
  const d = s.doc;
  const unit = Math.min(d.width, d.height);
  if (edit) primeKeyboard();
  const el = newText({
    x: d.width / 2,
    y: d.height / 2,
    width: d.width * 0.8,
    fontSize: unit * 0.075,
    ...preset,
    ...(preset?.fontSize ? { fontSize: preset.fontSize * unit } : {}),
    ...(preset?.stroke ? { stroke: { ...preset.stroke, width: preset.stroke.width * unit } } : {}),
  });
  commit((doc) => addElement(doc, el));
  s.select(el.id);
  if (edit) s.setTextEditing(el.id);
}

export function addSticker(stickerId: string) {
  const s = st();
  if (!s.doc) return;
  const def = getStickerDef(stickerId);
  if (!def) return;
  const d = s.doc;
  const size = Math.min(d.width, d.height) * (def.w / def.h > 2.5 ? 0.6 : 0.3);
  const k = size / Math.max(def.w, def.h);
  const jitter = () => (Math.random() - 0.5) * Math.min(d.width, d.height) * 0.12;
  const el: StickerElement = newSticker({ x: d.width / 2 + jitter(), y: d.height / 2 + jitter(), width: def.w * k, height: def.h * k, stickerId });
  commit((doc) => addElement(doc, el));
  s.select(el.id);
}

export function replaceSticker(stickerId: string) {
  const el = selected();
  const def = getStickerDef(stickerId);
  if (!el || el.type !== 'sticker' || !def) return;
  const size = Math.max(el.width, el.height);
  const k = size / Math.max(def.w, def.h);
  commit((d) => updateElement<StickerElement>(d, el.id, { stickerId, assetId: undefined, colors: undefined, width: def.w * k, height: def.h * k }));
}

export function addShape(kind: ShapeKind) {
  const s = st();
  if (!s.doc) return;
  const d = s.doc;
  const unit = Math.min(d.width, d.height);
  const isLine = kind === 'line' || kind === 'arrow';
  const el = newShape(kind, {
    x: d.width / 2,
    y: d.height / 2,
    width: unit * (isLine ? 0.5 : 0.35),
    height: isLine ? unit * 0.06 : unit * (kind === 'arch' ? 0.45 : 0.35),
    strokeWidth: isLine ? unit * 0.008 : 0,
  });
  commit((doc) => addElement(doc, el));
  s.select(el.id);
}

export function deleteSelected() {
  const el = selected();
  if (!el) return;
  commit((d) => removeElement(d, el.id));
  const d = st().doc;
  if (!d?.elements.some((e) => e.id === el.id)) st().select(null);
  st().setPanel(null);
}

export function duplicateSelected() {
  const el = selected();
  if (!el) return;
  let newId: string | null = null;
  commit((d) => {
    const r = duplicateElement(d, el.id);
    newId = r.id;
    return r.doc;
  });
  if (newId) st().select(newId);
}

export function copySelected() {
  const el = selected();
  if (!el) return;
  st().setClipboard(JSON.parse(JSON.stringify(el)));
  toast('Kopiert', 'info', 1200);
}

export function paste() {
  const s = st();
  if (!s.clipboard || !s.doc) return;
  const copy = cloneElement(s.clipboard, Math.min(s.doc.width, s.doc.height) * 0.04);
  // Position auf Leinwand begrenzen (falls aus anderem Format kopiert)
  copy.x = Math.min(Math.max(copy.x, 0), s.doc.width);
  copy.y = Math.min(Math.max(copy.y, 0), s.doc.height);
  commit((d) => addElement(d, copy));
  s.select(copy.id);
}

export function toggleLock() {
  const el = selected();
  if (!el) return;
  commit((d) => updateElement(d, el.id, { locked: !el.locked }));
  toast(el.locked ? 'Entsperrt' : 'Gesperrt', 'info', 1200);
}

export function arrange(dir: 'up' | 'down' | 'top' | 'bottom') {
  const el = selected();
  if (!el) return;
  commit((d) => moveLayer(d, el.id, dir));
}

export function flipSelected(axis: 'x' | 'y') {
  const el = selected();
  if (!el) return;
  commit((d) => updateElement(d, el.id, axis === 'x' ? { flipX: !el.flipX } : { flipY: !el.flipY }));
}

/** Dreht Fotos im Feld um 90°, andere Elemente als Ganzes. */
export function rotateSelected90() {
  const el = selected();
  if (!el) return;
  if (el.type === 'photo') {
    commit((d) =>
      updateElement<PhotoElement>(d, el.id, (p) => {
        const rot = (((p.adjust.rotate90 + 1) % 4) as 0 | 1 | 2 | 3);
        // Radierstriche mitdrehen (Uhrzeigersinn: (x, y) → (1 - y, x))
        const mask = p.mask.map((m) => {
          const pts: number[] = [];
          for (let i = 0; i + 1 < m.points.length; i += 2) pts.push(1 - m.points[i + 1]!, m.points[i]!);
          return { ...m, points: pts };
        });
        const next: PhotoElement = { ...p, adjust: { ...p.adjust, rotate90: rot }, mask, crop: { cx: 1 - p.crop.cy, cy: p.crop.cx, zoom: p.crop.zoom } };
        if (p.slot === undefined && p.frame.kind === 'none' && p.shape === 'rect') {
          next.width = p.height;
          next.height = p.width;
        }
        return next;
      }),
    );
    return;
  }
  commit((d) => updateElement(d, el.id, { rotation: (el.rotation + 90) % 360 }));
}

export function openTextEditor(id: string) {
  primeKeyboard();
  st().select(id);
  st().setTextEditing(id);
}

export function startSwap() {
  const el = selected();
  if (!el || el.type !== 'photo') return;
  st().setSwapSource(el.id);
  toast('Tippe auf das Foto, mit dem getauscht werden soll', 'info', 2600);
}
