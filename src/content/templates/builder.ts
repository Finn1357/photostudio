/**
 * Baukasten für Vorlagen. Koordinaten sind normalisiert:
 *  x, w relativ zur Leinwandbreite · y, h relativ zur -höhe · Schriftgrößen/Radien relativ zur kürzeren Seite.
 */
import type {
  Background,
  BackgroundFill,
  DesignDoc,
  DesignElement,
  FrameKind,
  MaskShape,
  PhotoElement,
  ShadowStyle,
  ShapeKind,
  TextBackgroundKind,
  TextElement,
} from '../../types/doc';
import { getFormat } from '../formats';
import { createDoc, defaultBackground, newPhoto, newShape, newSticker, newText, NO_SHADOW, SOFT_SHADOW } from '../../editor/factory';
import { applyLayout } from '../../editor/ops';
import { getStickerDef } from '../stickers';

export type TemplateCategory =
  | 'geburtstag'
  | 'hochzeit'
  | 'hochzeitstag'
  | 'verlobung'
  | 'baby'
  | 'jubilaeum'
  | 'einladung'
  | 'glueckwunsch'
  | 'danke'
  | 'fruehling'
  | 'sommer'
  | 'herbst'
  | 'winter'
  | 'weihnachten'
  | 'silvester'
  | 'ostern'
  | 'valentinstag'
  | 'muttertag'
  | 'vatertag'
  | 'halloween'
  | 'familie'
  | 'freundschaft'
  | 'liebe'
  | 'urlaub'
  | 'reisen'
  | 'tiere'
  | 'natur'
  | 'essen'
  | 'erinnerungen'
  | 'vorher-nachher'
  | 'elegant'
  | 'minimal'
  | 'modern'
  | 'vintage'
  | 'retro'
  | 'boho'
  | 'pastell'
  | 'aquarell'
  | 'scrapbook'
  | 'polaroid'
  | 'floral'
  | 'glitzer'
  | 'papier'
  | 'luxus'
  | 'verspielt';

export interface TemplateDef {
  id: string;
  name: string;
  categories: TemplateCategory[];
  tags: string;
  formatId: string;
  /** Grußkarte (für den Bereich "Grußkarten gestalten") */
  card?: boolean;
  photoCount: number;
  build: () => DesignDoc;
}

// ---------- Elemente ----------

type Item = (W: number, H: number, U: number) => DesignElement[];

const shadowOf = (s: boolean | Partial<ShadowStyle> | undefined): ShadowStyle =>
  s === true ? { ...SOFT_SHADOW } : s ? { ...SOFT_SHADOW, ...s } : { ...NO_SHADOW };

export interface PhotoOpts {
  rot?: number;
  shape?: MaskShape;
  radius?: number;
  frame?: FrameKind;
  frameColor?: string;
  accent?: string;
  thickness?: number;
  shadow?: boolean | Partial<ShadowStyle>;
  border?: [number, string];
  ph?: number;
}

/** Foto: Mittelpunkt (x, y), Breite w (rel. W), Seitenverhältnis ar = Breite/Höhe. */
export const P =
  (x: number, y: number, w: number, ar: number, o: PhotoOpts = {}): Item =>
  (W, H, U) => {
    const width = w * W;
    const p = newPhoto({
      x: x * W,
      y: y * H,
      width,
      height: width / ar,
      rotation: o.rot ?? 0,
      shape: o.shape ?? 'rect',
      cornerRadius: (o.radius ?? 0) * U,
      shadow: shadowOf(o.shadow),
      border: o.border ? { width: o.border[0] * U, color: o.border[1] } : { width: 0, color: '#ffffff' },
      frame: {
        kind: o.frame ?? 'none',
        color: o.frameColor ?? (o.frame === 'film' ? '#1f1f1f' : '#ffffff'),
        accent: o.accent ?? (o.frame === 'film' ? '#f4f1ea' : o.frame === 'corners' ? '#2b2b2b' : '#f2b48a'),
        thickness: o.thickness ?? 0.5,
      },
    });
    return [p];
  };

export interface TextOpts {
  font?: string;
  size?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  upper?: boolean;
  align?: TextElement['align'];
  ls?: number;
  lh?: number;
  rot?: number;
  curve?: number;
  stroke?: [number, string];
  shadow?: boolean | Partial<ShadowStyle>;
  bg?: { kind: TextBackgroundKind; color: string; opacity?: number; padding?: number };
  gradient?: [string, string, number?];
  opacity?: number;
}

export const T =
  (text: string, x: number, y: number, w: number, o: TextOpts = {}): Item =>
  (W, H, U) => {
    const t = newText({
      text,
      x: x * W,
      y: y * H,
      width: w * W,
      fontFamily: o.font ?? 'Playfair Display',
      fontSize: (o.size ?? 0.07) * U,
      color: o.color ?? '#2b2b2b',
      bold: o.bold ?? false,
      italic: o.italic ?? false,
      underline: o.underline ?? false,
      uppercase: o.upper ?? false,
      align: o.align ?? 'center',
      letterSpacing: o.ls ?? 0,
      lineHeight: o.lh ?? 1.2,
      rotation: o.rot ?? 0,
      curve: o.curve ?? 0,
      opacity: o.opacity ?? 1,
      stroke: o.stroke ? { width: o.stroke[0] * U, color: o.stroke[1] } : { width: 0, color: '#ffffff' },
      shadow: o.shadow === true ? { enabled: true, color: '#000000', blur: 0.12, offsetX: 0, offsetY: 0.04, opacity: 0.35 } : o.shadow ? { ...NO_SHADOW, enabled: true, ...o.shadow } : { ...NO_SHADOW },
      background: o.bg ? { kind: o.bg.kind, color: o.bg.color, opacity: o.bg.opacity ?? 1, padding: o.bg.padding ?? 0.35 } : { kind: 'none', color: '#ffffff', opacity: 1, padding: 0.35 },
      gradient: o.gradient ? { from: o.gradient[0], to: o.gradient[1], angle: o.gradient[2] ?? 90 } : null,
    });
    return [t];
  };

export interface StickerOpts {
  rot?: number;
  colors?: string[];
  opacity?: number;
  flipX?: boolean;
  shadow?: boolean | Partial<ShadowStyle>;
}

/** Sticker: Mittelpunkt (x, y), Breite w (rel. W); Höhe aus dem Seitenverhältnis des Motivs. */
export const S =
  (id: string, x: number, y: number, w: number, o: StickerOpts = {}): Item =>
  (W, H) => {
    const def = getStickerDef(id);
    if (!def) throw new Error(`Unbekannter Sticker in Vorlage: ${id}`);
    const width = w * W;
    return [
      newSticker({
        stickerId: id,
        x: x * W,
        y: y * H,
        width,
        height: (width * def.h) / def.w,
        rotation: o.rot ?? 0,
        colors: o.colors,
        opacity: o.opacity ?? 1,
        flipX: o.flipX ?? false,
        shadow: o.shadow ? { ...SOFT_SHADOW, blur: 0.04, offsetY: 0.015, opacity: 0.25, ...(o.shadow === true ? {} : o.shadow) } : undefined,
      }),
    ];
  };

export interface ShapeOpts {
  fill?: string;
  stroke?: string;
  sw?: number;
  radius?: number;
  rot?: number;
  opacity?: number;
  dashed?: boolean;
}

/** Form: Mittelpunkt (x, y), Breite w (rel. W), Höhe h (rel. H). */
export const R =
  (kind: ShapeKind, x: number, y: number, w: number, h: number, o: ShapeOpts = {}): Item =>
  (W, H, U) => [
    newShape(kind, {
      x: x * W,
      y: y * H,
      width: w * W,
      height: h * H,
      fill: o.fill ?? (kind === 'line' || kind === 'arrow' ? '' : '#ffffff'),
      stroke: o.stroke ?? (kind === 'line' || kind === 'arrow' ? '#2b2b2b' : ''),
      strokeWidth: (o.sw ?? (kind === 'line' || kind === 'arrow' ? 0.003 : 0)) * U,
      cornerRadius: (o.radius ?? 0) * U,
      rotation: o.rot ?? 0,
      opacity: o.opacity ?? 1,
      dashed: o.dashed ?? false,
    }),
  ];

// ---------- Hintergründe ----------

const bg = (fill: BackgroundFill, extra: Partial<Background> = {}): Background => ({ ...defaultBackground(), fill, ...extra });
export const bgColor = (color: string) => bg({ kind: 'color', color });
export const bgGrad = (colors: string[], angle = 90, radial = false) => bg({ kind: 'gradient', colors, angle, radial });
export const bgPattern = (patternId: string, colors: string[] = [], scale = 1) => bg({ kind: 'pattern', patternId, colors }, { scale });
export const bgTexture = (textureId: string, tint: string | null = null, scale = 1) => bg({ kind: 'texture', textureId, tint }, { scale });

// ---------- Vorlage ----------

export interface TemplateSpec {
  id: string;
  name: string;
  cats: TemplateCategory[];
  tags?: string;
  format: string;
  card?: boolean;
  bg: Background;
  items: Item[];
  collage?: { layoutId: string; gap?: number; margin?: number; radius?: number; border?: [number, string]; shadow?: boolean };
}

export function template(spec: TemplateSpec): TemplateDef {
  const build = (): DesignDoc => {
    const f = getFormat(spec.format);
    if (!f) throw new Error(`Unbekanntes Format: ${spec.format}`);
    const W = f.width,
      H = f.height,
      U = Math.min(W, H);
    let doc = createDoc(f.id, W, H, JSON.parse(JSON.stringify(spec.bg)));
    const elements = spec.items.flatMap((it) => it(W, H, U));
    let ph = 0;
    for (const e of elements) if (e.type === 'photo') (e as PhotoElement).placeholder = ph++ % 6;
    doc = { ...doc, elements };
    if (spec.collage) {
      const c = spec.collage;
      doc = applyLayout(doc, c.layoutId, { gap: c.gap ?? 0.014, margin: c.margin ?? 0.014, radius: c.radius ?? 0 });
      doc = {
        ...doc,
        elements: doc.elements.map((e) =>
          e.type === 'photo' && e.slot !== undefined
            ? {
                ...e,
                border: c.border ? { width: c.border[0] * U, color: c.border[1] } : e.border,
                shadow: c.shadow ? { ...SOFT_SHADOW, blur: 0.04, offsetY: 0.012, opacity: 0.25 } : e.shadow,
              }
            : e,
        ),
      };
    }
    return doc;
  };
  const sample = build();
  return {
    id: spec.id,
    name: spec.name,
    categories: spec.cats,
    tags: spec.tags ?? '',
    formatId: spec.format,
    card: spec.card,
    photoCount: sample.elements.filter((e) => e.type === 'photo').length,
    build,
  };
}
