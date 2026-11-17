/** Hintergrund-Verläufe und fertige Textstile. */
import type { TextElement } from '../types/doc';

export const GRADIENTS: { id: string; colors: string[]; angle: number; radial?: boolean }[] = [
  { id: 'pfirsich', colors: ['#ffd6c2', '#ff9a7a'], angle: 90 },
  { id: 'sonnenuntergang', colors: ['#ffe08a', '#ff9a7a', '#e2546f'], angle: 90 },
  { id: 'meer', colors: ['#dff3f6', '#6cc3d5', '#1f6f99'], angle: 90 },
  { id: 'lavendel', colors: ['#e8e3fb', '#a08be3'], angle: 135 },
  { id: 'zuckerwatte', colors: ['#fde2e4', '#e8e3fb', '#dff3f6'], angle: 45 },
  { id: 'minze', colors: ['#e3f4dc', '#a8dfe8'], angle: 135 },
  { id: 'rose', colors: ['#fff1f3', '#f28aa5'], angle: 90 },
  { id: 'gold', colors: ['#fff3c4', '#e6c27a', '#b88a44'], angle: 135 },
  { id: 'nacht', colors: ['#24345a', '#0f1830'], angle: 90 },
  { id: 'aubergine', colors: ['#53389e', '#1d1430'], angle: 135 },
  { id: 'wald', colors: ['#9caf88', '#1d4d33'], angle: 90 },
  { id: 'sand', colors: ['#f7f3ee', '#d9c7b0'], angle: 90 },
  { id: 'grau', colors: ['#fafafa', '#c9c9c9'], angle: 90 },
  { id: 'strahl', colors: ['#fff8e6', '#ffc59e'], angle: 0, radial: true },
  { id: 'glut', colors: ['#ffe08a', '#d9480f'], angle: 0, radial: true },
  { id: 'kosmos', colors: ['#3a2a6b', '#0a0a1a'], angle: 0, radial: true },
];

export interface TextPreset {
  id: string;
  group: string;
  text: string;
  style: Partial<TextElement> & { fontSize: number };
}

const NOBG = { kind: 'none' as const, color: '#ffffff', opacity: 1, padding: 0.35 };

export const TEXT_PRESETS: TextPreset[] = [
  { id: 'gb-1', group: 'Geburtstag', text: 'Happy Birthday!', style: { fontFamily: 'Pacifico', fontSize: 0.09, color: '#e2546f' } },
  { id: 'gb-2', group: 'Geburtstag', text: 'Alles Gute\nzum Geburtstag', style: { fontFamily: 'Playfair Display', fontSize: 0.075, bold: true, color: '#1f1c1a', lineHeight: 1.05 } },
  { id: 'gb-3', group: 'Geburtstag', text: 'HAPPY DAY', style: { fontFamily: 'Bebas Neue', fontSize: 0.12, color: '#ffffff', letterSpacing: 0.08, stroke: { width: 0.005, color: '#e2546f' } } },
  { id: 'gw-1', group: 'Glückwünsche', text: 'Herzlichen Glückwunsch', style: { fontFamily: 'Great Vibes', fontSize: 0.09, color: '#3a2e27' } },
  { id: 'gw-2', group: 'Glückwünsche', text: 'Von Herzen', style: { fontFamily: 'Dancing Script', fontSize: 0.08, bold: true, color: '#ffffff', background: { kind: 'pill', color: '#e5566e', opacity: 1, padding: 0.35 } } },
  { id: 'gw-3', group: 'Glückwünsche', text: 'Du bist großartig', style: { fontFamily: 'Caveat', fontSize: 0.08, color: '#2b2b2b', background: { kind: 'tape', color: '#f2b48a', opacity: 0.95, padding: 0.4 } } },
  { id: 'ei-1', group: 'Einladungen', text: 'DU BIST EINGELADEN', style: { fontFamily: 'Montserrat', fontSize: 0.05, bold: true, letterSpacing: 0.2, color: '#1f1c1a' } },
  { id: 'ei-2', group: 'Einladungen', text: 'Save the Date', style: { fontFamily: 'Parisienne', fontSize: 0.1, color: '#b88a44' } },
  { id: 'ei-3', group: 'Einladungen', text: 'Samstag · 19 Uhr', style: { fontFamily: 'Josefin Sans', fontSize: 0.045, letterSpacing: 0.1, color: '#6b4423', background: { kind: 'label', color: '#e8d4b8', opacity: 1, padding: 0.4 } } },
  { id: 'ho-1', group: 'Hochzeit', text: 'Just Married', style: { fontFamily: 'Great Vibes', fontSize: 0.11, color: '#3a2e27' } },
  { id: 'ho-2', group: 'Hochzeit', text: 'Anna & Jonas', style: { fontFamily: 'Cormorant Garamond', fontSize: 0.08, italic: true, color: '#6b7f5b' } },
  { id: 'ho-3', group: 'Hochzeit', text: 'FÜR IMMER', style: { fontFamily: 'Cinzel', fontSize: 0.06, letterSpacing: 0.3, gradient: { from: '#e6c27a', to: '#a8822f', angle: 0 }, color: '#c9a24b' } },
  { id: 'fe-1', group: 'Feiertage', text: 'Frohe Weihnachten', style: { fontFamily: 'Great Vibes', fontSize: 0.09, color: '#a4161a' } },
  { id: 'fe-2', group: 'Feiertage', text: 'Frohe Ostern', style: { fontFamily: 'Fredoka', fontSize: 0.09, bold: true, color: '#5aa469' } },
  { id: 'fe-3', group: 'Feiertage', text: 'Prosit Neujahr', style: { fontFamily: 'Cinzel', fontSize: 0.07, bold: true, gradient: { from: '#fff3c4', to: '#d4af37', angle: 90 }, color: '#d4af37', shadow: { enabled: true, color: '#000000', blur: 0.1, offsetX: 0, offsetY: 0.03, opacity: 0.4 } } },
  { id: 'fe-4', group: 'Feiertage', text: 'Happy Halloween', style: { fontFamily: 'Special Elite', fontSize: 0.08, color: '#f2843d' } },
  { id: 'st-1', group: 'Stile', text: 'Sommer, Sonne, Meer', style: { fontFamily: 'Pacifico', fontSize: 0.08, color: '#ffffff', shadow: { enabled: true, color: '#c2563c', blur: 0.08, offsetX: 0, offsetY: 0.03, opacity: 0.5 } } },
  { id: 'st-2', group: 'Stile', text: 'Erinnerungen', style: { fontFamily: 'Special Elite', fontSize: 0.06, color: '#3a2e27', background: { kind: 'paper', color: '#fbf8f2', opacity: 1, padding: 0.4 } } },
  { id: 'st-3', group: 'Stile', text: 'Good Vibes', style: { fontFamily: 'Righteous', fontSize: 0.09, color: '#8e3b22', curve: 45 } },
  { id: 'st-4', group: 'Stile', text: 'notiz an mich', style: { fontFamily: 'Kalam', fontSize: 0.06, color: '#2b2b2b', background: { kind: 'note', color: '#ffe08a', opacity: 1, padding: 0.5 } } },
  { id: 'st-5', group: 'Stile', text: 'MOMENTE', style: { fontFamily: 'Inter', fontSize: 0.045, letterSpacing: 0.35, color: '#1f1c1a' } },
  { id: 'st-6', group: 'Stile', text: 'Liebe', style: { fontFamily: 'Abril Fatface', fontSize: 0.12, color: '#ffffff', background: { kind: 'brush', color: '#e5566e', opacity: 1, padding: 0.4 } } },
];

export const TEXT_PRESET_GROUPS = [...new Set(TEXT_PRESETS.map((p) => p.group))];

export { NOBG };
