/** Obere Editor-Leiste. */
import { useState } from 'react';
import { ChevronLeft, Undo2, Redo2, Share, MoreHorizontal, Check, Loader2, AlertTriangle } from 'lucide-react';
import { useEditor } from '../store';
import { IconButton, PromptDialog } from '../../ui/components';
import { flushSave } from '../persistence';
import { navigate } from '../../app/router';

export function TopBar({ onExport, onMenu }: { onExport: () => void; onMenu: () => void }) {
  const project = useEditor((s) => s.project);
  const canUndo = useEditor((s) => s.past.length > 0);
  const canRedo = useEditor((s) => s.future.length > 0);
  const saveState = useEditor((s) => s.saveState);
  const saveError = useEditor((s) => s.saveError);
  const [renaming, setRenaming] = useState(false);
  return (
    <div className="pt-safe pl-safe pr-safe border-b border-line bg-surface">
      <div className="flex h-12 items-center gap-0.5 px-1.5">
        <button
          type="button"
          onClick={async () => {
            await flushSave(true);
            navigate({ name: 'home' });
          }}
          aria-label="Editor schließen und zur Startseite"
          className="flex h-10 items-center gap-0.5 rounded-full pl-1 pr-2.5 text-[15px] font-medium text-accent"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button type="button" onClick={() => setRenaming(true)} className="min-w-0 flex-1 truncate px-1 text-center text-[15px] font-semibold" title="Projekt umbenennen">
          {project?.name}
          <span className="ml-1.5 inline-flex translate-y-[2px] items-center text-ink-2" aria-live="polite">
            {saveState === 'saving' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-label="Speichert" />
            ) : saveState === 'error' ? (
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" aria-label={saveError ?? 'Fehler beim Speichern'} />
            ) : saveState === 'saved' ? (
              <Check className="h-3.5 w-3.5 text-[#34c759]" aria-label="Gespeichert" />
            ) : null}
          </span>
        </button>
        <IconButton icon={<Undo2 />} label="Rückgängig" onClick={() => useEditor.getState().undo()} disabled={!canUndo} />
        <IconButton icon={<Redo2 />} label="Wiederholen" onClick={() => useEditor.getState().redo()} disabled={!canRedo} />
        <IconButton icon={<MoreHorizontal />} label="Projektmenü" onClick={onMenu} />
        <button type="button" onClick={onExport} className="ml-0.5 flex h-9 items-center gap-1.5 rounded-full bg-accent px-3.5 text-[14px] font-semibold text-white active:scale-95">
          <Share className="h-4 w-4" /> Sichern
        </button>
      </div>
      {saveState === 'error' && saveError && <div className="bg-red-50 px-3 py-1.5 text-[12px] text-red-700 dark:bg-red-950 dark:text-red-200">{saveError}</div>}
      <PromptDialog
        open={renaming}
        title="Projekt umbenennen"
        input
        initial={project?.name}
        confirmLabel="Sichern"
        onClose={() => setRenaming(false)}
        onConfirm={(v) => {
          useEditor.getState().rename(v);
          setRenaming(false);
        }}
      />
    </div>
  );
}
