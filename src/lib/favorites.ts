/** Favorisierte Vorlagen (in IndexedDB gespeichert). */
import { create } from 'zustand';
import { kvGet, kvSet } from './db';

interface FavState {
  ids: Set<string>;
  loaded: boolean;
  load(): Promise<void>;
  toggle(id: string): void;
}

export const useFavorites = create<FavState>((set, get) => ({
  ids: new Set(),
  loaded: false,
  async load() {
    if (get().loaded) return;
    const list = await kvGet<string[]>('favorites', []);
    set({ ids: new Set(list), loaded: true });
  },
  toggle(id) {
    const ids = new Set(get().ids);
    if (ids.has(id)) ids.delete(id);
    else ids.add(id);
    set({ ids });
    void kvSet('favorites', [...ids]);
  },
}));
