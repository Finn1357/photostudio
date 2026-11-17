/**
 * Zentrales Dokumentmodell von PhotoStudio.
 *
 * Alle Koordinaten sind "Leinwand-Einheiten" (logische Pixel der Basisauflösung).
 * Die Exportauflösung ergibt sich aus Basisauflösung × Exportfaktor.
 * Elemente werden über ihren Mittelpunkt (x, y) positioniert und um diesen gedreht.
 */

export type ElementType = 'photo' | 'text' | 'sticker' | 'shape' | 'drawing';

export interface BaseElement {
  id: string;
  type: ElementType;
  /** Mittelpunkt X */
  x: number;
  /** Mittelpunkt Y */
  y: number;
  width: number;
  height: number;
  /** Grad, im Uhrzeigersinn */
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  /** 0..1 */
  opacity: number;
  locked: boolean;
  hidden?: boolean;
}

/** Bildanpassungen. Wertebereiche: -100..100 bzw. 0..100. */
export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  /** Farbton-Drehung in Grad (-180..180) */
  hue: number;
  exposure: number;
  /** "Ausbleichen"/Matt-Effekt 0..100 */
  fade: number;
  grayscale: number;
  sepia: number;
  blur: number;
  sharpen: number;
  vignette: number;
  /** Drehung der Bildquelle in 90°-Schritten */
  rotate90: 0 | 1 | 2 | 3;
  /** Name des gewählten Filter-Presets (nur zur Anzeige) */
  preset?: string;
}

export interface MaskStroke {
  mode: 'erase' | 'restore';
  /** Pinseldurchmesser relativ zur kürzeren Bildseite (0..1) */
  size: number;
  /** Normalisierte Bildkoordinaten [x0, y0, x1, y1, ...] */
  points: number[];
}

export type MaskShape =
  | 'rect'
  | 'circle'
  | 'heart'
  | 'star'
  | 'hexagon'
  | 'diamond'
  | 'arch'
  | 'flower'
  | 'blob'
  | 'triangle'
  | 'polygon'
  | 'custom';

export type FrameKind =
  | 'none'
  | 'classic'
  | 'polaroid'
  | 'film'
  | 'torn'
  | 'deckle'
  | 'stamp'
  | 'tape'
  | 'floral'
  | 'corners'
  | 'pencil'
  | 'double'
  | 'scallop';

export interface FrameStyle {
  kind: FrameKind;
  color: string;
  /** Akzentfarbe (Tape, Blüten, Ecken) */
  accent: string;
  /** Dicke relativ (0..1), 0.5 = Standard */
  thickness: number;
}

export interface ShadowStyle {
  enabled: boolean;
  color: string;
  /** relativ zur kürzeren Elementseite */
  blur: number;
  offsetX: number;
  offsetY: number;
  opacity: number;
}

export interface Crop {
  /** Bildpunkt (0..1), der in der Feldmitte liegt */
  cx: number;
  cy: number;
  /** >= 1 */
  zoom: number;
}

export interface PhotoElement extends BaseElement {
  type: 'photo';
  assetId: string | null;
  crop: Crop;
  shape: MaskShape;
  /** Für 'polygon' und 'custom': normalisierte Punkte [x0,y0,...] im Fotobereich */
  points?: number[];
  /** Eckenradius in Leinwand-Einheiten (für Rechteck und Polygone) */
  cornerRadius: number;
  adjust: Adjustments;
  mask: MaskStroke[];
  border: { width: number; color: string };
  shadow: ShadowStyle;
  frame: FrameStyle;
  /** Index des Collage-Feldes; undefined = frei platziertes Foto */
  slot?: number;
  /** Platzhalter-Illustration (0..5) für leere Felder */
  placeholder?: number;
}

export type TextBackgroundKind = 'none' | 'solid' | 'pill' | 'paper' | 'tape' | 'label' | 'note' | 'brush';

export interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strike: boolean;
  uppercase: boolean;
  align: 'left' | 'center' | 'right';
  /** Vielfaches der Schriftgröße */
  lineHeight: number;
  /** in em (relativ zur Schriftgröße) */
  letterSpacing: number;
  color: string;
  gradient: { from: string; to: string; angle: number } | null;
  stroke: { width: number; color: string };
  shadow: ShadowStyle;
  background: { kind: TextBackgroundKind; color: string; opacity: number; padding: number };
  /** -100..100, 0 = gerade */
  curve: number;
}

export interface StickerElement extends BaseElement {
  type: 'sticker';
  /** ID eines integrierten Stickers */
  stickerId: string | null;
  /** Für eigene importierte PNG/SVG-Sticker */
  assetId?: string;
  /** Farbüberschreibungen (Index entspricht den Farbslots des Stickers) */
  colors?: string[];
  /** Schlagschatten (folgt der Sticker-Kontur) */
  shadow?: ShadowStyle;
}

export type ShapeKind =
  | 'rect'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'heart'
  | 'hexagon'
  | 'diamond'
  | 'arch'
  | 'blob'
  | 'flower'
  | 'line'
  | 'arrow';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shape: ShapeKind;
  fill: string;
  /** leerer String = keine Füllung */
  stroke: string;
  strokeWidth: number;
  cornerRadius: number;
  dashed: boolean;
}

export interface DrawStroke {
  tool: 'pen' | 'marker' | 'erase';
  color: string;
  width: number;
  opacity: number;
  /** element-lokale Koordinaten [x0,y0,...] (0..width, 0..height) */
  points: number[];
}

export interface DrawingElement extends BaseElement {
  type: 'drawing';
  strokes: DrawStroke[];
}

export type DesignElement = PhotoElement | TextElement | StickerElement | ShapeElement | DrawingElement;

export type BackgroundFill =
  | { kind: 'none' }
  | { kind: 'color'; color: string }
  | { kind: 'gradient'; colors: string[]; angle: number; radial: boolean }
  | { kind: 'pattern'; patternId: string; colors: string[] }
  | { kind: 'texture'; textureId: string; tint: string | null }
  | { kind: 'image'; assetId: string };

export interface Background {
  fill: BackgroundFill;
  /** Muster-/Textur-/Bildskalierung (1 = Standard) */
  scale: number;
  /** Position -1..1 (Bild/Muster) */
  offsetX: number;
  offsetY: number;
  /** 0..100 */
  blur: number;
  /** -100..100 */
  brightness: number;
  /** -100..100 */
  saturation: number;
  /** 0..1 */
  opacity: number;
}

export interface CollageSettings {
  layoutId: string;
  /** Abstand zwischen Feldern relativ zur kürzeren Leinwandseite */
  gap: number;
  /** Außenrand relativ zur kürzeren Leinwandseite */
  margin: number;
  /** Eckenradius relativ zur kürzeren Leinwandseite */
  radius: number;
}

export interface DesignDoc {
  version: 1;
  formatId: string;
  width: number;
  height: number;
  background: Background;
  elements: DesignElement[];
  collage: CollageSettings | null;
  /** Bilder, die bei einem Rasterwechsel keinen Platz mehr hatten */
  overflow: string[];
}

export type ProjectKind = 'collage' | 'free' | 'template' | 'card';

export interface ProjectRecord {
  id: string;
  name: string;
  kind: ProjectKind;
  templateId?: string;
  createdAt: number;
  updatedAt: number;
  doc: DesignDoc;
}

export interface ProjectMeta {
  id: string;
  name: string;
  kind: ProjectKind;
  createdAt: number;
  updatedAt: number;
  width: number;
  height: number;
}

export interface AssetRecord {
  id: string;
  kind: 'photo' | 'sticker';
  mime: string;
  width: number;
  height: number;
  /** Original (max. 4096 px Kantenlänge) */
  blob: Blob;
  /** Vorschau (max. 1280 px) */
  preview: Blob;
  createdAt: number;
}

export interface UserTemplateRecord {
  id: string;
  name: string;
  createdAt: number;
  doc: DesignDoc;
  thumb?: Blob;
}
