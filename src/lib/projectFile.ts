/**
 * Projektdateien (.photostudio.zip) als vollständige Sicherungskopie:
 *  project.json  – Projekt inkl. Dokument
 *  assets.json   – Metadaten der Bilder
 *  assets/<id>.orig / assets/<id>.prev – Original und Vorschau
 */
import { strFromU8, strToU8, unzipSync, zipSync, type Zippable } from 'fflate';
import type { AssetRecord, DesignDoc, ProjectRecord } from '../types/doc';
import { referencedAssets } from '../editor/ops';
import { uid } from './util';

export const PROJECT_FILE_FORMAT = 'photostudio-project';
export const PROJECT_FILE_VERSION = 1;

interface AssetMeta {
  id: string;
  kind: AssetRecord['kind'];
  mime: string;
  width: number;
  height: number;
  createdAt: number;
  previewMime: string;
}

export interface AssetStore {
  getAsset(id: string): Promise<AssetRecord | undefined>;
  putAsset(a: AssetRecord): Promise<void>;
  hasAsset(id: string): Promise<boolean>;
}

async function blobBytes(b: Blob): Promise<Uint8Array> {
  return new Uint8Array(await b.arrayBuffer());
}

export async function buildProjectFile(project: ProjectRecord, store: AssetStore): Promise<Blob> {
  const files: Zippable = {};
  const metas: AssetMeta[] = [];
  for (const id of referencedAssets(project.doc)) {
    const a = await store.getAsset(id);
    if (!a) continue;
    files[`assets/${id}.orig`] = [await blobBytes(a.blob), { level: 0 }];
    if (a.preview !== a.blob) files[`assets/${id}.prev`] = [await blobBytes(a.preview), { level: 0 }];
    metas.push({ id, kind: a.kind, mime: a.mime, width: a.width, height: a.height, createdAt: a.createdAt, previewMime: a.preview.type || a.mime });
  }
  files['project.json'] = strToU8(JSON.stringify({ format: PROJECT_FILE_FORMAT, version: PROJECT_FILE_VERSION, project }));
  files['assets.json'] = strToU8(JSON.stringify(metas));
  const zipped = zipSync(files, { level: 6 });
  return new Blob([zipped as BlobPart], { type: 'application/zip' });
}

function remapDoc(doc: DesignDoc, map: Map<string, string>): DesignDoc {
  const m = (id: string) => map.get(id) ?? id;
  return {
    ...doc,
    overflow: doc.overflow.map(m),
    background: doc.background.fill.kind === 'image' ? { ...doc.background, fill: { kind: 'image', assetId: m(doc.background.fill.assetId) } } : doc.background,
    elements: doc.elements.map((e) => {
      if (e.type === 'photo' && e.assetId) return { ...e, assetId: m(e.assetId) };
      if (e.type === 'sticker' && e.assetId) return { ...e, assetId: m(e.assetId) };
      return e;
    }),
  };
}

/** Liest eine Projektdatei, legt fehlende Bilder an und liefert ein neues Projekt (neue ID). */
export async function readProjectFile(file: Blob, store: AssetStore): Promise<ProjectRecord> {
  let entries: Record<string, Uint8Array>;
  try {
    entries = unzipSync(new Uint8Array(await file.arrayBuffer()));
  } catch {
    throw new Error('Die Datei ist keine gültige PhotoStudio-Projektdatei.');
  }
  const pj = entries['project.json'];
  if (!pj) throw new Error('Die Datei enthält kein PhotoStudio-Projekt.');
  const parsed = JSON.parse(strFromU8(pj)) as { format?: string; version?: number; project?: ProjectRecord };
  if (parsed.format !== PROJECT_FILE_FORMAT || !parsed.project?.doc) throw new Error('Unbekanntes Dateiformat.');
  if ((parsed.version ?? 1) > PROJECT_FILE_VERSION) throw new Error('Diese Projektdatei stammt aus einer neueren App-Version.');
  const metas = JSON.parse(strFromU8(entries['assets.json'] ?? strToU8('[]'))) as AssetMeta[];
  const map = new Map<string, string>();
  for (const meta of metas) {
    const orig = entries[`assets/${meta.id}.orig`];
    if (!orig) continue;
    if (await store.hasAsset(meta.id)) continue; // identisches Bild bereits vorhanden
    const blob = new Blob([orig as BlobPart], { type: meta.mime });
    const prevBytes = entries[`assets/${meta.id}.prev`];
    const preview = prevBytes ? new Blob([prevBytes as BlobPart], { type: meta.previewMime }) : blob;
    await store.putAsset({ id: meta.id, kind: meta.kind, mime: meta.mime, width: meta.width, height: meta.height, blob, preview, createdAt: Date.now() });
  }
  const now = Date.now();
  const p = parsed.project;
  return { ...p, id: uid('prj'), doc: remapDoc(p.doc, map), createdAt: p.createdAt ?? now, updatedAt: now, name: p.name || 'Importiertes Projekt' };
}
