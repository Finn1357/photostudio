/** Panels für das ausgewählte Element. */
import { useEffect, useState } from 'react';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline, Strikethrough, CaseUpper, Lasso, RotateCcw, Copy, ClipboardPaste, CopyPlus, Lock, Trash2, BringToFront, SendToBack, ArrowUp, ArrowDown } from 'lucide-react';
import type { Adjustments, DesignElement, FrameKind, MaskShape, PhotoElement, ShadowStyle, ShapeElement, StickerElement, TextBackgroundKind, TextElement } from '../../types/doc';
import { useEditor, useSelectedElement, commit } from '../store';
import { updateElement } from '../ops';
import { DEFAULT_ADJUST, FILTER_PRESETS, applyAdjustments, presetAdjust } from '../../lib/filters';
import { loadAsset, sourceSize } from '../../lib/images';
import { FRAME_KINDS, photoArea } from '../../render/paint';
import { FONTS, FONT_CATEGORIES, ensureFont } from '../../lib/fonts';
import { TEXT_PRESETS, TEXT_PRESET_GROUPS } from '../../content/presets';
import { getStickerDef } from '../../content/stickers';
import { ColorRow, SectionTitle, Segmented, Slider, Toggle, cx, Chip } from '../../ui/components';
import { arrange, copySelected, deleteSelected, duplicateSelected, paste, toggleLock, addText } from '../actions';
import { NO_SHADOW, SOFT_SHADOW } from '../factory';

function useUpdate<T extends DesignElement>(el: T | undefined) {
  return (patch: Partial<T> | ((e: T) => T), key?: string) => {
    if (!el) return;
    commit((d) => updateElement<T>(d, el.id, patch), key ? { coalesce: el.id + key } : undefined);
  };
}

// ---------------- Foto: Filter ----------------

const filterThumbCache = new Map<string, string[]>();

export function PhotoFilterPanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const upd = useUpdate(el);
  const [thumbs, setThumbs] = useState<string[] | null>(null);
  const assetId = el?.assetId;
  const rot = el?.adjust.rotate90 ?? 0;
  useEffect(() => {
    if (!assetId) return;
    const key = assetId + rot;
    const cached = filterThumbCache.get(key);
    if (cached) {
      setThumbs(cached);
      return;
    }
    let alive = true;
    void loadAsset(assetId, 'preview').then((src) => {
      if (!src || !alive) return;
      const S = 88;
      const c = document.createElement('canvas');
      c.width = c.height = S;
      const ctx = c.getContext('2d', { willReadFrequently: true })!;
      const { w, h } = sourceSize(src);
      const s = Math.max(S / w, S / h);
      ctx.translate(S / 2, S / 2);
      ctx.rotate((rot * Math.PI) / 2);
      ctx.drawImage(src, (-w * s) / 2, (-h * s) / 2, w * s, h * s);
      const base = ctx.getImageData(0, 0, S, S);
      const out = FILTER_PRESETS.map((p) => {
        const img = new ImageData(new Uint8ClampedArray(base.data), S, S);
        applyAdjustments(img, { ...DEFAULT_ADJUST, ...p.adjust, blur: (p.adjust.blur ?? 0) * 0.6 });
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.putImageData(img, 0, 0);
        return c.toDataURL('image/jpeg', 0.8);
      });
      filterThumbCache.set(key, out);
      if (alive) setThumbs(out);
    });
    return () => {
      alive = false;
    };
  }, [assetId, rot]);
  if (!el || el.type !== 'photo') return null;
  if (!el.assetId) return <p className="text-[13px] text-ink-2">Zuerst ein Foto einsetzen.</p>;
  return (
    <div className="hscroll gap-2 py-1">
      {FILTER_PRESETS.map((p, i) => (
        <button key={p.id} type="button" onClick={() => upd({ adjust: presetAdjust(p.id, el.adjust) })} className="flex w-[72px] shrink-0 flex-col items-center gap-1">
          <span className={cx('h-[72px] w-[72px] overflow-hidden rounded-xl bg-surface-2', (el.adjust.preset ?? 'original') === p.id && 'ring-2 ring-accent ring-offset-2 ring-offset-surface')}>
            {thumbs?.[i] && <img src={thumbs[i]} alt="" className="h-full w-full object-cover" />}
          </span>
          <span className="text-[11px]">{p.name}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------- Foto: Anpassen ----------------

const ADJ: { key: keyof Adjustments; label: string; min: number; max: number }[] = [
  { key: 'brightness', label: 'Helligkeit', min: -100, max: 100 },
  { key: 'contrast', label: 'Kontrast', min: -100, max: 100 },
  { key: 'saturation', label: 'Sättigung', min: -100, max: 100 },
  { key: 'warmth', label: 'Wärme', min: -100, max: 100 },
  { key: 'hue', label: 'Farbton', min: -180, max: 180 },
  { key: 'exposure', label: 'Belichtung', min: -100, max: 100 },
  { key: 'fade', label: 'Verblassen', min: 0, max: 100 },
  { key: 'grayscale', label: 'Schwarzweiß', min: 0, max: 100 },
  { key: 'sepia', label: 'Sepia', min: 0, max: 100 },
  { key: 'blur', label: 'Weichzeichnen', min: 0, max: 100 },
  { key: 'sharpen', label: 'Schärfen', min: 0, max: 100 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 100 },
];

export function PhotoAdjustPanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const upd = useUpdate(el);
  if (!el || el.type !== 'photo') return null;
  return (
    <div>
      {ADJ.map((a) => (
        <Slider
          key={a.key}
          label={a.label}
          value={el.adjust[a.key] as number}
          min={a.min}
          max={a.max}
          center={a.min < 0}
          onChange={(v) => upd((p) => ({ ...p, adjust: { ...p.adjust, [a.key]: v, preset: undefined } }), 'adj-' + a.key)}
        />
      ))}
      <Slider label="Deckkraft" value={el.opacity * 100} min={5} max={100} onChange={(v) => upd({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
      <button type="button" onClick={() => upd({ adjust: { ...DEFAULT_ADJUST, rotate90: el.adjust.rotate90 } })} className="mt-2 flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-[13px] font-medium">
        <RotateCcw className="h-4 w-4" /> Zurücksetzen
      </button>
    </div>
  );
}

// ---------------- Foto: Form ----------------

const MASKS: { id: MaskShape; name: string; svg: string }[] = [
  { id: 'rect', name: 'Rechteck', svg: '<rect x="6" y="8" width="36" height="32" rx="3"/>' },
  { id: 'circle', name: 'Kreis', svg: '<circle cx="24" cy="24" r="18"/>' },
  { id: 'heart', name: 'Herz', svg: '<path d="M24 42C10 31 5 24 5 16.5 5 10 10 6 15.5 6c3.8 0 6.6 2 8.5 5 1.9-3 4.7-5 8.5-5C38 6 43 10 43 16.5 43 24 38 31 24 42z"/>' },
  { id: 'star', name: 'Stern', svg: '<path d="M24 5l5.6 12.2 13.4 1.4-10 9 2.9 13.2L24 34l-11.9 6.8 2.9-13.2-10-9 13.4-1.4z"/>' },
  { id: 'arch', name: 'Bogen', svg: '<path d="M8 44V22a16 16 0 0 1 32 0v22z"/>' },
  { id: 'hexagon', name: 'Sechseck', svg: '<path d="M14 6h20l10 18-10 18H14L4 24z"/>' },
  { id: 'diamond', name: 'Raute', svg: '<path d="M24 4 L44 24 L24 44 L4 24Z"/>' },
  { id: 'triangle', name: 'Dreieck', svg: '<path d="M24 6 L42 40 L6 40Z"/>' },
  { id: 'flower', name: 'Blüte', svg: '<path d="M24 4c4 0 6 5 6 8 3-2 9-3 11 1s-2 8-5 9c3 1 7 5 5 9s-8 3-11 1c0 3-2 8-6 8s-6-5-6-8c-3 2-9 3-11-1s2-8 5-9c-3-1-7-5-5-9s8-3 11-1c0-3 2-8 6-8z"/>' },
  { id: 'blob', name: 'Klecks', svg: '<path d="M24 6c10 0 18 6 18 16s-6 20-18 20S6 34 6 24 14 6 24 6z"/>' },
];

export function PhotoShapePanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const upd = useUpdate(el);
  const setMode = useEditor((s) => s.setMode);
  if (!el || el.type !== 'photo') return null;
  const unit = Math.min(el.width, el.height);
  return (
    <div className="space-y-2">
      <div className="hscroll gap-2 py-1">
        {el.points && el.shape === 'polygon' && (
          <button type="button" onClick={() => upd({ shape: 'polygon' })} className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl bg-accent-soft py-2 text-[11px] text-accent">
            <svg viewBox="0 0 48 48" className="h-8 w-8 fill-current">
              <path d="M6 6h28l8 36H6z" />
            </svg>
            Raster
          </button>
        )}
        {MASKS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => upd({ shape: m.id })}
            className={cx('flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl py-2 text-[11px]', el.shape === m.id ? 'bg-accent-soft text-accent' : 'bg-surface-2')}
          >
            <svg viewBox="0 0 48 48" className="h-8 w-8 fill-current" dangerouslySetInnerHTML={{ __html: m.svg }} />
            {m.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            setMode('lasso');
            useEditor.getState().setPanel(null);
          }}
          disabled={!el.assetId}
          className={cx('flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl py-2 text-[11px] disabled:opacity-40', el.shape === 'custom' ? 'bg-accent-soft text-accent' : 'bg-surface-2')}
        >
          <Lasso className="h-8 w-8" />
          Freie Form
        </button>
      </div>
      {(el.shape === 'rect' || el.shape === 'polygon' || el.shape === 'hexagon' || el.shape === 'diamond' || el.shape === 'triangle' || el.shape === 'star') && (
        <Slider label="Ecken" value={(el.cornerRadius / unit) * 100} min={0} max={50} onChange={(v) => upd({ cornerRadius: (v / 100) * unit }, 'radius')} />
      )}
      <p className="text-[12px] text-ink-2">„Freie Form“: Fahre mit dem Finger um den gewünschten Ausschnitt.</p>
    </div>
  );
}

// ---------------- Foto: Rahmen ----------------

export function PhotoFramePanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const upd = useUpdate(el);
  if (!el || el.type !== 'photo') return null;
  const f = el.frame;
  const setFrame = (kind: FrameKind) => {
    const def = FRAME_KINDS.find((k) => k.id === kind)!;
    upd((p) => ({
      ...p,
      frame: { ...p.frame, kind, color: def.defaults.color ?? p.frame.color, accent: def.defaults.accent ?? p.frame.accent },
      shadow: kind !== 'none' && !p.shadow.enabled ? { ...SOFT_SHADOW, blur: 0.04, offsetY: 0.012, opacity: 0.25 } : p.shadow,
    }));
  };
  const usesColor = !['tape', 'corners', 'floral', 'none'].includes(f.kind);
  const usesAccent = ['tape', 'corners', 'floral', 'film', 'double'].includes(f.kind);
  return (
    <div className="space-y-2">
      <div className="hscroll gap-2 py-1">
        {FRAME_KINDS.map((k) => (
          <Chip key={k.id} active={f.kind === k.id} onClick={() => setFrame(k.id)}>
            {k.name}
          </Chip>
        ))}
      </div>
      {f.kind !== 'none' && (
        <>
          <Slider label="Stärke" value={f.thickness * 100} min={0} max={100} onChange={(v) => upd((p) => ({ ...p, frame: { ...p.frame, thickness: v / 100 } }), 'frame-t')} />
          {usesColor && (
            <>
              <SectionTitle>Rahmenfarbe</SectionTitle>
              <ColorRow value={f.color} onChange={(c) => upd((p) => ({ ...p, frame: { ...p.frame, color: c } }), 'frame-c')} />
            </>
          )}
          {usesAccent && (
            <>
              <SectionTitle>{f.kind === 'film' ? 'Lochfarbe' : f.kind === 'double' ? 'Linienfarbe' : 'Akzentfarbe'}</SectionTitle>
              <ColorRow value={f.accent} onChange={(c) => upd((p) => ({ ...p, frame: { ...p.frame, accent: c } }), 'frame-a')} />
            </>
          )}
        </>
      )}
    </div>
  );
}

// ---------------- Schatten-Editor (gemeinsam) ----------------

function ShadowControls({ shadow, onChange }: { shadow: ShadowStyle; onChange: (s: ShadowStyle, key: string) => void }) {
  return (
    <>
      <Toggle label="Schatten" checked={shadow.enabled} onChange={(v) => onChange(v ? { ...SOFT_SHADOW, ...shadow, enabled: true } : { ...shadow, enabled: false }, 'sh-on')} />
      {shadow.enabled && (
        <>
          <Slider label="Weichheit" value={shadow.blur * 100} min={0} max={30} onChange={(v) => onChange({ ...shadow, blur: v / 100 }, 'sh-blur')} />
          <Slider label="Abstand" value={shadow.offsetY * 100} min={-10} max={15} center onChange={(v) => onChange({ ...shadow, offsetY: v / 100 }, 'sh-y')} />
          <Slider label="Versatz ↔" value={shadow.offsetX * 100} min={-10} max={10} center onChange={(v) => onChange({ ...shadow, offsetX: v / 100 }, 'sh-x')} />
          <Slider label="Stärke" value={shadow.opacity * 100} min={5} max={100} onChange={(v) => onChange({ ...shadow, opacity: v / 100 }, 'sh-o')} format={(v) => `${Math.round(v)} %`} />
          <ColorRow value={shadow.color} onChange={(c) => onChange({ ...shadow, color: c }, 'sh-c')} />
        </>
      )}
    </>
  );
}

export function PhotoBorderPanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const upd = useUpdate(el);
  if (!el || el.type !== 'photo') return null;
  const unit = Math.min(el.width, el.height);
  return (
    <div className="space-y-1">
      <Slider label="Umrandung" value={(el.border.width / unit) * 1000} min={0} max={80} onChange={(v) => upd((p) => ({ ...p, border: { ...p.border, width: (v / 1000) * unit } }), 'border-w')} />
      {el.border.width > 0 && <ColorRow value={el.border.color} onChange={(c) => upd((p) => ({ ...p, border: { ...p.border, color: c } }), 'border-c')} />}
      <ShadowControls shadow={el.shadow} onChange={(s, k) => upd({ shadow: s }, k)} />
    </div>
  );
}

// ---------------- Foto: Zuschneiden ----------------

const ASPECTS: { label: string; r: number | null }[] = [
  { label: 'Original', r: null },
  { label: '1:1', r: 1 },
  { label: '4:5', r: 0.8 },
  { label: '3:4', r: 0.75 },
  { label: '2:3', r: 2 / 3 },
  { label: '3:2', r: 1.5 },
  { label: '16:9', r: 16 / 9 },
  { label: '9:16', r: 9 / 16 },
];

export function PhotoCropPanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const upd = useUpdate(el);
  const [orig, setOrig] = useState<number | null>(null);
  const assetId = el?.assetId;
  const rot = el?.adjust.rotate90 ?? 0;
  useEffect(() => {
    if (!assetId) return;
    void loadAsset(assetId, 'preview').then((s) => {
      if (!s) return;
      const { w, h } = sourceSize(s);
      setOrig(rot % 2 ? h / w : w / h);
    });
  }, [assetId, rot]);
  if (!el || el.type !== 'photo') return null;
  const isSlot = el.slot !== undefined;
  const setAspect = (r: number | null) => {
    const ratio = r ?? orig;
    if (!ratio) return;
    upd((p) => {
      const a = photoArea(p);
      const insW = p.width - a.w,
        insH = p.height - a.h;
      const area = a.w * a.h;
      const aw = Math.sqrt(area * ratio),
        ah = aw / ratio;
      return { ...p, width: aw + insW, height: ah + insH, crop: { cx: 0.5, cy: 0.5, zoom: 1 } };
    });
  };
  return (
    <div className="space-y-2">
      {!isSlot && (
        <div className="hscroll gap-1.5">
          {ASPECTS.map((a) => (
            <Chip key={a.label} onClick={() => setAspect(a.r)}>
              {a.label}
            </Chip>
          ))}
        </div>
      )}
      <Slider label="Zoom" value={el.crop.zoom * 100} min={100} max={500} onChange={(v) => upd((p) => ({ ...p, crop: { ...p.crop, zoom: v / 100 } }), 'zoom')} format={(v) => `${Math.round(v)} %`} />
      <button type="button" onClick={() => upd({ crop: { cx: 0.5, cy: 0.5, zoom: 1 } })} className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-[13px] font-medium">
        <RotateCcw className="h-4 w-4" /> Ausschnitt zurücksetzen
      </button>
      <p className="text-[12px] text-ink-2">
        {isSlot ? 'Im Feld mit einem Finger verschieben, mit zwei Fingern zoomen.' : 'Seitenverhältnis wählen, dann Bildausschnitt mit dem Zoom und – bei Collage-Feldern – per Finger anpassen. Freie Fotos lassen sich auch über die seitlichen Griffe zuschneiden.'}
      </p>
    </div>
  );
}

// ---------------- Foto: Radierer ----------------

export function PhotoErasePanel() {
  const el = useSelectedElement() as PhotoElement | undefined;
  const eraser = useEditor((s) => s.eraser);
  const setEraser = useEditor((s) => s.setEraser);
  const upd = useUpdate(el);
  useEffect(() => {
    useEditor.getState().setMode('erase');
    return () => {
      if (useEditor.getState().mode === 'erase') useEditor.getState().setMode('select');
    };
  }, []);
  if (!el || el.type !== 'photo') return null;
  return (
    <div className="space-y-2">
      <Segmented
        value={eraser.mode}
        onChange={(m) => setEraser({ mode: m })}
        options={[
          { id: 'erase', label: 'Radieren' },
          { id: 'restore', label: 'Wiederherstellen' },
        ]}
      />
      <Slider label="Pinselgröße" value={eraser.size * 100} min={1} max={30} onChange={(v) => setEraser({ size: v / 100 })} />
      <div className="flex gap-2">
        <button type="button" onClick={() => useEditor.getState().undo()} className="flex-1 rounded-xl bg-surface-2 py-2.5 text-[14px] font-medium">
          Rückgängig
        </button>
        <button type="button" disabled={!el.mask.length} onClick={() => upd({ mask: [] })} className="flex-1 rounded-xl bg-surface-2 py-2.5 text-[14px] font-medium disabled:opacity-40">
          Alles wiederherstellen
        </button>
      </div>
      <p className="text-[12px] text-ink-2">Mit dem Finger über das Foto fahren, um Bereiche zu entfernen (Freistellen). Zwei Finger zoomen die Arbeitsfläche für feine Details.</p>
    </div>
  );
}

// ---------------- Text ----------------

export function TextFontPanel() {
  const el = useSelectedElement() as TextElement | undefined;
  const upd = useUpdate(el);
  const [cat, setCat] = useState<string>('alle');
  useEffect(() => {
    FONTS.forEach((f) => void ensureFont(f.family));
  }, []);
  if (!el || el.type !== 'text') return null;
  const fonts = cat === 'alle' ? FONTS : FONTS.filter((f) => f.category === cat);
  const toggle = (k: 'bold' | 'italic' | 'underline' | 'strike' | 'uppercase') => upd({ [k]: !el[k] } as Partial<TextElement>);
  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        {(
          [
            ['bold', <Bold key="b" className="h-4 w-4" />, 'Fett'],
            ['italic', <Italic key="i" className="h-4 w-4" />, 'Kursiv'],
            ['underline', <Underline key="u" className="h-4 w-4" />, 'Unterstrichen'],
            ['strike', <Strikethrough key="s" className="h-4 w-4" />, 'Durchgestrichen'],
            ['uppercase', <CaseUpper key="c" className="h-4 w-4" />, 'Großbuchstaben'],
          ] as const
        ).map(([k, icon, label]) => (
          <button key={k} type="button" aria-label={label} title={label} onClick={() => toggle(k)} className={cx('flex h-10 flex-1 items-center justify-center rounded-xl', el[k] ? 'bg-accent-soft text-accent' : 'bg-surface-2')}>
            {icon}
          </button>
        ))}
      </div>
      <div className="hscroll gap-1.5">
        <Chip active={cat === 'alle'} onClick={() => setCat('alle')}>
          Alle
        </Chip>
        {FONT_CATEGORIES.map((c) => (
          <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
            {c.name}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {fonts.map((f) => (
          <button
            key={f.family}
            type="button"
            onClick={() => upd({ fontFamily: f.family })}
            className={cx('truncate rounded-xl px-2 py-2.5 text-[18px]', el.fontFamily === f.family ? 'bg-accent-soft text-accent' : 'bg-surface-2')}
            style={{ fontFamily: `'${f.family}'` }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TextColorPanel() {
  const el = useSelectedElement() as TextElement | undefined;
  const upd = useUpdate(el);
  if (!el || el.type !== 'text') return null;
  return (
    <div className="space-y-1">
      <Toggle label="Farbverlauf" checked={!!el.gradient} onChange={(v) => upd({ gradient: v ? { from: el.color, to: '#f28aa5', angle: 90 } : null })} />
      {el.gradient ? (
        <>
          <SectionTitle>Von</SectionTitle>
          <ColorRow value={el.gradient.from} onChange={(c) => upd((t) => ({ ...t, gradient: { ...t.gradient!, from: c } }), 'gf')} />
          <SectionTitle>Nach</SectionTitle>
          <ColorRow value={el.gradient.to} onChange={(c) => upd((t) => ({ ...t, gradient: { ...t.gradient!, to: c } }), 'gt')} />
          <Slider label="Richtung" value={el.gradient.angle} min={0} max={360} onChange={(v) => upd((t) => ({ ...t, gradient: { ...t.gradient!, angle: v } }), 'ga')} format={(v) => `${Math.round(v)}°`} />
        </>
      ) : (
        <ColorRow value={el.color} onChange={(c) => upd({ color: c }, 'color')} />
      )}
      <Slider label="Deckkraft" value={el.opacity * 100} min={5} max={100} onChange={(v) => upd({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
    </div>
  );
}

const TEXT_BGS: { id: TextBackgroundKind; name: string }[] = [
  { id: 'none', name: 'Ohne' },
  { id: 'solid', name: 'Fläche' },
  { id: 'pill', name: 'Pille' },
  { id: 'paper', name: 'Papier' },
  { id: 'tape', name: 'Tape' },
  { id: 'label', name: 'Etikett' },
  { id: 'note', name: 'Notiz' },
  { id: 'brush', name: 'Pinsel' },
];

export function TextStylePanel() {
  const el = useSelectedElement() as TextElement | undefined;
  const upd = useUpdate(el);
  const [tab, setTab] = useState<'kontur' | 'schatten' | 'hintergrund'>('hintergrund');
  if (!el || el.type !== 'text') return null;
  return (
    <div className="space-y-2">
      <Segmented
        value={tab}
        onChange={setTab}
        options={[
          { id: 'hintergrund', label: 'Hintergrund' },
          { id: 'kontur', label: 'Kontur' },
          { id: 'schatten', label: 'Schatten' },
        ]}
      />
      {tab === 'hintergrund' && (
        <>
          <div className="hscroll gap-1.5">
            {TEXT_BGS.map((b) => (
              <Chip
                key={b.id}
                active={el.background.kind === b.id}
                onClick={() =>
                  upd((t) => ({
                    ...t,
                    background: { ...t.background, kind: b.id, color: b.id === 'tape' ? '#f2b48a' : b.id === 'note' ? '#ffe08a' : b.id === 'paper' ? '#fbf8f2' : t.background.color },
                  }))
                }
              >
                {b.name}
              </Chip>
            ))}
          </div>
          {el.background.kind !== 'none' && (
            <>
              <ColorRow value={el.background.color} onChange={(c) => upd((t) => ({ ...t, background: { ...t.background, color: c } }), 'bgc')} />
              <Slider label="Deckkraft" value={el.background.opacity * 100} min={10} max={100} onChange={(v) => upd((t) => ({ ...t, background: { ...t.background, opacity: v / 100 } }), 'bgo')} format={(v) => `${Math.round(v)} %`} />
              <Slider label="Innenabstand" value={el.background.padding * 100} min={5} max={120} onChange={(v) => upd((t) => ({ ...t, background: { ...t.background, padding: v / 100 } }), 'bgp')} />
            </>
          )}
        </>
      )}
      {tab === 'kontur' && (
        <>
          <Slider label="Stärke" value={(el.stroke.width / el.fontSize) * 100} min={0} max={25} onChange={(v) => upd((t) => ({ ...t, stroke: { ...t.stroke, width: (v / 100) * t.fontSize } }), 'sw')} />
          <ColorRow value={el.stroke.color} onChange={(c) => upd((t) => ({ ...t, stroke: { width: t.stroke.width || t.fontSize * 0.05, color: c } }), 'sc')} />
        </>
      )}
      {tab === 'schatten' && <ShadowControls shadow={el.shadow} onChange={(s, k) => upd({ shadow: s }, k)} />}
    </div>
  );
}

export function TextSpacingPanel() {
  const el = useSelectedElement() as TextElement | undefined;
  const upd = useUpdate(el);
  const doc = useEditor((s) => s.doc)!;
  if (!el || el.type !== 'text') return null;
  const unit = Math.min(doc.width, doc.height);
  return (
    <div className="space-y-1">
      <div className="flex gap-1.5 pb-1">
        {(
          [
            ['left', <AlignLeft key="l" className="h-4 w-4" />],
            ['center', <AlignCenter key="c" className="h-4 w-4" />],
            ['right', <AlignRight key="r" className="h-4 w-4" />],
          ] as const
        ).map(([a, icon]) => (
          <button key={a} type="button" aria-label={`Ausrichtung ${a}`} onClick={() => upd({ align: a })} className={cx('flex h-10 flex-1 items-center justify-center rounded-xl', el.align === a ? 'bg-accent-soft text-accent' : 'bg-surface-2')}>
            {icon}
          </button>
        ))}
      </div>
      <Slider label="Größe" value={(el.fontSize / unit) * 1000} min={10} max={300} onChange={(v) => upd((t) => ({ ...t, fontSize: (v / 1000) * unit, width: Math.max(t.width, (v / 1000) * unit) }), 'size')} />
      <Slider label="Zeilenabstand" value={el.lineHeight * 100} min={70} max={250} onChange={(v) => upd({ lineHeight: v / 100 }, 'lh')} format={(v) => (v / 100).toFixed(2)} />
      <Slider label="Buchstaben" value={el.letterSpacing * 100} min={-10} max={60} center onChange={(v) => upd({ letterSpacing: v / 100 }, 'ls')} />
      <Slider label="Biegen" value={el.curve} min={-100} max={100} center onChange={(v) => upd({ curve: Math.abs(v) < 3 ? 0 : v }, 'curve')} />
      <Slider label="Drehung" value={el.rotation} min={-180} max={180} center onChange={(v) => upd({ rotation: v }, 'rot')} format={(v) => `${Math.round(v)}°`} />
    </div>
  );
}

export function TextPresetsPanel() {
  const [group, setGroup] = useState(TEXT_PRESET_GROUPS[0]!);
  useEffect(() => {
    TEXT_PRESETS.forEach((p) => p.style.fontFamily && void ensureFont(p.style.fontFamily, !!p.style.bold));
  }, []);
  return (
    <div className="space-y-2">
      <div className="hscroll gap-1.5">
        {TEXT_PRESET_GROUPS.map((g) => (
          <Chip key={g} active={group === g} onClick={() => setGroup(g)}>
            {g}
          </Chip>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {TEXT_PRESETS.filter((p) => p.group === group).map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              const { background, shadow, ...rest } = p.style;
              addText({ text: p.text, ...rest, background: background ?? { kind: 'none', color: '#ffffff', opacity: 1, padding: 0.35 }, shadow: shadow ?? { ...NO_SHADOW } }, false);
              useEditor.getState().setPanel(null);
            }}
            className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-surface-2 px-2"
          >
            <span
              className="line-clamp-2 text-center leading-tight"
              style={{
                fontFamily: `'${p.style.fontFamily}'`,
                fontWeight: p.style.bold ? 700 : 400,
                fontStyle: p.style.italic ? 'italic' : 'normal',
                color: p.style.gradient ? p.style.gradient.to : p.style.color === '#ffffff' ? (p.style.background?.color ?? '#888') : p.style.color,
                fontSize: 20,
                letterSpacing: `${(p.style.letterSpacing ?? 0) * 0.6}em`,
              }}
            >
              {p.text}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------- Sticker ----------------

export function StickerColorPanel() {
  const el = useSelectedElement() as StickerElement | undefined;
  const upd = useUpdate(el);
  const [slot, setSlot] = useState(0);
  if (!el || el.type !== 'sticker') return null;
  const def = el.stickerId ? getStickerDef(el.stickerId) : undefined;
  const colors = def ? def.colors.map((c, i) => el.colors?.[i] || c) : [];
  return (
    <div className="space-y-2">
      {def ? (
        <>
          {colors.length > 1 && (
            <div className="flex gap-2">
              {colors.map((c, i) => (
                <button key={i} type="button" onClick={() => setSlot(i)} className={cx('flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px]', slot === i ? 'bg-ink text-bg' : 'bg-surface-2')}>
                  <span className="h-4 w-4 rounded-full border border-line" style={{ background: c }} /> Farbe {i + 1}
                </button>
              ))}
            </div>
          )}
          <ColorRow value={colors[slot] ?? '#000000'} onChange={(c) => upd((s) => ({ ...s, colors: colors.map((x, i) => (i === slot ? c : x)) }), 'col' + slot)} />
          <button type="button" onClick={() => upd({ colors: undefined })} className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 py-2 text-[13px] font-medium">
            <RotateCcw className="h-4 w-4" /> Originalfarben
          </button>
        </>
      ) : (
        <p className="text-[13px] text-ink-2">Eigene Sticker behalten ihre Originalfarben.</p>
      )}
      <Slider label="Deckkraft" value={el.opacity * 100} min={5} max={100} onChange={(v) => upd({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
      <ShadowControls shadow={el.shadow ?? { ...NO_SHADOW }} onChange={(s, k) => upd({ shadow: s }, k)} />
    </div>
  );
}

// ---------------- Form ----------------

export function ShapeStylePanel() {
  const el = useSelectedElement() as ShapeElement | undefined;
  const upd = useUpdate(el);
  const [tab, setTab] = useState<'fuellung' | 'kontur'>('fuellung');
  if (!el || el.type !== 'shape') return null;
  const unit = Math.min(el.width, el.height);
  const isLine = el.shape === 'line' || el.shape === 'arrow';
  return (
    <div className="space-y-2">
      {!isLine && (
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { id: 'fuellung', label: 'Füllung' },
            { id: 'kontur', label: 'Kontur' },
          ]}
        />
      )}
      {tab === 'fuellung' && !isLine ? (
        <ColorRow value={el.fill} onChange={(c) => upd({ fill: c }, 'fill')} allowNone />
      ) : (
        <>
          <ColorRow value={el.stroke} onChange={(c) => upd((s) => ({ ...s, stroke: c, strokeWidth: s.strokeWidth || Math.max(4, unit * 0.04) }), 'stroke')} allowNone={!isLine} />
          <Slider label="Stärke" value={el.strokeWidth} min={0} max={Math.max(40, Math.round(unit * 0.25))} onChange={(v) => upd({ strokeWidth: v }, 'sw')} />
          <Toggle label="Gestrichelt" checked={el.dashed} onChange={(v) => upd({ dashed: v })} />
        </>
      )}
      {!isLine && ['rect', 'hexagon', 'diamond', 'triangle', 'star'].includes(el.shape) && (
        <Slider label="Ecken" value={(el.cornerRadius / unit) * 100} min={0} max={50} onChange={(v) => upd({ cornerRadius: (v / 100) * unit }, 'radius')} />
      )}
      <Slider label="Deckkraft" value={el.opacity * 100} min={5} max={100} onChange={(v) => upd({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
    </div>
  );
}

// ---------------- Deckkraft & Anordnen ----------------

export function OpacityPanel() {
  const el = useSelectedElement();
  const upd = useUpdate(el);
  if (!el) return null;
  return <Slider label="Deckkraft" value={el.opacity * 100} min={5} max={100} onChange={(v) => upd({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />;
}

export function ArrangePanel() {
  const el = useSelectedElement();
  const clipboard = useEditor((s) => s.clipboard);
  if (!el) return null;
  const btn = (icon: React.ReactNode, label: string, onClick: () => void, disabled = false, danger = false) => (
    <button type="button" onClick={onClick} disabled={disabled} className={cx('flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-2.5 text-[12px] disabled:opacity-35 [&>svg]:h-5 [&>svg]:w-5', danger && 'text-red-500')}>
      {icon}
      {label}
    </button>
  );
  return (
    <div className="grid grid-cols-4 gap-2">
      {btn(<BringToFront />, 'Ganz vorne', () => arrange('top'))}
      {btn(<ArrowUp />, 'Nach vorne', () => arrange('up'))}
      {btn(<ArrowDown />, 'Nach hinten', () => arrange('down'))}
      {btn(<SendToBack />, 'Ganz hinten', () => arrange('bottom'))}
      {btn(<CopyPlus />, 'Duplizieren', duplicateSelected)}
      {btn(<Copy />, 'Kopieren', copySelected)}
      {btn(<ClipboardPaste />, 'Einfügen', paste, !clipboard)}
      {btn(<Lock />, el.locked ? 'Entsperren' : 'Sperren', toggleLock)}
      {btn(<Trash2 />, el.type === 'photo' && el.slot !== undefined ? 'Foto entfernen' : 'Löschen', deleteSelected, false, true)}
    </div>
  );
}
