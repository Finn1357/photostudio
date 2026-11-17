/**
 * Nahtlos kachelbare SVG-Muster (eigene Gestaltung). Farben: [Hintergrund, Farbe 1, Farbe 2, Farbe 3].
 */
import { rng } from '../lib/util';

export interface PatternDef {
  id: string;
  name: string;
  /** Kachelgröße in SVG-Einheiten */
  tile: number;
  /** Anzeigegröße der Kachel relativ zu 1000 Leinwand-Einheiten (kürzere Seite) */
  display: number;
  colors: string[];
  body: (c: string[], t: number) => string;
  tags: string;
  /** Nicht kacheln, sondern flächig einpassen */
  cover?: boolean;
}

const heart = (x: number, y: number, s: number, fill: string, rot = 0) =>
  `<path transform="translate(${x} ${y}) rotate(${rot}) scale(${s / 20})" d="M0 6 C0 -2 -10 -4 -10 3 C-10 9 -3 12 0 16 C3 12 10 9 10 3 C10 -4 0 -2 0 6Z" fill="${fill}"/>`;

const star = (x: number, y: number, r: number, fill: string, rot = 0) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5 + (rot * Math.PI) / 180;
    pts.push(`${(x + Math.cos(a) * rr).toFixed(2)},${(y + Math.sin(a) * rr).toFixed(2)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}"/>`;
};

const flower = (x: number, y: number, r: number, petal: string, center: string) => {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    s += `<ellipse cx="${(x + Math.cos(a) * r * 0.55).toFixed(2)}" cy="${(y + Math.sin(a) * r * 0.55).toFixed(2)}" rx="${r * 0.48}" ry="${r * 0.34}" transform="rotate(${i * 72} ${(x + Math.cos(a) * r * 0.55).toFixed(2)} ${(y + Math.sin(a) * r * 0.55).toFixed(2)})" fill="${petal}"/>`;
  }
  return s + `<circle cx="${x}" cy="${y}" r="${r * 0.26}" fill="${center}"/>`;
};

/** Platziert ein Motiv an allen Kachelrändern mehrfach, damit es nahtlos bleibt. */
const wrap = (t: number, x: number, y: number, draw: (x: number, y: number) => string) => {
  let s = '';
  for (const dx of [-t, 0, t]) for (const dy of [-t, 0, t]) s += draw(x + dx, y + dy);
  return s;
};

const snowflake = (x: number, y: number, r: number, c: string) => {
  let s = `<g stroke="${c}" stroke-width="${r * 0.14}" stroke-linecap="round" fill="none">`;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    const ex = x + Math.cos(a) * r,
      ey = y + Math.sin(a) * r;
    s += `<line x1="${x}" y1="${y}" x2="${ex.toFixed(2)}" y2="${ey.toFixed(2)}"/>`;
    const mx = x + Math.cos(a) * r * 0.55,
      my = y + Math.sin(a) * r * 0.55;
    for (const side of [-1, 1]) {
      const b = a + side * 0.7;
      s += `<line x1="${mx.toFixed(2)}" y1="${my.toFixed(2)}" x2="${(mx + Math.cos(b) * r * 0.32).toFixed(2)}" y2="${(my + Math.sin(b) * r * 0.32).toFixed(2)}"/>`;
    }
  }
  return s + '</g>';
};

export const PATTERNS: PatternDef[] = [
  {
    id: 'dots',
    name: 'Punkte',
    tile: 40,
    display: 60,
    colors: ['#fde2e4', '#ffffff'],
    tags: 'punkte pastell verspielt',
    body: (c, t) => `<circle cx="${t / 4}" cy="${t / 4}" r="5" fill="${c[1]}"/><circle cx="${(3 * t) / 4}" cy="${(3 * t) / 4}" r="5" fill="${c[1]}"/>`,
  },
  {
    id: 'confetti',
    name: 'Konfetti',
    tile: 200,
    display: 260,
    colors: ['#fffaf2', '#f28aa5', '#6cc3d5', '#f7c948', '#8fcf8f'],
    tags: 'konfetti geburtstag party bunt',
    body: (c, t) => {
      const r = rng(42);
      let s = '';
      for (let i = 0; i < 26; i++) {
        const x = r() * t,
          y = r() * t;
        const col = c[1 + (i % 4)] ?? c[1]!;
        const kind = i % 3;
        s += wrap(t, x, y, (px, py) =>
          kind === 0
            ? `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="4" fill="${col}"/>`
            : kind === 1
              ? `<rect x="${(px - 6).toFixed(1)}" y="${(py - 2.5).toFixed(1)}" width="12" height="5" rx="1.5" fill="${col}" transform="rotate(${Math.round(r() * 180)} ${px.toFixed(1)} ${py.toFixed(1)})"/>`
              : `<path d="M${(px - 7).toFixed(1)} ${py.toFixed(1)} q3.5 -5 7 0 t7 0" stroke="${col}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
        );
      }
      return s;
    },
  },
  {
    id: 'stripes',
    name: 'Streifen',
    tile: 40,
    display: 70,
    colors: ['#ffffff', '#cfe8ef'],
    tags: 'streifen maritim modern',
    body: (c, t) => `<rect x="0" y="0" width="${t / 2}" height="${t}" fill="${c[1]}"/>`,
  },
  {
    id: 'stripes-diag',
    name: 'Diagonal',
    tile: 40,
    display: 60,
    colors: ['#fff3c4', '#f7c948'],
    tags: 'diagonal streifen retro',
    body: (c, t) =>
      `<path d="M0 ${t / 2} L${t / 2} 0 L${t} 0 L0 ${t}Z M${t / 2} ${t} L${t} ${t / 2} L${t} ${t}Z" fill="${c[1]}"/>`,
  },
  {
    id: 'gingham',
    name: 'Vichy-Karo',
    tile: 40,
    display: 70,
    colors: ['#ffffff', '#f28aa5'],
    tags: 'karo vichy picknick ostern landhaus',
    body: (c, t) =>
      `<rect x="0" y="0" width="${t / 2}" height="${t}" fill="${c[1]}" opacity="0.45"/><rect x="0" y="0" width="${t}" height="${t / 2}" fill="${c[1]}" opacity="0.45"/>`,
  },
  {
    id: 'grid',
    name: 'Karopapier',
    tile: 30,
    display: 34,
    colors: ['#ffffff', '#b9c7d6'],
    tags: 'karo papier schule notiz',
    body: (c, t) => `<path d="M0 0.5 H${t} M0.5 0 V${t}" stroke="${c[1]}" stroke-width="1"/>`,
  },
  {
    id: 'lined',
    name: 'Liniert',
    tile: 30,
    display: 44,
    colors: ['#fffdf6', '#a9c4e0'],
    tags: 'liniert papier notiz brief',
    body: (c, t) => `<path d="M0 ${t - 1} H${t}" stroke="${c[1]}" stroke-width="1.2"/>`,
  },
  {
    id: 'hearts',
    name: 'Herzen',
    tile: 60,
    display: 90,
    colors: ['#fde2e4', '#e2546f'],
    tags: 'herzen liebe valentinstag',
    body: (c, t) => heart(t / 4, t / 4, 14, c[1]!, -12) + heart((3 * t) / 4, (3 * t) / 4, 14, c[1]!, 12),
  },
  {
    id: 'stars',
    name: 'Sterne',
    tile: 80,
    display: 100,
    colors: ['#14213d', '#f7c948', '#ffffff'],
    tags: 'sterne nacht glitzer silvester baby',
    body: (c, t) =>
      star(t * 0.22, t * 0.28, 8, c[1]!, 10) + star(t * 0.72, t * 0.68, 6, c[1]!, -8) + `<circle cx="${t * 0.7}" cy="${t * 0.2}" r="1.6" fill="${c[2] ?? c[1]}"/><circle cx="${t * 0.25}" cy="${t * 0.78}" r="1.3" fill="${c[2] ?? c[1]}"/>`,
  },
  {
    id: 'floral',
    name: 'Blümchen',
    tile: 80,
    display: 110,
    colors: ['#fff6ef', '#f4a6b8', '#f7c948', '#9caf88'],
    tags: 'blumen floral frühling muttertag',
    body: (c, t) =>
      flower(t * 0.25, t * 0.25, 12, c[1]!, c[2]!) +
      flower(t * 0.75, t * 0.75, 12, c[1]!, c[2]!) +
      `<ellipse cx="${t * 0.72}" cy="${t * 0.22}" rx="5" ry="2.4" fill="${c[3]}" transform="rotate(-30 ${t * 0.72} ${t * 0.22})"/><ellipse cx="${t * 0.22}" cy="${t * 0.74}" rx="5" ry="2.4" fill="${c[3]}" transform="rotate(30 ${t * 0.22} ${t * 0.74})"/>`,
  },
  {
    id: 'leaves',
    name: 'Blätter',
    tile: 100,
    display: 140,
    colors: ['#f3f1e7', '#9caf88', '#6b7f5b'],
    tags: 'blätter natur boho grün',
    body: (c, t) => {
      const leaf = (x: number, y: number, rot: number, col: string) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 -16 C9 -8 9 8 0 16 C-9 8 -9 -8 0 -16Z" fill="${col}"/><path d="M0 -14 V14" stroke="${c[0]}" stroke-width="1" opacity="0.6"/></g>`;
      return leaf(t * 0.25, t * 0.3, 30, c[1]!) + leaf(t * 0.7, t * 0.2, -40, c[2]!) + leaf(t * 0.75, t * 0.75, 60, c[1]!) + leaf(t * 0.25, t * 0.8, -20, c[2]!);
    },
  },
  {
    id: 'zigzag',
    name: 'Zickzack',
    tile: 40,
    display: 70,
    colors: ['#ffffff', '#3a9fbf'],
    tags: 'zickzack chevron modern geometrisch',
    body: (c, t) => `<path d="M0 ${t * 0.6} L${t / 2} ${t * 0.2} L${t} ${t * 0.6}" stroke="${c[1]}" stroke-width="${t * 0.14}" fill="none"/>`,
  },
  {
    id: 'waves',
    name: 'Wellen',
    tile: 60,
    display: 90,
    colors: ['#dff3f6', '#6cc3d5'],
    tags: 'wellen meer sommer',
    body: (c, t) =>
      `<path d="M0 ${t * 0.35} Q${t / 4} ${t * 0.15} ${t / 2} ${t * 0.35} T${t} ${t * 0.35}" stroke="${c[1]}" stroke-width="3" fill="none"/><path d="M0 ${t * 0.85} Q${t / 4} ${t * 0.65} ${t / 2} ${t * 0.85} T${t} ${t * 0.85}" stroke="${c[1]}" stroke-width="3" fill="none" opacity="0.6"/>`,
  },
  {
    id: 'triangles',
    name: 'Dreiecke',
    tile: 60,
    display: 90,
    colors: ['#f7f3ee', '#e2725b', '#f2c879'],
    tags: 'geometrisch dreiecke modern boho',
    body: (c, t) =>
      `<polygon points="0,${t / 2} ${t / 2},${t / 2} ${t / 4},0" fill="${c[1]}"/><polygon points="${t / 2},${t} ${t},${t} ${(3 * t) / 4},${t / 2}" fill="${c[2]}"/>`,
  },
  {
    id: 'hexagons',
    name: 'Waben',
    tile: 52,
    display: 70,
    colors: ['#fff8e6', '#f2c879'],
    tags: 'waben geometrisch honig',
    body: (c, t) => {
      const h = (x: number, y: number) => {
        const pts = [];
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i + Math.PI / 6;
          pts.push(`${(x + Math.cos(a) * 13).toFixed(1)},${(y + Math.sin(a) * 13).toFixed(1)}`);
        }
        return `<polygon points="${pts.join(' ')}" fill="none" stroke="${c[1]}" stroke-width="2"/>`;
      };
      return wrap(t, t / 4, t / 4, h) + wrap(t, (3 * t) / 4, (3 * t) / 4, h);
    },
  },
  {
    id: 'plaid',
    name: 'Schottenkaro',
    tile: 80,
    display: 120,
    colors: ['#a4161a', '#1d4d33', '#f7c948'],
    tags: 'karo weihnachten winter tartan',
    body: (c, t) =>
      `<rect x="${t * 0.15}" y="0" width="${t * 0.3}" height="${t}" fill="${c[1]}" opacity="0.55"/><rect x="0" y="${t * 0.15}" width="${t}" height="${t * 0.3}" fill="${c[1]}" opacity="0.55"/><rect x="${t * 0.7}" y="0" width="${t * 0.04}" height="${t}" fill="${c[2]}" opacity="0.8"/><rect x="0" y="${t * 0.7}" width="${t}" height="${t * 0.04}" fill="${c[2]}" opacity="0.8"/><rect x="${t * 0.29}" y="0" width="${t * 0.02}" height="${t}" fill="#000" opacity="0.25"/><rect x="0" y="${t * 0.29}" width="${t}" height="${t * 0.02}" fill="#000" opacity="0.25"/>`,
  },
  {
    id: 'snowflakes',
    name: 'Schneeflocken',
    tile: 100,
    display: 140,
    colors: ['#cfe4f2', '#ffffff'],
    tags: 'schnee winter weihnachten',
    body: (c, t) => snowflake(t * 0.25, t * 0.28, 11, c[1]!) + snowflake(t * 0.74, t * 0.72, 8, c[1]!) + `<circle cx="${t * 0.75}" cy="${t * 0.2}" r="2" fill="${c[1]}"/><circle cx="${t * 0.2}" cy="${t * 0.75}" r="2.5" fill="${c[1]}"/>`,
  },
  {
    id: 'eggs',
    name: 'Ostereier',
    tile: 90,
    display: 120,
    colors: ['#f4f9ec', '#f4a6b8', '#a8dfe8', '#f7c948'],
    tags: 'ostern eier frühling pastell',
    body: (c, t) => {
      const egg = (x: number, y: number, col: string, band: string, rot: number) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 -14 C8 -14 11 0 11 5 C11 12 6 15 0 15 C-6 15 -11 12 -11 5 C-11 0 -8 -14 0 -14Z" fill="${col}"/><path d="M-10.6 2 Q-5 -1 0 2 T10.6 2" stroke="${band}" stroke-width="2.2" fill="none"/></g>`;
      return egg(t * 0.25, t * 0.28, c[1]!, '#ffffff', -12) + egg(t * 0.75, t * 0.72, c[2]!, c[3]!, 14);
    },
  },
  {
    id: 'autumn',
    name: 'Herbstlaub',
    tile: 100,
    display: 150,
    colors: ['#fbf1e3', '#d9480f', '#e0a526', '#a65e2e'],
    tags: 'herbst blätter laub',
    body: (c, t) => {
      const leaf = (x: number, y: number, rot: number, col: string) =>
        `<path transform="translate(${x} ${y}) rotate(${rot}) scale(0.9)" d="M0 14 L0 4 L-9 7 L-6 0 L-13 -4 L-6 -5 L-8 -12 L-2 -8 L0 -16 L2 -8 L8 -12 L6 -5 L13 -4 L6 0 L9 7 L0 4Z" fill="${col}"/>`;
      return leaf(t * 0.25, t * 0.25, -15, c[1]!) + leaf(t * 0.72, t * 0.3, 25, c[2]!) + leaf(t * 0.5, t * 0.75, 5, c[3]!);
    },
  },
  {
    id: 'scallops',
    name: 'Schuppen',
    tile: 40,
    display: 60,
    colors: ['#e8e3fb', '#a08be3'],
    tags: 'schuppen meerjungfrau verspielt',
    body: (c, t) =>
      `<path d="M0 ${t / 2} A${t / 2} ${t / 2} 0 0 0 ${t} ${t / 2}" stroke="${c[1]}" stroke-width="2" fill="none"/><path d="M${-t / 2} ${t} A${t / 2} ${t / 2} 0 0 0 ${t / 2} ${t} M${t / 2} ${t} A${t / 2} ${t / 2} 0 0 0 ${(3 * t) / 2} ${t}" stroke="${c[1]}" stroke-width="2" fill="none"/>`,
  },
  {
    id: 'terrazzo',
    name: 'Terrazzo',
    tile: 160,
    display: 220,
    colors: ['#f7f3ee', '#e2725b', '#9caf88', '#2f2f2f'],
    tags: 'terrazzo modern stein',
    body: (c, t) => {
      const r = rng(7);
      let s = '';
      for (let i = 0; i < 22; i++) {
        const x = r() * t,
          y = r() * t,
          sz = 3 + r() * 7;
        const col = c[1 + (i % 3)]!;
        const pts = [0, 1, 2, 3].map((k) => {
          const a = (k / 4) * Math.PI * 2 + r();
          return [Math.cos(a) * sz * (0.6 + r() * 0.5), Math.sin(a) * sz * (0.6 + r() * 0.5)];
        });
        s += wrap(t, x, y, (px, py) => `<polygon points="${pts.map(([a, b]) => `${(px + a!).toFixed(1)},${(py + b!).toFixed(1)}`).join(' ')}" fill="${col}"/>`);
      }
      return s;
    },
  },
  {
    id: 'retro-bands',
    name: 'Retro-Bänder',
    tile: 100,
    display: 260,
    colors: ['#f6e7cb', '#d9480f', '#e0a526', '#8e3b22'],
    tags: 'retro 70er streifen',
    body: (c, t) =>
      `<rect y="${t * 0.1}" width="${t}" height="${t * 0.12}" fill="${c[1]}"/><rect y="${t * 0.26}" width="${t}" height="${t * 0.12}" fill="${c[2]}"/><rect y="${t * 0.42}" width="${t}" height="${t * 0.12}" fill="${c[3]}"/>`,
  },
  {
    id: 'checker',
    name: 'Schachbrett',
    tile: 40,
    display: 80,
    colors: ['#ffffff', '#c9bdf2'],
    tags: 'schachbrett retro karo',
    body: (c, t) => `<rect width="${t / 2}" height="${t / 2}" fill="${c[1]}"/><rect x="${t / 2}" y="${t / 2}" width="${t / 2}" height="${t / 2}" fill="${c[1]}"/>`,
  },
  {
    id: 'pastel-dots',
    name: 'Bunte Punkte',
    tile: 60,
    display: 80,
    colors: ['#ffffff', '#f9b9c6', '#a8dfe8', '#ffe08a', '#c9bdf2'],
    tags: 'punkte pastell baby kinder',
    body: (c, t) =>
      `<circle cx="${t * 0.2}" cy="${t * 0.2}" r="5" fill="${c[1]}"/><circle cx="${t * 0.7}" cy="${t * 0.3}" r="5" fill="${c[2]}"/><circle cx="${t * 0.3}" cy="${t * 0.7}" r="5" fill="${c[3]}"/><circle cx="${t * 0.8}" cy="${t * 0.8}" r="5" fill="${c[4]}"/>`,
  },
  {
    id: 'checks-table',
    name: 'Tischdecke',
    tile: 60,
    display: 120,
    colors: ['#ffffff', '#d64545'],
    tags: 'karo picknick essen tischdecke',
    body: (c, t) =>
      `<rect width="${t / 2}" height="${t}" fill="${c[1]}" opacity="0.5"/><rect width="${t}" height="${t / 2}" fill="${c[1]}" opacity="0.5"/><rect width="${t / 2}" height="${t / 2}" fill="${c[1]}" opacity="0.4"/>`,
  },
  {
    id: 'rays',
    name: 'Sonnenstrahlen',
    tile: 400,
    display: 1000,
    colors: ['#ffe08a', '#ffc59e'],
    tags: 'retro strahlen sonne sommer',
    cover: true,
    body: (c, t) => {
      let s = '';
      const cx = t / 2,
        cy = t / 2;
      for (let i = 0; i < 24; i += 2) {
        const a1 = (i / 24) * Math.PI * 2,
          a2 = ((i + 1) / 24) * Math.PI * 2;
        s += `<polygon points="${cx},${cy} ${(cx + Math.cos(a1) * t).toFixed(1)},${(cy + Math.sin(a1) * t).toFixed(1)} ${(cx + Math.cos(a2) * t).toFixed(1)},${(cy + Math.sin(a2) * t).toFixed(1)}" fill="${c[1]}"/>`;
      }
      return s;
    },
  },
];

const byId = new Map(PATTERNS.map((p) => [p.id, p]));
export const getPattern = (id: string) => byId.get(id);

export function patternSvg(id: string, colors: string[]): string {
  const def = byId.get(id) ?? PATTERNS[0]!;
  const c = def.colors.map((d, i) => colors[i] ?? d);
  const t = def.tile;
  const px = Math.max(128, Math.min(1024, t * 4));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${t} ${t}" width="${px}" height="${px}"><rect width="${t}" height="${t}" fill="${c[0]}"/>${def.body(c, t)}</svg>`;
}
