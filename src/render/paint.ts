/**
 * Natives Canvas-Zeichnen für Fotos, Rahmen, Text-Hintergründe, Formen und Zeichnungen.
 * Wird in Konva-sceneFuncs aufgerufen – identisch für Editor, Vorschau und Export.
 */
import type { FrameStyle, PhotoElement, ShadowStyle, ShapeElement, TextBackgroundKind, DrawStroke, Crop } from '../types/doc';
import { traceMaskShape, roundRectPath, tornRectPoints, polygonPath, heartPath } from '../lib/paths';
import { hashString, rng } from '../lib/util';
import { darken, lighten, rgba } from '../lib/color';
import type { Source } from '../lib/images';
import { sourceSize } from '../lib/images';

export type Ctx = CanvasRenderingContext2D;

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Aktueller Gesamtmaßstab (Leinwand-Einheit → Gerätepixel). */
export function ctxScale(ctx: Ctx): number {
  const m = ctx.getTransform();
  return Math.hypot(m.a, m.b) || 1;
}

export function applyShadow(ctx: Ctx, s: ShadowStyle | undefined, unit: number) {
  if (!s || !s.enabled) return;
  const k = ctxScale(ctx);
  ctx.shadowColor = rgba(s.color, s.opacity);
  ctx.shadowBlur = s.blur * unit * k;
  ctx.shadowOffsetX = s.offsetX * unit * k;
  ctx.shadowOffsetY = s.offsetY * unit * k;
}

export function clearShadow(ctx: Ctx) {
  ctx.shadowColor = 'rgba(0,0,0,0)';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// ---------------- Rahmen ----------------

export const FRAME_KINDS: { id: FrameStyle['kind']; name: string; defaults: Partial<FrameStyle> }[] = [
  { id: 'none', name: 'Ohne', defaults: {} },
  { id: 'classic', name: 'Klassisch', defaults: { color: '#ffffff' } },
  { id: 'polaroid', name: 'Polaroid', defaults: { color: '#fffdf8' } },
  { id: 'film', name: 'Film', defaults: { color: '#1f1f1f', accent: '#f4f1ea' } },
  { id: 'torn', name: 'Papierriss', defaults: { color: '#fbf8f2' } },
  { id: 'deckle', name: 'Vintage', defaults: { color: '#f6efe0' } },
  { id: 'stamp', name: 'Briefmarke', defaults: { color: '#fffdf8' } },
  { id: 'scallop', name: 'Wellenrand', defaults: { color: '#f9d3dc' } },
  { id: 'double', name: 'Doppellinie', defaults: { color: '#ffffff', accent: '#b88a44' } },
  { id: 'tape', name: 'Washi-Tape', defaults: { accent: '#f2b48a' } },
  { id: 'corners', name: 'Fotoecken', defaults: { accent: '#2b2b2b' } },
  { id: 'floral', name: 'Blüten', defaults: { accent: '#f4a6b8' } },
  { id: 'pencil', name: 'Bleistift', defaults: { color: '#3a3a3a' } },
];

export function frameBase(f: FrameStyle, w: number, h: number) {
  return Math.min(w, h) * (0.015 + f.thickness * 0.07);
}

export function frameInsets(f: FrameStyle, w: number, h: number): Insets {
  const b = frameBase(f, w, h);
  switch (f.kind) {
    case 'classic':
    case 'torn':
    case 'deckle':
      return { top: b, right: b, bottom: b, left: b };
    case 'scallop':
      return { top: b * 1.3, right: b * 1.3, bottom: b * 1.3, left: b * 1.3 };
    case 'stamp':
      return { top: b * 1.4, right: b * 1.4, bottom: b * 1.4, left: b * 1.4 };
    case 'double':
      return { top: b * 0.9, right: b * 0.9, bottom: b * 0.9, left: b * 0.9 };
    case 'polaroid':
      return { top: b * 0.9, right: b * 0.9, bottom: b * 3.4, left: b * 0.9 };
    case 'film':
      return { top: b * 2.2, right: b * 0.5, bottom: b * 2.2, left: b * 0.5 };
    default:
      return { top: 0, right: 0, bottom: 0, left: 0 };
  }
}

export function frameHasBack(kind: FrameStyle['kind']) {
  return ['classic', 'polaroid', 'film', 'torn', 'deckle', 'stamp', 'scallop', 'double'].includes(kind);
}

/** Umriss der Rahmenrückseite als Pfad (für Füllung und Schatten). */
function traceFrameOutline(ctx: Ctx, f: FrameStyle, w: number, h: number, seed: number) {
  const b = frameBase(f, w, h);
  switch (f.kind) {
    case 'torn': {
      const pts = tornRectPoints(b * 0.15, b * 0.15, w - b * 0.3, h - b * 0.3, b * 0.45, seed, Math.max(3, b * 0.35));
      polygonPath(ctx, pts);
      return;
    }
    case 'deckle': {
      const r = rng(seed);
      const step = Math.max(3, b * 0.5);
      const pts: [number, number][] = [];
      const amp = b * 0.22;
      const edge = (x1: number, y1: number, x2: number, y2: number, nx: number, ny: number) => {
        const n = Math.max(2, Math.round(Math.hypot(x2 - x1, y2 - y1) / step));
        for (let i = 0; i < n; i++) {
          const t = i / n;
          const j = (Math.sin(i * 1.7) * 0.5 + r() * 0.5) * amp;
          pts.push([x1 + (x2 - x1) * t - nx * j, y1 + (y2 - y1) * t - ny * j]);
        }
      };
      edge(amp, amp, w - amp, amp, 0, 1);
      edge(w - amp, amp, w - amp, h - amp, -1, 0);
      edge(w - amp, h - amp, amp, h - amp, 0, -1);
      edge(amp, h - amp, amp, amp, 1, 0);
      polygonPath(ctx, pts);
      return;
    }
    case 'stamp': {
      const r = b * 0.38;
      const nX = Math.max(3, Math.round(w / (r * 3)));
      const nY = Math.max(3, Math.round(h / (r * 3)));
      const sx = w / nX,
        sy = h / nY;
      ctx.moveTo(0, 0);
      for (let i = 0; i < nX; i++) {
        const cx = sx * (i + 0.5);
        ctx.lineTo(cx - r, 0);
        ctx.arc(cx, 0, r, Math.PI, 0, true);
      }
      ctx.lineTo(w, 0);
      for (let i = 0; i < nY; i++) {
        const cy = sy * (i + 0.5);
        ctx.lineTo(w, cy - r);
        ctx.arc(w, cy, r, -Math.PI / 2, Math.PI / 2, true);
      }
      ctx.lineTo(w, h);
      for (let i = nX - 1; i >= 0; i--) {
        const cx = sx * (i + 0.5);
        ctx.lineTo(cx + r, h);
        ctx.arc(cx, h, r, 0, Math.PI, true);
      }
      ctx.lineTo(0, h);
      for (let i = nY - 1; i >= 0; i--) {
        const cy = sy * (i + 0.5);
        ctx.lineTo(0, cy + r);
        ctx.arc(0, cy, r, Math.PI / 2, -Math.PI / 2, true);
      }
      ctx.closePath();
      return;
    }
    case 'scallop': {
      const r = b * 0.55;
      const inset = r;
      const nX = Math.max(3, Math.round((w - 2 * inset) / (r * 2)));
      const nY = Math.max(3, Math.round((h - 2 * inset) / (r * 2)));
      const sx = (w - 2 * inset) / nX,
        sy = (h - 2 * inset) / nY;
      ctx.moveTo(inset, inset);
      for (let i = 0; i < nX; i++) ctx.arc(inset + sx * (i + 0.5), inset, sx / 2, Math.PI, 0, false);
      for (let i = 0; i < nY; i++) ctx.arc(w - inset, inset + sy * (i + 0.5), sy / 2, -Math.PI / 2, Math.PI / 2, false);
      for (let i = nX - 1; i >= 0; i--) ctx.arc(inset + sx * (i + 0.5), h - inset, sx / 2, 0, Math.PI, false);
      for (let i = nY - 1; i >= 0; i--) ctx.arc(inset, inset + sy * (i + 0.5), sy / 2, Math.PI / 2, -Math.PI / 2, false);
      ctx.closePath();
      return;
    }
    case 'polaroid':
      roundRectPath(ctx, 0, 0, w, h, b * 0.12);
      return;
    default:
      roundRectPath(ctx, 0, 0, w, h, 0);
  }
}

function paintFrameBack(ctx: Ctx, f: FrameStyle, w: number, h: number, seed: number, shadow: ShadowStyle | undefined, unit: number) {
  ctx.save();
  ctx.beginPath();
  traceFrameOutline(ctx, f, w, h, seed);
  applyShadow(ctx, shadow, unit);
  ctx.fillStyle = f.color;
  ctx.fill();
  clearShadow(ctx);
  const b = frameBase(f, w, h);
  if (f.kind === 'polaroid' || f.kind === 'torn' || f.kind === 'deckle') {
    // leichte Papierstruktur
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,255,255,0.25)');
    g.addColorStop(1, 'rgba(120,100,70,0.08)');
    ctx.fillStyle = g;
    ctx.fill();
  }
  if (f.kind === 'film') {
    ctx.fillStyle = f.accent;
    const hw = b * 0.55,
      hh = b * 0.75;
    const n = Math.max(4, Math.floor(w / (hw * 2.2)));
    const gap = w / n;
    for (let i = 0; i < n; i++) {
      const x = gap * i + (gap - hw) / 2;
      for (const y of [(b * 2.2 - hh) / 2, h - b * 2.2 + (b * 2.2 - hh) / 2]) {
        ctx.beginPath();
        roundRectPath(ctx, x, y, hw, hh, hw * 0.2);
        ctx.fill();
      }
    }
  }
  if (f.kind === 'double') {
    ctx.strokeStyle = f.accent;
    ctx.lineWidth = Math.max(1, b * 0.08);
    ctx.strokeRect(b * 0.3, b * 0.3, w - b * 0.6, h - b * 0.6);
  }
  ctx.restore();
}

function tapeStrip(ctx: Ctx, cx: number, cy: number, len: number, wid: number, angle: number, color: string, seed: number) {
  const r = rng(seed);
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angle * Math.PI) / 180);
  ctx.beginPath();
  const n = 6;
  ctx.moveTo(-len / 2, -wid / 2);
  ctx.lineTo(len / 2, -wid / 2);
  for (let i = 1; i <= n; i++) ctx.lineTo(len / 2 - (i % 2 ? wid * 0.08 : 0) - r() * wid * 0.04, -wid / 2 + (wid * i) / n);
  ctx.lineTo(-len / 2, wid / 2);
  for (let i = 1; i <= n; i++) ctx.lineTo(-len / 2 + (i % 2 ? wid * 0.08 : 0) + r() * wid * 0.04, wid / 2 - (wid * i) / n);
  ctx.closePath();
  ctx.fillStyle = rgba(color, 0.82);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  ctx.fillRect(-len / 2, -wid / 2, len, wid * 0.3);
  ctx.restore();
}

function flowerCluster(ctx: Ctx, cx: number, cy: number, s: number, color: string, seed: number) {
  const r = rng(seed);
  const leafCol = '#7f9a6a';
  for (let i = 0; i < 5; i++) {
    const a = r() * Math.PI * 2;
    ctx.save();
    ctx.translate(cx + Math.cos(a) * s * 0.5, cy + Math.sin(a) * s * 0.5);
    ctx.rotate(a + Math.PI / 2);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(s * 0.18, -s * 0.3, 0, -s * 0.6);
    ctx.quadraticCurveTo(-s * 0.18, -s * 0.3, 0, 0);
    ctx.fillStyle = i % 2 ? leafCol : darken(leafCol, 0.15);
    ctx.fill();
    ctx.restore();
  }
  const flowers: [number, number, number][] = [
    [0, 0, 0.42],
    [s * 0.45, -s * 0.2, 0.28],
    [-s * 0.3, s * 0.38, 0.26],
  ];
  flowers.forEach(([dx, dy, k], fi) => {
    const fr = s * k;
    const col = fi === 1 ? lighten(color, 0.4) : color;
    for (let p = 0; p < 6; p++) {
      const a = (p / 6) * Math.PI * 2 + fi;
      ctx.beginPath();
      ctx.ellipse(cx + dx + Math.cos(a) * fr * 0.55, cy + dy + Math.sin(a) * fr * 0.55, fr * 0.45, fr * 0.3, a, 0, Math.PI * 2);
      ctx.fillStyle = col;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, fr * 0.24, 0, Math.PI * 2);
    ctx.fillStyle = '#f2c14e';
    ctx.fill();
  });
}

function paintFrameFront(ctx: Ctx, f: FrameStyle, w: number, h: number, seed: number) {
  const unit = Math.min(w, h);
  const k = 0.5 + f.thickness;
  switch (f.kind) {
    case 'tape': {
      const len = unit * 0.36 * k,
        wid = unit * 0.1 * k;
      tapeStrip(ctx, w * 0.12, h * 0.04, len, wid, -38, f.accent, seed);
      tapeStrip(ctx, w * 0.88, h * 0.04, len, wid, 38, f.accent, seed + 1);
      break;
    }
    case 'corners': {
      const s = unit * 0.16 * k;
      ctx.fillStyle = f.accent;
      const tri = (x: number, y: number, dx: number, dy: number) => {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * s, y);
        ctx.lineTo(x, y + dy * s);
        ctx.closePath();
        ctx.fill();
      };
      const o = -s * 0.15;
      tri(o, o, 1, 1);
      tri(w - o, o, -1, 1);
      tri(o, h - o, 1, -1);
      tri(w - o, h - o, -1, -1);
      break;
    }
    case 'floral': {
      const s = unit * 0.2 * k;
      flowerCluster(ctx, s * 0.25, s * 0.25, s, f.accent, seed);
      flowerCluster(ctx, w - s * 0.25, h - s * 0.25, s, f.accent, seed + 7);
      break;
    }
    case 'pencil': {
      const r = rng(seed);
      ctx.strokeStyle = rgba(f.color, 0.75);
      ctx.lineCap = 'round';
      const lw = unit * 0.006 * k;
      for (let pass = 0; pass < 3; pass++) {
        ctx.lineWidth = lw * (1 - pass * 0.25);
        const o = unit * 0.01 * pass;
        ctx.beginPath();
        const pts: [number, number][] = [
          [o - lw, o],
          [w - o, o + r() * lw * 2],
          [w - o + r() * lw * 2, h - o],
          [o, h - o - r() * lw * 2],
          [o + r() * lw, -lw * 2],
        ];
        ctx.moveTo(pts[0]![0], pts[0]![1]);
        for (let i = 1; i < pts.length; i++) {
          const [x, y] = pts[i]!;
          const [px, py] = pts[i - 1]!;
          ctx.quadraticCurveTo((x + px) / 2 + (r() - 0.5) * lw * 6, (y + py) / 2 + (r() - 0.5) * lw * 6, x, y);
        }
        ctx.stroke();
      }
      break;
    }
  }
}

// ---------------- Fotos ----------------

export interface CoverPlacement {
  x: number;
  y: number;
  w: number;
  h: number;
  /** maximal mögliche Verschiebung (für Clamping) */
  crop: Crop;
}

/** Berechnet die Bildposition (cover) inkl. Ausschnitt und Zoom – geklemmt, damit das Feld gefüllt bleibt. */
export function coverPlacement(imgW: number, imgH: number, ax: number, ay: number, aw: number, ah: number, crop: Crop): CoverPlacement {
  const base = Math.max(aw / imgW, ah / imgH);
  const s = base * Math.max(1, crop.zoom);
  const w = imgW * s,
    h = imgH * s;
  const minCx = aw / 2 / w,
    maxCx = 1 - minCx;
  const minCy = ah / 2 / h,
    maxCy = 1 - minCy;
  const cx = Math.min(maxCx, Math.max(minCx, crop.cx));
  const cy = Math.min(maxCy, Math.max(minCy, crop.cy));
  return { x: ax + aw / 2 - cx * w, y: ay + ah / 2 - cy * h, w, h, crop: { cx, cy, zoom: Math.max(1, crop.zoom) } };
}

export function photoArea(el: PhotoElement) {
  const ins = frameInsets(el.frame, el.width, el.height);
  return { x: ins.left, y: ins.top, w: Math.max(1, el.width - ins.left - ins.right), h: Math.max(1, el.height - ins.top - ins.bottom) };
}

function tracePhotoMask(ctx: Ctx, el: PhotoElement, a: { x: number; y: number; w: number; h: number }) {
  traceMaskShape(ctx, el.shape, a.x, a.y, a.w, a.h, { radius: el.cornerRadius, points: el.points });
}

const shadowCache = new Map<string, HTMLCanvasElement>();
const srcIds = new WeakMap<object, number>();
let srcCounter = 0;
function srcId(s: object): number {
  let v = srcIds.get(s);
  if (v === undefined) {
    v = ++srcCounter;
    srcIds.set(s, v);
  }
  return v;
}

export interface PaintPhotoOpts {
  editor: boolean;
  /** Platzhalter-Illustration für leere Felder */
  placeholder: Source | null;
  highlight?: boolean;
}

export function paintPhoto(ctx: Ctx, el: PhotoElement, src: Source | null, opts: PaintPhotoOpts) {
  const w = el.width,
    h = el.height;
  const unit = Math.min(w, h);
  const seed = hashString(el.id);
  const a = photoArea(el);
  const hasBack = frameHasBack(el.frame.kind);
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (hasBack) {
    paintFrameBack(ctx, el.frame, w, h, seed, el.shadow, unit);
  } else if (el.shadow.enabled) {
    if (el.mask.length && src) {
      // Schatten folgt der freigestellten Kontur
      const k = ctxScale(ctx);
      const cw = Math.max(1, Math.ceil(a.w * k)),
        ch = Math.max(1, Math.ceil(a.h * k));
      const key = `${el.id}|${cw}x${ch}|${JSON.stringify([el.crop, el.shape, el.cornerRadius, el.points, el.flipX, el.flipY])}|${srcId(src)}`;
      let off = shadowCache.get(key);
      if (!off && cw * ch < 9_000_000) {
        off = document.createElement('canvas');
        off.width = cw;
        off.height = ch;
        const o = off.getContext('2d')!;
        o.scale(k, k);
        o.translate(-a.x, -a.y);
        drawPhotoContent(o, el, src, a);
        if (shadowCache.size > 24) {
          const first = shadowCache.keys().next().value;
          if (first) shadowCache.delete(first);
        }
        shadowCache.set(key, off);
      }
      if (off) {
        ctx.save();
        applyShadow(ctx, el.shadow, unit);
        ctx.drawImage(off, a.x, a.y, a.w, a.h);
        ctx.restore();
        paintBorderAndFront(ctx, el, a, seed);
        ctx.restore();
        return;
      }
    }
    // Nur den Schatten zeichnen (Form wird außerhalb verschoben)
    ctx.save();
    const k = ctxScale(ctx);
    const far = 100000;
    ctx.translate(-far / k, 0);
    applyShadow(ctx, el.shadow, unit);
    ctx.shadowOffsetX += far;
    ctx.beginPath();
    tracePhotoMask(ctx, el, a);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
  }

  drawPhotoContent(ctx, el, src ?? opts.placeholder, a);

  if (!src && opts.editor) {
    // Hinweis "Foto hinzufügen"
    const k = ctxScale(ctx);
    const r = Math.min(Math.max(Math.min(a.w, a.h) * 0.13, 16 / k), 30 / k);
    const cx = a.x + a.w / 2,
      cy = a.y + a.h / 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,60,60,0.85)';
    ctx.lineWidth = r * 0.14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.45, cy);
    ctx.lineTo(cx + r * 0.45, cy);
    ctx.moveTo(cx, cy - r * 0.45);
    ctx.lineTo(cx, cy + r * 0.45);
    ctx.stroke();
  }
  paintBorderAndFront(ctx, el, a, seed);
  if (opts.highlight) {
    const k = ctxScale(ctx);
    ctx.beginPath();
    tracePhotoMask(ctx, el, a);
    ctx.strokeStyle = '#ff5a7a';
    ctx.lineWidth = 4 / k;
    ctx.setLineDash([10 / k, 6 / k]);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPhotoContent(ctx: Ctx, el: PhotoElement, src: Source | null, a: { x: number; y: number; w: number; h: number }) {
  ctx.save();
  ctx.beginPath();
  tracePhotoMask(ctx, el, a);
  ctx.clip();
  if (src) {
    const { w: iw, h: ih } = sourceSize(src);
    const p = coverPlacement(iw, ih, a.x, a.y, a.w, a.h, el.crop);
    if (el.flipX || el.flipY) {
      const cx = a.x + a.w / 2,
        cy = a.y + a.h / 2;
      ctx.translate(cx, cy);
      ctx.scale(el.flipX ? -1 : 1, el.flipY ? -1 : 1);
      ctx.translate(-cx, -cy);
    }
    ctx.drawImage(src, p.x, p.y, p.w, p.h);
  } else {
    ctx.fillStyle = '#ece7e1';
    ctx.fillRect(a.x, a.y, a.w, a.h);
  }
  ctx.restore();
}

function paintBorderAndFront(ctx: Ctx, el: PhotoElement, a: { x: number; y: number; w: number; h: number }, seed: number) {
  if (el.border.width > 0) {
    ctx.save();
    ctx.beginPath();
    tracePhotoMask(ctx, el, a);
    ctx.clip();
    ctx.beginPath();
    tracePhotoMask(ctx, el, a);
    ctx.strokeStyle = el.border.color;
    ctx.lineWidth = el.border.width * 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
  }
  paintFrameFront(ctx, el.frame, el.width, el.height, seed);
}

// ---------------- Text-Hintergründe ----------------

export function paintTextBackground(ctx: Ctx, kind: TextBackgroundKind, color: string, opacity: number, w: number, h: number, seed: number) {
  if (kind === 'none') return;
  ctx.save();
  ctx.globalAlpha *= opacity;
  ctx.fillStyle = color;
  ctx.beginPath();
  switch (kind) {
    case 'solid':
      roundRectPath(ctx, 0, 0, w, h, Math.min(w, h) * 0.08);
      ctx.fill();
      break;
    case 'pill':
      roundRectPath(ctx, 0, 0, w, h, h / 2);
      ctx.fill();
      break;
    case 'paper': {
      const pts = tornRectPoints(0, 0, w, h, Math.min(w, h) * 0.06, seed, Math.max(4, Math.min(w, h) * 0.05));
      polygonPath(ctx, pts);
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = Math.min(w, h) * 0.06 * ctxScale(ctx);
      ctx.shadowOffsetY = Math.min(w, h) * 0.02 * ctxScale(ctx);
      ctx.fill();
      break;
    }
    case 'tape': {
      clearShadow(ctx);
      ctx.restore();
      ctx.save();
      ctx.globalAlpha *= opacity;
      tapeStrip(ctx, w / 2, h / 2, w, h, -1.5, color, seed);
      break;
    }
    case 'label': {
      const p = h * 0.45;
      ctx.moveTo(0, h * 0.12);
      ctx.quadraticCurveTo(0, 0, h * 0.12, 0);
      ctx.lineTo(w - p, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w - p, h);
      ctx.lineTo(h * 0.12, h);
      ctx.quadraticCurveTo(0, h, 0, h - h * 0.12);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(w - p * 0.85, h / 2, h * 0.09, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fill();
      break;
    }
    case 'note': {
      ctx.shadowColor = 'rgba(0,0,0,0.2)';
      ctx.shadowBlur = Math.min(w, h) * 0.08 * ctxScale(ctx);
      ctx.shadowOffsetY = Math.min(w, h) * 0.03 * ctxScale(ctx);
      ctx.moveTo(0, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.86);
      ctx.quadraticCurveTo(w * 0.96, h, w * 0.82, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      clearShadow(ctx);
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, w, h * 0.12);
      break;
    }
    case 'brush': {
      const r = rng(seed);
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const yo = (r() - 0.5) * h * 0.18;
        ctx.ellipse(w / 2 + (r() - 0.5) * w * 0.04, h / 2 + yo, w / 2 - r() * w * 0.03, h * (0.36 + r() * 0.1), (r() - 0.5) * 0.04, 0, Math.PI * 2);
        ctx.globalAlpha = opacity * 0.55;
        ctx.fill();
      }
      break;
    }
  }
  ctx.restore();
}

// ---------------- Formen ----------------

export function paintShape(ctx: Ctx, el: ShapeElement) {
  const w = el.width,
    h = el.height;
  ctx.save();
  if (el.shape === 'line' || el.shape === 'arrow') {
    const sw = Math.max(1, el.strokeWidth);
    ctx.strokeStyle = el.stroke || '#2b2b2b';
    ctx.fillStyle = el.stroke || '#2b2b2b';
    ctx.lineWidth = sw;
    ctx.lineCap = 'round';
    if (el.dashed) ctx.setLineDash([sw * 2.5, sw * 2]);
    const head = el.shape === 'arrow' ? Math.min(w * 0.3, sw * 4) : 0;
    ctx.beginPath();
    ctx.moveTo(sw / 2, h / 2);
    ctx.lineTo(w - head * 0.8 - sw / 2, h / 2);
    ctx.stroke();
    if (head) {
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(w, h / 2);
      ctx.lineTo(w - head, h / 2 - head * 0.6);
      ctx.lineTo(w - head, h / 2 + head * 0.6);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    return;
  }
  ctx.beginPath();
  if (el.shape === 'heart') heartPath(ctx, 0, 0, w, h);
  else traceMaskShape(ctx, el.shape, 0, 0, w, h, { radius: el.cornerRadius });
  if (el.fill) {
    ctx.fillStyle = el.fill;
    ctx.fill();
  }
  if (el.stroke && el.strokeWidth > 0) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth;
    ctx.lineJoin = 'round';
    if (el.dashed) ctx.setLineDash([el.strokeWidth * 3, el.strokeWidth * 2]);
    ctx.stroke();
  }
  ctx.restore();
}

// ---------------- Zeichnungen ----------------

const drawingCache = new WeakMap<DrawStroke[], { key: string; canvas: HTMLCanvasElement }>();

function strokePath(o: CanvasRenderingContext2D, s: DrawStroke) {
  const p = s.points;
  o.beginPath();
  if (p.length === 2) {
    o.arc(p[0]!, p[1]!, s.width / 2, 0, Math.PI * 2);
    o.fill();
    return;
  }
  o.moveTo(p[0]!, p[1]!);
  for (let i = 2; i + 3 < p.length; i += 2) {
    const mx = (p[i]! + p[i + 2]!) / 2,
      my = (p[i + 1]! + p[i + 3]!) / 2;
    o.quadraticCurveTo(p[i]!, p[i + 1]!, mx, my);
  }
  if (p.length >= 4) o.lineTo(p[p.length - 2]!, p[p.length - 1]!);
  o.stroke();
}

/** Zeichnet alle Striche in ein Offscreen-Canvas (damit der Radierer nur die Zeichnung betrifft). */
export function paintDrawing(ctx: Ctx, strokes: DrawStroke[], w: number, h: number, live?: DrawStroke | null) {
  const k = ctxScale(ctx);
  const cw = Math.max(1, Math.min(4096, Math.ceil(w * k)));
  const ch = Math.max(1, Math.min(4096, Math.ceil(h * k)));
  const sx = cw / w,
    sy = ch / h;
  const key = `${cw}x${ch}`;
  let entry = drawingCache.get(strokes);
  if (!entry || entry.key !== key) {
    const c = entry?.canvas ?? document.createElement('canvas');
    c.width = cw;
    c.height = ch;
    const o = c.getContext('2d')!;
    o.setTransform(sx, 0, 0, sy, 0, 0);
    for (const s of strokes) drawStroke(o, s);
    entry = { key, canvas: c };
    drawingCache.set(strokes, entry);
  }
  if (live) {
    // Live-Strich auf eine Kopie zeichnen
    const tmp = document.createElement('canvas');
    tmp.width = cw;
    tmp.height = ch;
    const o = tmp.getContext('2d')!;
    o.drawImage(entry.canvas, 0, 0);
    o.setTransform(sx, 0, 0, sy, 0, 0);
    drawStroke(o, live);
    ctx.drawImage(tmp, 0, 0, w, h);
    tmp.width = tmp.height = 1;
    return;
  }
  ctx.drawImage(entry.canvas, 0, 0, w, h);
}

function drawStroke(o: CanvasRenderingContext2D, s: DrawStroke) {
  o.save();
  o.lineCap = 'round';
  o.lineJoin = 'round';
  o.lineWidth = s.width;
  if (s.tool === 'erase') {
    o.globalCompositeOperation = 'destination-out';
    o.strokeStyle = '#000';
    o.fillStyle = '#000';
  } else {
    o.globalAlpha = s.opacity * (s.tool === 'marker' ? 0.5 : 1);
    o.strokeStyle = s.color;
    o.fillStyle = s.color;
  }
  strokePath(o, s);
  o.restore();
}

export { heartPath };
