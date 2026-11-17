/** Minimaler Hash-Router (funktioniert auf jedem statischen Hosting und offline). */
import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'templates'; category?: string; cards?: boolean; query?: string }
  | { name: 'projects' }
  | { name: 'editor'; id: string };

export function parseHash(hash: string): Route {
  const h = hash.replace(/^#\/?/, '');
  const [path = '', qs = ''] = h.split('?');
  const params = new URLSearchParams(qs);
  const parts = path.split('/').filter(Boolean);
  if (parts[0] === 'vorlagen')
    return { name: 'templates', category: params.get('k') ?? undefined, cards: params.get('karten') === '1', query: params.get('q') ?? undefined };
  if (parts[0] === 'projekte') return { name: 'projects' };
  if (parts[0] === 'editor' && parts[1]) return { name: 'editor', id: decodeURIComponent(parts[1]) };
  return { name: 'home' };
}

export function routeToHash(r: Route): string {
  switch (r.name) {
    case 'home':
      return '#/';
    case 'projects':
      return '#/projekte';
    case 'editor':
      return `#/editor/${encodeURIComponent(r.id)}`;
    case 'templates': {
      const p = new URLSearchParams();
      if (r.category) p.set('k', r.category);
      if (r.cards) p.set('karten', '1');
      if (r.query) p.set('q', r.query);
      const s = p.toString();
      return '#/vorlagen' + (s ? '?' + s : '');
    }
  }
}

export function navigate(r: Route, replace = false) {
  const h = routeToHash(r);
  if (replace) history.replaceState(null, '', h);
  else location.hash = h;
  if (replace) window.dispatchEvent(new HashChangeEvent('hashchange'));
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash, () => '');
  return parseHash(hash);
}
