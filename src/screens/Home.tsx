/** Startbildschirm. */
import { useEffect, useState } from 'react';
import { Search, Settings, LayoutGrid, LayoutTemplate, PenTool, Mail, FolderOpen, ChevronRight, Images } from 'lucide-react';
import { navigate } from '../app/router';
import { startFreeDesign, startNewCollage, startEmptyCollage, openTemplate } from '../app/flows';
import { listProjects, kvGet } from '../lib/db';
import type { ProjectMeta } from '../types/doc';
import { useProjectThumb } from '../lib/thumbs';
import { TEMPLATES, getTemplate } from '../content/templates';
import { TemplateCard } from '../ui/TemplateCard';
import { FormatPickerSheet, SettingsSheet, InstallHint } from '../ui/sheets';
import { formatDate } from '../lib/util';

function ProjectTile({ p }: { p: ProjectMeta }) {
  const url = useProjectThumb(p.id, p.updatedAt);
  return (
    <button type="button" onClick={() => navigate({ name: 'editor', id: p.id })} className="w-[132px] shrink-0 text-left active:scale-[0.98]">
      <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-surface-2 p-2 shadow-sm">
        {url ? <img src={url} alt="" className="max-h-full max-w-full rounded-md object-contain shadow" /> : <div className="skeleton h-full w-full rounded-md" />}
      </div>
      <div className="mt-1.5 truncate px-0.5 text-[13px] font-semibold">{p.name}</div>
      <div className="truncate px-0.5 text-[11px] text-ink-2">{formatDate(p.updatedAt)}</div>
    </button>
  );
}

export function HomeScreen() {
  const [projects, setProjects] = useState<ProjectMeta[]>([]);
  const [recentTpl, setRecentTpl] = useState<string[]>([]);
  const [formatFor, setFormatFor] = useState<null | 'free' | 'collage'>(null);
  const [settings, setSettings] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    void listProjects().then(setProjects);
    void kvGet<string[]>('recentTemplates', []).then(setRecentTpl);
  }, []);

  const featured = ['geburtstag-notizbuch', 'erinnerungen-vintage', 'sommer-strand', 'hochzeit-aquarell', 'freundschaft', 'retro-70er', 'polaroid-wand', 'baby-willkommen']
    .map((id) => getTemplate(id))
    .filter((t): t is NonNullable<typeof t> => !!t);

  const tile = (icon: React.ReactNode, title: string, sub: string, onClick: () => void, tint: string) => (
    <button type="button" onClick={onClick} className="flex flex-col items-start gap-2 rounded-3xl bg-surface p-4 text-left shadow-sm active:scale-[0.98]">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl [&>svg]:h-5 [&>svg]:w-5" style={{ background: tint }}>
        {icon}
      </span>
      <span>
        <span className="block text-[15px] font-semibold leading-tight">{title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-2">{sub}</span>
      </span>
    </button>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="pt-safe pl-safe pr-safe pb-safe">
      <div className="mx-auto max-w-3xl px-4 pb-10">
        <header className="flex items-center justify-between pb-3 pt-4">
          <div>
            <h1 className="font-display text-[30px] font-bold leading-none tracking-tight">PhotoStudio</h1>
            <p className="mt-1 text-[13px] text-ink-2">Collagen, Karten & Scrapbooks</p>
          </div>
          <button type="button" aria-label="Einstellungen" onClick={() => setSettings(true)} className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm">
            <Settings className="h-5 w-5" />
          </button>
        </header>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ name: 'templates', query: q.trim() || undefined });
          }}
          className="mb-4 flex items-center gap-2 rounded-2xl bg-surface px-3.5 shadow-sm"
        >
          <Search className="h-4 w-4 text-ink-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} type="search" enterKeyHint="search" placeholder="Vorlagen, Designs und Motive suchen" className="h-12 w-full bg-transparent outline-none" />
        </form>

        <button
          type="button"
          onClick={startNewCollage}
          className="relative mb-3 flex w-full items-center gap-4 overflow-hidden rounded-3xl p-5 text-left text-white shadow-md active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #ff9a7a 0%, #e5566e 60%, #c2185b 100%)' }}
        >
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20">
            <LayoutGrid className="h-7 w-7" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[19px] font-bold leading-tight">Neue Collage erstellen</span>
            <span className="mt-1 block text-[13px] text-white/85">Fotos wählen – das passende Raster entsteht automatisch</span>
          </span>
          <ChevronRight className="h-6 w-6 shrink-0 opacity-80" />
        </button>
        <button type="button" onClick={() => setFormatFor('collage')} className="mb-4 ml-1 flex items-center gap-1.5 text-[13px] font-medium text-accent">
          <Images className="h-4 w-4" /> Erst Raster wählen, Fotos später einfügen
        </button>

        <div className="grid grid-cols-2 gap-3">
          {tile(<LayoutTemplate className="text-[#7a5cc9]" />, 'Vorlagen entdecken', `${TEMPLATES.length} gestaltete Vorlagen`, () => navigate({ name: 'templates' }), '#ece6fb')}
          {tile(<PenTool className="text-[#2f7a4b]" />, 'Freies Design', 'Leere Leinwand in jedem Format', () => setFormatFor('free'), '#e3f4dc')}
          {tile(<Mail className="text-[#d9480f]" />, 'Grußkarten gestalten', 'Geburtstag, Hochzeit, Danke …', () => navigate({ name: 'templates', cards: true }), '#ffe5d0')}
          {tile(<FolderOpen className="text-[#1f6f99]" />, 'Meine Projekte', projects.length ? `${projects.length} gespeichert` : 'Noch keine Projekte', () => navigate({ name: 'projects' }), '#dff3f6')}
        </div>

        {(projects.length > 0 || recentTpl.length > 0) && (
          <section className="mt-7">
            <div className="mb-2.5 flex items-baseline justify-between">
              <h2 className="text-[19px] font-bold">Zuletzt verwendet</h2>
              {projects.length > 0 && (
                <button type="button" onClick={() => navigate({ name: 'projects' })} className="text-[14px] font-medium text-accent">
                  Alle
                </button>
              )}
            </div>
            <div className="hscroll -mx-4 gap-3 px-4 pb-1">
              {projects.slice(0, 10).map((p) => (
                <ProjectTile key={p.id} p={p} />
              ))}
              {recentTpl
                .map((id) => getTemplate(id))
                .filter((t): t is NonNullable<typeof t> => !!t)
                .slice(0, 6)
                .map((t) => (
                  <TemplateCard key={'t' + t.id} t={t} compact onOpen={() => void openTemplate(t.id)} />
                ))}
            </div>
          </section>
        )}

        <section className="mt-7">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 className="text-[19px] font-bold">Beliebte Vorlagen</h2>
            <button type="button" onClick={() => navigate({ name: 'templates' })} className="text-[14px] font-medium text-accent">
              Alle
            </button>
          </div>
          <div className="hscroll -mx-4 gap-3 px-4 pb-1">
            {featured.map((t) => (
              <TemplateCard key={t.id} t={t} compact onOpen={() => void openTemplate(t.id)} />
            ))}
          </div>
        </section>

        <div className="mt-7">
          <InstallHint />
        </div>
      </div>
      </div>
      <FormatPickerSheet
        open={formatFor !== null}
        title={formatFor === 'collage' ? 'Format der Collage' : 'Format des Designs'}
        onClose={() => setFormatFor(null)}
        onPick={(id) => {
          const mode = formatFor;
          setFormatFor(null);
          if (mode === 'collage') void startEmptyCollage(id);
          else void startFreeDesign(id);
        }}
      />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} />
    </div>
  );
}
