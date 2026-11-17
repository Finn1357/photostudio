/**
 * Teilen und Speichern unter iOS:
 *  1. Web Share API mit Datei → iOS-Teilen-Menü ("Bild sichern" legt es in Fotos ab)
 *  2. Fallback: Download-Link (landet in "Dateien" bzw. im Download-Ordner)
 *  3. Zusätzlich zeigt die Oberfläche das Bild an – langes Drücken → "Zu Fotos hinzufügen"
 */

export function canShareFile(file: File): boolean {
  try {
    return typeof navigator !== 'undefined' && !!navigator.canShare && navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

/** Muss direkt in einem Tipp-Ereignis aufgerufen werden. */
export async function shareFile(file: File, title?: string): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (!canShareFile(file)) return 'unsupported';
  try {
    await navigator.share({ files: [file], title });
    return 'shared';
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') return 'cancelled';
    console.warn('Teilen fehlgeschlagen', e);
    return 'unsupported';
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
