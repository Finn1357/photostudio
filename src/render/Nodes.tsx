/**
 * Darstellung des Dokuments mit react-konva.
 * Dieselben Komponenten rendern Editor, Vorschaubilder und den hochaufgelösten Export.
 */
import { createContext, memo, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { Group, Image as KImage, Rect, Shape, Text as KText, TextPath } from 'react-konva';
import Konva from 'konva';
import type { Background, DesignDoc, DesignElement, DrawStroke, DrawingElement, PhotoElement, ShapeElement, StickerElement, TextElement } from '../types/doc';
import {
  bgAdjust,
  getVersion,
  peekAsset,
  peekPattern,
  peekPhoto,
  peekPlaceholder,
  peekSticker,
  peekTexture,
  sourceSize,
  subscribe,
  type Quality,
  type Source,
} from '../lib/images';
import { ensureFont, fontStyleString, getFontsVersion, subscribeFonts } from '../lib/fonts';
import { paintDrawing, paintPhoto, paintShape, paintTextBackground, type Ctx } from './paint';
import { getPattern } from '../content/patterns';
import { getTexture } from '../content/textures';
import { hashString } from '../lib/util';

export interface RenderOpts {
  quality: Quality;
  editor: boolean;
  /** Weiß unter transparente Bereiche legen (JPEG) */
  opaqueBase?: boolean;
  /** Maßstab Leinwand → Bildschirm (für Trefferflächen) */
  viewScale: number;
  swapTargetId?: string | null;
  liveStroke?: { elementId: string; stroke: DrawStroke } | null;
}

const RenderCtx = createContext<RenderOpts>({ quality: 'preview', editor: false, viewScale: 1 });

export function useImageVersion() {
  return useSyncExternalStore(subscribe, getVersion, getVersion);
}
export function useFontsVersion() {
  return useSyncExternalStore(subscribeFonts, getFontsVersion, getFontsVersion);
}

const native = (c: Konva.Context) => c._context as Ctx;

function rectHit(ctx: Konva.Context, shape: Konva.Shape) {
  ctx.beginPath();
  ctx.rect(0, 0, shape.width(), shape.height());
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

/** Hält die zuletzt verfügbare Quelle, während eine neue berechnet wird (kein Flackern). */
function useStableSource(key: string | null, src: Source | null): Source | null {
  const last = useRef<{ key: string | null; src: Source | null }>({ key: null, src: null });
  if (src) {
    last.current = { key, src };
    return src;
  }
  return last.current.key === key ? last.current.src : null;
}

// ---------------- Hintergrund ----------------

function drawCover(ctx: Ctx, src: Source, W: number, H: number, scale = 1, ox = 0, oy = 0) {
  const { w: iw, h: ih } = sourceSize(src);
  const s = Math.max(W / iw, H / ih) * Math.max(1, scale);
  const dw = iw * s,
    dh = ih * s;
  const maxX = (dw - W) / 2,
    maxY = (dh - H) / 2;
  ctx.drawImage(src, (W - dw) / 2 + ox * maxX, (H - dh) / 2 + oy * maxY, dw, dh);
}

function drawTiled(ctx: Ctx, src: Source, W: number, H: number, tile: number, ox: number, oy: number) {
  const pat = ctx.createPattern(src, 'repeat');
  const { w } = sourceSize(src);
  if (!pat) return;
  const k = tile / w;
  try {
    pat.setTransform(new DOMMatrix().translate(ox * tile, oy * tile).scale(k));
    ctx.fillStyle = pat;
    ctx.fillRect(0, 0, W, H);
  } catch {
    // Fallback ohne Mustertransformation
    for (let y = -tile + ((oy * tile) % tile); y < H; y += tile) for (let x = -tile + ((ox * tile) % tile); x < W; x += tile) ctx.drawImage(src, x, y, tile, tile);
  }
}

function drawChecker(ctx: Ctx, W: number, H: number) {
  const s = Math.min(W, H) / 24;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#e6e6e6';
  for (let y = 0; y < H; y += s) for (let x = ((y / s) % 2) * s; x < W; x += s * 2) ctx.fillRect(x, y, s, s);
}

export const BackgroundNode = memo(function BackgroundNode({ bg, w, h }: { bg: Background; w: number; h: number }) {
  const { quality, editor, opaqueBase } = useContext(RenderCtx);
  useImageVersion();
  const fill = bg.fill;
  let src: Source | null = null;
  if (fill.kind === 'image') src = peekPhoto({ assetId: fill.assetId, adjust: bgAdjust(bg.blur, bg.brightness, bg.saturation), mask: [] }, quality);
  else if (fill.kind === 'pattern') src = peekPattern(fill.patternId, fill.colors);
  else if (fill.kind === 'texture') src = peekTexture(fill.textureId, fill.tint);
  const stable = useStableSource(fill.kind === 'image' ? fill.assetId : JSON.stringify(fill), src);

  return (
    <Shape
      listening={false}
      width={w}
      height={h}
      perfectDrawEnabled={false}
      sceneFunc={(kc) => {
        const ctx = native(kc);
        ctx.save();
        if (editor && (bg.opacity < 1 || fill.kind === 'none')) drawChecker(ctx, w, h);
        else if (opaqueBase) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, w, h);
        }
        ctx.globalAlpha *= bg.opacity;
        const unit = Math.min(w, h);
        switch (fill.kind) {
          case 'color':
            ctx.fillStyle = fill.color;
            ctx.fillRect(0, 0, w, h);
            break;
          case 'gradient': {
            const cols = fill.colors.length ? fill.colors : ['#ffffff', '#eeeeee'];
            let g: CanvasGradient;
            if (fill.radial) g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 2);
            else {
              const a = (fill.angle * Math.PI) / 180;
              const len = Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a));
              const dx = (Math.cos(a) * len) / 2,
                dy = (Math.sin(a) * len) / 2;
              g = ctx.createLinearGradient(w / 2 - dx, h / 2 - dy, w / 2 + dx, h / 2 + dy);
            }
            cols.forEach((c, i) => g.addColorStop(cols.length === 1 ? 0 : i / (cols.length - 1), c));
            ctx.fillStyle = g;
            ctx.fillRect(0, 0, w, h);
            break;
          }
          case 'pattern': {
            if (!stable) break;
            const def = getPattern(fill.patternId);
            if (def?.cover) drawCover(ctx, stable, w, h, bg.scale, bg.offsetX, bg.offsetY);
            else drawTiled(ctx, stable, w, h, ((def?.display ?? 80) * unit * bg.scale) / 1000, bg.offsetX, bg.offsetY);
            break;
          }
          case 'texture': {
            if (!stable) break;
            const def = getTexture(fill.textureId);
            if (def?.mode === 'cover') drawCover(ctx, stable, w, h, bg.scale, bg.offsetX, bg.offsetY);
            else drawTiled(ctx, stable, w, h, ((def?.display ?? 800) * unit * bg.scale) / 1000, bg.offsetX, bg.offsetY);
            break;
          }
          case 'image':
            if (stable) drawCover(ctx, stable, w, h, bg.scale, bg.offsetX, bg.offsetY);
            else {
              ctx.fillStyle = '#eeeae4';
              ctx.fillRect(0, 0, w, h);
            }
            break;
          case 'none':
            break;
        }
        ctx.restore();
      }}
    />
  );
});

// ---------------- Elemente ----------------

function baseGroupProps(el: DesignElement) {
  return {
    id: el.id,
    name: 'element',
    x: el.x,
    y: el.y,
    rotation: el.rotation,
    opacity: el.opacity,
    visible: !el.hidden,
  };
}

const PhotoNode = memo(function PhotoNode({ el }: { el: PhotoElement }) {
  const { quality, editor, swapTargetId } = useContext(RenderCtx);
  useImageVersion();
  const raw = el.assetId ? peekPhoto({ assetId: el.assetId, adjust: el.adjust, mask: el.mask }, quality) : null;
  const src = useStableSource(el.assetId, raw);
  const ph = el.assetId ? null : peekPlaceholder(el.placeholder ?? 0);
  const highlight = swapTargetId === el.id;
  return (
    <Group {...baseGroupProps(el)}>
      <Shape
        x={-el.width / 2}
        y={-el.height / 2}
        width={el.width}
        height={el.height}
        fill="#000"
        perfectDrawEnabled={false}
        sceneFunc={(kc) => paintPhoto(native(kc), el, src, { editor, placeholder: ph, highlight })}
        hitFunc={rectHit}
      />
    </Group>
  );
});

// ---- Text ----

const measurer = new Konva.Text({ wrap: 'word', padding: 0 });

export function displayText(el: TextElement) {
  const t = el.uppercase ? el.text.toLocaleUpperCase('de-DE') : el.text;
  return el.curve !== 0 ? t.replace(/\s*\n\s*/g, ' ') : t;
}

export interface TextLayout {
  boxW: number;
  boxH: number;
  pad: number;
  textW: number;
  textH: number;
  path?: string;
  pathOffset?: { x: number; y: number };
}

export function textPadding(el: TextElement) {
  return el.background.kind !== 'none' ? el.fontSize * el.background.padding : el.fontSize * 0.08;
}

export function measureText(el: TextElement): TextLayout {
  const pad = textPadding(el);
  const text = displayText(el) || ' ';
  const style = fontStyleString(el.bold, el.italic);
  if (el.curve === 0) {
    const textW = Math.max(el.fontSize * 0.6, el.width - 2 * pad);
    measurer.setAttrs({
      text,
      fontFamily: el.fontFamily,
      fontSize: el.fontSize,
      fontStyle: style,
      lineHeight: el.lineHeight,
      letterSpacing: el.letterSpacing * el.fontSize,
      width: textW,
      align: el.align,
    });
    const textH = measurer.height();
    return { boxW: textW + 2 * pad, boxH: textH + 2 * pad, pad, textW, textH };
  }
  measurer.setAttrs({ text, fontFamily: el.fontFamily, fontSize: el.fontSize, fontStyle: style, letterSpacing: el.letterSpacing * el.fontSize, width: undefined });
  const tw = measurer.measureSize(text).width + Math.max(0, text.length - 1) * el.letterSpacing * el.fontSize;
  const theta = Math.max(0.08, (Math.abs(el.curve) / 100) * Math.PI * 1.85);
  const r = Math.max(el.fontSize, tw / theta);
  const up = el.curve > 0;
  // Pfad etwas länger als der Text (Glyphenbreiten weichen minimal ab); Text wird zentriert
  const half = Math.min(Math.PI * 0.97, (theta / 2) * 1.12 + 0.02);
  const sx = -r * Math.sin(half);
  const ex = r * Math.sin(half);
  const yEnd = up ? r * (1 - Math.cos(half)) : -r * (1 - Math.cos(half));
  const large = half * 2 > Math.PI ? 1 : 0;
  // Begrenzungsrahmen über Stichproben entlang des Bogens
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const fs = el.fontSize * 0.62;
  for (let i = 0; i <= 32; i++) {
    const a = -half + (2 * half * i) / 32;
    for (const d of [-fs, fs]) {
      const rr = r + (up ? d : -d);
      const x = rr * Math.sin(a);
      const y = up ? r - rr * Math.cos(a) : -r + rr * Math.cos(a);
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  const textW = maxX - minX,
    textH = maxY - minY;
  const ox = -(minX + maxX) / 2,
    oy = -(minY + maxY) / 2;
  const path = `M${(sx + ox).toFixed(2)} ${(yEnd + oy).toFixed(2)} A${r.toFixed(2)} ${r.toFixed(2)} 0 ${large} ${up ? 1 : 0} ${(ex + ox).toFixed(2)} ${(yEnd + oy).toFixed(2)}`;
  return { boxW: textW + 2 * pad, boxH: textH + 2 * pad, pad, textW, textH, path, pathOffset: { x: 0, y: 0 } };
}

function gradientProps(el: TextElement, w: number, h: number, centered: boolean) {
  if (!el.gradient) return { fill: el.color };
  const a = (el.gradient.angle * Math.PI) / 180;
  const len = Math.abs(w * Math.cos(a)) + Math.abs(h * Math.sin(a));
  const dx = (Math.cos(a) * len) / 2,
    dy = (Math.sin(a) * len) / 2;
  const cx = centered ? 0 : w / 2,
    cy = centered ? 0 : h / 2;
  return {
    fillPriority: 'linear-gradient',
    fillLinearGradientStartPoint: { x: cx - dx, y: cy - dy },
    fillLinearGradientEndPoint: { x: cx + dx, y: cy + dy },
    fillLinearGradientColorStops: [0, el.gradient.from, 1, el.gradient.to],
    fill: el.gradient.from,
  };
}

const TextNode = memo(function TextNode({ el }: { el: TextElement }) {
  const fontsVersion = useFontsVersion();
  useEffect(() => {
    void ensureFont(el.fontFamily, el.bold, el.italic);
  }, [el.fontFamily, el.bold, el.italic]);
  const layout = useMemo(() => measureText(el), [el, fontsVersion]);
  const { boxW, boxH, pad, textW, textH } = layout;
  const seed = hashString(el.id);
  const fontSize = el.fontSize;
  const shadow = el.shadow.enabled
    ? {
        shadowColor: el.shadow.color,
        shadowBlur: el.shadow.blur * fontSize * 2,
        shadowOffsetX: el.shadow.offsetX * fontSize * 2,
        shadowOffsetY: el.shadow.offsetY * fontSize * 2,
        shadowOpacity: el.shadow.opacity,
        shadowEnabled: true,
      }
    : { shadowEnabled: false };
  const common = {
    text: displayText(el),
    fontFamily: el.fontFamily,
    fontSize,
    fontStyle: fontStyleString(el.bold, el.italic),
    letterSpacing: el.letterSpacing * fontSize,
    stroke: el.stroke.width > 0 ? el.stroke.color : undefined,
    strokeWidth: el.stroke.width > 0 ? el.stroke.width : 0,
    strokeEnabled: el.stroke.width > 0,
    fillAfterStrokeEnabled: true,
    lineJoin: 'round' as const,
    listening: false,
    perfectDrawEnabled: false,
    ...shadow,
    ...gradientProps(el, textW, textH, !!layout.path),
  };
  return (
    <Group {...baseGroupProps(el)}>
      <Group scaleX={el.flipX ? -1 : 1} scaleY={el.flipY ? -1 : 1}>
        <Rect x={-boxW / 2} y={-boxH / 2} width={boxW} height={boxH} fill="rgba(0,0,0,0)" />
        {el.background.kind !== 'none' && (
          <Shape
            x={-boxW / 2}
            y={-boxH / 2}
            width={boxW}
            height={boxH}
            listening={false}
            perfectDrawEnabled={false}
            sceneFunc={(kc) => paintTextBackground(native(kc), el.background.kind, el.background.color, el.background.opacity, boxW, boxH, seed)}
          />
        )}
        {layout.path ? (
          <TextPath x={0} y={0} data={layout.path} align="center" {...common} />
        ) : (
          <KText
            x={-boxW / 2 + pad}
            y={-boxH / 2 + pad}
            width={textW}
            align={el.align}
            lineHeight={el.lineHeight}
            textDecoration={[el.underline ? 'underline' : '', el.strike ? 'line-through' : ''].filter(Boolean).join(' ')}
            wrap="word"
            {...common}
          />
        )}
      </Group>
    </Group>
  );
});

const StickerNode = memo(function StickerNode({ el }: { el: StickerElement }) {
  const { quality } = useContext(RenderCtx);
  useImageVersion();
  const raw = el.stickerId ? peekSticker(el.stickerId, el.colors) : el.assetId ? peekAsset(el.assetId, quality) : null;
  const src = useStableSource(el.stickerId ?? el.assetId ?? null, raw);
  const unit = Math.min(el.width, el.height);
  const sh = el.shadow?.enabled
    ? {
        shadowColor: el.shadow.color,
        shadowBlur: el.shadow.blur * unit,
        shadowOffsetX: el.shadow.offsetX * unit,
        shadowOffsetY: el.shadow.offsetY * unit,
        shadowOpacity: el.shadow.opacity,
        shadowEnabled: true,
      }
    : { shadowEnabled: false };
  return (
    <Group {...baseGroupProps(el)}>
      <Group scaleX={el.flipX ? -1 : 1} scaleY={el.flipY ? -1 : 1}>
        {src ? (
          <KImage image={src} x={-el.width / 2} y={-el.height / 2} width={el.width} height={el.height} perfectDrawEnabled={false} {...sh} />
        ) : (
          <Rect x={-el.width / 2} y={-el.height / 2} width={el.width} height={el.height} fill="rgba(0,0,0,0)" />
        )}
      </Group>
    </Group>
  );
});

const ShapeNode = memo(function ShapeNode({ el }: { el: ShapeElement }) {
  return (
    <Group {...baseGroupProps(el)}>
      <Group scaleX={el.flipX ? -1 : 1} scaleY={el.flipY ? -1 : 1}>
        <Shape
          x={-el.width / 2}
          y={-el.height / 2}
          width={el.width}
          height={el.height}
          fill="#000"
          perfectDrawEnabled={false}
          sceneFunc={(kc) => paintShape(native(kc), el)}
          hitFunc={rectHit}
        />
      </Group>
    </Group>
  );
});

const DrawingNode = memo(function DrawingNode({ el, live, viewScale }: { el: DrawingElement; live: DrawStroke | null; viewScale: number }) {
  const hitW = Math.max(24 / Math.max(0.01, viewScale), 10);
  return (
    <Group {...baseGroupProps(el)}>
      <Group scaleX={el.flipX ? -1 : 1} scaleY={el.flipY ? -1 : 1}>
        <Shape
          x={-el.width / 2}
          y={-el.height / 2}
          width={el.width}
          height={el.height}
          stroke="#000"
          strokeWidth={1}
          hitStrokeWidth={hitW}
          perfectDrawEnabled={false}
          sceneFunc={(kc) => paintDrawing(native(kc), el.strokes, el.width, el.height, live)}
          hitFunc={(kc, shape) => {
            for (const s of el.strokes) {
              if (s.tool === 'erase' || s.points.length < 2) continue;
              kc.beginPath();
              kc.moveTo(s.points[0]!, s.points[1]!);
              for (let i = 2; i + 1 < s.points.length; i += 2) kc.lineTo(s.points[i]!, s.points[i + 1]!);
              if (s.points.length === 2) kc.lineTo(s.points[0]! + 0.1, s.points[1]!);
              kc.strokeShape(shape);
            }
          }}
        />
      </Group>
    </Group>
  );
});

function ElementSwitch({ el }: { el: DesignElement }) {
  const opts = useContext(RenderCtx);
  switch (el.type) {
    case 'photo':
      return <PhotoNode el={el} />;
    case 'text':
      return <TextNode el={el} />;
    case 'sticker':
      return <StickerNode el={el} />;
    case 'shape':
      return <ShapeNode el={el} />;
    case 'drawing':
      return <DrawingNode el={el} live={opts.liveStroke?.elementId === el.id ? opts.liveStroke.stroke : null} viewScale={opts.viewScale} />;
  }
}

export function DocumentNodes({ doc, opts }: { doc: DesignDoc; opts: RenderOpts }) {
  return (
    <RenderCtx.Provider value={opts}>
      <BackgroundNode bg={doc.background} w={doc.width} h={doc.height} />
      {doc.elements.map((el) => (
        <ElementSwitch key={el.id} el={el} />
      ))}
    </RenderCtx.Provider>
  );
}
