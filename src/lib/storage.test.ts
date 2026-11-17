import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { collectGarbage, deleteProject, duplicateProject, getAsset, getProject, hasAsset, kvGet, kvSet, listProjects, putAsset, saveProject, _resetDbForTests } from './db';
import { buildProjectFile, readProjectFile } from './projectFile';
import { applyLayout, placePhotos } from '../editor/ops';
import { createDoc } from '../editor/factory';
import type { AssetRecord, ProjectRecord } from '../types/doc';

function asset(id: string, createdAt = 0): AssetRecord {
  const blob = new Blob([new Uint8Array([1, 2, 3, id.length])], { type: 'image/jpeg' });
  return { id, kind: 'photo', mime: 'image/jpeg', width: 100, height: 80, blob, preview: blob, createdAt };
}

function project(id: string, assetIds: string[]): ProjectRecord {
  const doc = placePhotos(applyLayout(createDoc('1:1', 2400, 2400), 'l4-raster'), assetIds.map((a) => ({ id: a, width: 100, height: 80 }))).doc;
  return { id, name: 'Projekt ' + id, kind: 'collage', createdAt: 1, updatedAt: 2, doc };
}

async function wipe() {
  await _resetDbForTests();
  await new Promise((r) => {
    const req = indexedDB.deleteDatabase('photostudio');
    req.onsuccess = req.onerror = req.onblocked = () => r(null);
  });
}

beforeEach(wipe);

describe('Lokale Speicherung (IndexedDB)', () => {
  it('speichert, listet, dupliziert und löscht Projekte', async () => {
    await saveProject(project('p1', []));
    await saveProject({ ...project('p2', []), updatedAt: 5 });
    let list = await listProjects();
    expect(list.map((p) => p.id)).toEqual(['p2', 'p1']);
    const copy = await duplicateProject('p1');
    expect(copy?.name).toContain('Kopie');
    expect((await getProject(copy!.id))!.doc.elements.length).toBe(4);
    await deleteProject('p1');
    list = await listProjects();
    expect(list.some((p) => p.id === 'p1')).toBe(false);
  });

  it('vollständiges Dokument übersteht das Speichern unverändert', async () => {
    const p = project('p3', ['a1']);
    await saveProject(p);
    expect((await getProject('p3'))!.doc).toEqual(p.doc);
  });

  it('räumt nur unbenutzte Bilder auf', async () => {
    await putAsset(asset('used'));
    await putAsset(asset('orphan'));
    await saveProject(project('p4', ['used']));
    const removed = await collectGarbage(0);
    expect(removed).toBe(1);
    expect(await hasAsset('used')).toBe(true);
    expect(await hasAsset('orphan')).toBe(false);
  });

  it('Schlüssel/Wert-Speicher', async () => {
    expect(await kvGet('x', 42)).toBe(42);
    await kvSet('x', [1, 2]);
    expect(await kvGet('x', [])).toEqual([1, 2]);
  });
});

describe('Projektdateien (Sicherung)', () => {
  it('Export und Import ergeben das gleiche Projekt mit allen Bildern', async () => {
    await putAsset(asset('img1'));
    await putAsset(asset('img2'));
    const p = project('p5', ['img1', 'img2']);
    await saveProject(p);
    const file = await buildProjectFile(p, { getAsset, putAsset, hasAsset });
    expect(file.size).toBeGreaterThan(100);

    // Auf einem "anderen Gerät" importieren
    await wipe();
    const imported = await readProjectFile(file, { getAsset, putAsset, hasAsset });
    expect(imported.id).not.toBe('p5');
    expect(imported.name).toBe(p.name);
    expect(imported.doc).toEqual(p.doc);
    const a = await getAsset('img1');
    expect(a?.width).toBe(100);
    expect(new Uint8Array(await a!.blob.arrayBuffer())).toEqual(new Uint8Array([1, 2, 3, 4]));
  });

  it('lehnt fremde Dateien ab', async () => {
    await expect(readProjectFile(new Blob(['kein zip']), { getAsset, putAsset, hasAsset })).rejects.toThrow();
  });
});
