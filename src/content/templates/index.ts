/** Vorlagen-Registry mit Kategorien, Suche und Filtern. Erweiterbar durch weitere Sets. */
import { FEIERN } from './setFeiern';
import { ALLTAG } from './setAlltag';
import type { TemplateCategory, TemplateDef } from './builder';

export type { TemplateCategory, TemplateDef } from './builder';

export const TEMPLATES: TemplateDef[] = [...FEIERN, ...ALLTAG];

export const CATEGORY_GROUPS: { name: string; cats: { id: TemplateCategory; name: string }[] }[] = [
  {
    name: 'Feiern & Anlässe',
    cats: [
      { id: 'geburtstag', name: 'Geburtstag' },
      { id: 'hochzeit', name: 'Hochzeit' },
      { id: 'hochzeitstag', name: 'Hochzeitstag' },
      { id: 'verlobung', name: 'Verlobung' },
      { id: 'baby', name: 'Geburt & Baby' },
      { id: 'jubilaeum', name: 'Jubiläum' },
      { id: 'einladung', name: 'Einladungen' },
      { id: 'glueckwunsch', name: 'Glückwünsche' },
      { id: 'danke', name: 'Dankeskarten' },
    ],
  },
  {
    name: 'Jahreszeiten & Feiertage',
    cats: [
      { id: 'fruehling', name: 'Frühling' },
      { id: 'sommer', name: 'Sommer' },
      { id: 'herbst', name: 'Herbst' },
      { id: 'winter', name: 'Winter' },
      { id: 'weihnachten', name: 'Weihnachten' },
      { id: 'silvester', name: 'Silvester' },
      { id: 'ostern', name: 'Ostern' },
      { id: 'valentinstag', name: 'Valentinstag' },
      { id: 'muttertag', name: 'Muttertag' },
      { id: 'vatertag', name: 'Vatertag' },
      { id: 'halloween', name: 'Halloween' },
    ],
  },
  {
    name: 'Alltag & Erinnerungen',
    cats: [
      { id: 'familie', name: 'Familie' },
      { id: 'freundschaft', name: 'Freundschaft' },
      { id: 'liebe', name: 'Liebe' },
      { id: 'urlaub', name: 'Urlaub' },
      { id: 'reisen', name: 'Reisen' },
      { id: 'tiere', name: 'Tiere' },
      { id: 'natur', name: 'Natur' },
      { id: 'essen', name: 'Essen' },
      { id: 'erinnerungen', name: 'Erinnerungen' },
      { id: 'vorher-nachher', name: 'Vorher-Nachher' },
    ],
  },
  {
    name: 'Künstlerische Stile',
    cats: [
      { id: 'elegant', name: 'Elegant' },
      { id: 'minimal', name: 'Minimalistisch' },
      { id: 'modern', name: 'Modern' },
      { id: 'vintage', name: 'Vintage' },
      { id: 'retro', name: 'Retro' },
      { id: 'boho', name: 'Boho' },
      { id: 'pastell', name: 'Pastell' },
      { id: 'aquarell', name: 'Aquarell' },
      { id: 'scrapbook', name: 'Scrapbook' },
      { id: 'polaroid', name: 'Polaroid' },
      { id: 'floral', name: 'Floral' },
      { id: 'glitzer', name: 'Glitzeroptik' },
      { id: 'papier', name: 'Papieroptik' },
      { id: 'luxus', name: 'Luxus' },
      { id: 'verspielt', name: 'Verspielt' },
    ],
  },
];

export const CATEGORY_NAMES = new Map(CATEGORY_GROUPS.flatMap((g) => g.cats.map((c) => [c.id, c.name] as const)));

const byId = new Map(TEMPLATES.map((t) => [t.id, t]));
export const getTemplate = (id: string) => byId.get(id);

export interface TemplateFilter {
  query?: string;
  category?: TemplateCategory | null;
  photoCount?: number | null;
  /** Format-Gruppe: 'quadrat' | 'hoch' | 'quer' */
  shape?: 'quadrat' | 'hoch' | 'quer' | null;
  cardsOnly?: boolean;
  favorites?: Set<string> | null;
}

export function formatShape(formatId: string): 'quadrat' | 'hoch' | 'quer' {
  if (formatId === '1:1') return 'quadrat';
  if (['16:9', '3:2', 'a4l'].includes(formatId)) return 'quer';
  return 'hoch';
}

export function filterTemplates(f: TemplateFilter): TemplateDef[] {
  const q = f.query?.trim().toLowerCase();
  return TEMPLATES.filter((t) => {
    if (f.category && !t.categories.includes(f.category)) return false;
    if (f.cardsOnly && !t.card) return false;
    if (f.photoCount) {
      if (f.photoCount >= 6 ? t.photoCount < 6 : t.photoCount !== f.photoCount) return false;
    }
    if (f.shape && formatShape(t.formatId) !== f.shape) return false;
    if (f.favorites && !f.favorites.has(t.id)) return false;
    if (q) {
      const hay = `${t.name} ${t.tags} ${t.categories.map((c) => CATEGORY_NAMES.get(c) ?? c).join(' ')}`.toLowerCase();
      return q.split(/\s+/).every((w) => hay.includes(w));
    }
    return true;
  });
}
