/** Leinwandformate. Basisauflösung: längere Seite 2400 px. */

export interface CanvasFormat {
  id: string;
  name: string;
  hint: string;
  width: number;
  height: number;
}

export const FORMATS: CanvasFormat[] = [
  { id: '1:1', name: 'Quadrat', hint: '1:1', width: 2400, height: 2400 },
  { id: '4:5', name: 'Beitrag', hint: '4:5', width: 1920, height: 2400 },
  { id: '9:16', name: 'Story', hint: '9:16', width: 1350, height: 2400 },
  { id: '16:9', name: 'Querformat', hint: '16:9', width: 2400, height: 1350 },
  { id: '3:2', name: 'Foto quer', hint: '3:2', width: 2400, height: 1600 },
  { id: '2:3', name: 'Hochformat', hint: '2:3', width: 1600, height: 2400 },
  { id: 'a4p', name: 'DIN A4 hoch', hint: 'A4', width: 1697, height: 2400 },
  { id: 'a4l', name: 'DIN A4 quer', hint: 'A4', width: 2400, height: 1697 },
];

export function getFormat(id: string): CanvasFormat | undefined {
  return FORMATS.find((f) => f.id === id);
}

/** Größte sichere Canvas-Fläche auf iOS Safari (16.777.216 px) und Kantenlänge. */
export const MAX_CANVAS_AREA = 16_700_000;
export const MAX_CANVAS_SIDE = 4096;

/** Größter Exportfaktor; mit kleiner Sicherheitsreserve gegen Rundung auf ganze Pixel. */
export function maxExportScale(w: number, h: number): number {
  return Math.min(MAX_CANVAS_SIDE / Math.max(w, h), Math.sqrt(MAX_CANVAS_AREA / (w * h))) * 0.998;
}

export interface ExportSize {
  id: string;
  name: string;
  scale: number;
  width: number;
  height: number;
}

export function exportSizes(w: number, h: number): ExportSize[] {
  const max = maxExportScale(w, h);
  const mk = (id: string, name: string, s: number): ExportSize => {
    const scale = Math.min(s, max);
    return { id, name, scale, width: Math.floor(w * scale), height: Math.floor(h * scale) };
  };
  const list = [mk('web', 'Klein', 0.5), mk('standard', 'Standard', 1), mk('hoch', 'Hoch', 1.4), mk('max', 'Maximal', max)];
  // Duplikate (wenn die Basis bereits nahe am Maximum liegt) entfernen
  return list.filter((s, i) => list.findIndex((o) => o.width === s.width) === i);
}
