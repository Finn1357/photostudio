/** Editor-Zustand mit Undo/Redo (Schnappschuss-basiert, strukturelles Teilen). */
import { create } from 'zustand';
import type { DesignDoc, DesignElement, ProjectRecord } from '../types/doc';

export type PanelId =
  | 'photos'
  | 'layout'
  | 'background'
  | 'stickers'
  | 'shapes'
  | 'draw'
  | 'format'
  | 'layers'
  | 'text-font'
  | 'text-color'
  | 'text-style'
  | 'text-spacing'
  | 'text-presets'
  | 'photo-filter'
  | 'photo-adjust'
  | 'photo-shape'
  | 'photo-frame'
  | 'photo-border'
  | 'photo-crop'
  | 'photo-erase'
  | 'opacity'
  | 'sticker-color'
  | 'shape-style'
  | 'arrange';

export type EditorMode = 'select' | 'draw' | 'erase' | 'lasso' | 'swap';

export interface DrawSettings {
  tool: 'pen' | 'marker' | 'erase';
  color: string;
  width: number;
  opacity: number;
}

export interface ProjectInfo {
  id: string;
  name: string;
  kind: ProjectRecord['kind'];
  templateId?: string;
  createdAt: number;
}

const HISTORY_LIMIT = 80;

interface EditorState {
  project: ProjectInfo | null;
  doc: DesignDoc | null;
  past: DesignDoc[];
  future: DesignDoc[];
  selectedId: string | null;
  panel: PanelId | null;
  mode: EditorMode;
  draw: DrawSettings;
  eraser: { size: number; mode: 'erase' | 'restore' };
  drawingId: string | null;
  clipboard: DesignElement | null;
  textEditingId: string | null;
  swapSourceId: string | null;
  fitNonce: number;
  saveState: 'saved' | 'dirty' | 'saving' | 'error';
  saveError: string | null;
  lastSavedAt: number;
  gestureBase: DesignDoc | null;
  lastCoalesce: { key: string; at: number } | null;

  open(p: ProjectRecord): void;
  close(): void;
  commit(fn: (d: DesignDoc) => DesignDoc, opts?: { coalesce?: string }): void;
  transient(fn: (d: DesignDoc) => DesignDoc): void;
  beginGesture(): void;
  endGesture(): void;
  undo(): void;
  redo(): void;
  select(id: string | null): void;
  setPanel(p: PanelId | null): void;
  togglePanel(p: PanelId): void;
  setMode(m: EditorMode): void;
  setDraw(p: Partial<DrawSettings>): void;
  setEraser(p: Partial<EditorState['eraser']>): void;
  setDrawingId(id: string | null): void;
  setClipboard(el: DesignElement | null): void;
  setTextEditing(id: string | null): void;
  setSwapSource(id: string | null): void;
  requestFit(): void;
  rename(name: string): void;
  setSaveState(s: EditorState['saveState'], err?: string | null): void;
}

export const useEditor = create<EditorState>((set, get) => ({
  project: null,
  doc: null,
  past: [],
  future: [],
  selectedId: null,
  panel: null,
  mode: 'select',
  draw: { tool: 'pen', color: '#2b2b2b', width: 14, opacity: 1 },
  eraser: { size: 0.06, mode: 'erase' },
  drawingId: null,
  clipboard: null,
  textEditingId: null,
  swapSourceId: null,
  fitNonce: 0,
  saveState: 'saved',
  saveError: null,
  lastSavedAt: 0,
  gestureBase: null,
  lastCoalesce: null,

  open(p) {
    set({
      project: { id: p.id, name: p.name, kind: p.kind, templateId: p.templateId, createdAt: p.createdAt },
      doc: p.doc,
      past: [],
      future: [],
      selectedId: null,
      panel: null,
      mode: 'select',
      drawingId: null,
      textEditingId: null,
      swapSourceId: null,
      saveState: 'saved',
      saveError: null,
      lastSavedAt: p.updatedAt,
      gestureBase: null,
      lastCoalesce: null,
      fitNonce: get().fitNonce + 1,
    });
  },
  close() {
    set({ project: null, doc: null, past: [], future: [], selectedId: null, panel: null, mode: 'select', textEditingId: null });
  },
  commit(fn, opts) {
    const { doc, past, lastCoalesce } = get();
    if (!doc) return;
    const next = fn(doc);
    if (next === doc) return;
    const now = performance.now();
    const coalesce = opts?.coalesce && lastCoalesce && lastCoalesce.key === opts.coalesce && now - lastCoalesce.at < 1200;
    set({
      doc: next,
      past: coalesce ? past : [...past, doc].slice(-HISTORY_LIMIT),
      future: [],
      lastCoalesce: opts?.coalesce ? { key: opts.coalesce, at: now } : null,
      saveState: 'dirty',
    });
  },
  transient(fn) {
    const { doc } = get();
    if (!doc) return;
    const next = fn(doc);
    if (next !== doc) set({ doc: next, saveState: 'dirty' });
  },
  beginGesture() {
    const { doc } = get();
    if (doc) set({ gestureBase: doc });
  },
  endGesture() {
    const { doc, gestureBase, past } = get();
    if (gestureBase && doc && doc !== gestureBase) set({ past: [...past, gestureBase].slice(-HISTORY_LIMIT), future: [], lastCoalesce: null });
    set({ gestureBase: null });
  },
  undo() {
    const { doc, past, future, selectedId } = get();
    if (!doc || !past.length) return;
    const prev = past[past.length - 1]!;
    set({
      doc: prev,
      past: past.slice(0, -1),
      future: [doc, ...future].slice(0, HISTORY_LIMIT),
      selectedId: selectedId && prev.elements.some((e) => e.id === selectedId) ? selectedId : null,
      lastCoalesce: null,
      saveState: 'dirty',
    });
  },
  redo() {
    const { doc, past, future, selectedId } = get();
    if (!doc || !future.length) return;
    const next = future[0]!;
    set({
      doc: next,
      past: [...past, doc].slice(-HISTORY_LIMIT),
      future: future.slice(1),
      selectedId: selectedId && next.elements.some((e) => e.id === selectedId) ? selectedId : null,
      lastCoalesce: null,
      saveState: 'dirty',
    });
  },
  select(id) {
    const prev = get().selectedId;
    if (prev === id) return;
    const panel = get().panel;
    // Element-spezifische Panels beim Wechsel schließen
    const keepPanels: (PanelId | null)[] = ['photos', 'layout', 'background', 'stickers', 'shapes', 'format', 'layers', 'draw'];
    set({ selectedId: id, panel: keepPanels.includes(panel) && panel !== 'stickers' ? panel : null, lastCoalesce: null });
  },
  setPanel(p) {
    set({ panel: p });
  },
  togglePanel(p) {
    set({ panel: get().panel === p ? null : p });
  },
  setMode(m) {
    set({ mode: m });
  },
  setDraw(p) {
    set({ draw: { ...get().draw, ...p } });
  },
  setEraser(p) {
    set({ eraser: { ...get().eraser, ...p } });
  },
  setDrawingId(id) {
    set({ drawingId: id });
  },
  setClipboard(el) {
    set({ clipboard: el });
  },
  setTextEditing(id) {
    set({ textEditingId: id });
  },
  setSwapSource(id) {
    set({ swapSourceId: id, mode: id ? 'swap' : 'select' });
  },
  requestFit() {
    set({ fitNonce: get().fitNonce + 1 });
  },
  rename(name) {
    const p = get().project;
    if (p) set({ project: { ...p, name }, saveState: 'dirty' });
  },
  setSaveState(s, err = null) {
    set({ saveState: s, saveError: err, ...(s === 'saved' ? { lastSavedAt: Date.now() } : {}) });
  },
}));

export function useSelectedElement(): DesignElement | undefined {
  return useEditor((s) => (s.doc && s.selectedId ? s.doc.elements.find((e) => e.id === s.selectedId) : undefined));
}

/** Kurzform für Änderungen am Dokument mit History. */
export const commit = (fn: (d: DesignDoc) => DesignDoc, opts?: { coalesce?: string }) => useEditor.getState().commit(fn, opts);

// Für automatisierte Browser-Tests im Entwicklungsmodus
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as unknown as { __ps: typeof useEditor }).__ps = useEditor;
