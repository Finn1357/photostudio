/** Lokale Datenhaltung in IndexedDB (Projekte, Bilder, Vorschaubilder, eigene Vorlagen, Einstellungen). */
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AssetRecord, ProjectMeta, ProjectRecord, UserTemplateRecord } from '../types/doc';
import { referencedAssets } from '../editor/ops';
import { uid } from './util';

interface ThumbRecord {
  key: string;
  blob: Blob;
  updatedAt: number;
}

interface KvRecord {
  key: string;
  value: unknown;
}

interface PhotoStudioDB extends DBSchema {
  projects: { key: string; value: ProjectRecord; indexes: { updatedAt: number } };
  assets: { key: string; value: AssetRecord };
  thumbs: { key: string; value: ThumbRecord };
  templates: { key: string; value: UserTemplateRecord };
  kv: { key: string; value: KvRecord };
}

const DB_NAME = 'photostudio';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PhotoStudioDB>> | null = null;

export function db(): Promise<IDBPDatabase<PhotoStudioDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PhotoStudioDB>(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains('projects')) {
          const s = d.createObjectStore('projects', { keyPath: 'id' });
          s.createIndex('updatedAt', 'updatedAt');
        }
        if (!d.objectStoreNames.contains('assets')) d.createObjectStore('assets', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('thumbs')) d.createObjectStore('thumbs', { keyPath: 'key' });
        if (!d.objectStoreNames.contains('templates')) d.createObjectStore('templates', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', { keyPath: 'key' });
      },
      blocked() {
        console.warn('IndexedDB-Upgrade blockiert – bitte andere Tabs schließen.');
      },
    });
  }
  return dbPromise;
}

/** Nur für Tests: Verbindung schließen und zurücksetzen. */
export async function _resetDbForTests() {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}

// ---------- Projekte ----------

export function toMeta(p: ProjectRecord): ProjectMeta {
  return { id: p.id, name: p.name, kind: p.kind, createdAt: p.createdAt, updatedAt: p.updatedAt, width: p.doc.width, height: p.doc.height };
}

export async function listProjects(): Promise<ProjectMeta[]> {
  const all = await (await db()).getAll('projects');
  return all.map(toMeta).sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getProject(id: string): Promise<ProjectRecord | undefined> {
  return (await db()).get('projects', id);
}

export async function saveProject(p: ProjectRecord): Promise<void> {
  await (await db()).put('projects', p);
}

export async function deleteProject(id: string): Promise<void> {
  const d = await db();
  const tx = d.transaction(['projects', 'thumbs'], 'readwrite');
  await Promise.all([tx.objectStore('projects').delete(id), tx.objectStore('thumbs').delete(`project:${id}`), tx.done]);
}

export async function duplicateProject(id: string): Promise<ProjectRecord | undefined> {
  const src = await getProject(id);
  if (!src) return undefined;
  const now = Date.now();
  const copy: ProjectRecord = { ...structuredClone(src), id: uid('prj'), name: `${src.name} (Kopie)`, createdAt: now, updatedAt: now };
  await saveProject(copy);
  const thumb = await getThumb(`project:${id}`);
  if (thumb) await putThumb(`project:${copy.id}`, thumb);
  return copy;
}

export async function renameProject(id: string, name: string): Promise<void> {
  const p = await getProject(id);
  if (!p) return;
  await saveProject({ ...p, name, updatedAt: Date.now() });
}

// ---------- Assets ----------

export async function putAsset(a: AssetRecord): Promise<void> {
  await (await db()).put('assets', a);
}

export async function getAsset(id: string): Promise<AssetRecord | undefined> {
  return (await db()).get('assets', id);
}

export async function hasAsset(id: string): Promise<boolean> {
  return (await (await db()).getKey('assets', id)) !== undefined;
}

// ---------- Vorschaubilder ----------

export async function putThumb(key: string, blob: Blob): Promise<void> {
  await (await db()).put('thumbs', { key, blob, updatedAt: Date.now() });
}

export async function getThumb(key: string): Promise<Blob | undefined> {
  return (await (await db()).get('thumbs', key))?.blob;
}

export async function getThumbRecord(key: string): Promise<{ blob: Blob; updatedAt: number } | undefined> {
  return (await db()).get('thumbs', key);
}

// ---------- Eigene Vorlagen ----------

export async function listUserTemplates(): Promise<UserTemplateRecord[]> {
  const all = await (await db()).getAll('templates');
  return all.sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveUserTemplate(t: UserTemplateRecord): Promise<void> {
  await (await db()).put('templates', t);
}

export async function deleteUserTemplate(id: string): Promise<void> {
  await (await db()).delete('templates', id);
}

// ---------- Schlüssel/Wert ----------

export async function kvGet<T>(key: string, fallback: T): Promise<T> {
  const r = await (await db()).get('kv', key);
  return r ? (r.value as T) : fallback;
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  await (await db()).put('kv', { key, value });
}

// ---------- Aufräumen ----------

/** Löscht Bilder, die von keinem Projekt und keiner Vorlage mehr verwendet werden. */
export async function collectGarbage(minAgeMs = 60 * 60 * 1000): Promise<number> {
  const d = await db();
  const used = new Set<string>();
  for (const p of await d.getAll('projects')) referencedAssets(p.doc).forEach((id) => used.add(id));
  for (const t of await d.getAll('templates')) referencedAssets(t.doc).forEach((id) => used.add(id));
  const tx = d.transaction('assets', 'readwrite');
  let removed = 0;
  let cursor = await tx.store.openCursor();
  const now = Date.now();
  while (cursor) {
    const a = cursor.value;
    if (!used.has(a.id) && now - a.createdAt > minAgeMs) {
      await cursor.delete();
      removed++;
    }
    cursor = await cursor.continue();
  }
  await tx.done;
  return removed;
}

/** Bittet den Browser, die Daten dauerhaft zu speichern (verringert automatisches Löschen). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true;
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export async function storageEstimate(): Promise<{ usage: number; quota: number } | null> {
  try {
    const e = await navigator.storage?.estimate?.();
    return e ? { usage: e.usage ?? 0, quota: e.quota ?? 0 } : null;
  } catch {
    return null;
  }
}
