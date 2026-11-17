/** Projektmenü: Speichern, Umbenennen, Duplizieren, Vorlage, Sicherungsdatei. */
import { useState } from 'react';
import { Save, Pencil, CopyPlus, LayoutTemplate, FileArchive, Maximize, Loader2 } from 'lucide-react';
import { useEditor } from '../store';
import { Sheet, PromptDialog } from '../../ui/components';
import { flushSave } from '../persistence';
import { duplicateProject, getProject, saveUserTemplate, getAsset, putAsset, hasAsset } from '../../lib/db';
import { buildProjectFile } from '../../lib/projectFile';
import { renderThumbnail } from '../../render/exportDoc';
import { shareFile, downloadBlob } from '../../lib/share';
import { sanitizeFileName, uid } from '../../lib/util';
import { toast } from '../../ui/toast';
import { navigate } from '../../app/router';

export function ProjectMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const project = useEditor((s) => s.project);
  const [renaming, setRenaming] = useState(false);
  const [templating, setTemplating] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [backup, setBackup] = useState<File | null>(null);
  if (!project) return null;

  const item = (icon: React.ReactNode, label: string, sub: string, onClick: () => void, id?: string) => (
    <button type="button" onClick={onClick} disabled={!!busy} className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left active:bg-surface-2 disabled:opacity-50">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 [&>svg]:h-5 [&>svg]:w-5">{busy && busy === id ? <Loader2 className="animate-spin" /> : icon}</span>
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        <span className="block text-[12px] text-ink-2">{sub}</span>
      </span>
    </button>
  );

  const makeBackup = async () => {
    setBusy('backup');
    try {
      await flushSave();
      const p = await getProject(project.id);
      if (!p) throw new Error('Projekt nicht gefunden');
      const blob = await buildProjectFile(p, { getAsset, putAsset, hasAsset });
      setBackup(new File([blob], `${sanitizeFileName(p.name)}.photostudio.zip`, { type: 'application/zip' }));
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Sicherung fehlgeschlagen', 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <Sheet open={open} onClose={onClose} title="Projekt">
        <div className="space-y-0.5">
          {item(<Save />, 'Jetzt speichern', 'Wird zusätzlich automatisch gespeichert', async () => {
            await flushSave(true);
            toast('Projekt gespeichert', 'success', 1500);
            onClose();
          })}
          {item(<Pencil />, 'Umbenennen', project.name, () => setRenaming(true))}
          {item(<CopyPlus />, 'Duplizieren', 'Kopie als neues Projekt öffnen', async () => {
            setBusy('dup');
            await flushSave(true);
            const copy = await duplicateProject(project.id);
            setBusy(null);
            onClose();
            if (copy) {
              toast('Kopie erstellt', 'success', 1500);
              navigate({ name: 'editor', id: copy.id });
            }
          }, 'dup')}
          {item(<LayoutTemplate />, 'Als eigene Vorlage speichern', 'Erscheint unter „Vorlagen → Meine Vorlagen“', () => setTemplating(true))}
          {item(<FileArchive />, 'Projektdatei sichern', 'Vollständige Sicherung inkl. aller Bilder (.zip)', makeBackup, 'backup')}
          {item(<Maximize />, 'Arbeitsfläche einpassen', 'Zoom zurücksetzen', () => {
            useEditor.getState().requestFit();
            onClose();
          })}
        </div>
        {backup && (
          <div className="mt-3 rounded-2xl bg-surface-2 p-3">
            <p className="text-[13px]">Sicherung bereit ({(backup.size / 1024 / 1024).toFixed(1)} MB). In „Dateien“ sichern oder weitergeben:</p>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-xl bg-accent py-2.5 text-[14px] font-semibold text-white"
                onClick={async () => {
                  const r = await shareFile(backup, backup.name);
                  if (r === 'unsupported') downloadBlob(backup, backup.name);
                }}
              >
                Teilen / Sichern
              </button>
              <button type="button" className="flex-1 rounded-xl bg-surface py-2.5 text-[14px] font-semibold" onClick={() => downloadBlob(backup, backup.name)}>
                Herunterladen
              </button>
            </div>
          </div>
        )}
      </Sheet>
      <PromptDialog
        open={renaming}
        title="Projekt umbenennen"
        input
        initial={project.name}
        confirmLabel="Sichern"
        onClose={() => setRenaming(false)}
        onConfirm={(v) => {
          useEditor.getState().rename(v);
          setRenaming(false);
        }}
      />
      <PromptDialog
        open={templating}
        title="Als Vorlage speichern"
        message="Die aktuelle Gestaltung inklusive Bilder wird als eigene Vorlage gespeichert."
        input
        initial={project.name}
        confirmLabel="Speichern"
        onClose={() => setTemplating(false)}
        onConfirm={async (name) => {
          setTemplating(false);
          const doc = useEditor.getState().doc;
          if (!doc) return;
          const thumb = await renderThumbnail(doc, 420).catch(() => undefined);
          await saveUserTemplate({ id: uid('utpl'), name, createdAt: Date.now(), doc: structuredClone(doc), thumb });
          toast('Vorlage gespeichert', 'success');
        }}
      />
    </>
  );
}
