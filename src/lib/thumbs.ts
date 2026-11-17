/** Vorschaubilder für Vorlagen und Projekte (gerendert, im Speicher und in IndexedDB zwischengespeichert). */
import { useEffect, useState } from 'react';
import { getProject, getThumb, getThumbRecord, putThumb } from './db';
import { renderThumbnail } from '../render/exportDoc';
import { getTemplate } from '../content/templates';

/** Bei Gestaltungsänderungen an Vorlagen erhöhen, damit Vorschaubilder neu erzeugt werden. */
export const TEMPLATE_THUMB_VERSION = 4;

const urlCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

async function loadOrRender(key: string, render: () => Promise<Blob>): Promise<string | null> {
  const cached = urlCache.get(key);
  if (cached) return cached;
  let p = inflight.get(key);
  if (!p) {
    p = (async () => {
      try {
        let blob = await getThumb(key);
        if (!blob) {
          blob = await render();
          void putThumb(key, blob);
        }
        const url = URL.createObjectURL(blob);
        urlCache.set(key, url);
        return url;
      } catch (e) {
        console.warn('Vorschau fehlgeschlagen', key, e);
        return null;
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
  }
  return p;
}

export function templateThumbKey(id: string) {
  return `tpl:${id}:v${TEMPLATE_THUMB_VERSION}`;
}

export function useTemplateThumb(id: string, visible = true): string | null {
  const key = templateThumbKey(id);
  const [url, setUrl] = useState<string | null>(urlCache.get(key) ?? null);
  useEffect(() => {
    if (!visible || url) return;
    let alive = true;
    const t = getTemplate(id);
    if (!t) return;
    void loadOrRender(key, () => renderThumbnail(t.build(), 480)).then((u) => alive && setUrl(u));
    return () => {
      alive = false;
    };
  }, [id, key, visible, url]);
  return url;
}

/**
 * Projekt-Vorschaubild; `version` ist das Änderungsdatum des Projekts.
 * Ist das gespeicherte Bild älter (z. B. weil die App vorher geschlossen wurde), wird es neu erzeugt.
 */
export function useProjectThumb(projectId: string, version: number): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let created: string | null = null;
    const show = (b: Blob) => {
      if (!alive) return;
      if (created) URL.revokeObjectURL(created);
      created = URL.createObjectURL(b);
      setUrl(created);
    };
    const key = `project:${projectId}`;
    void getThumbRecord(key).then(async (rec) => {
      if (rec) show(rec.blob);
      if (rec && rec.updatedAt >= version) return;
      const p = await getProject(projectId);
      if (!p || !alive) return;
      try {
        const blob = await renderThumbnail(p.doc, 420);
        await putThumb(key, blob);
        show(blob);
      } catch (e) {
        console.warn('Vorschaubild konnte nicht erzeugt werden', e);
      }
    });
    return () => {
      alive = false;
      if (created) URL.revokeObjectURL(created);
    };
  }, [projectId, version]);
  return url;
}

/** Sichtbarkeit eines Elements (für verzögertes Rendern von Vorschaubildern). */
export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '200px'): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, inView]);
  return inView;
}
