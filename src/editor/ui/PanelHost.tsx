/** Container für das aktive Werkzeug-Panel (unten bzw. rechts im Querformat). */
import { ChevronDown } from 'lucide-react';
import { useEditor, useSelectedElement, type PanelId } from '../store';
import { BackgroundPanel, DrawPanel, FormatPanel, LayersPanel, LayoutPanel, PhotosPanel, ShapesPanel, StickersPanel } from './PanelsGeneral';
import {
  ArrangePanel,
  OpacityPanel,
  PhotoAdjustPanel,
  PhotoBorderPanel,
  PhotoCropPanel,
  PhotoErasePanel,
  PhotoFilterPanel,
  PhotoFramePanel,
  PhotoShapePanel,
  ShapeStylePanel,
  StickerColorPanel,
  TextColorPanel,
  TextFontPanel,
  TextPresetsPanel,
  TextSpacingPanel,
  TextStylePanel,
} from './PanelsElement';

const TITLES: Record<PanelId, string> = {
  photos: 'Fotos hinzufügen',
  layout: 'Raster',
  background: 'Hintergrund',
  stickers: 'Sticker & Motive',
  shapes: 'Formen',
  draw: 'Zeichnen',
  format: 'Format',
  layers: 'Ebenen',
  'text-font': 'Schrift',
  'text-color': 'Textfarbe',
  'text-style': 'Textstil',
  'text-spacing': 'Größe & Form',
  'text-presets': 'Textvorlagen',
  'photo-filter': 'Filter',
  'photo-adjust': 'Anpassen',
  'photo-shape': 'Form & Maske',
  'photo-frame': 'Rahmen',
  'photo-border': 'Rand & Schatten',
  'photo-crop': 'Ausschnitt',
  'photo-erase': 'Radieren & Freistellen',
  opacity: 'Deckkraft',
  'sticker-color': 'Farbe & Schatten',
  'shape-style': 'Formstil',
  arrange: 'Anordnen',
};

export function PanelHost() {
  const panel = useEditor((s) => s.panel);
  const setPanel = useEditor((s) => s.setPanel);
  const el = useSelectedElement();
  if (!panel) return null;
  let body: React.ReactNode = null;
  switch (panel) {
    case 'photos':
      body = <PhotosPanel />;
      break;
    case 'layout':
      body = <LayoutPanel />;
      break;
    case 'background':
      body = <BackgroundPanel />;
      break;
    case 'stickers':
      body = <StickersPanel replace={el?.type === 'sticker'} />;
      break;
    case 'shapes':
      body = <ShapesPanel />;
      break;
    case 'draw':
      body = <DrawPanel />;
      break;
    case 'format':
      body = <FormatPanel />;
      break;
    case 'layers':
      body = <LayersPanel />;
      break;
    case 'text-font':
      body = <TextFontPanel />;
      break;
    case 'text-color':
      body = <TextColorPanel />;
      break;
    case 'text-style':
      body = <TextStylePanel />;
      break;
    case 'text-spacing':
      body = <TextSpacingPanel />;
      break;
    case 'text-presets':
      body = <TextPresetsPanel />;
      break;
    case 'photo-filter':
      body = <PhotoFilterPanel />;
      break;
    case 'photo-adjust':
      body = <PhotoAdjustPanel />;
      break;
    case 'photo-shape':
      body = <PhotoShapePanel />;
      break;
    case 'photo-frame':
      body = <PhotoFramePanel />;
      break;
    case 'photo-border':
      body = <PhotoBorderPanel />;
      break;
    case 'photo-crop':
      body = <PhotoCropPanel />;
      break;
    case 'photo-erase':
      body = <PhotoErasePanel />;
      break;
    case 'opacity':
      body = <OpacityPanel />;
      break;
    case 'sticker-color':
      body = <StickerColorPanel />;
      break;
    case 'shape-style':
      body = <ShapeStylePanel />;
      break;
    case 'arrange':
      body = <ArrangePanel />;
      break;
  }
  const tall = panel === 'stickers' || panel === 'layers' || panel === 'text-font' || panel === 'photo-adjust' || panel === 'background';
  return (
    <div className="anim-sheet flex flex-col rounded-t-3xl bg-surface shadow-[0_-8px_24px_rgba(0,0,0,0.08)] short:rounded-none short:shadow-none">
      <div className="flex items-center justify-between px-4 pb-1 pt-2.5">
        <h2 className="text-[15px] font-semibold">{panel === 'stickers' && el?.type === 'sticker' ? 'Sticker ersetzen' : TITLES[panel]}</h2>
        <button type="button" aria-label="Panel schließen" onClick={() => setPanel(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2">
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>
      <div className={`overflow-y-auto overscroll-contain px-4 pb-3 ${tall ? 'max-h-[38dvh]' : 'max-h-[34dvh]'} short:max-h-none`}>{body}</div>
    </div>
  );
}
