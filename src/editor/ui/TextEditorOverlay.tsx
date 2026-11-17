/**
 * Texteingabe über der Arbeitsfläche. Richtet sich am sichtbaren Bereich (visualViewport) aus,
 * damit die iPhone-Tastatur nichts verdeckt.
 */
import { useEffect, useRef, useState } from 'react';
import { useEditor, commit } from '../store';
import { getElement, removeElement, updateElement } from '../ops';
import type { TextElement } from '../../types/doc';
import { FONTS, ensureFont } from '../../lib/fonts';
import { cx } from '../../ui/components';

function useVisualViewport() {
  const get = () => {
    const vv = window.visualViewport;
    return { height: vv?.height ?? window.innerHeight, top: vv?.offsetTop ?? 0 };
  };
  const [v, setV] = useState(get);
  useEffect(() => {
    const vv = window.visualViewport;
    const on = () => setV(get());
    vv?.addEventListener('resize', on);
    vv?.addEventListener('scroll', on);
    window.addEventListener('resize', on);
    return () => {
      vv?.removeEventListener('resize', on);
      vv?.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);
  return v;
}

const QUICK_COLORS = ['#2b2b2b', '#ffffff', '#e2546f', '#f2843d', '#f7c948', '#5aa469', '#3a9fbf', '#7a5cc9', '#b88a44', '#8e1d3c'];

export function TextEditorOverlay() {
  const id = useEditor((s) => s.textEditingId);
  const el = useEditor((s) => (s.doc && id ? getElement(s.doc, id) : undefined)) as TextElement | undefined;
  const vv = useVisualViewport();
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!id) return;
    const t = ref.current;
    if (!t) return;
    t.focus({ preventScroll: true });
    const len = t.value.length;
    // Platzhaltertext komplett markieren, damit direkt überschrieben werden kann
    if (t.value === 'Dein Text') t.setSelectionRange(0, len);
    else t.setSelectionRange(len, len);
    // iOS scrollt die Seite manchmal beim Fokussieren
    window.scrollTo(0, 0);
  }, [id]);

  if (!id || !el || el.type !== 'text') return null;

  const close = () => {
    const s = useEditor.getState();
    const cur = s.doc ? (getElement(s.doc, id) as TextElement | undefined) : undefined;
    if (cur && !cur.text.trim()) {
      commit((d) => removeElement(d, id));
      s.select(null);
    }
    s.setTextEditing(null);
    ref.current?.blur();
  };

  const set = (patch: Partial<TextElement>, key: string) => commit((d) => updateElement<TextElement>(d, id, patch), { coalesce: id + key });

  return (
    <div className="anim-fade fixed inset-x-0 z-40 flex flex-col bg-black/55 backdrop-blur-[2px]" style={{ top: vv.top, height: vv.height }} onPointerDown={(e) => e.target === e.currentTarget && close()}>
      <div className="pt-safe flex items-center justify-between px-4 py-2">
        <span className="text-[13px] font-medium text-white/80">Text bearbeiten</span>
        <button type="button" onClick={close} className="rounded-full bg-white px-4 py-1.5 text-[15px] font-semibold text-black">
          Fertig
        </button>
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center px-4" onPointerDown={(e) => e.target === e.currentTarget && close()}>
        <textarea
          ref={ref}
          value={el.text}
          onChange={(e) => set({ text: e.target.value }, 'text')}
          rows={Math.min(6, Math.max(2, el.text.split('\n').length + 1))}
          className="max-h-full w-full max-w-md resize-none rounded-2xl bg-white/95 p-4 text-center text-black shadow-xl outline-none"
          style={{
            fontFamily: `'${el.fontFamily}'`,
            fontWeight: el.bold ? 700 : 400,
            fontStyle: el.italic ? 'italic' : 'normal',
            fontSize: 26,
            lineHeight: 1.25,
            textAlign: el.align,
            textTransform: el.uppercase ? 'uppercase' : 'none',
          }}
          placeholder="Text eingeben"
          enterKeyHint="enter"
          autoCapitalize="sentences"
        />
      </div>
      <div className="space-y-2 bg-black/40 px-3 py-2 backdrop-blur">
        <div className="hscroll gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f.family}
              type="button"
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => {
                void ensureFont(f.family, el.bold, el.italic);
                set({ fontFamily: f.family }, 'font');
              }}
              className={cx('shrink-0 rounded-full px-3 py-1.5 text-[16px]', el.fontFamily === f.family ? 'bg-white text-black' : 'bg-white/15 text-white')}
              style={{ fontFamily: `'${f.family}'` }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="hscroll gap-2 pb-1">
          {QUICK_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c}
              onPointerDown={(e) => e.preventDefault()}
              onClick={() => set({ color: c, gradient: null }, 'color')}
              className={cx('h-8 w-8 shrink-0 rounded-full border-2', el.color === c && !el.gradient ? 'border-white' : 'border-white/30')}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
