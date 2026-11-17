/** Vorlagenkatalog mit Kategorien, Suche, Filtern und Favoriten. */
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, Search, Heart, Trash2, SlidersHorizontal } from 'lucide-react';
import { navigate } from '../app/router';
import { CATEGORY_GROUPS, CATEGORY_NAMES, filterTemplates, type TemplateCategory } from '../content/templates';
import { TemplateCard } from '../ui/TemplateCard';
import { Chip, PromptDialog, cx } from '../ui/components';
import { openTemplate, openUserTemplate, startWithSticker } from '../app/flows';
import { useFavorites } from '../lib/favorites';
import { deleteUserTemplate, listUserTemplates } from '../lib/db';
import type { UserTemplateRecord } from '../types/doc';
import { searchStickers, stickerThumb } from '../content/stickers';

function UserTemplateCard({ t, onDelete }: { t: UserTemplateRecord; onDelete: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!t.thumb) return;
    const u = URL.createObjectURL(t.thumb);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [t.thumb]);
  return (
    <div className="relative w-[132px] shrink-0">
      <button type="button" onClick={() => void openUserTemplate(t)} className="block w-full text-left">
        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-surface-2 p-2 shadow-sm">
          {url ? <img src={url} alt="" className="max-h-full max-w-full rounded-md object-contain shadow" /> : <div className="skeleton h-full w-full rounded-md" />}
        </div>
        <div className="mt-1.5 truncate px-0.5 text-[13px] font-semibold">{t.name}</div>
      </button>
      <button type="button" aria-label="Vorlage löschen" onClick={onDelete} className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-neutral-600 shadow-sm">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function TemplatesScreen({ category, cards, query }: { category?: string; cards?: boolean; query?: string }) {
  const [q, setQ] = useState(query ?? '');
  const [cat, setCat] = useState<TemplateCategory | null>((category as TemplateCategory) ?? null);
  const [count, setCount] = useState<number | null>(null);
  const [shape, setShape] = useState<'quadrat' | 'hoch' | 'quer' | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userTpl, setUserTpl] = useState<UserTemplateRecord[]>([]);
  const [toDelete, setToDelete] = useState<UserTemplateRecord | null>(null);
  const fav = useFavorites();

  useEffect(() => {
    void fav.load();
    void listUserTemplates().then(setUserTpl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(
    () => filterTemplates({ query: q, category: cat, photoCount: count, shape, cardsOnly: cards, favorites: favOnly ? fav.ids : null }),
    [q, cat, count, shape, cards, favOnly, fav.ids],
  );
  const stickers = useMemo(() => (q.trim().length >= 2 ? searchStickers(q).slice(0, 24) : []), [q]);
  const activeFilters = (count ? 1 : 0) + (shape ? 1 : 0) + (favOnly ? 1 : 0);

  return (
    <div className="flex h-full flex-col">
      <div className="pt-safe pl-safe pr-safe sticky top-0 z-10 border-b border-line bg-bg/95 backdrop-blur">
        <div className="mx-auto max-w-5xl px-3">
          <div className="flex h-12 items-center gap-1">
            <button type="button" onClick={() => navigate({ name: 'home' })} className="flex h-10 items-center pr-2 text-[15px] font-medium text-accent">
              <ChevronLeft className="h-6 w-6" /> Start
            </button>
            <h1 className="flex-1 text-center text-[17px] font-semibold">{cards ? 'Grußkarten' : 'Vorlagen'}</h1>
            <button type="button" aria-label="Filter" onClick={() => setShowFilters((v) => !v)} className={cx('relative flex h-10 w-10 items-center justify-center rounded-full', showFilters && 'bg-surface-2')}>
              <SlidersHorizontal className="h-5 w-5" />
              {activeFilters > 0 && <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold leading-4 text-white">{activeFilters}</span>}
            </button>
          </div>
          <label className="mb-2 flex items-center gap-2 rounded-xl bg-surface px-3 shadow-sm">
            <Search className="h-4 w-4 text-ink-2" />
            <input value={q} onChange={(e) => setQ(e.target.value)} type="search" placeholder="z. B. Geburtstag, Polaroid, Herbst …" className="h-10 w-full bg-transparent outline-none" />
          </label>
          {showFilters && (
            <div className="space-y-2 pb-2">
              <div className="hscroll gap-1.5">
                <Chip active={!count} onClick={() => setCount(null)}>
                  Alle Fotoanzahlen
                </Chip>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Chip key={n} active={count === n} onClick={() => setCount(n)}>
                    {n === 6 ? '6+ Fotos' : `${n} ${n === 1 ? 'Foto' : 'Fotos'}`}
                  </Chip>
                ))}
              </div>
              <div className="hscroll gap-1.5">
                <Chip active={!shape} onClick={() => setShape(null)}>
                  Alle Formate
                </Chip>
                <Chip active={shape === 'quadrat'} onClick={() => setShape('quadrat')}>
                  Quadrat
                </Chip>
                <Chip active={shape === 'hoch'} onClick={() => setShape('hoch')}>
                  Hochformat
                </Chip>
                <Chip active={shape === 'quer'} onClick={() => setShape('quer')}>
                  Querformat
                </Chip>
                <Chip active={favOnly} onClick={() => setFavOnly((v) => !v)}>
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" /> Favoriten
                  </span>
                </Chip>
              </div>
            </div>
          )}
          <div className="hscroll gap-1.5 pb-2.5">
            <Chip active={!cat} onClick={() => setCat(null)}>
              Alle
            </Chip>
            {CATEGORY_GROUPS.flatMap((g) => g.cats).map((c) => (
              <Chip key={c.id} active={cat === c.id} onClick={() => setCat(cat === c.id ? null : c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      <div className="pl-safe pr-safe min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-3">
          {userTpl.length > 0 && !q && !cat && !cards && (
            <section className="mb-5">
              <h2 className="mb-2 text-[17px] font-bold">Meine Vorlagen</h2>
              <div className="hscroll -mx-4 gap-3 px-4">
                {userTpl.map((t) => (
                  <UserTemplateCard key={t.id} t={t} onDelete={() => setToDelete(t)} />
                ))}
              </div>
            </section>
          )}
          {cat && <h2 className="mb-2 text-[17px] font-bold">{CATEGORY_NAMES.get(cat)}</h2>}
          <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((t) => (
              <TemplateCard key={t.id} t={t} fav={fav.ids.has(t.id)} onFav={() => fav.toggle(t.id)} onOpen={() => void openTemplate(t.id)} />
            ))}
          </div>
          {!list.length && <p className="py-10 text-center text-[14px] text-ink-2">Keine passenden Vorlagen gefunden.</p>}
          {stickers.length > 0 && (
            <section className="mt-6">
              <h2 className="mb-2 text-[17px] font-bold">Passende Motive</h2>
              <p className="mb-2 text-[13px] text-ink-2">Tippe auf ein Motiv, um damit ein neues Design zu beginnen.</p>
              <div className="grid grid-cols-5 gap-2 sm:grid-cols-8">
                {stickers.map((s) => (
                  <button key={s.id} type="button" title={s.name} onClick={() => void startWithSticker(s.id)} className="flex aspect-square items-center justify-center rounded-xl bg-surface p-2 shadow-sm">
                    <img src={stickerThumb(s.id)} alt={s.name} className="max-h-full max-w-full" />
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
      <PromptDialog
        open={!!toDelete}
        title="Vorlage löschen?"
        message={toDelete ? `„${toDelete.name}“ wird entfernt. Projekte, die daraus erstellt wurden, bleiben erhalten.` : ''}
        confirmLabel="Löschen"
        danger
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          await deleteUserTemplate(toDelete.id);
          setUserTpl((l) => l.filter((x) => x.id !== toDelete.id));
          setToDelete(null);
        }}
      />
    </div>
  );
}
