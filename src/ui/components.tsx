/** Wiederverwendbare UI-Bausteine im iOS-Stil. */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, X, Pipette } from 'lucide-react';
import { PALETTE } from '../lib/color';

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(' ');
}

export function ToolButton({
  icon,
  label,
  onClick,
  active,
  disabled,
  danger,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx(
        'flex min-w-[64px] shrink-0 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-colors',
        active ? 'bg-accent-soft text-accent' : danger ? 'text-red-500' : 'text-ink',
        disabled && 'opacity-35',
      )}
    >
      <span className="flex h-7 items-center justify-center [&>svg]:h-[22px] [&>svg]:w-[22px]">{icon}</span>
      <span className="whitespace-nowrap leading-none">{label}</span>
    </button>
  );
}

export function IconButton({ icon, label, onClick, disabled, className }: { icon: ReactNode; label: string; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cx('flex h-10 w-10 items-center justify-center rounded-full text-ink transition active:scale-95 disabled:opacity-30 [&>svg]:h-[22px] [&>svg]:w-[22px]', className)}
    >
      {icon}
    </button>
  );
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  onCommit,
  format,
  center,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  format?: (v: number) => string;
  center?: boolean;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="flex items-center gap-3 py-1">
      <span className="w-[92px] shrink-0 text-[13px] text-ink-2">{label}</span>
      <input
        type="range"
        className="slider flex-1"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--fill' as string]: center ? '0%' : `${pct}%` }}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onPointerUp={onCommit}
        onTouchEnd={onCommit}
        onDoubleClick={() => center && onChange(0)}
      />
      <span className="w-11 shrink-0 text-right text-[12px] tabular-nums text-ink-2">{format ? format(value) : Math.round(value)}</span>
    </label>
  );
}

export function Segmented<T extends string>({ options, value, onChange }: { options: { id: T; label: ReactNode }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex rounded-xl bg-surface-2 p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cx('flex-1 rounded-[10px] px-2 py-1.5 text-[13px] font-medium transition', value === o.id ? 'bg-surface text-ink shadow-sm' : 'text-ink-2')}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({ active, onClick, children }: { active?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx('shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition', active ? 'bg-ink text-bg' : 'bg-surface-2 text-ink')}
    >
      {children}
    </button>
  );
}

/** Farbreihe mit Palette und freiem Farbwähler. */
export function ColorRow({ value, onChange, allowNone, extra }: { value: string; onChange: (c: string) => void; allowNone?: boolean; extra?: string[] }) {
  const colors = [...(extra ?? []), ...PALETTE.filter((c) => !extra?.includes(c))];
  return (
    <div className="hscroll gap-2 py-1">
      {allowNone && (
        <button
          type="button"
          aria-label="Keine Farbe"
          onClick={() => onChange('')}
          className={cx('relative h-9 w-9 shrink-0 rounded-full border border-line bg-surface', value === '' && 'ring-2 ring-accent ring-offset-2 ring-offset-surface')}
        >
          <span className="absolute left-1/2 top-1/2 h-[2px] w-7 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-red-400" />
        </button>
      )}
      <label
        className="relative flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full"
        style={{ background: 'conic-gradient(#f44, #fd4, #4d6, #4cf, #64f, #f4c, #f44)' }}
        aria-label="Eigene Farbe"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface">
          <Pipette className="h-3.5 w-3.5 text-ink" />
        </span>
        <input type="color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} />
      </label>
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={c}
          onClick={() => onChange(c)}
          className={cx('h-9 w-9 shrink-0 rounded-full border border-line', value.toLowerCase() === c.toLowerCase() && 'ring-2 ring-accent ring-offset-2 ring-offset-surface')}
          style={{ background: c }}
        />
      ))}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-1.5 mt-2 flex items-center justify-between">
      <h3 className="text-[12px] font-semibold uppercase tracking-wide text-ink-2">{children}</h3>
      {action}
    </div>
  );
}

/** Modales Blatt von unten (für Export, Formate, Einstellungen …). */
export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="anim-sheet pb-safe relative flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between px-5 pb-2 pt-4">
          <h2 className="text-[17px] font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Schließen" className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-ink-2">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, onClick, disabled, className }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx('flex h-12 items-center justify-center gap-2 rounded-2xl bg-accent px-5 text-[16px] font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-50', className)}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, disabled, className }: { children: ReactNode; onClick: () => void; disabled?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cx('flex h-12 items-center justify-center gap-2 rounded-2xl bg-surface-2 px-5 text-[16px] font-semibold text-ink transition active:scale-[0.98] disabled:opacity-50', className)}
    >
      {children}
    </button>
  );
}

/** Einfacher Bestätigungs-/Eingabedialog. */
export function PromptDialog({
  open,
  title,
  message,
  initial,
  confirmLabel = 'OK',
  danger,
  input,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message?: string;
  initial?: string;
  confirmLabel?: string;
  danger?: boolean;
  input?: boolean;
  onConfirm: (value: string) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(initial ?? '');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (open) {
      setV(initial ?? '');
      setTimeout(() => ref.current?.select(), 50);
    }
  }, [open, initial]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" role="alertdialog" aria-modal="true">
      <div className="anim-fade absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="anim-sheet relative w-full max-w-sm rounded-3xl bg-surface p-5 shadow-2xl">
        <h2 className="text-[17px] font-semibold">{title}</h2>
        {message && <p className="mt-1.5 text-[14px] text-ink-2">{message}</p>}
        {input && (
          <input
            ref={ref}
            value={v}
            onChange={(e) => setV(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && v.trim() && onConfirm(v.trim())}
            className="mt-3 w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 outline-none focus:border-accent"
            maxLength={80}
          />
        )}
        <div className="mt-4 flex gap-2">
          <SecondaryButton className="h-11 flex-1" onClick={onClose}>
            Abbrechen
          </SecondaryButton>
          <button
            type="button"
            onClick={() => (!input || v.trim()) && onConfirm(v.trim())}
            className={cx('flex h-11 flex-1 items-center justify-center gap-1.5 rounded-2xl text-[16px] font-semibold text-white', danger ? 'bg-red-500' : 'bg-accent')}
          >
            <Check className="h-4 w-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center justify-between py-2">
      <span className="text-[15px]">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx('relative h-[31px] w-[51px] rounded-full transition-colors', checked ? 'bg-[#34c759]' : 'bg-surface-2')}
      >
        <span className={cx('absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-[2px]')} />
      </button>
    </label>
  );
}
