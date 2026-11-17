/** Einstiegs-Abläufe von der Startseite und aus dem Katalog. */
import type { DesignDoc, UserTemplateRecord } from '../types/doc';
import { getFormat } from '../content/formats';
import { createDoc, defaultBackground, newSticker } from '../editor/factory';
import { addElement, applyLayout, collageForAssets } from '../editor/ops';
import { getTemplate } from '../content/templates';
import { getStickerDef } from '../content/stickers';
import { createProject } from './projects';
import { importFiles, pickFiles } from '../lib/assets';
import { toast, useToasts } from '../ui/toast';

/** Fotoauswahl öffnen und daraus direkt eine Collage erstellen (muss aus einem Tipp aufgerufen werden). */
export function startNewCollage() {
  void pickFiles({ multiple: true }).then(async (files) => {
    if (!files.length) return;
    const tid = useToasts.getState().show(`Fotos werden vorbereitet … 0/${files.length}`, 'progress');
    const res = await importFiles(files, (d, t) => useToasts.getState().update(tid, { text: `Fotos werden vorbereitet … ${d}/${t}` }));
    useToasts.getState().dismiss(tid);
    if (res.errors.length) toast(res.errors.join('\n'), 'error', 6000);
    if (!res.assets.length) return;
    const f = getFormat('1:1')!;
    const doc = collageForAssets(createDoc(f.id, f.width, f.height, defaultBackground('#ffffff')), res.assets);
    await createProject(doc, 'collage');
  });
}

/** Leere Collage (ohne Fotos) im gewählten Format. */
export async function startEmptyCollage(formatId: string) {
  const f = getFormat(formatId) ?? getFormat('1:1')!;
  const doc = applyLayout(createDoc(f.id, f.width, f.height), 'l4-raster');
  await createProject(doc, 'collage');
}

export async function startFreeDesign(formatId: string, background = '#ffffff') {
  const f = getFormat(formatId) ?? getFormat('1:1')!;
  await createProject(createDoc(f.id, f.width, f.height, defaultBackground(background)), 'free');
}

export async function openTemplate(id: string) {
  const t = getTemplate(id);
  if (!t) return;
  await createProject(t.build(), t.card ? 'card' : 'template', { name: t.name, templateId: id });
}

export async function openUserTemplate(t: UserTemplateRecord) {
  await createProject(structuredClone(t.doc) as DesignDoc, 'template', { name: t.name });
}

export async function startWithSticker(stickerId: string) {
  const def = getStickerDef(stickerId);
  const f = getFormat('1:1')!;
  let doc = createDoc(f.id, f.width, f.height);
  if (def) {
    const size = f.width * 0.4;
    const k = size / Math.max(def.w, def.h);
    doc = addElement(doc, newSticker({ stickerId, x: f.width / 2, y: f.height / 2, width: def.w * k, height: def.h * k }));
  }
  await createProject(doc, 'free');
}
