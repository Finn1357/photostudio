/** Automatisches Speichern des geöffneten Projekts inkl. Vorschaubild. */
import { useEditor } from './store';
import { putThumb, saveProject } from '../lib/db';
import { renderThumbnail } from '../render/exportDoc';
import { debounce } from '../lib/util';

let started = false;
let saving: Promise<void> | null = null;

async function saveNow(): Promise<void> {
  const { project, doc } = useEditor.getState();
  if (!project || !doc) return;
  const st = useEditor.getState();
  st.setSaveState('saving');
  try {
    await saveProject({
      id: project.id,
      name: project.name,
      kind: project.kind,
      templateId: project.templateId,
      createdAt: project.createdAt,
      updatedAt: Date.now(),
      doc,
    });
    // Nur als gespeichert markieren, wenn sich seitdem nichts geändert hat
    if (useEditor.getState().doc === doc) useEditor.getState().setSaveState('saved');
    else useEditor.getState().setSaveState('dirty');
    thumb();
  } catch (e) {
    const quota = e instanceof DOMException && (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED');
    useEditor.getState().setSaveState('error', quota ? 'Der Speicher ist voll. Bitte alte Projekte löschen.' : 'Speichern fehlgeschlagen.');
    console.error(e);
  }
}

const save = debounce(() => {
  saving = saveNow().finally(() => (saving = null));
}, 700);

const thumb = debounce(async () => {
  const { project, doc } = useEditor.getState();
  if (!project || !doc) return;
  try {
    const blob = await renderThumbnail(doc, 420);
    await putThumb(`project:${project.id}`, blob);
  } catch (e) {
    console.warn('Vorschaubild fehlgeschlagen', e);
  }
}, 2500);

/** Speichert sofort (z. B. beim Verlassen des Editors oder wenn die App in den Hintergrund geht). */
export async function flushSave(withThumb = false): Promise<void> {
  if (saving) await saving;
  const st = useEditor.getState();
  if (st.saveState === 'dirty' || st.saveState === 'error') {
    save.cancel();
    await saveNow();
  }
  if (withThumb) thumb.flush();
}

export function startAutosave() {
  if (started) return;
  started = true;
  useEditor.subscribe((s, prev) => {
    if (!s.project || !s.doc) return;
    if (s.doc !== prev.doc || s.project.name !== prev.project?.name) {
      if (prev.project?.id === s.project.id) save();
    }
  });
  const onHide = () => {
    void flushSave();
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') onHide();
  });
  window.addEventListener('pagehide', onHide);
}
