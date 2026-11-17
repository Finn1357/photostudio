/**
 * Schriftarten (alle lokal gebündelt über @fontsource, OFL-1.1 bzw. Apache-2.0).
 * Vor dem Zeichnen auf Canvas müssen Schriften geladen sein – `ensureFont` kümmert sich darum.
 */
import '@fontsource/caveat/latin-400.css';
import '@fontsource/caveat/latin-700.css';
import '@fontsource/dancing-script/latin-400.css';
import '@fontsource/dancing-script/latin-700.css';
import '@fontsource/great-vibes/latin-400.css';
import '@fontsource/pacifico/latin-400.css';
import '@fontsource/sacramento/latin-400.css';
import '@fontsource/homemade-apple/latin-400.css';
import '@fontsource/shadows-into-light/latin-400.css';
import '@fontsource/parisienne/latin-400.css';
import '@fontsource/kalam/latin-400.css';
import '@fontsource/kalam/latin-700.css';
import '@fontsource/permanent-marker/latin-400.css';
import '@fontsource/playfair-display/latin-400.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-400-italic.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-700.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/latin-700-italic.css';
import '@fontsource/lora/latin-400.css';
import '@fontsource/lora/latin-700.css';
import '@fontsource/lora/latin-400-italic.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/dm-serif-display/latin-400-italic.css';
import '@fontsource/abril-fatface/latin-400.css';
import '@fontsource/libre-baskerville/latin-400.css';
import '@fontsource/libre-baskerville/latin-700.css';
import '@fontsource/libre-baskerville/latin-400-italic.css';
import '@fontsource/cinzel/latin-400.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-700.css';
import '@fontsource/inter/latin-400-italic.css';
import '@fontsource/montserrat/latin-400.css';
import '@fontsource/montserrat/latin-700.css';
import '@fontsource/montserrat/latin-400-italic.css';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/poppins/latin-400-italic.css';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-400-italic.css';
import '@fontsource/josefin-sans/latin-400.css';
import '@fontsource/josefin-sans/latin-700.css';
import '@fontsource/josefin-sans/latin-400-italic.css';
import '@fontsource/bebas-neue/latin-400.css';
import '@fontsource/oswald/latin-400.css';
import '@fontsource/oswald/latin-700.css';
import '@fontsource/comfortaa/latin-400.css';
import '@fontsource/comfortaa/latin-700.css';
import '@fontsource/fredoka/latin-400.css';
import '@fontsource/fredoka/latin-700.css';
import '@fontsource/lobster/latin-400.css';
import '@fontsource/amatic-sc/latin-400.css';
import '@fontsource/amatic-sc/latin-700.css';
import '@fontsource/righteous/latin-400.css';
import '@fontsource/special-elite/latin-400.css';
import '@fontsource/bungee/latin-400.css';

export type FontCategory = 'hand' | 'serif' | 'sans' | 'deko';

export interface FontDef {
  family: string;
  label: string;
  category: FontCategory;
  bold: boolean;
  italic: boolean;
}

export const FONT_CATEGORIES: { id: FontCategory; name: string }[] = [
  { id: 'hand', name: 'Handschrift' },
  { id: 'serif', name: 'Elegant' },
  { id: 'sans', name: 'Modern' },
  { id: 'deko', name: 'Verspielt' },
];

export const FONTS: FontDef[] = [
  { family: 'Great Vibes', label: 'Great Vibes', category: 'hand', bold: false, italic: false },
  { family: 'Dancing Script', label: 'Dancing Script', category: 'hand', bold: true, italic: false },
  { family: 'Parisienne', label: 'Parisienne', category: 'hand', bold: false, italic: false },
  { family: 'Sacramento', label: 'Sacramento', category: 'hand', bold: false, italic: false },
  { family: 'Pacifico', label: 'Pacifico', category: 'hand', bold: false, italic: false },
  { family: 'Caveat', label: 'Caveat', category: 'hand', bold: true, italic: false },
  { family: 'Homemade Apple', label: 'Homemade Apple', category: 'hand', bold: false, italic: false },
  { family: 'Shadows Into Light', label: 'Shadows Into Light', category: 'hand', bold: false, italic: false },
  { family: 'Kalam', label: 'Kalam', category: 'hand', bold: true, italic: false },
  { family: 'Permanent Marker', label: 'Permanent Marker', category: 'hand', bold: false, italic: false },
  { family: 'Playfair Display', label: 'Playfair Display', category: 'serif', bold: true, italic: true },
  { family: 'Cormorant Garamond', label: 'Cormorant Garamond', category: 'serif', bold: true, italic: true },
  { family: 'Lora', label: 'Lora', category: 'serif', bold: true, italic: true },
  { family: 'DM Serif Display', label: 'DM Serif Display', category: 'serif', bold: false, italic: true },
  { family: 'Libre Baskerville', label: 'Libre Baskerville', category: 'serif', bold: true, italic: true },
  { family: 'Abril Fatface', label: 'Abril Fatface', category: 'serif', bold: false, italic: false },
  { family: 'Cinzel', label: 'Cinzel', category: 'serif', bold: true, italic: false },
  { family: 'Inter', label: 'Inter', category: 'sans', bold: true, italic: true },
  { family: 'Montserrat', label: 'Montserrat', category: 'sans', bold: true, italic: true },
  { family: 'Poppins', label: 'Poppins', category: 'sans', bold: true, italic: true },
  { family: 'Nunito', label: 'Nunito', category: 'sans', bold: true, italic: true },
  { family: 'Josefin Sans', label: 'Josefin Sans', category: 'sans', bold: true, italic: true },
  { family: 'Bebas Neue', label: 'Bebas Neue', category: 'sans', bold: false, italic: false },
  { family: 'Oswald', label: 'Oswald', category: 'sans', bold: true, italic: false },
  { family: 'Comfortaa', label: 'Comfortaa', category: 'sans', bold: true, italic: false },
  { family: 'Fredoka', label: 'Fredoka', category: 'deko', bold: true, italic: false },
  { family: 'Lobster', label: 'Lobster', category: 'deko', bold: false, italic: false },
  { family: 'Amatic SC', label: 'Amatic SC', category: 'deko', bold: true, italic: false },
  { family: 'Righteous', label: 'Righteous', category: 'deko', bold: false, italic: false },
  { family: 'Special Elite', label: 'Special Elite', category: 'deko', bold: false, italic: false },
  { family: 'Bungee', label: 'Bungee', category: 'deko', bold: false, italic: false },
];

export function getFont(family: string): FontDef | undefined {
  return FONTS.find((f) => f.family === family);
}

/** CSS-Schriftdeklaration für Canvas/Konva. */
export function fontStyleString(bold: boolean, italic: boolean): string {
  return `${italic ? 'italic ' : ''}${bold ? 'bold' : 'normal'}`.trim();
}

const loaded = new Set<string>();
const pending = new Map<string, Promise<void>>();
const listeners = new Set<() => void>();
let version = 0;

export function subscribeFonts(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}
export const getFontsVersion = () => version;

function fontKey(family: string, bold: boolean, italic: boolean) {
  const def = getFont(family);
  return `${def?.italic && italic ? 'italic' : 'normal'} ${def?.bold && bold ? 700 : 400} 64px "${family}"`;
}

export function isFontReady(family: string, bold = false, italic = false): boolean {
  return loaded.has(fontKey(family, bold, italic));
}

export function ensureFont(family: string, bold = false, italic = false): Promise<void> {
  const key = fontKey(family, bold, italic);
  if (loaded.has(key)) return Promise.resolve();
  let p = pending.get(key);
  if (!p) {
    p = (typeof document !== 'undefined' && document.fonts
      ? document.fonts.load(key, 'AaÄäÖöÜüß').then(() => undefined)
      : Promise.resolve()
    )
      .catch(() => undefined)
      .then(() => {
        loaded.add(key);
        pending.delete(key);
        version++;
        listeners.forEach((l) => l());
      });
    pending.set(key, p);
  }
  return p;
}

/** Lädt alle im Dokument verwendeten Schriften. */
export async function ensureFonts(list: { family: string; bold: boolean; italic: boolean }[]): Promise<void> {
  await Promise.all(list.map((f) => ensureFont(f.family, f.bold, f.italic)));
}
