/** App-weite Dialoge: Formatwahl, Einstellungen, Toasts. */
import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Info } from 'lucide-react';
import { FORMATS } from '../content/formats';
import { Sheet, Segmented, cx } from './components';
import { useToasts } from './toast';
import { storageEstimate, requestPersistentStorage } from '../lib/db';
import { isIOS, isStandalone } from '../lib/share';

export function FormatPickerSheet({ open, onClose, onPick, title = 'Format wählen' }: { open: boolean; onClose: () => void; onPick: (id: string) => void; title?: string }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {FORMATS.map((f) => {
          const r = f.width / f.height;
          return (
            <button key={f.id} type="button" onClick={() => onPick(f.id)} className="flex flex-col items-center gap-2 rounded-2xl bg-surface-2 px-2 py-3 active:scale-[0.97]">
              <span className="flex h-14 w-14 items-center justify-center">
                <span className="rounded-md border-2 border-accent bg-accent-soft" style={{ width: r >= 1 ? 52 : 52 * r, height: r >= 1 ? 52 / r : 52 }} />
              </span>
              <span className="text-[14px] font-semibold leading-none">{f.name}</span>
              <span className="text-[11px] leading-none text-ink-2">{f.hint}</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

export type ThemePref = 'system' | 'hell' | 'dunkel';

export function readThemePref(): ThemePref {
  try {
    return (localStorage.getItem('ps-theme') as ThemePref) || 'system';
  } catch {
    return 'system';
  }
}

export function applyTheme(pref: ThemePref) {
  const dark = pref === 'dunkel' || (pref === 'system' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', !!dark);
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', dark ? '#0f0f10' : '#f7f3ee'));
}

export function SettingsSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pref, setPref] = useState<ThemePref>(readThemePref());
  const [usage, setUsage] = useState<{ usage: number; quota: number } | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  useEffect(() => {
    if (!open) return;
    void storageEstimate().then(setUsage);
    void navigator.storage?.persisted?.().then(setPersisted);
  }, [open]);
  const mb = (b: number) => `${(b / 1024 / 1024).toFixed(b > 100 * 1024 * 1024 ? 0 : 1)} MB`;
  return (
    <Sheet open={open} onClose={onClose} title="Einstellungen">
      <div className="space-y-5">
        <section>
          <h3 className="mb-2 text-[13px] font-semibold text-ink-2">Erscheinungsbild</h3>
          <Segmented<ThemePref>
            value={pref}
            onChange={(p) => {
              setPref(p);
              try {
                localStorage.setItem('ps-theme', p);
              } catch {
                /* ignorieren */
              }
              applyTheme(p);
            }}
            options={[
              { id: 'system', label: 'Automatisch' },
              { id: 'hell', label: 'Hell' },
              { id: 'dunkel', label: 'Dunkel' },
            ]}
          />
        </section>
        <section className="space-y-1.5 text-[14px]">
          <h3 className="text-[13px] font-semibold text-ink-2">Speicher</h3>
          <p>{usage ? `Belegt: ${mb(usage.usage)}${usage.quota ? ` von ca. ${mb(usage.quota)}` : ''}` : 'Speichernutzung wird ermittelt …'}</p>
          <p className="text-ink-2">
            Alle Projekte und Fotos bleiben ausschließlich auf diesem Gerät.{' '}
            {persisted ? 'Dauerhafte Speicherung ist aktiv.' : 'Tipp: Installiere die App auf dem Home-Bildschirm – dann löscht iOS die Daten nicht automatisch.'}
          </p>
          {!persisted && (
            <button type="button" className="text-accent" onClick={() => void requestPersistentStorage().then(setPersisted)}>
              Dauerhafte Speicherung anfragen
            </button>
          )}
          <p className="text-ink-2">Sichere wichtige Projekte zusätzlich über „Projekt → Projektdatei sichern“.</p>
        </section>
        <section className="space-y-1.5 text-[13px] text-ink-2">
          <h3 className="text-[13px] font-semibold text-ink-2">Über PhotoStudio</h3>
          <p>Version 1.0 · Keine Werbung, kein Konto, keine Wasserzeichen. Fotos werden nie hochgeladen.</p>
          <p>Alle Vorlagen, Sticker, Muster und Texturen sind eigens für diese App gestaltet. Schriften: SIL Open Font License 1.1 bzw. Apache 2.0 (über Fontsource). Symbole: Lucide (ISC-Lizenz).</p>
        </section>
      </div>
    </Sheet>
  );
}

export function InstallHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(isIOS() && !isStandalone() && localStorage.getItem('ps-install-hint') !== 'aus');
    } catch {
      setShow(isIOS() && !isStandalone());
    }
  }, []);
  if (!show) return null;
  return (
    <div className="flex gap-3 rounded-2xl bg-surface p-4 shadow-sm">
      <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="text-[13px]">
        <p className="font-semibold">Als App installieren</p>
        <p className="mt-0.5 text-ink-2">In Safari unten auf „Teilen“ tippen und „Zum Home-Bildschirm“ wählen. So startet PhotoStudio im Vollbild, funktioniert offline und deine Projekte bleiben sicher gespeichert.</p>
        <button
          type="button"
          className="mt-1.5 font-medium text-accent"
          onClick={() => {
            try {
              localStorage.setItem('ps-install-hint', 'aus');
            } catch {
              /* ignorieren */
            }
            setShow(false);
          }}
        >
          Ausblenden
        </button>
      </div>
    </div>
  );
}

export function ToastHost() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] flex flex-col items-center gap-2 px-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 56px)' }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          onClick={() => t.kind !== 'progress' && dismiss(t.id)}
          className={cx(
            'anim-sheet pointer-events-auto flex max-w-sm items-start gap-2 whitespace-pre-line rounded-2xl px-4 py-2.5 text-[14px] shadow-lg backdrop-blur',
            t.kind === 'error' ? 'bg-red-600/95 text-white' : 'bg-black/80 text-white',
          )}
        >
          {t.kind === 'progress' ? (
            <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin" />
          ) : t.kind === 'error' ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : t.kind === 'success' ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#5be37d]" />
          ) : null}
          <span>{t.text}</span>
        </div>
      ))}
    </div>
  );
}
