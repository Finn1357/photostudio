/** Anlegen und Öffnen von Projekten. */
import type { DesignDoc, ProjectKind, ProjectRecord } from '../types/doc';
import { saveProject, kvGet, kvSet, putThumb } from '../lib/db';
import { uid } from '../lib/util';
import { navigate } from './router';
import { renderThumbnail } from '../render/exportDoc';

export function defaultName(kind: ProjectKind): string {
  const d = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const base = kind === 'collage' ? 'Collage' : kind === 'card' ? 'Grußkarte' : kind === 'template' ? 'Design' : 'Freies Design';
  return `${base} vom ${d}`;
}

export async function createProject(doc: DesignDoc, kind: ProjectKind, opts: { name?: string; templateId?: string; open?: boolean } = {}): Promise<ProjectRecord> {
  const now = Date.now();
  const p: ProjectRecord = { id: uid('prj'), name: opts.name ?? defaultName(kind), kind, templateId: opts.templateId, createdAt: now, updatedAt: now, doc };
  await saveProject(p);
  void renderThumbnail(doc, 420)
    .then((b) => putThumb(`project:${p.id}`, b))
    .catch(() => undefined);
  if (opts.templateId) await rememberTemplate(opts.templateId);
  if (opts.open !== false) navigate({ name: 'editor', id: p.id });
  return p;
}

export async function rememberTemplate(id: string) {
  const list = await kvGet<string[]>('recentTemplates', []);
  await kvSet('recentTemplates', [id, ...list.filter((x) => x !== id)].slice(0, 12));
}
