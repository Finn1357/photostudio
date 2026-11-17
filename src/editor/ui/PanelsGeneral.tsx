/** Allgemeine Editor-Panels. */
import { useMemo, useState } from 'react';
import {
  Camera,
  Images,
  ImagePlus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ChevronUp,
  ChevronDown,
  Type,
  Shapes,
  PenLine,
  Sticker,
  Image as ImageIcon,
  Upload,
  Search,
  Shuffle,
  Undo2,
  Grid2x2X,
} from 'lucide-react';
import type { BackgroundFill, CollageSettings, DesignElement, PhotoElement, ShapeKind } from '../../types/doc';
import { useEditor, commit } from '../store';
import { applyLayout, changeFormat, fitPhotoBox, addElement, moveLayer, reorderLayer, setCollageSettings, slotPhotos, updateElement } from '../ops';
import { LAYOUTS, LAYOUT_STYLE_NAMES, type CollageLayout, type LayoutStyle } from '../../content/layouts';
import { computeSlots } from '../collage';
import { FORMATS } from '../../content/formats';
import { PATTERNS, patternSvg } from '../../content/patterns';
import { TEXTURES } from '../../content/textures';
import { GRADIENTS } from '../../content/presets';
import { STICKERS, STICKER_CATEGORIES, searchStickers, stickerThumb } from '../../content/stickers';
import { addShape, addSticker, pickCustomSticker, pickPhotos, replaceSticker } from '../actions';
import { Chip, ColorRow, SectionTitle, Segmented, Slider, cx, PrimaryButton } from '../../ui/components';
import { kvGet, kvSet, getAsset } from '../../lib/db';
import { newPhoto, SOFT_SHADOW } from '../factory';
import { renderTexture } from '../../content/textures';
import { getStickerDef } from '../../content/stickers';
import { useEffect } from 'react';

// ---------------- Fotos ----------------

export function PhotosPanel() {
  const doc = useEditor((s) => s.doc)!;
  const addOverflow = async (assetId: string) => {
    const a = await getAsset(assetId);
    if (!a) return;
    const box = fitPhotoBox(a.width, a.height, doc.width, doc.height, 0.5);
    const p = newPhoto({ ...box, x: doc.width / 2, y: doc.height / 2, assetId, shadow: { ...SOFT_SHADOW }, border: { width: Math.min(doc.width, doc.height) * 0.012, color: '#ffffff' } });
    commit((d) => ({ ...addElement(d, p), overflow: d.overflow.filter((x) => x !== assetId) }));
    useEditor.getState().select(p.id);
  };
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <BigAction icon={<Images />} label="Mediathek" onClick={() => pickPhotos({ multiple: true })} />
        <BigAction icon={<Camera />} label="Kamera" onClick={() => pickPhotos({ camera: true, multiple: false })} />
        <BigAction icon={<ImageIcon />} label="Als Hintergrund" onClick={() => pickPhotos({ background: true })} />
      </div>
      <p className="text-[13px] leading-snug text-ink-2">
        Mehrere Fotos auf einmal wählen: Sie füllen zuerst die leeren Felder, weitere Fotos werden frei platziert. Ein leeres Feld antippen, um gezielt ein Foto einzusetzen.
      </p>
      {doc.overflow.length > 0 && (
        <div>
          <SectionTitle>Nicht platzierte Fotos</SectionTitle>
          <div className="hscroll gap-2">
            {doc.overflow.map((id) => (
              <OverflowThumb key={id} assetId={id} onClick={() => void addOverflow(id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverflowThumb({ assetId, onClick }: { assetId: string; onClick: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let u: string | null = null;
    void getAsset(assetId).then((a) => {
      if (a) {
        u = URL.createObjectURL(a.preview);
        setUrl(u);
      }
    });
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [assetId]);
  return (
    <button type="button" onClick={onClick} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
      {url && <img src={url} alt="" className="h-full w-full object-cover" />}
    </button>
  );
}

export function BigAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-2xl bg-surface-2 px-2 py-3 text-[13px] font-medium active:scale-[0.97] [&>svg]:h-6 [&>svg]:w-6">
      {icon}
      {label}
    </button>
  );
}

// ---------------- Raster ----------------

function LayoutThumb({ layout, aspect, active, onClick }: { layout: CollageLayout; aspect: number; active: boolean; onClick: () => void }) {
  const W = 100 * Math.min(1, aspect),
    H = 100 / Math.max(1, aspect);
  const slots = useMemo(() => computeSlots(layout, { layoutId: layout.id, gap: 0.04, margin: 0.04, radius: 0.02 }, W, H), [layout, W, H]);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={layout.name}
      className={cx('flex h-[74px] w-[74px] shrink-0 items-center justify-center rounded-xl bg-surface-2 p-1.5', active && 'ring-2 ring-accent')}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="max-h-full max-w-full" style={{ width: W >= H ? '100%' : 'auto', height: H > W ? '100%' : 'auto' }}>
        <rect width={W} height={H} rx={3} className="fill-surface" />
        {slots.map((s, i) => {
          const fill = active ? 'var(--accent)' : 'var(--ink-2)';
          const t = `rotate(${s.rotation} ${s.x} ${s.y})`;
          const x = s.x - s.width / 2,
            y = s.y - s.height / 2;
          if (s.points) {
            const pts = [];
            for (let k = 0; k + 1 < s.points.length; k += 2) pts.push(`${x + s.points[k]! * s.width},${y + s.points[k + 1]! * s.height}`);
            return <polygon key={i} points={pts.join(' ')} fill={fill} opacity={0.55} />;
          }
          if (s.shape === 'circle') return <ellipse key={i} cx={s.x} cy={s.y} rx={s.width / 2} ry={s.height / 2} fill={fill} opacity={0.55} />;
          if (s.shape === 'heart')
            return (
              <path
                key={i}
                transform={`translate(${x} ${y}) scale(${s.width / 100} ${s.height / 100})`}
                d="M50 26 C50 22 43 2 25 2 C5 2 0 20 0 32 C0 58 28 76 50 98 C72 76 100 58 100 32 C100 20 95 2 75 2 C57 2 50 22 50 26Z"
                fill={fill}
                opacity={0.55}
              />
            );
          const pol = s.frame === 'polaroid' || s.frame === 'tape';
          return (
            <g key={i} transform={t}>
              {pol && <rect x={x} y={y} width={s.width} height={s.height} fill="#fff" stroke={fill} strokeWidth={0.8} opacity={0.9} />}
              <rect
                x={x + (pol ? s.width * 0.08 : 0)}
                y={y + (pol ? s.height * 0.07 : 0)}
                width={s.width * (pol ? 0.84 : 1)}
                height={s.height * (pol ? (s.frame === 'polaroid' ? 0.7 : 0.86) : 1)}
                rx={s.shape === 'arch' ? s.width / 2 : 2}
                fill={fill}
                opacity={0.55}
              />
            </g>
          );
        })}
      </svg>
    </button>
  );
}

export function LayoutPanel() {
  const doc = useEditor((s) => s.doc)!;
  const current = doc.collage;
  const photoCount = doc.elements.filter((e) => e.type === 'photo' && e.assetId).length + doc.overflow.length;
  const [count, setCount] = useState<number | null>(current ? LAYOUTS.find((l) => l.id === current.layoutId)?.count ?? null : photoCount ? Math.min(12, photoCount) : null);
  const [style, setStyle] = useState<LayoutStyle | null>(null);
  const list = LAYOUTS.filter((l) => (!count || l.count === count) && (!style || l.style === style));
  const aspect = doc.width / doc.height;
  const setC = (p: Partial<CollageSettings>) => commit((d) => setCollageSettings(d, p), { coalesce: 'collage-' + Object.keys(p).join() });
  const shuffle = () =>
    commit((d) => {
      const slots = slotPhotos(d);
      const contents = slots.map((p) => ({ assetId: p.assetId, crop: p.crop, adjust: p.adjust, mask: p.mask }));
      for (let i = contents.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [contents[i], contents[j]] = [contents[j]!, contents[i]!];
      }
      let next = d;
      slots.forEach((p, i) => (next = updateElement<PhotoElement>(next, p.id, contents[i]!)));
      return next;
    });
  const removeGrid = () =>
    commit((d) => ({
      ...d,
      collage: null,
      elements: d.elements
        .filter((e) => !(e.type === 'photo' && e.slot !== undefined && !e.assetId))
        .map((e) => {
          if (e.type !== 'photo' || e.slot === undefined) return e;
          const { slot: _s, ...rest } = e;
          return rest as PhotoElement;
        }),
    }));
  return (
    <div className="space-y-2">
      <div className="hscroll gap-1.5">
        <Chip active={!count} onClick={() => setCount(null)}>
          Alle
        </Chip>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
          <Chip key={n} active={count === n} onClick={() => setCount(n)}>
            {n} {n === 1 ? 'Foto' : 'Fotos'}
          </Chip>
        ))}
      </div>
      <div className="hscroll gap-1.5">
        <Chip active={!style} onClick={() => setStyle(null)}>
          Alle Stile
        </Chip>
        {(Object.keys(LAYOUT_STYLE_NAMES) as LayoutStyle[]).map((s) => (
          <Chip key={s} active={style === s} onClick={() => setStyle(s)}>
            {LAYOUT_STYLE_NAMES[s]}
          </Chip>
        ))}
      </div>
      <div className="hscroll gap-2 py-1">
        {list.map((l) => (
          <LayoutThumb key={l.id} layout={l} aspect={aspect} active={current?.layoutId === l.id} onClick={() => commit((d) => applyLayout(d, l.id))} />
        ))}
        {!list.length && <p className="py-4 text-[13px] text-ink-2">Keine Raster für diese Auswahl.</p>}
      </div>
      {current && (
        <>
          <Slider label="Abstand" value={current.gap * 1000} min={0} max={80} onChange={(v) => setC({ gap: v / 1000 })} />
          <Slider label="Außenrand" value={current.margin * 1000} min={0} max={120} onChange={(v) => setC({ margin: v / 1000 })} />
          <Slider label="Ecken" value={current.radius * 1000} min={0} max={120} onChange={(v) => setC({ radius: v / 1000 })} />
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={shuffle} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-[14px] font-medium">
              <Shuffle className="h-4 w-4" /> Fotos mischen
            </button>
            <button type="button" onClick={removeGrid} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-[14px] font-medium">
              <Grid2x2X className="h-4 w-4" /> Raster lösen
            </button>
          </div>
          <p className="text-[12px] text-ink-2">Tipp: Foto lange drücken und auf ein anderes Feld ziehen, um Fotos zu tauschen. Mit einem Finger verschiebst du den Bildausschnitt, mit zwei Fingern zoomst du.</p>
        </>
      )}
    </div>
  );
}

// ---------------- Hintergrund ----------------

const textureThumbs = new Map<string, string>();
function textureThumb(id: string, tint: string | null) {
  const key = id + (tint ?? '');
  let v = textureThumbs.get(key);
  if (!v) {
    const c = renderTexture(id, tint, 128);
    v = c.toDataURL('image/jpeg', 0.8);
    textureThumbs.set(key, v);
  }
  return v;
}

function patternThumb(id: string, colors: string[]) {
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(patternSvg(id, colors));
}

type BgTab = 'farbe' | 'verlauf' | 'muster' | 'textur' | 'foto';

export function BackgroundPanel() {
  const doc = useEditor((s) => s.doc)!;
  const bg = doc.background;
  const fill = bg.fill;
  const initial: BgTab = fill.kind === 'gradient' ? 'verlauf' : fill.kind === 'pattern' ? 'muster' : fill.kind === 'texture' ? 'textur' : fill.kind === 'image' ? 'foto' : 'farbe';
  const [tab, setTab] = useState<BgTab>(initial);
  const setFill = (f: BackgroundFill, coalesce?: string) => commit((d) => ({ ...d, background: { ...d.background, fill: f } }), coalesce ? { coalesce } : undefined);
  const setBg = (p: Partial<typeof bg>, key: string) => commit((d) => ({ ...d, background: { ...d.background, ...p } }), { coalesce: 'bg-' + key });
  const [lazyTex, setLazyTex] = useState(false);
  useEffect(() => {
    if (tab === 'textur') {
      const t = setTimeout(() => setLazyTex(true), 30);
      return () => clearTimeout(t);
    }
  }, [tab]);

  return (
    <div className="space-y-2">
      <Segmented<BgTab>
        value={tab}
        onChange={setTab}
        options={[
          { id: 'farbe', label: 'Farbe' },
          { id: 'verlauf', label: 'Verlauf' },
          { id: 'muster', label: 'Muster' },
          { id: 'textur', label: 'Textur' },
          { id: 'foto', label: 'Foto' },
        ]}
      />
      {tab === 'farbe' && (
        <>
          <ColorRow value={fill.kind === 'color' ? fill.color : ''} onChange={(c) => setFill(c ? { kind: 'color', color: c } : { kind: 'none' }, 'bg-color')} allowNone />
          <p className="text-[12px] text-ink-2">„Keine Farbe“ ergibt einen transparenten Hintergrund (für PNG-Export).</p>
        </>
      )}
      {tab === 'verlauf' && (
        <>
          <div className="hscroll gap-2 py-1">
            {GRADIENTS.map((g) => (
              <button
                key={g.id}
                type="button"
                aria-label={g.id}
                onClick={() => setFill({ kind: 'gradient', colors: g.colors, angle: g.angle, radial: !!g.radial })}
                className="h-14 w-14 shrink-0 rounded-xl border border-line"
                style={{ background: g.radial ? `radial-gradient(${g.colors.join(',')})` : `linear-gradient(${g.angle + 90}deg, ${g.colors.join(',')})` }}
              />
            ))}
          </div>
          {fill.kind === 'gradient' && (
            <>
              {fill.colors.map((c, i) => (
                <div key={i}>
                  <SectionTitle>Farbe {i + 1}</SectionTitle>
                  <ColorRow value={c} onChange={(nc) => setFill({ ...fill, colors: fill.colors.map((x, j) => (j === i ? nc : x)) }, 'bg-grad-' + i)} />
                </div>
              ))}
              {!fill.radial && <Slider label="Winkel" value={fill.angle} min={0} max={360} onChange={(v) => setFill({ ...fill, angle: v }, 'bg-angle')} format={(v) => `${Math.round(v)}°`} />}
            </>
          )}
        </>
      )}
      {tab === 'muster' && (
        <>
          <div className="grid grid-cols-5 gap-2 py-1 sm:grid-cols-7">
            {PATTERNS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-label={p.name}
                title={p.name}
                onClick={() => setFill({ kind: 'pattern', patternId: p.id, colors: p.colors })}
                className={cx('aspect-square rounded-xl border border-line bg-cover', fill.kind === 'pattern' && fill.patternId === p.id && 'ring-2 ring-accent')}
                style={{ backgroundImage: `url("${patternThumb(p.id, p.colors)}")`, backgroundSize: p.cover ? 'cover' : '50%' }}
              />
            ))}
          </div>
          {fill.kind === 'pattern' && (
            <>
              <SectionTitle>Hintergrundfarbe</SectionTitle>
              <ColorRow value={fill.colors[0] ?? '#ffffff'} onChange={(c) => setFill({ ...fill, colors: [c, ...fill.colors.slice(1)] }, 'bg-pc0')} />
              <SectionTitle>Musterfarbe</SectionTitle>
              <ColorRow value={fill.colors[1] ?? '#000000'} onChange={(c) => setFill({ ...fill, colors: [fill.colors[0] ?? '#ffffff', c, ...fill.colors.slice(2)] }, 'bg-pc1')} />
              <Slider label="Größe" value={bg.scale * 100} min={25} max={400} onChange={(v) => setBg({ scale: v / 100 }, 'scale')} format={(v) => `${Math.round(v)} %`} />
            </>
          )}
        </>
      )}
      {tab === 'textur' && (
        <>
          <div className="grid grid-cols-5 gap-2 py-1 sm:grid-cols-7">
            {TEXTURES.map((t) => (
              <button
                key={t.id}
                type="button"
                title={t.name}
                aria-label={t.name}
                onClick={() => setFill({ kind: 'texture', textureId: t.id, tint: null })}
                className={cx('aspect-square overflow-hidden rounded-xl border border-line bg-surface-2', fill.kind === 'texture' && fill.textureId === t.id && 'ring-2 ring-accent')}
              >
                {lazyTex && <img src={textureThumb(t.id, null)} alt="" className="h-full w-full object-cover" />}
              </button>
            ))}
          </div>
          {fill.kind === 'texture' && (
            <>
              <SectionTitle>Farbton</SectionTitle>
              <ColorRow value={fill.tint ?? ''} onChange={(c) => setFill({ ...fill, tint: c || null }, 'bg-tint')} allowNone />
              <Slider label="Größe" value={bg.scale * 100} min={25} max={400} onChange={(v) => setBg({ scale: v / 100 }, 'scale')} format={(v) => `${Math.round(v)} %`} />
            </>
          )}
        </>
      )}
      {tab === 'foto' && (
        <>
          <PrimaryButton className="h-11 w-full" onClick={() => pickPhotos({ background: true })}>
            <ImagePlus className="h-5 w-5" /> {fill.kind === 'image' ? 'Anderes Foto wählen' : 'Foto als Hintergrund wählen'}
          </PrimaryButton>
          {fill.kind === 'image' && (
            <>
              <Slider label="Zoom" value={bg.scale * 100} min={100} max={400} onChange={(v) => setBg({ scale: v / 100 }, 'scale')} format={(v) => `${Math.round(v)} %`} />
              <Slider label="Position ↔" value={bg.offsetX * 100} min={-100} max={100} center onChange={(v) => setBg({ offsetX: v / 100 }, 'ox')} />
              <Slider label="Position ↕" value={bg.offsetY * 100} min={-100} max={100} center onChange={(v) => setBg({ offsetY: v / 100 }, 'oy')} />
              <Slider label="Weichzeichnen" value={bg.blur} min={0} max={100} onChange={(v) => setBg({ blur: v }, 'blur')} />
              <Slider label="Helligkeit" value={bg.brightness} min={-100} max={100} center onChange={(v) => setBg({ brightness: v }, 'bri')} />
              <Slider label="Sättigung" value={bg.saturation} min={-100} max={100} center onChange={(v) => setBg({ saturation: v }, 'sat')} />
            </>
          )}
        </>
      )}
      <Slider label="Deckkraft" value={bg.opacity * 100} min={0} max={100} onChange={(v) => setBg({ opacity: v / 100 }, 'opacity')} format={(v) => `${Math.round(v)} %`} />
    </div>
  );
}

// ---------------- Sticker ----------------

export function StickersPanel({ replace }: { replace?: boolean }) {
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string>('alle');
  const [recent, setRecent] = useState<string[]>([]);
  useEffect(() => {
    void kvGet<string[]>('recentStickers', []).then(setRecent);
  }, []);
  const list = q ? searchStickers(q) : cat === 'alle' ? STICKERS : cat === 'zuletzt' ? recent.map((id) => getStickerDef(id)).filter((d): d is NonNullable<typeof d> => !!d) : STICKERS.filter((s) => s.cat === cat);
  const choose = (id: string) => {
    if (replace) replaceSticker(id);
    else addSticker(id);
    const next = [id, ...recent.filter((x) => x !== id)].slice(0, 24);
    setRecent(next);
    void kvSet('recentStickers', next);
    if (!replace) useEditor.getState().setPanel(null);
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <label className="flex flex-1 items-center gap-2 rounded-xl bg-surface-2 px-3">
          <Search className="h-4 w-4 text-ink-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${STICKERS.length} Motive durchsuchen`} className="h-10 w-full bg-transparent outline-none" />
        </label>
        <button type="button" onClick={pickCustomSticker} className="flex items-center gap-1.5 rounded-xl bg-surface-2 px-3 text-[13px] font-medium" title="Eigenes PNG oder SVG importieren">
          <Upload className="h-4 w-4" /> Eigene
        </button>
      </div>
      {!q && (
        <div className="hscroll gap-1.5">
          <Chip active={cat === 'alle'} onClick={() => setCat('alle')}>
            Alle
          </Chip>
          {recent.length > 0 && (
            <Chip active={cat === 'zuletzt'} onClick={() => setCat('zuletzt')}>
              Zuletzt
            </Chip>
          )}
          {STICKER_CATEGORIES.map((c) => (
            <Chip key={c.id} active={cat === c.id} onClick={() => setCat(c.id)}>
              {c.name}
            </Chip>
          ))}
        </div>
      )}
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-7">
        {list.map((s) => (
          <button key={s.id} type="button" title={s.name} aria-label={s.name} onClick={() => choose(s.id)} className="flex aspect-square items-center justify-center rounded-xl bg-surface-2 p-1.5 active:scale-95">
            <img src={stickerThumb(s.id)} alt="" loading="lazy" className="max-h-full max-w-full" draggable={false} />
          </button>
        ))}
      </div>
      {!list.length && <p className="py-3 text-center text-[13px] text-ink-2">Keine Motive gefunden.</p>}
    </div>
  );
}

// ---------------- Formen ----------------

const SHAPE_LIST: { kind: ShapeKind; name: string; svg: string }[] = [
  { kind: 'rect', name: 'Rechteck', svg: '<rect x="6" y="10" width="36" height="28" rx="2"/>' },
  { kind: 'circle', name: 'Kreis', svg: '<circle cx="24" cy="24" r="18"/>' },
  { kind: 'triangle', name: 'Dreieck', svg: '<path d="M24 6 L42 40 L6 40Z"/>' },
  { kind: 'star', name: 'Stern', svg: '<path d="M24 5l5.6 12.2 13.4 1.4-10 9 2.9 13.2L24 34l-11.9 6.8 2.9-13.2-10-9 13.4-1.4z"/>' },
  { kind: 'heart', name: 'Herz', svg: '<path d="M24 42C10 31 5 24 5 16.5 5 10 10 6 15.5 6c3.8 0 6.6 2 8.5 5 1.9-3 4.7-5 8.5-5C38 6 43 10 43 16.5 43 24 38 31 24 42z"/>' },
  { kind: 'hexagon', name: 'Sechseck', svg: '<path d="M14 6h20l10 18-10 18H14L4 24z"/>' },
  { kind: 'diamond', name: 'Raute', svg: '<path d="M24 4 L44 24 L24 44 L4 24Z"/>' },
  { kind: 'arch', name: 'Bogen', svg: '<path d="M8 44V22a16 16 0 0 1 32 0v22z"/>' },
  { kind: 'blob', name: 'Klecks', svg: '<path d="M24 6c10 0 18 6 18 16s-6 20-18 20S6 34 6 24 14 6 24 6z"/>' },
  { kind: 'flower', name: 'Blume', svg: '<path d="M24 4c4 0 6 5 6 8 3-2 9-3 11 1s-2 8-5 9c3 1 7 5 5 9s-8 3-11 1c0 3-2 8-6 8s-6-5-6-8c-3 2-9 3-11-1s2-8 5-9c-3-1-7-5-5-9s8-3 11-1c0-3 2-8 6-8z"/>' },
  { kind: 'line', name: 'Linie', svg: '<path d="M6 24h36" stroke-width="4" stroke="currentColor"/>' },
  { kind: 'arrow', name: 'Pfeil', svg: '<path d="M6 24h28" stroke-width="4" stroke="currentColor"/><path d="M32 14l12 10-12 10z"/>' },
];

export function ShapesPanel() {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {SHAPE_LIST.map((s) => (
        <button
          key={s.kind}
          type="button"
          onClick={() => {
            addShape(s.kind);
            useEditor.getState().setPanel('shape-style');
          }}
          className="flex flex-col items-center gap-1 rounded-xl bg-surface-2 py-2.5 text-[12px] active:scale-95"
        >
          <svg viewBox="0 0 48 48" className="h-9 w-9 fill-current text-accent" dangerouslySetInnerHTML={{ __html: s.svg }} />
          {s.name}
        </button>
      ))}
    </div>
  );
}

// ---------------- Zeichnen ----------------

export function DrawPanel() {
  const draw = useEditor((s) => s.draw);
  const setDraw = useEditor((s) => s.setDraw);
  return (
    <div className="space-y-2">
      <Segmented
        value={draw.tool}
        onChange={(t) => setDraw({ tool: t })}
        options={[
          { id: 'pen', label: 'Stift' },
          { id: 'marker', label: 'Marker' },
          { id: 'erase', label: 'Radierer' },
        ]}
      />
      {draw.tool !== 'erase' && <ColorRow value={draw.color} onChange={(c) => setDraw({ color: c })} />}
      <Slider label="Pinselstärke" value={draw.width} min={2} max={80} onChange={(v) => setDraw({ width: v })} />
      {draw.tool !== 'erase' && <Slider label="Deckkraft" value={draw.opacity * 100} min={10} max={100} onChange={(v) => setDraw({ opacity: v / 100 })} format={(v) => `${Math.round(v)} %`} />}
      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => useEditor.getState().undo()} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-surface-2 py-2.5 text-[14px] font-medium">
          <Undo2 className="h-4 w-4" /> Letzten Strich zurück
        </button>
        <PrimaryButton
          className="h-auto flex-1 py-2.5 text-[14px]"
          onClick={() => {
            const s = useEditor.getState();
            s.setMode('select');
            s.setPanel(null);
            if (s.drawingId) s.select(s.drawingId);
          }}
        >
          Fertig
        </PrimaryButton>
      </div>
      <p className="text-[12px] text-ink-2">Mit einem Finger zeichnen, mit zwei Fingern die Arbeitsfläche zoomen.</p>
    </div>
  );
}

// ---------------- Format ----------------

export function FormatPanel() {
  const doc = useEditor((s) => s.doc)!;
  const [w, setW] = useState(String(doc.width));
  const [h, setH] = useState(String(doc.height));
  const apply = (id: string, W: number, H: number) => commit((d) => changeFormat(d, id, W, H));
  return (
    <div className="space-y-3">
      <div className="hscroll gap-2 py-1">
        {FORMATS.map((f) => {
          const r = f.width / f.height;
          return (
            <button key={f.id} type="button" onClick={() => apply(f.id, f.width, f.height)} className={cx('flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-xl p-2', doc.formatId === f.id ? 'bg-accent-soft text-accent' : 'bg-surface-2')}>
              <span className="flex h-10 w-10 items-center justify-center">
                <span className="rounded-[3px] border-2 border-current" style={{ width: r >= 1 ? 36 : 36 * r, height: r >= 1 ? 36 / r : 36 }} />
              </span>
              <span className="text-[11px] font-semibold leading-none">{f.hint}</span>
              <span className="text-center text-[10px] leading-tight opacity-75">{f.name}</span>
            </button>
          );
        })}
      </div>
      <SectionTitle>Eigene Größe (Pixel)</SectionTitle>
      <div className="flex items-center gap-2">
        <input inputMode="numeric" value={w} onChange={(e) => setW(e.target.value.replace(/\D/g, ''))} className="h-10 w-24 rounded-xl bg-surface-2 px-3 outline-none" aria-label="Breite" />
        <span className="text-ink-2">×</span>
        <input inputMode="numeric" value={h} onChange={(e) => setH(e.target.value.replace(/\D/g, ''))} className="h-10 w-24 rounded-xl bg-surface-2 px-3 outline-none" aria-label="Höhe" />
        <button
          type="button"
          className="h-10 flex-1 rounded-xl bg-ink text-[14px] font-semibold text-bg"
          onClick={() => {
            const W = Math.min(4096, Math.max(200, parseInt(w) || 0));
            const H = Math.min(4096, Math.max(200, parseInt(h) || 0));
            setW(String(W));
            setH(String(H));
            apply('custom', W, H);
          }}
        >
          Übernehmen
        </button>
      </div>
      <p className="text-[12px] text-ink-2">Elemente werden beim Formatwechsel proportional angepasst. Erlaubt sind 200 bis 4096 Pixel pro Seite.</p>
    </div>
  );
}

// ---------------- Ebenen ----------------

function elementLabel(e: DesignElement): { icon: React.ReactNode; label: string } {
  switch (e.type) {
    case 'photo':
      return { icon: <ImageIcon className="h-4 w-4" />, label: e.slot !== undefined ? `Collage-Feld ${e.slot + 1}${e.assetId ? '' : ' (leer)'}` : 'Foto' };
    case 'text':
      return { icon: <Type className="h-4 w-4" />, label: e.text.split('\n')[0]!.slice(0, 32) || 'Text' };
    case 'sticker':
      return { icon: <Sticker className="h-4 w-4" />, label: (e.stickerId && getStickerDef(e.stickerId)?.name) || 'Eigener Sticker' };
    case 'shape':
      return { icon: <Shapes className="h-4 w-4" />, label: SHAPE_LIST.find((s) => s.kind === e.shape)?.name ?? 'Form' };
    case 'drawing':
      return { icon: <PenLine className="h-4 w-4" />, label: 'Zeichnung' };
  }
}

export function LayersPanel() {
  const doc = useEditor((s) => s.doc)!;
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const items = doc.elements.map((e, i) => ({ e, i })).reverse();
  return (
    <ul className="divide-y divide-line">
      {items.map(({ e, i }) => {
        const { icon, label } = elementLabel(e);
        return (
          <li key={e.id} className={cx('flex items-center gap-2 py-1.5', selectedId === e.id && 'text-accent')}>
            <button type="button" className="flex min-w-0 flex-1 items-center gap-2.5 py-1 text-left" onClick={() => select(e.id)}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-2">{icon}</span>
              <span className={cx('truncate text-[14px]', e.hidden && 'opacity-40')}>{label}</span>
            </button>
            <button type="button" aria-label={e.hidden ? 'Einblenden' : 'Ausblenden'} className="p-2 text-ink-2" onClick={() => commit((d) => updateElement(d, e.id, { hidden: !e.hidden }))}>
              {e.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button type="button" aria-label={e.locked ? 'Entsperren' : 'Sperren'} className="p-2 text-ink-2" onClick={() => commit((d) => updateElement(d, e.id, { locked: !e.locked }))}>
              {e.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            </button>
            <button type="button" aria-label="Nach vorne" disabled={i === doc.elements.length - 1} className="p-2 text-ink-2 disabled:opacity-25" onClick={() => commit((d) => moveLayer(d, e.id, 'up'))}>
              <ChevronUp className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Nach hinten" disabled={i === 0} className="p-2 text-ink-2 disabled:opacity-25" onClick={() => commit((d) => reorderLayer(d, e.id, i - 1))}>
              <ChevronDown className="h-4 w-4" />
            </button>
          </li>
        );
      })}
      {!items.length && <li className="py-4 text-center text-[13px] text-ink-2">Noch keine Elemente.</li>}
    </ul>
  );
}
