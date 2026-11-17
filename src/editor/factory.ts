/** Fabrikfunktionen für neue Elemente und Dokumente. */
import type {
  Background,
  DesignDoc,
  DrawingElement,
  FrameStyle,
  PhotoElement,
  ShadowStyle,
  ShapeElement,
  ShapeKind,
  StickerElement,
  TextElement,
} from '../types/doc';
import { DEFAULT_ADJUST } from '../lib/filters';
import { uid } from '../lib/util';

export const NO_SHADOW: ShadowStyle = { enabled: false, color: '#000000', blur: 0.06, offsetX: 0, offsetY: 0.02, opacity: 0.35 };
export const SOFT_SHADOW: ShadowStyle = { enabled: true, color: '#000000', blur: 0.06, offsetX: 0.0, offsetY: 0.025, opacity: 0.3 };
export const NO_FRAME: FrameStyle = { kind: 'none', color: '#ffffff', accent: '#e8b4b8', thickness: 0.5 };

export function defaultBackground(color = '#ffffff'): Background {
  return {
    fill: { kind: 'color', color },
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    blur: 0,
    brightness: 0,
    saturation: 0,
    opacity: 1,
  };
}

export function createDoc(formatId: string, width: number, height: number, bg?: Background): DesignDoc {
  return {
    version: 1,
    formatId,
    width,
    height,
    background: bg ?? defaultBackground(),
    elements: [],
    collage: null,
    overflow: [],
  };
}

export function newPhoto(p: Partial<PhotoElement> & Pick<PhotoElement, 'x' | 'y' | 'width' | 'height'>): PhotoElement {
  return {
    id: uid('p'),
    type: 'photo',
    rotation: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    locked: false,
    assetId: null,
    crop: { cx: 0.5, cy: 0.5, zoom: 1 },
    shape: 'rect',
    cornerRadius: 0,
    adjust: { ...DEFAULT_ADJUST },
    mask: [],
    border: { width: 0, color: '#ffffff' },
    shadow: { ...NO_SHADOW },
    frame: { ...NO_FRAME },
    ...p,
  };
}

export function newText(p: Partial<TextElement> & Pick<TextElement, 'x' | 'y' | 'width'>): TextElement {
  return {
    id: uid('t'),
    type: 'text',
    height: 100,
    rotation: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    locked: false,
    text: 'Dein Text',
    fontFamily: 'Playfair Display',
    fontSize: 120,
    bold: false,
    italic: false,
    underline: false,
    strike: false,
    uppercase: false,
    align: 'center',
    lineHeight: 1.2,
    letterSpacing: 0,
    color: '#2b2b2b',
    gradient: null,
    stroke: { width: 0, color: '#ffffff' },
    shadow: { ...NO_SHADOW },
    background: { kind: 'none', color: '#ffffff', opacity: 1, padding: 0.35 },
    curve: 0,
    ...p,
  };
}

export function newSticker(p: Partial<StickerElement> & Pick<StickerElement, 'x' | 'y' | 'width' | 'height'>): StickerElement {
  return {
    id: uid('s'),
    type: 'sticker',
    rotation: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    locked: false,
    stickerId: null,
    ...p,
  };
}

export function newShape(kind: ShapeKind, p: Partial<ShapeElement> & Pick<ShapeElement, 'x' | 'y' | 'width' | 'height'>): ShapeElement {
  const isLine = kind === 'line' || kind === 'arrow';
  return {
    id: uid('f'),
    type: 'shape',
    shape: kind,
    rotation: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    locked: false,
    fill: isLine ? '' : '#f2a7b5',
    stroke: isLine ? '#2b2b2b' : '',
    strokeWidth: isLine ? 12 : 0,
    cornerRadius: 0,
    dashed: false,
    ...p,
  };
}

export function newDrawing(W: number, H: number): DrawingElement {
  return {
    id: uid('d'),
    type: 'drawing',
    x: W / 2,
    y: H / 2,
    width: W,
    height: H,
    rotation: 0,
    flipX: false,
    flipY: false,
    opacity: 1,
    locked: false,
    strokes: [],
  };
}
