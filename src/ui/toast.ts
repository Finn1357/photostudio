/** Einfache globale Hinweis-Meldungen. */
import { create } from 'zustand';

export interface Toast {
  id: number;
  text: string;
  kind: 'info' | 'success' | 'error' | 'progress';
  progress?: number;
}

interface ToastState {
  toasts: Toast[];
  show(text: string, kind?: Toast['kind'], ms?: number): number;
  update(id: number, patch: Partial<Toast>): void;
  dismiss(id: number): void;
}

let counter = 0;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  show(text, kind = 'info', ms = 2600) {
    const id = ++counter;
    set({ toasts: [...get().toasts.filter((t) => t.kind !== kind || kind === 'error'), { id, text, kind }] });
    if (kind !== 'progress' && ms > 0) setTimeout(() => get().dismiss(id), ms);
    return id;
  },
  update(id, patch) {
    set({ toasts: get().toasts.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
  },
  dismiss(id) {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },
}));

export const toast = (text: string, kind: Toast['kind'] = 'info', ms?: number) => useToasts.getState().show(text, kind, ms);
