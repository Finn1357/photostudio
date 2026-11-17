/** Vollbild-Editor. */
import { useEffect, useState } from 'react';
import { Loader2, Lasso, Eraser, ArrowLeftRight, X } from 'lucide-react';
import { useEditor } from '../editor/store';
import { EditorStage } from '../editor/EditorStage';
import { TopBar } from '../editor/ui/TopBar';
import { Toolbar } from '../editor/ui/Toolbar';
import { PanelHost } from '../editor/ui/PanelHost';
import { TextEditorOverlay } from '../editor/ui/TextEditorOverlay';
import { ExportSheet } from '../editor/ui/ExportSheet';
import { ProjectMenu } from '../editor/ui/ProjectMenu';
import { getProject } from '../lib/db';
import { flushSave } from '../editor/persistence';
import { navigate } from '../app/router';
import { PrimaryButton } from '../ui/components';

function ModeBanner() {
  const mode = useEditor((s) => s.mode);
  if (mode === 'select' || mode === 'draw' || mode === 'erase') return null;
  const info =
    mode === 'lasso'
      ? { icon: <Lasso className="h-4 w-4" />, text: 'Umfahre den gewünschten Bildbereich mit dem Finger' }
      : { icon: <ArrowLeftRight className="h-4 w-4" />, text: 'Tippe auf das Foto zum Tauschen' };
  return (
    <div className="pointer-events-auto absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/75 py-1.5 pl-3 pr-1.5 text-[13px] text-white backdrop-blur">
      {info.icon}
      <span>{info.text}</span>
      <button
        type="button"
        aria-label="Abbrechen"
        onClick={() => {
          const s = useEditor.getState();
          s.setMode('select');
          s.setSwapSource(null);
        }}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function EraseHint() {
  const mode = useEditor((s) => s.mode);
  if (mode !== 'erase') return null;
  return (
    <div className="pointer-events-none absolute left-1/2 top-3 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[13px] text-white backdrop-blur">
      <Eraser className="h-4 w-4" /> Radiermodus
    </div>
  );
}

export function EditorScreen({ id }: { id: string }) {
  const project = useEditor((s) => s.project);
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading');
  const [exportOpen, setExportOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    setState('loading');
    void getProject(id).then((p) => {
      if (!alive) return;
      if (!p) {
        setState('missing');
        return;
      }
      useEditor.getState().open(p);
      setState('ready');
    });
    return () => {
      alive = false;
      void flushSave(true).then(() => {
        if (useEditor.getState().project?.id === id) useEditor.getState().close();
      });
    };
  }, [id]);

  if (state === 'missing')
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="text-[17px] font-semibold">Projekt nicht gefunden</p>
        <p className="text-[14px] text-ink-2">Es wurde vielleicht gelöscht.</p>
        <PrimaryButton onClick={() => navigate({ name: 'home' }, true)}>Zur Startseite</PrimaryButton>
      </div>
    );
  if (state === 'loading' || !project || project.id !== id)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-ink-2" />
      </div>
    );

  return (
    <div className="editor-root">
      <div className="editor-top">
        <TopBar onExport={() => setExportOpen(true)} onMenu={() => setMenuOpen(true)} />
      </div>
      <div className="editor-canvas-wrap pl-safe pr-safe">
        <EditorStage />
        <ModeBanner />
        <EraseHint />
      </div>
      <div className="editor-tools pb-safe pl-safe pr-safe bg-surface">
        <PanelHost />
        <Toolbar />
      </div>
      <TextEditorOverlay />
      <ExportSheet open={exportOpen} onClose={() => setExportOpen(false)} />
      <ProjectMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>
  );
}
