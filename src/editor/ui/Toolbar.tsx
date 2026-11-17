/** Untere Werkzeugleiste: Hauptwerkzeuge oder Aktionen für das ausgewählte Element. */
import {
  ImagePlus,
  LayoutGrid,
  Type,
  Sticker,
  PaintBucket,
  Shapes,
  Brush,
  Ratio,
  Layers,
  X,
  Replace,
  Wand2,
  SlidersHorizontal,
  Crop,
  Frame,
  Square,
  Eraser,
  RotateCw,
  FlipHorizontal2,
  Droplet,
  CopyPlus,
  Layers2,
  Lock,
  Unlock,
  Trash2,
  Pencil,
  Palette,
  Baseline,
  Sparkles,
  Camera,
  ArrowLeftRight,
  ClipboardPaste,
  Shapes as ShapeIcon,
} from 'lucide-react';
import { useEditor, useSelectedElement, type PanelId } from '../store';
import { ToolButton } from '../../ui/components';
import {
  addText,
  deleteSelected,
  duplicateSelected,
  flipSelected,
  openTextEditor,
  paste,
  pickPhotos,
  rotateSelected90,
  startSwap,
  toggleLock,
} from '../actions';

export function Toolbar() {
  const el = useSelectedElement();
  const panel = useEditor((s) => s.panel);
  const togglePanel = useEditor((s) => s.togglePanel);
  const select = useEditor((s) => s.select);
  const mode = useEditor((s) => s.mode);
  const clipboard = useEditor((s) => s.clipboard);
  const tp = (p: PanelId) => () => togglePanel(p);
  const act = (p: PanelId) => panel === p;

  let items: React.ReactNode;
  if (!el) {
    items = (
      <>
        <ToolButton icon={<ImagePlus />} label="Fotos" active={act('photos')} onClick={tp('photos')} />
        <ToolButton icon={<LayoutGrid />} label="Raster" active={act('layout')} onClick={tp('layout')} />
        <ToolButton icon={<Type />} label="Text" onClick={() => addText()} />
        <ToolButton icon={<Sticker />} label="Sticker" active={act('stickers')} onClick={tp('stickers')} />
        <ToolButton icon={<PaintBucket />} label="Hintergrund" active={act('background')} onClick={tp('background')} />
        <ToolButton icon={<Shapes />} label="Formen" active={act('shapes')} onClick={tp('shapes')} />
        <ToolButton
          icon={<Brush />}
          label="Zeichnen"
          active={mode === 'draw'}
          onClick={() => {
            const s = useEditor.getState();
            const on = s.mode !== 'draw';
            s.setMode(on ? 'draw' : 'select');
            s.setPanel(on ? 'draw' : null);
          }}
        />
        <ToolButton icon={<Ratio />} label="Format" active={act('format')} onClick={tp('format')} />
        <ToolButton icon={<Layers />} label="Ebenen" active={act('layers')} onClick={tp('layers')} />
        {clipboard && <ToolButton icon={<ClipboardPaste />} label="Einfügen" onClick={paste} />}
      </>
    );
  } else if (el.locked) {
    items = (
      <>
        <ToolButton icon={<Unlock />} label="Entsperren" onClick={toggleLock} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
      </>
    );
  } else if (el.type === 'photo') {
    const slot = el.slot !== undefined;
    items = el.assetId ? (
      <>
        <ToolButton icon={<Replace />} label="Ersetzen" onClick={() => pickPhotos({ replaceId: el.id })} />
        <ToolButton icon={<Wand2 />} label="Filter" active={act('photo-filter')} onClick={tp('photo-filter')} />
        <ToolButton icon={<SlidersHorizontal />} label="Anpassen" active={act('photo-adjust')} onClick={tp('photo-adjust')} />
        <ToolButton icon={<Crop />} label="Ausschnitt" active={act('photo-crop')} onClick={tp('photo-crop')} />
        {slot && <ToolButton icon={<ArrowLeftRight />} label="Tauschen" active={mode === 'swap'} onClick={startSwap} />}
        <ToolButton icon={<ShapeIcon />} label="Form" active={act('photo-shape')} onClick={tp('photo-shape')} />
        <ToolButton icon={<Frame />} label="Rahmen" active={act('photo-frame')} onClick={tp('photo-frame')} />
        <ToolButton icon={<Square />} label="Rand & Schatten" active={act('photo-border')} onClick={tp('photo-border')} />
        <ToolButton icon={<Eraser />} label="Radierer" active={act('photo-erase')} onClick={tp('photo-erase')} />
        <ToolButton icon={<RotateCw />} label="Drehen" onClick={rotateSelected90} />
        <ToolButton icon={<FlipHorizontal2 />} label="Spiegeln" onClick={() => flipSelected('x')} />
        <ToolButton icon={<CopyPlus />} label="Duplizieren" onClick={duplicateSelected} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
        <ToolButton icon={<Lock />} label="Sperren" onClick={toggleLock} />
        <ToolButton icon={<Trash2 />} label={slot ? 'Entfernen' : 'Löschen'} danger onClick={deleteSelected} />
      </>
    ) : (
      <>
        <ToolButton icon={<ImagePlus />} label="Foto wählen" onClick={() => pickPhotos({ replaceId: el.id, multiple: true })} />
        <ToolButton icon={<Camera />} label="Kamera" onClick={() => pickPhotos({ replaceId: el.id, camera: true })} />
        <ToolButton icon={<ShapeIcon />} label="Form" active={act('photo-shape')} onClick={tp('photo-shape')} />
        <ToolButton icon={<Frame />} label="Rahmen" active={act('photo-frame')} onClick={tp('photo-frame')} />
        <ToolButton icon={<Square />} label="Rand & Schatten" active={act('photo-border')} onClick={tp('photo-border')} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
        {!slot && <ToolButton icon={<Trash2 />} label="Löschen" danger onClick={deleteSelected} />}
      </>
    );
  } else if (el.type === 'text') {
    items = (
      <>
        <ToolButton icon={<Pencil />} label="Bearbeiten" onClick={() => openTextEditor(el.id)} />
        <ToolButton icon={<Sparkles />} label="Vorlagen" active={act('text-presets')} onClick={tp('text-presets')} />
        <ToolButton icon={<Type />} label="Schrift" active={act('text-font')} onClick={tp('text-font')} />
        <ToolButton icon={<Palette />} label="Farbe" active={act('text-color')} onClick={tp('text-color')} />
        <ToolButton icon={<Baseline />} label="Stil" active={act('text-style')} onClick={tp('text-style')} />
        <ToolButton icon={<SlidersHorizontal />} label="Größe & Form" active={act('text-spacing')} onClick={tp('text-spacing')} />
        <ToolButton icon={<FlipHorizontal2 />} label="Spiegeln" onClick={() => flipSelected('x')} />
        <ToolButton icon={<CopyPlus />} label="Duplizieren" onClick={duplicateSelected} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
        <ToolButton icon={<Lock />} label="Sperren" onClick={toggleLock} />
        <ToolButton icon={<Trash2 />} label="Löschen" danger onClick={deleteSelected} />
      </>
    );
  } else if (el.type === 'sticker') {
    items = (
      <>
        <ToolButton icon={<Replace />} label="Ersetzen" active={act('stickers')} onClick={tp('stickers')} />
        <ToolButton icon={<Palette />} label="Farbe & Schatten" active={act('sticker-color')} onClick={tp('sticker-color')} />
        <ToolButton icon={<FlipHorizontal2 />} label="Spiegeln" onClick={() => flipSelected('x')} />
        <ToolButton icon={<RotateCw />} label="Drehen" onClick={rotateSelected90} />
        <ToolButton icon={<CopyPlus />} label="Duplizieren" onClick={duplicateSelected} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
        <ToolButton icon={<Lock />} label="Sperren" onClick={toggleLock} />
        <ToolButton icon={<Trash2 />} label="Löschen" danger onClick={deleteSelected} />
      </>
    );
  } else if (el.type === 'shape') {
    items = (
      <>
        <ToolButton icon={<Palette />} label="Stil" active={act('shape-style')} onClick={tp('shape-style')} />
        <ToolButton icon={<FlipHorizontal2 />} label="Spiegeln" onClick={() => flipSelected('x')} />
        <ToolButton icon={<RotateCw />} label="Drehen" onClick={rotateSelected90} />
        <ToolButton icon={<CopyPlus />} label="Duplizieren" onClick={duplicateSelected} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
        <ToolButton icon={<Lock />} label="Sperren" onClick={toggleLock} />
        <ToolButton icon={<Trash2 />} label="Löschen" danger onClick={deleteSelected} />
      </>
    );
  } else {
    items = (
      <>
        <ToolButton
          icon={<Brush />}
          label="Weiterzeichnen"
          onClick={() => {
            const s = useEditor.getState();
            s.setDrawingId(el.id);
            s.select(null);
            s.setMode('draw');
            s.setPanel('draw');
          }}
        />
        <ToolButton icon={<Droplet />} label="Deckkraft" active={act('opacity')} onClick={tp('opacity')} />
        <ToolButton icon={<FlipHorizontal2 />} label="Spiegeln" onClick={() => flipSelected('x')} />
        <ToolButton icon={<CopyPlus />} label="Duplizieren" onClick={duplicateSelected} />
        <ToolButton icon={<Layers2 />} label="Anordnen" active={act('arrange')} onClick={tp('arrange')} />
        <ToolButton icon={<Lock />} label="Sperren" onClick={toggleLock} />
        <ToolButton icon={<Trash2 />} label="Löschen" danger onClick={deleteSelected} />
      </>
    );
  }

  return (
    <div className="flex items-stretch border-t border-line bg-surface">
      {el && (
        <button type="button" aria-label="Auswahl aufheben" onClick={() => select(null)} className="flex w-12 shrink-0 items-center justify-center border-r border-line text-ink-2">
          <X className="h-5 w-5" />
        </button>
      )}
      <div key={el ? `${el.type}-${el.locked}` : 'none'} className="hscroll min-w-0 flex-1 gap-0.5 px-1.5 py-1.5">
        {items}
      </div>
    </div>
  );
}
