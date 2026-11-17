/** Export als PNG/JPEG mit iOS-Teilen, Download und "Bild gedrückt halten"-Fallback. */
import { useEffect, useMemo, useState } from 'react';
import { Download, Share, Loader2, RefreshCw, Info } from 'lucide-react';
import { useEditor } from '../store';
import { Sheet, Segmented, Slider, Toggle, PrimaryButton, SecondaryButton, cx } from '../../ui/components';
import { exportSizes } from '../../content/formats';
import { renderDocToBlob } from '../../render/exportDoc';
import { canShareFile, downloadBlob, isIOS, shareFile } from '../../lib/share';
import { sanitizeFileName } from '../../lib/util';
import { toast } from '../../ui/toast';
import { flushSave } from '../persistence';

export function ExportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const doc = useEditor((s) => s.doc);
  const project = useEditor((s) => s.project);
  const [type, setType] = useState<'image/png' | 'image/jpeg'>('image/jpeg');
  const sizes = useMemo(() => (doc ? exportSizes(doc.width, doc.height) : []), [doc]);
  const [sizeId, setSizeId] = useState('hoch');
  const [quality, setQuality] = useState(92);
  const [transparent, setTransparent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ file: File; url: string } | null>(null);

  useEffect(() => {
    if (!open) {
      setResult((r) => {
        if (r) URL.revokeObjectURL(r.url);
        return null;
      });
      setError(null);
    } else void flushSave();
  }, [open]);

  if (!doc || !project) return null;
  const size = sizes.find((s) => s.id === sizeId) ?? sizes[sizes.length - 1]!;
  const bgTransparent = doc.background.fill.kind === 'none' || doc.background.opacity < 1;

  const create = async () => {
    setBusy(true);
    setError(null);
    try {
      const blob = await renderDocToBlob(doc, { scale: size.scale, quality: 'full', type, jpegQuality: quality / 100, transparent: type === 'image/png' && transparent });
      const ext = type === 'image/png' ? 'png' : 'jpg';
      const file = new File([blob], `${sanitizeFileName(project.name)}.${ext}`, { type });
      setResult({ file, url: URL.createObjectURL(blob) });
    } catch (e) {
      console.error(e);
      setError('Das Bild konnte nicht erstellt werden. Wahrscheinlich reicht der Arbeitsspeicher nicht – bitte eine kleinere Größe wählen.');
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    if (!result) return;
    const r = await shareFile(result.file, project.name);
    if (r === 'unsupported') {
      downloadBlob(result.file, result.file.name);
      toast('Teilen wird nicht unterstützt – Bild wurde heruntergeladen.', 'info', 3500);
    }
  };

  return (
    <Sheet open={open} onClose={onClose} title={result ? 'Dein Bild ist fertig' : 'Bild exportieren'}>
      {!result ? (
        <div className="space-y-3">
          <Segmented
            value={type}
            onChange={setType}
            options={[
              { id: 'image/jpeg', label: 'JPEG' },
              { id: 'image/png', label: 'PNG' },
            ]}
          />
          <div className="grid grid-cols-2 gap-2">
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSizeId(s.id)}
                className={cx('rounded-2xl border px-3 py-2.5 text-left', size.id === s.id ? 'border-accent bg-accent-soft' : 'border-line bg-surface-2')}
              >
                <div className="text-[15px] font-semibold">{s.name}</div>
                <div className="text-[12px] text-ink-2">
                  {s.width} × {s.height} px
                </div>
              </button>
            ))}
          </div>
          {type === 'image/jpeg' && <Slider label="Qualität" value={quality} min={60} max={100} onChange={setQuality} format={(v) => `${Math.round(v)} %`} />}
          {type === 'image/png' && <Toggle label="Transparenter Hintergrund" checked={transparent} onChange={setTransparent} />}
          {type === 'image/jpeg' && bgTransparent && <p className="text-[12px] text-ink-2">JPEG unterstützt keine Transparenz – transparente Bereiche werden weiß.</p>}
          {error && <p className="rounded-xl bg-red-50 p-3 text-[13px] text-red-700 dark:bg-red-950 dark:text-red-200">{error}</p>}
          <PrimaryButton className="w-full" onClick={create} disabled={busy}>
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {busy ? 'Bild wird erstellt …' : 'Bild erstellen'}
          </PrimaryButton>
          <p className="text-center text-[12px] text-ink-2">Kein Wasserzeichen · wird vollständig auf deinem Gerät erstellt</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-center rounded-2xl bg-surface-2 p-3" style={{ backgroundImage: 'repeating-conic-gradient(#0000 0 25%, #0000000d 0 50%)', backgroundSize: '16px 16px' }}>
            <img src={result.url} alt="Exportiertes Bild" className="max-h-[40dvh] max-w-full rounded-lg shadow-md" style={{ WebkitTouchCallout: 'default' }} />
          </div>
          {isIOS() && (
            <p className="flex items-start gap-1.5 text-[12px] text-ink-2">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Tipp: „Teilen“ → „Bild sichern“ legt es in deine Fotos. Alternativ das Bild gedrückt halten und „Zu Fotos hinzufügen“ wählen.
            </p>
          )}
          <div className="grid gap-2">
            {canShareFile(result.file) && (
              <PrimaryButton className="w-full" onClick={share}>
                <Share className="h-5 w-5" /> Teilen / In Fotos sichern
              </PrimaryButton>
            )}
            <SecondaryButton className="w-full" onClick={() => downloadBlob(result.file, result.file.name)}>
              <Download className="h-5 w-5" /> Herunterladen ({(result.file.size / 1024 / 1024).toFixed(1)} MB)
            </SecondaryButton>
            <button type="button" onClick={() => setResult(null)} className="flex items-center justify-center gap-1.5 py-2 text-[14px] text-ink-2">
              <RefreshCw className="h-4 w-4" /> Andere Einstellungen
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
