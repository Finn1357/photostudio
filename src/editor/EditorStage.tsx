/**
 * Interaktive Arbeitsfläche: Darstellung, Auswahl, Transformationsgriffe und Touch-Gesten.
 *
 * Gesten:
 *  - 1 Finger auf Element: verschieben (Collage-Feld: Bildausschnitt verschieben)
 *  - 2 Finger: skalieren + drehen (Collage-Feld: Bild zoomen) – auf leerer Fläche: Arbeitsfläche zoomen
 *  - Antippen: auswählen · Doppeltippen: bearbeiten · Lange drücken auf Collage-Feld: Foto tauschen
 */
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Group, Layer, Line, Rect, Stage, Transformer } from 'react-konva';
import Konva from 'konva';
import type { DesignDoc, DesignElement, DrawStroke, DrawingElement, PhotoElement } from '../types/doc';
import { useEditor } from './store';
import { DocumentNodes, type RenderOpts } from '../render/Nodes';
import { addElement, getElement, swapPhotos, updateElement } from './ops';
import { newDrawing } from './factory';
import { buildTargets, snapAngle, snapBox, type Box } from './snapping';
import { coverPlacement, photoArea } from '../render/paint';
import { peekPhoto, sourceSize } from '../lib/images';
import { rotatePoint, simplifyPath, type Pt } from '../lib/geometry';
import { clamp } from '../lib/util';
import { openTextEditor, pickPhotos, deleteSelected, copySelected, paste, duplicateSelected } from './actions';
import { isTypingTarget } from '../lib/keyboard';


type Gesture =
  | { type: 'none' }
  | { type: 'konva' }
  | { type: 'pending'; start: Pt; time: number; targetId: string | null; longTimer: number }
  | { type: 'move'; start: Pt; el: DesignElement; box: Box; targets: ReturnType<typeof buildTargets> }
  | { type: 'pan-crop'; start: Pt; el: PhotoElement }
  | { type: 'pinch-el'; c0: Pt; d0: number; a0: number; el: DesignElement }
  | { type: 'pinch-crop'; c0: Pt; d0: number; el: PhotoElement }
  | { type: 'pinch-view'; c0s: Pt; d0: number; zoom0: number; pagePt: Pt }
  | { type: 'pan-view'; start: Pt; pan0: Pt }
  | { type: 'swap'; sourceId: string }
  | { type: 'draw'; points: number[]; el: DrawingElement; stroke: DrawStroke }
  | { type: 'erase'; points: number[]; el: PhotoElement }
  | { type: 'lasso'; points: number[]; el: PhotoElement };

const TAP_SLOP = 8;
const LONG_PRESS_MS = 450;
const DOUBLE_TAP_MS = 320;

function localPoint(el: DesignElement, p: Pt): Pt {
  const [rx, ry] = rotatePoint(p[0] - el.x, p[1] - el.y, -el.rotation);
  return [rx + el.width / 2, ry + el.height / 2];
}

function elementAt(doc: DesignDoc, p: Pt, filter: (e: DesignElement) => boolean): DesignElement | undefined {
  for (let i = doc.elements.length - 1; i >= 0; i--) {
    const e = doc.elements[i]!;
    if (e.hidden || !filter(e)) continue;
    const [lx, ly] = localPoint(e, p);
    if (lx >= 0 && ly >= 0 && lx <= e.width && ly <= e.height) return e;
  }
  return undefined;
}

/** Normalisierte Bildkoordinate (0..1) eines Seitenpunkts innerhalb eines Fotos. */
function photoImagePoint(el: PhotoElement, p: Pt): Pt | null {
  if (!el.assetId) return null;
  const src = peekPhoto({ assetId: el.assetId, adjust: el.adjust, mask: [] }, 'preview');
  if (!src) return null;
  const { w, h } = sourceSize(src);
  const a = photoArea(el);
  let [lx, ly] = localPoint(el, p);
  if (el.flipX) lx = 2 * (a.x + a.w / 2) - lx;
  if (el.flipY) ly = 2 * (a.y + a.h / 2) - ly;
  const pl = coverPlacement(w, h, a.x, a.y, a.w, a.h, el.crop);
  return [(lx - pl.x) / pl.w, (ly - pl.y) / pl.h];
}

function photoDisplaySize(el: PhotoElement): { w: number; h: number } | null {
  if (!el.assetId) return null;
  const src = peekPhoto({ assetId: el.assetId, adjust: el.adjust, mask: el.mask }, 'preview') ?? peekPhoto({ assetId: el.assetId, adjust: el.adjust, mask: [] }, 'preview');
  if (!src) return null;
  const { w, h } = sourceSize(src);
  const a = photoArea(el);
  const pl = coverPlacement(w, h, a.x, a.y, a.w, a.h, el.crop);
  return { w: pl.w, h: pl.h };
}

function clampCrop(el: PhotoElement, crop: PhotoElement['crop']): PhotoElement['crop'] {
  if (!el.assetId) return crop;
  const src = peekPhoto({ assetId: el.assetId, adjust: el.adjust, mask: [] }, 'preview');
  if (!src) return crop;
  const { w, h } = sourceSize(src);
  const a = photoArea(el);
  return coverPlacement(w, h, a.x, a.y, a.w, a.h, crop).crop;
}

export function EditorStage() {
  const doc = useEditor((s) => s.doc)!;
  const selectedId = useEditor((s) => s.selectedId);
  const mode = useEditor((s) => s.mode);
  const fitNonce = useEditor((s) => s.fitNonce);
  const swapSourceId = useEditor((s) => s.swapSourceId);

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [view, setView] = useState({ zoom: 1, panX: 0, panY: 0 });
  const [guides, setGuides] = useState<{ vx: number[]; hy: number[] }>({ vx: [], hy: [] });
  const [live, setLive] = useState<{ elementId: string; stroke: DrawStroke } | null>(null);
  const [overlay, setOverlay] = useState<{ points: number[]; width: number; closed: boolean } | null>(null);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  useEffect(() => setView({ zoom: 1, panX: 0, panY: 0 }), [fitNonce, doc.width, doc.height]);

  const pad = Math.max(12, Math.min(size.w, size.h) * 0.04);
  const fit = size.w > 0 ? Math.max(0.01, Math.min((size.w - pad * 2) / doc.width, (size.h - pad * 2) / doc.height)) : 0.1;
  const scale = fit * view.zoom;
  const ox = (size.w - doc.width * scale) / 2 + view.panX;
  const oy = (size.h - doc.height * scale) / 2 + view.panY;

  const live$ = useRef({ scale, ox, oy, fit, view, doc, size });
  live$.current = { scale, ox, oy, fit, view, doc, size };

  const toPage = useCallback((x: number, y: number): Pt => {
    const v = live$.current;
    return [(x - v.ox) / v.scale, (y - v.oy) / v.scale];
  }, []);

  const selected = selectedId ? getElement(doc, selectedId) : undefined;
  const isSlot = selected?.type === 'photo' && selected.slot !== undefined;

  // ---------- Transformer ----------
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const showTr = selected && !selected.locked && !isSlot && mode === 'select';
    const node = showTr ? stage.findOne('#' + selected.id) : undefined;
    tr.nodes(node ? [node] : []);
    if (selected && node) {
      if (selected.type === 'text') {
        tr.enabledAnchors(selected.curve === 0 ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right'] : ['top-left', 'top-right', 'bottom-left', 'bottom-right']);
        tr.keepRatio(true);
      } else if (selected.type === 'sticker' || selected.type === 'drawing') {
        tr.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
        tr.keepRatio(true);
      } else {
        tr.enabledAnchors(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right', 'top-center', 'bottom-center']);
        tr.keepRatio(true);
      }
    }
    tr.forceUpdate();
    tr.getLayer()?.batchDraw();
  });

  const anchorRef = useRef<string | null>(null);
  const onTransformStart = () => {
    useEditor.getState().beginGesture();
    anchorRef.current = trRef.current?.getActiveAnchor() ?? null;
  };
  const onTransformEnd = () => {
    const tr = trRef.current;
    const node = tr?.nodes()[0];
    const s = useEditor.getState();
    const el = s.doc && s.selectedId ? getElement(s.doc, s.selectedId) : undefined;
    if (!node || !el) {
      s.endGesture();
      return;
    }
    const sx = Math.abs(node.scaleX()),
      sy = Math.abs(node.scaleY());
    node.scaleX(1);
    node.scaleY(1);
    const base = { x: node.x(), y: node.y(), rotation: node.rotation() };
    const anchor = anchorRef.current ?? '';
    s.transient((d) =>
      updateElement(d, el.id, (e: DesignElement) => {
        if (e.type === 'text') {
          if (anchor === 'middle-left' || anchor === 'middle-right') return { ...e, ...base, width: Math.max(e.fontSize, e.width * sx) };
          const k = (sx + sy) / 2;
          return { ...e, ...base, fontSize: Math.max(4, e.fontSize * k), width: e.width * k, stroke: { ...e.stroke, width: e.stroke.width * k } };
        }
        if (e.type === 'drawing') {
          const k = Math.sqrt(sx * sy);
          return {
            ...e,
            ...base,
            width: e.width * sx,
            height: e.height * sy,
            strokes: e.strokes.map((st) => ({ ...st, width: st.width * k, points: st.points.map((v, i) => (i % 2 ? v * sy : v * sx)) })),
          };
        }
        return { ...e, ...base, width: Math.max(8, e.width * sx), height: Math.max(8, e.height * sy) };
      }),
    );
    s.endGesture();
  };

  // ---------- Gesten ----------
  const pointers = useRef(new Map<number, Pt>());
  const gesture = useRef<Gesture>({ type: 'none' });
  const lastTap = useRef<{ id: string | null; time: number }>({ id: null, time: 0 });
  const raf = useRef<number | null>(null);
  const pendingMove = useRef(false);

  const containerPoint = (e: PointerEvent | React.PointerEvent): Pt => {
    const r = containerRef.current!.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  };

  const findElementIdAt = (pt: Pt): string | null | 'transformer' => {
    const stage = stageRef.current;
    if (!stage) return null;
    const hit = stage.getIntersection({ x: pt[0], y: pt[1] });
    if (!hit) return null;
    let n: Konva.Node | null = hit;
    while (n) {
      if (n instanceof Konva.Transformer) return 'transformer';
      if (n.name() === 'element') return n.id();
      n = n.getParent();
    }
    return null;
  };

  const twoFingerInfo = () => {
    const pts = [...pointers.current.values()];
    const [a, b] = [pts[0]!, pts[1]!];
    return {
      cs: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] as Pt,
      d: Math.hypot(b[0] - a[0], b[1] - a[1]) || 1,
      ang: (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI,
    };
  };

  const endAll = () => {
    const g = gesture.current;
    if (g.type === 'pending') clearTimeout(g.longTimer);
    if (['move', 'pan-crop', 'pinch-el', 'pinch-crop'].includes(g.type)) useEditor.getState().endGesture();
    gesture.current = { type: 'none' };
    setGuides({ vx: [], hy: [] });
  };

  const startPinch = () => {
    const g = gesture.current;
    if (g.type === 'pending') clearTimeout(g.longTimer);
    if (g.type === 'draw' || g.type === 'erase' || g.type === 'lasso') {
      setLive(null);
      setOverlay(null);
      if (g.type === 'draw') useEditor.getState().endGesture();
    }
    if (['move', 'pan-crop'].includes(g.type)) useEditor.getState().endGesture();
    const s = useEditor.getState();
    const d = s.doc!;
    const { cs, d: dist, ang } = twoFingerInfo();
    const targetId = g.type === 'pending' ? (g.targetId ?? s.selectedId) : s.selectedId;
    const el = targetId ? getElement(d, targetId) : undefined;
    const drawingModes = s.mode !== 'select' && s.mode !== 'swap';
    if (el && !el.locked && !drawingModes) {
      if (s.selectedId !== el.id) s.select(el.id);
      s.beginGesture();
      if (el.type === 'photo' && el.slot !== undefined) {
        if (el.assetId) gesture.current = { type: 'pinch-crop', c0: toPage(cs[0], cs[1]), d0: dist, el };
        else gesture.current = { type: 'none' };
      } else gesture.current = { type: 'pinch-el', c0: toPage(cs[0], cs[1]), d0: dist, a0: ang, el };
      return;
    }
    gesture.current = { type: 'pinch-view', c0s: cs, d0: dist, zoom0: live$.current.view.zoom, pagePt: toPage(cs[0], cs[1]) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const pt = containerPoint(e);
    pointers.current.set(e.pointerId, pt);
    if (pointers.current.size === 2) {
      startPinch();
      return;
    }
    if (pointers.current.size > 2) return;
    const s = useEditor.getState();
    const d = s.doc!;
    const page = toPage(pt[0], pt[1]);
    if (s.mode === 'draw') {
      s.beginGesture();
      let el = s.drawingId ? (getElement(d, s.drawingId) as DrawingElement | undefined) : undefined;
      if (!el || el.type !== 'drawing') {
        el = newDrawing(d.width, d.height);
        const created = el;
        s.transient((doc) => addElement(doc, created));
        s.setDrawingId(el.id);
      }
      const [lx, ly] = localPoint(el, page);
      const unit = Math.min(d.width, d.height) / 1000;
      const stroke: DrawStroke = { tool: s.draw.tool, color: s.draw.color, opacity: s.draw.opacity, width: s.draw.width * unit * (s.draw.tool === 'erase' ? 2.5 : 1), points: [lx, ly] };
      gesture.current = { type: 'draw', points: [lx, ly], el, stroke };
      setLive({ elementId: el.id, stroke });
      return;
    }
    if (s.mode === 'erase' || s.mode === 'lasso') {
      const el = s.selectedId ? getElement(d, s.selectedId) : undefined;
      if (!el || el.type !== 'photo' || !el.assetId) {
        s.setMode('select');
      } else {
        gesture.current = { type: s.mode, points: [page[0], page[1]], el };
        const a = photoArea(el);
        setOverlay({ points: [page[0], page[1]], width: s.mode === 'erase' ? s.eraser.size * Math.min(a.w, a.h) : 3 / live$.current.scale, closed: false });
        return;
      }
    }
    const hit = findElementIdAt(pt);
    if (hit === 'transformer') {
      gesture.current = { type: 'konva' };
      return;
    }
    const targetId = hit;
    const longTimer = window.setTimeout(() => {
      const g = gesture.current;
      if (g.type !== 'pending' || !g.targetId) return;
      const doc2 = useEditor.getState().doc!;
      const el = getElement(doc2, g.targetId);
      if (el && el.type === 'photo' && el.assetId && el.slot !== undefined && !el.locked) {
        useEditor.getState().select(el.id);
        gesture.current = { type: 'swap', sourceId: el.id };
        navigator.vibrate?.(15);
      }
    }, LONG_PRESS_MS);
    gesture.current = { type: 'pending', start: pt, time: performance.now(), targetId, longTimer };
  };

  const processMove = () => {
    pendingMove.current = false;
    const g = gesture.current;
    const s = useEditor.getState();
    const d = s.doc;
    if (!d) return;
    const v = live$.current;
    const pts = [...pointers.current.values()];
    if (!pts.length) return;
    const pt = pts[0]!;
    switch (g.type) {
      case 'pending': {
        if (Math.hypot(pt[0] - g.start[0], pt[1] - g.start[1]) < TAP_SLOP) return;
        clearTimeout(g.longTimer);
        const el = g.targetId ? getElement(d, g.targetId) : undefined;
        if (s.mode === 'swap') {
          gesture.current = { type: 'none' };
          return;
        }
        if (el && !el.locked) {
          if (s.selectedId !== el.id) s.select(el.id);
          if (el.type === 'photo' && el.slot !== undefined) {
            if (!el.assetId) {
              gesture.current = { type: 'none' };
              return;
            }
            s.beginGesture();
            gesture.current = { type: 'pan-crop', start: toPage(g.start[0], g.start[1]), el };
          } else {
            s.beginGesture();
            const stage = stageRef.current!;
            const pageNode = stage.findOne('.page') as Konva.Group;
            const rectOf = (id: string): Box | null => {
              const n = stage.findOne('#' + id);
              if (!n) return null;
              const r = n.getClientRect({ relativeTo: pageNode, skipShadow: true, skipStroke: true });
              return { x: r.x, y: r.y, w: r.width, h: r.height };
            };
            const box = rectOf(el.id) ?? { x: el.x - el.width / 2, y: el.y - el.height / 2, w: el.width, h: el.height };
            const others = d.elements
              .filter((o) => o.id !== el.id && !o.hidden && o.type !== 'drawing')
              .slice(-24)
              .map((o) => rectOf(o.id))
              .filter((b): b is Box => !!b);
            gesture.current = { type: 'move', start: toPage(g.start[0], g.start[1]), el, box, targets: buildTargets(d.width, d.height, others) };
          }
          processMove();
          return;
        }
        if (v.view.zoom > 1.01) {
          gesture.current = { type: 'pan-view', start: g.start, pan0: [v.view.panX, v.view.panY] };
          processMove();
          return;
        }
        gesture.current = { type: 'none' };
        return;
      }
      case 'move': {
        const p = toPage(pt[0], pt[1]);
        let dx = p[0] - g.start[0],
          dy = p[1] - g.start[1];
        const box = { ...g.box, x: g.box.x + dx, y: g.box.y + dy };
        const snap = snapBox(box, g.targets, 7 / v.scale);
        dx += snap.dx;
        dy += snap.dy;
        setGuides((prev) => (prev.vx.join() === snap.vx.join() && prev.hy.join() === snap.hy.join() ? prev : { vx: snap.vx, hy: snap.hy }));
        s.transient((doc) => updateElement(doc, g.el.id, { x: g.el.x + dx, y: g.el.y + dy }));
        return;
      }
      case 'pan-crop': {
        const p = toPage(pt[0], pt[1]);
        let [ldx, ldy] = rotatePoint(p[0] - g.start[0], p[1] - g.start[1], -g.el.rotation);
        if (g.el.flipX) ldx = -ldx;
        if (g.el.flipY) ldy = -ldy;
        const disp = photoDisplaySize(g.el);
        if (!disp) return;
        const crop = clampCrop(g.el, { ...g.el.crop, cx: g.el.crop.cx - ldx / disp.w, cy: g.el.crop.cy - ldy / disp.h });
        s.transient((doc) => updateElement<PhotoElement>(doc, g.el.id, { crop }));
        return;
      }
      case 'pan-view': {
        setView((vw) => ({ ...vw, panX: g.pan0[0] + pt[0] - g.start[0], panY: g.pan0[1] + pt[1] - g.start[1] }));
        return;
      }
      case 'pinch-el':
      case 'pinch-crop':
      case 'pinch-view': {
        if (pointers.current.size < 2) return;
        const { cs, d: dist, ang } = twoFingerInfo();
        const k = dist / g.d0;
        if (g.type === 'pinch-view') {
          const zoom = clamp(g.zoom0 * k, 0.4, 8);
          const sc = v.fit * zoom;
          setView({
            zoom,
            panX: cs[0] - g.pagePt[0] * sc - (v.size.w - d.width * sc) / 2,
            panY: cs[1] - g.pagePt[1] * sc - (v.size.h - d.height * sc) / 2,
          });
          return;
        }
        const c1 = toPage(cs[0], cs[1]);
        if (g.type === 'pinch-crop') {
          const disp = photoDisplaySize({ ...g.el, crop: { ...g.el.crop, zoom: 1 } });
          if (!disp) return;
          const zoom = clamp(g.el.crop.zoom * k, 1, 10);
          let [ldx, ldy] = rotatePoint(c1[0] - g.c0[0], c1[1] - g.c0[1], -g.el.rotation);
          if (g.el.flipX) ldx = -ldx;
          if (g.el.flipY) ldy = -ldy;
          const crop = clampCrop(g.el, { zoom, cx: g.el.crop.cx - ldx / (disp.w * zoom), cy: g.el.crop.cy - ldy / (disp.h * zoom) });
          s.transient((doc) => updateElement<PhotoElement>(doc, g.el.id, { crop }));
          return;
        }
        const dr = ang - g.a0;
        const rel = rotatePoint(g.el.x - g.c0[0], g.el.y - g.c0[1], dr);
        const rotation = snapAngle(g.el.rotation + dr, 3);
        const minSize = Math.min(d.width, d.height) * 0.02;
        const kk = Math.max(k, minSize / Math.min(g.el.width, g.el.height));
        s.transient((doc) =>
          updateElement(doc, g.el.id, (e: DesignElement) => {
            const pos = { x: c1[0] + rel[0] * kk, y: c1[1] + rel[1] * kk, rotation };
            const o = g.el;
            if (o.type === 'text' && e.type === 'text') return { ...e, ...pos, fontSize: o.fontSize * kk, width: o.width * kk, stroke: { ...o.stroke, width: o.stroke.width * kk } };
            if (o.type === 'drawing' && e.type === 'drawing')
              return { ...e, ...pos, width: o.width * kk, height: o.height * kk, strokes: o.strokes.map((st) => ({ ...st, width: st.width * kk, points: st.points.map((p) => p * kk) })) };
            return { ...e, ...pos, width: o.width * kk, height: o.height * kk };
          }),
        );
        return;
      }
      case 'swap': {
        const p = toPage(pt[0], pt[1]);
        const target = elementAt(d, p, (e) => e.type === 'photo' && e.id !== g.sourceId);
        setSwapTarget(target?.id ?? null);
        return;
      }
      case 'draw': {
        const p = toPage(pt[0], pt[1]);
        const [lx, ly] = localPoint(g.el, p);
        const lastX = g.points[g.points.length - 2]!,
          lastY = g.points[g.points.length - 1]!;
        if (Math.hypot(lx - lastX, ly - lastY) < 1.5 / v.scale) return;
        g.points.push(lx, ly);
        setLive((l) => (l ? { ...l, stroke: { ...l.stroke, points: g.points.slice() } } : l));
        return;
      }
      case 'erase':
      case 'lasso': {
        const p = toPage(pt[0], pt[1]);
        g.points.push(p[0], p[1]);
        setOverlay((o) => (o ? { ...o, points: g.points.slice(), closed: g.type === 'lasso' } : o));
        return;
      }
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, containerPoint(e));
    if (!pendingMove.current) {
      pendingMove.current = true;
      raf.current = requestAnimationFrame(processMove);
    }
  };

  const handleTap = (targetId: string | null) => {
    const s = useEditor.getState();
    const d = s.doc!;
    const now = performance.now();
    const isDouble = lastTap.current.id === targetId && now - lastTap.current.time < DOUBLE_TAP_MS;
    lastTap.current = { id: targetId, time: isDouble ? 0 : now };
    if (s.mode === 'swap' && s.swapSourceId) {
      const el = targetId ? getElement(d, targetId) : undefined;
      if (el && el.type === 'photo' && el.id !== s.swapSourceId) s.commit((doc) => swapPhotos(doc, s.swapSourceId!, el.id));
      s.setSwapSource(null);
      return;
    }
    if (!targetId) {
      if (isDouble) s.requestFit();
      s.select(null);
      if (s.panel && !['background', 'layout', 'format', 'layers', 'photos', 'stickers', 'shapes'].includes(s.panel)) s.setPanel(null);
      return;
    }
    const el = getElement(d, targetId);
    if (!el) return;
    if (el.type === 'photo' && !el.assetId && !el.locked) {
      s.select(el.id);
      pickPhotos({ replaceId: el.id, multiple: true });
      return;
    }
    s.select(el.id);
    if (isDouble && !el.locked) {
      if (el.type === 'text') openTextEditor(el.id);
      else if (el.type === 'photo') s.setPanel('photo-adjust');
      else if (el.type === 'sticker') s.setPanel('sticker-color');
      else if (el.type === 'shape') s.setPanel('shape-style');
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    if (raf.current && pendingMove.current) {
      cancelAnimationFrame(raf.current);
      processMove();
    }
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    const s = useEditor.getState();
    const cancelled = e.type === 'pointercancel';
    if (pointers.current.size === 1 && (g.type === 'pinch-el' || g.type === 'pinch-crop' || g.type === 'pinch-view')) {
      // Ein Finger bleibt liegen: Geste beenden, ohne zu springen
      if (g.type !== 'pinch-view') s.endGesture();
      gesture.current = { type: 'none' };
      return;
    }
    if (pointers.current.size > 0) return;
    switch (g.type) {
      case 'pending': {
        clearTimeout(g.longTimer);
        if (!cancelled && performance.now() - g.time < 600) handleTap(g.targetId);
        gesture.current = { type: 'none' };
        return;
      }
      case 'swap': {
        if (swapTargetRef.current) s.commit((doc) => swapPhotos(doc, g.sourceId, swapTargetRef.current!));
        setSwapTarget(null);
        gesture.current = { type: 'none' };
        return;
      }
      case 'draw': {
        setLive(null);
        if (!cancelled) {
          const stroke: DrawStroke = { ...g.stroke, points: g.points.slice() };
          s.transient((doc) => updateElement<DrawingElement>(doc, g.el.id, (el) => ({ ...el, strokes: [...el.strokes, stroke] })));
        }
        s.endGesture();
        gesture.current = { type: 'none' };
        return;
      }
      case 'erase': {
        setOverlay(null);
        const el = getElement(s.doc!, g.el.id) as PhotoElement | undefined;
        if (el && !cancelled) {
          const norm: number[] = [];
          for (let i = 0; i + 1 < g.points.length; i += 2) {
            const ip = photoImagePoint(el, [g.points[i]!, g.points[i + 1]!]);
            if (ip) norm.push(ip[0], ip[1]);
          }
          const disp = photoDisplaySize(el);
          const a = photoArea(el);
          if (norm.length && disp) {
            const size = (s.eraser.size * Math.min(a.w, a.h)) / Math.min(disp.w, disp.h);
            s.commit((doc) => updateElement<PhotoElement>(doc, el.id, (p) => ({ ...p, mask: [...p.mask, { mode: s.eraser.mode, size, points: norm }] })));
          }
        }
        gesture.current = { type: 'none' };
        return;
      }
      case 'lasso': {
        setOverlay(null);
        const el = getElement(s.doc!, g.el.id) as PhotoElement | undefined;
        if (el && !cancelled && g.points.length >= 16) {
          const a = photoArea(el);
          const pts: Pt[] = [];
          for (let i = 0; i + 1 < g.points.length; i += 2) {
            const [lx, ly] = localPoint(el, [g.points[i]!, g.points[i + 1]!]);
            pts.push([clamp((lx - a.x) / a.w, 0, 1), clamp((ly - a.y) / a.h, 0, 1)]);
          }
          const simple = simplifyPath(pts, 0.006).slice(0, 90);
          if (simple.length >= 4) s.commit((doc) => updateElement<PhotoElement>(doc, el.id, { shape: 'custom', points: simple.flat() }));
        }
        s.setMode('select');
        gesture.current = { type: 'none' };
        return;
      }
      default:
        endAll();
    }
  };

  const swapTargetRef = useRef<string | null>(null);
  swapTargetRef.current = swapTarget;

  // iOS: Seiten-Zoom/Scrollen unterbinden
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const prevent = (e: Event) => e.preventDefault();
    el.addEventListener('touchmove', prevent, { passive: false });
    el.addEventListener('gesturestart', prevent);
    el.addEventListener('gesturechange', prevent);
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const cs: Pt = [e.clientX - r.left, e.clientY - r.top];
      const v = live$.current;
      const pagePt = toPage(cs[0], cs[1]);
      const zoom = clamp(v.view.zoom * Math.exp(-e.deltaY * 0.0015), 0.4, 8);
      const sc = v.fit * zoom;
      setView({ zoom, panX: cs[0] - pagePt[0] * sc - (v.size.w - v.doc.width * sc) / 2, panY: cs[1] - pagePt[1] * sc - (v.size.h - v.doc.height * sc) / 2 });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchmove', prevent);
      el.removeEventListener('gesturestart', prevent);
      el.removeEventListener('gesturechange', prevent);
      el.removeEventListener('wheel', onWheel);
    };
  }, [toPage]);

  // Tastaturkürzel (Desktop/iPad-Tastatur)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const s = useEditor.getState();
      if (s.textEditingId) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      } else if (mod && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        s.redo();
      } else if (mod && e.key.toLowerCase() === 'c') copySelected();
      else if (mod && e.key.toLowerCase() === 'v') paste();
      else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && s.selectedId) {
        e.preventDefault();
        deleteSelected();
      } else if (e.key === 'Escape') {
        s.select(null);
        s.setMode('select');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const renderOpts: RenderOpts = useMemo(
    () => ({ quality: 'preview', editor: true, viewScale: scale, swapTargetId: swapTarget ?? null, liveStroke: live }),
    [scale, swapTarget, live],
  );

  const outline = selected && (isSlot || selected.locked) ? selected : swapSourceId ? getElement(doc, swapSourceId) : undefined;
  const uiStroke = 1.5 / scale;

  return (
    <div
      ref={containerRef}
      className="editor-canvas absolute inset-0 overflow-hidden"
      style={{ touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {size.w > 0 && (
        <Stage ref={stageRef} width={size.w} height={size.h}>
          <Layer>
            <Group x={ox} y={oy} scaleX={scale} scaleY={scale} listening={false}>
              <Rect width={doc.width} height={doc.height} fill="#fff" shadowColor="#000" shadowOpacity={0.18} shadowBlur={18 / scale} shadowOffsetY={4 / scale} />
            </Group>
            <Group name="page" x={ox} y={oy} scaleX={scale} scaleY={scale} clipX={0} clipY={0} clipWidth={doc.width} clipHeight={doc.height}>
              <DocumentNodes doc={doc} opts={renderOpts} />
            </Group>
          </Layer>
          <Layer>
            <Group x={ox} y={oy} scaleX={scale} scaleY={scale} listening={false}>
              {guides.vx.map((x) => (
                <Line key={'v' + x} points={[x, -20 / scale, x, doc.height + 20 / scale]} stroke="#ff2d78" strokeWidth={uiStroke} dash={[6 / scale, 4 / scale]} />
              ))}
              {guides.hy.map((y) => (
                <Line key={'h' + y} points={[-20 / scale, y, doc.width + 20 / scale, y]} stroke="#ff2d78" strokeWidth={uiStroke} dash={[6 / scale, 4 / scale]} />
              ))}
              {outline && (
                <Rect
                  x={outline.x}
                  y={outline.y}
                  width={outline.width}
                  height={outline.height}
                  offsetX={outline.width / 2}
                  offsetY={outline.height / 2}
                  rotation={outline.rotation}
                  stroke={outline.locked ? '#8a8a8a' : '#ff5a7a'}
                  strokeWidth={2.5 / scale}
                  dash={outline.locked ? [6 / scale, 5 / scale] : undefined}
                />
              )}
              {overlay && (
                <Line
                  points={overlay.points}
                  stroke={overlay.closed ? '#ff5a7a' : 'rgba(255,90,122,0.45)'}
                  strokeWidth={overlay.closed ? 2.5 / scale : overlay.width}
                  lineCap="round"
                  lineJoin="round"
                  closed={overlay.closed}
                  fill={overlay.closed ? 'rgba(255,90,122,0.12)' : undefined}
                  dash={overlay.closed ? [8 / scale, 6 / scale] : undefined}
                />
              )}
            </Group>
            <Transformer
              ref={trRef}
              rotateAnchorOffset={34}
              anchorSize={22}
              anchorCornerRadius={11}
              anchorStroke="#ff5a7a"
              anchorFill="#ffffff"
              anchorStrokeWidth={2}
              borderStroke="#ff5a7a"
              borderStrokeWidth={1.5}
              padding={4}
              ignoreStroke
              flipEnabled={false}
              rotationSnaps={[0, 90, 180, 270]}
              rotationSnapTolerance={5}
              boundBoxFunc={(oldB, newB) => (Math.abs(newB.width) < 12 || Math.abs(newB.height) < 12 ? oldB : newB)}
              onTransformStart={onTransformStart}
              onTransformEnd={onTransformEnd}
            />
          </Layer>
        </Stage>
      )}
      {view.zoom !== 1 && (
        <button
          className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur"
          onClick={() => setView({ zoom: 1, panX: 0, panY: 0 })}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Einpassen · {Math.round(view.zoom * 100)} %
        </button>
      )}
    </div>
  );
}
