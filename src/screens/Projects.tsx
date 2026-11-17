/** Projektverwaltung: öffnen, umbenennen, duplizieren, sichern, importieren, löschen. */
import { useEffect, useState } from 'react';
import { ChevronLeft, Upload, MoreHorizontal, Pencil, CopyPlus, FileArchive, Trash2, FolderOpen, Plus } from 'lucide-react';
import { navigate } from '../app/router';
import { listProjects, deleteProject, duplicateProject, renameProject, getProject, getAsset, putAsset, hasAsset, saveProject, putThumb } from '../lib/db';
import type { ProjectMeta } from '../types/doc';
import { useProjectThumb } from '../lib/thumbs';
import { formatDate, sanitizeFileName } from '../lib/util';
import { PromptDialog, Sheet, PrimaryButton } from '../ui/components';
import { buildProjectFile, readProjectFile } from '../lib/projectFile';
import { pickFiles } from '../lib/assets';
import { downloadBlob, shareFile } from '../lib/share';
import { toast } from '../ui/toast';
import { renderThumbnail } from '../render/exportDoc';
import { startNewCollage } from '../app/flows';

function ProjectCard({ p, onMenu }: { p: ProjectMeta; onMenu: () => void }) {
  const url = useProjectThumb(p.id, p.updatedAt);
  return (
    <div className="relative">
      <button type="button" onClick={() => navigate({ name: 'editor', id: p.id })} className="block w-full text-left active:scale-[0.98]">
        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-surface-2 p-2 shadow-sm">
          {url ? <img src={url} alt="" className="max-h-full max-w-full rounded-md object-contain shadow" /> : <div className="skeleton h-full w-full rounded-md" />}
        </div>
        <div className="mt-1.5 px-0.5">
          <div className="truncate text-[14px] font-semibold">{p.name}</div>
          <div className="text-[11px] text-ink-2">{formatDate(p.updatedAt)}</div>
        </div>
      </button>
      <button type="button" aria-label="Projektoptionen" onClick={onMenu} className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-700 shadow-sm backdrop-blur">
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProjectsScreen() {
  const [projects, setProjects] = useState<ProjectMeta[] | null>(null);
  const [menuFor, setMenuFor] = useState<ProjectMeta | null>(null);
  const [renaming, setRenaming] = useState<ProjectMeta | null>(null);
  const [deleting, setDeleting] = useState<ProjectMeta | null>(null);
  const reload = () => void listProjects().then(setProjects);
  useEffect(reload, []);

  const importProject = () => {
    void pickFiles({ accept: '.zip,application/zip,application/x-zip-compressed' }).then(async (files) => {
      const f = files[0];
      if (!f) return;
      try {
        const p = await readProjectFile(f, { getAsset, putAsset, hasAsset });
        await saveProject(p);
        void renderThumbnail(p.doc)
          .then((b) => putThumb(`project:${p.id}`, b))
          .then(reload)
          .catch(() => undefined);
        toast(`„${p.name}“ importiert`, 'success');
        reload();
      } catch (e) {
        toast(e instanceof Error ? e.message : 'Import fehlgeschlagen', 'error', 5000);
      }
    });
  };

  const backup = async (p: ProjectMeta) => {
    const rec = await getProject(p.id);
    if (!rec) return;
    try {
      const blob = await buildProjectFile(rec, { getAsset, putAsset, hasAsset });
      const file = new File([blob], `${sanitizeFileName(rec.name)}.photostudio.zip`, { type: 'application/zip' });
      const r = await shareFile(file, rec.name);
      if (r === 'unsupported') downloadBlob(file, file.name);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Sicherung fehlgeschlagen', 'error');
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="pt-safe pl-safe pr-safe border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-5xl items-center gap-1 px-3">
          <button type="button" onClick={() => navigate({ name: 'home' })} className="flex h-10 items-center pr-2 text-[15px] font-medium text-accent">
            <ChevronLeft className="h-6 w-6" /> Start
          </button>
          <h1 className="flex-1 text-center text-[17px] font-semibold">Meine Projekte</h1>
          <button type="button" onClick={importProject} className="flex h-10 items-center gap-1 px-2 text-[14px] font-medium text-accent" title="Projektdatei importieren">
            <Upload className="h-5 w-5" /> Import
          </button>
        </div>
      </div>
      <div className="pl-safe pr-safe min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
          {projects && projects.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <FolderOpen className="h-12 w-12 text-ink-2" />
              <p className="text-[17px] font-semibold">Noch keine Projekte</p>
              <p className="max-w-xs text-[14px] text-ink-2">Deine Collagen und Designs werden automatisch hier gespeichert.</p>
              <PrimaryButton onClick={startNewCollage}>
                <Plus className="h-5 w-5" /> Neue Collage
              </PrimaryButton>
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            {projects?.map((p) => (
              <ProjectCard key={p.id} p={p} onMenu={() => setMenuFor(p)} />
            ))}
          </div>
        </div>
      </div>

      <Sheet open={!!menuFor} onClose={() => setMenuFor(null)} title={menuFor?.name ?? ''}>
        {menuFor && (
          <div className="space-y-0.5 pb-2">
            {[
              { icon: <FolderOpen />, label: 'Öffnen', fn: () => navigate({ name: 'editor', id: menuFor.id }) },
              { icon: <Pencil />, label: 'Umbenennen', fn: () => setRenaming(menuFor) },
              {
                icon: <CopyPlus />,
                label: 'Duplizieren',
                fn: async () => {
                  await duplicateProject(menuFor.id);
                  toast('Kopie erstellt', 'success', 1500);
                  reload();
                },
              },
              { icon: <FileArchive />, label: 'Projektdatei sichern', fn: () => void backup(menuFor) },
              { icon: <Trash2 />, label: 'Löschen', fn: () => setDeleting(menuFor), danger: true },
            ].map((it) => (
              <button
                key={it.label}
                type="button"
                onClick={() => {
                  setMenuFor(null);
                  void it.fn();
                }}
                className={`flex w-full items-center gap-3 rounded-2xl px-2 py-3 text-left text-[15px] active:bg-surface-2 [&>svg]:h-5 [&>svg]:w-5 ${it.danger ? 'text-red-500' : ''}`}
              >
                {it.icon}
                {it.label}
              </button>
            ))}
          </div>
        )}
      </Sheet>
      <PromptDialog
        open={!!renaming}
        title="Umbenennen"
        input
        initial={renaming?.name}
        confirmLabel="Sichern"
        onClose={() => setRenaming(null)}
        onConfirm={async (v) => {
          if (renaming) await renameProject(renaming.id, v);
          setRenaming(null);
          reload();
        }}
      />
      <PromptDialog
        open={!!deleting}
        title="Projekt löschen?"
        message={deleting ? `„${deleting.name}“ wird endgültig von diesem Gerät gelöscht.` : ''}
        confirmLabel="Löschen"
        danger
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting) await deleteProject(deleting.id);
          setDeleting(null);
          reload();
        }}
      />
    </div>
  );
}
