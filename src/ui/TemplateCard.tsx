/** Vorlagenkarte mit verzögert gerendertem Vorschaubild. */
import { useRef } from 'react';
import { Heart, Images } from 'lucide-react';
import type { TemplateDef } from '../content/templates';
import { useInView, useTemplateThumb } from '../lib/thumbs';
import { getFormat } from '../content/formats';
import { cx } from './components';

export function TemplateCard({ t, onOpen, fav, onFav, compact }: { t: TemplateDef; onOpen: () => void; fav?: boolean; onFav?: () => void; compact?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref);
  const url = useTemplateThumb(t.id, inView);
  const f = getFormat(t.formatId)!;
  return (
    <div ref={ref} className={cx('relative', compact ? 'w-[132px] shrink-0' : '')}>
      <button type="button" onClick={onOpen} className="block w-full text-left active:scale-[0.98]">
        <div className="flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-surface-2 p-2 shadow-sm">
          {url ? (
            <img src={url} alt={t.name} className="max-h-full max-w-full rounded-md object-contain shadow" draggable={false} />
          ) : (
            <div className="skeleton rounded-md" style={{ aspectRatio: `${f.width} / ${f.height}`, width: f.width >= f.height ? '100%' : 'auto', height: f.width < f.height ? '100%' : 'auto' }} />
          )}
        </div>
        <div className="mt-1.5 px-0.5">
          <div className="truncate text-[13px] font-semibold">{t.name}</div>
          {!compact && (
            <div className="flex items-center gap-1 text-[11px] text-ink-2">
              <Images className="h-3 w-3" /> {t.photoCount} {t.photoCount === 1 ? 'Foto' : 'Fotos'} · {f.hint}
            </div>
          )}
        </div>
      </button>
      {onFav && (
        <button
          type="button"
          aria-label={fav ? 'Aus Favoriten entfernen' : 'Als Favorit markieren'}
          onClick={onFav}
          className="absolute right-1.5 top-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 shadow-sm backdrop-blur"
        >
          <Heart className={cx('h-4 w-4', fav ? 'fill-accent text-accent' : 'text-neutral-600')} />
        </button>
      )}
    </div>
  );
}
