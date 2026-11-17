/** Sticker: Herzen, Blumen, Sterne, Schleifen, Party, Tiere. Alle Motive original gestaltet. */
import { darken, lighten } from '../../lib/color';
import { rng } from '../../lib/util';
import { f, heartD, leaf, petals, sparkleD, starPts, type StickerDef } from './helpers';

const bowShape = (c0: string, extra = '') => {
  const d = darken(c0, 0.18);
  return `<path d="M100 92 C70 46 18 50 20 92 C22 134 70 130 100 104Z" fill="${c0}"/><path d="M100 92 C130 46 182 50 180 92 C178 134 130 130 100 104Z" fill="${c0}"/>${extra}<path d="M100 98 C82 74 50 68 40 86 C58 80 80 86 100 102Z M100 98 C118 74 150 68 160 86 C142 80 120 86 100 102Z" fill="${d}" opacity="0.55"/><path d="M92 102 L64 176 L80 166 L90 184 L104 108Z" fill="${d}"/><path d="M108 102 L136 176 L120 166 L110 184 L96 108Z" fill="${c0}"/><rect x="86" y="82" width="28" height="30" rx="10" fill="${d}"/>`;
};

const balloon = (cx: number, cy: number, rx: number, ry: number, col: string) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${col}"/><ellipse cx="${f(cx - rx * 0.38)}" cy="${f(cy - ry * 0.4)}" rx="${f(rx * 0.18)}" ry="${f(ry * 0.26)}" fill="#fff" opacity="0.5" transform="rotate(-25 ${f(cx - rx * 0.38)} ${f(cy - ry * 0.4)})"/><path d="M${cx} ${f(cy + ry - 2)} l-6 9 h12z" fill="${darken(col, 0.15)}"/>`;

export const SET_A: StickerDef[] = [
  // ---------------- Herzen ----------------
  {
    id: 'herz-klassisch', name: 'Herz', cat: 'herzen', tags: 'liebe valentinstag rot', w: 200, h: 200, colors: ['#e2546f'],
    draw: (c) => `<path d="${heartD(100, 104, 180)}" fill="${c[0]}"/><path d="M48 64 C36 76 36 92 42 104" stroke="#fff" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.45"/>`,
  },
  {
    id: 'herz-doodle', name: 'Herz-Skizze', cat: 'herzen', tags: 'liebe gezeichnet doodle', w: 200, h: 200, colors: ['#c2185b'],
    draw: (c) => `<path d="${heartD(100, 104, 170)}" fill="none" stroke="${c[0]}" stroke-width="7" stroke-linejoin="round"/><path d="${heartD(105, 99, 156)}" fill="none" stroke="${c[0]}" stroke-width="3" opacity="0.55"/>`,
  },
  {
    id: 'herz-glanz', name: 'Glanzherz', cat: 'herzen', tags: 'liebe glänzend', w: 200, h: 200, colors: ['#f28aa5', '#c2185b'],
    draw: (c) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient></defs><path d="${heartD(100, 104, 180)}" fill="url(#g)"/><ellipse cx="58" cy="66" rx="22" ry="11" fill="#fff" opacity="0.6" transform="rotate(-38 58 66)"/><circle cx="86" cy="50" r="5" fill="#fff" opacity="0.75"/>`,
  },
  {
    id: 'herz-paar', name: 'Herzenpaar', cat: 'herzen', tags: 'liebe paar hochzeit', w: 200, h: 200, colors: ['#e2546f', '#f9b9c6'],
    draw: (c) => `<g transform="rotate(-12 78 110)"><path d="${heartD(78, 110, 128)}" fill="${c[0]}"/></g><g transform="rotate(14 128 90)"><path d="${heartD(128, 90, 104)}" fill="${c[1]}" stroke="#fff" stroke-width="5"/></g>`,
  },
  {
    id: 'herz-pfeil', name: 'Herz mit Pfeil', cat: 'herzen', tags: 'amor liebe valentinstag', w: 200, h: 200, colors: ['#e2546f', '#b88a44'],
    draw: (c) => `<line x1="22" y1="150" x2="100" y2="101" stroke="${c[1]}" stroke-width="6" stroke-linecap="round"/><path d="M22 150 L10 144 M22 150 L14 160 M30 145 L18 139 M30 145 L22 155" stroke="${c[1]}" stroke-width="4" stroke-linecap="round"/><path d="${heartD(100, 104, 150)}" fill="${c[0]}"/><line x1="128" y1="84" x2="174" y2="55" stroke="${c[1]}" stroke-width="6" stroke-linecap="round"/><path d="M192 44 L178.8 63.1 L169.2 47.9Z" fill="${c[1]}"/>`,
  },
  {
    id: 'herz-ballon', name: 'Herzballon', cat: 'herzen', tags: 'ballon liebe geburtstag', w: 200, h: 220, colors: ['#f28aa5'],
    draw: (c) => `<path d="M100 152 C92 170 110 182 98 200 C92 208 100 214 98 218" stroke="#9a8a7a" stroke-width="2.5" fill="none"/><path d="${heartD(100, 84, 150)}" fill="${c[0]}"/><path d="M93 152 L100 142 L107 152Z" fill="${darken(c[0]!, 0.2)}"/><ellipse cx="62" cy="58" rx="16" ry="9" fill="#fff" opacity="0.5" transform="rotate(-38 62 58)"/>`,
  },
  {
    id: 'herz-genaeht', name: 'Stoffherz', cat: 'herzen', tags: 'genäht stoff handgemacht', w: 200, h: 200, colors: ['#f4a6b8', '#ffffff'],
    draw: (c) => `<path d="${heartD(100, 104, 180)}" fill="${c[0]}"/><path d="${heartD(100, 104, 146)}" fill="none" stroke="${c[1]}" stroke-width="4" stroke-dasharray="10 8" stroke-linecap="round"/><path d="${heartD(100, 104, 180)}" fill="none" stroke="${darken(c[0]!, 0.12)}" stroke-width="2"/>`,
  },
  {
    id: 'liebesbrief', name: 'Liebesbrief', cat: 'herzen', tags: 'brief post liebe', w: 200, h: 160, colors: ['#fdf3e7', '#e2546f'],
    draw: (c) => `<rect x="18" y="18" width="164" height="124" rx="8" fill="${c[0]}" stroke="#d9c6a8" stroke-width="3"/><path d="M22 138 L80 86 M178 138 L120 86" stroke="#e3d2b8" stroke-width="3"/><path d="M22 24 L100 90 L178 24" fill="none" stroke="#d9c6a8" stroke-width="3" stroke-linejoin="round"/><path d="${heartD(100, 88, 46)}" fill="${c[1]}"/>`,
  },
  {
    id: 'herz-gekritzelt', name: 'Kritzelherz', cat: 'herzen', tags: 'gekritzelt doodle liebe', w: 200, h: 200, colors: ['#e2546f'],
    draw: (c) => {
      let d = 'M-10 30';
      for (let x = -10, i = 0; x < 230; x += 11, i++) d += ` L${x + 6} ${i % 2 ? 22 : 196} `;
      return `<defs><clipPath id="h"><path d="${heartD(100, 104, 176)}"/></clipPath></defs><g clip-path="url(#h)"><path d="${d}" stroke="${c[0]}" stroke-width="5" fill="none" stroke-linejoin="round" opacity="0.85"/></g><path d="${heartD(100, 104, 176)}" fill="none" stroke="${c[0]}" stroke-width="6" stroke-linejoin="round"/>`;
    },
  },

  // ---------------- Blumen ----------------
  {
    id: 'gaensebluemchen', name: 'Gepresstes Gänseblümchen', cat: 'blumen', tags: 'blume getrocknet vintage scrapbook', w: 200, h: 200, colors: ['#f4e9cc', '#e0b23a'],
    draw: (c) => {
      const r = rng(3);
      let dots = '';
      for (let k = 1; k < 4; k++)
        for (let j = 0; j < k * 7; j++) {
          const a = (j / (k * 7)) * Math.PI * 2 + k;
          dots += `<circle cx="${f(100 + Math.cos(a) * k * 6.5)}" cy="${f(100 + Math.sin(a) * k * 6.5)}" r="${f(1.6 + r())}" fill="${darken(c[1]!, 0.35)}" opacity="0.7"/>`;
        }
      return `${petals(100, 100, 22, 50, 8, 36, darken(c[0]!, 0.08), 6, `stroke="${darken(c[0]!, 0.2)}" stroke-width="1"`)}${petals(100, 100, 22, 46, 7.5, 32, c[0]!, 0, `stroke="${darken(c[0]!, 0.18)}" stroke-width="1"`)}<circle cx="100" cy="100" r="27" fill="${c[1]}"/><circle cx="100" cy="100" r="27" fill="none" stroke="${darken(c[1]!, 0.25)}" stroke-width="3" opacity="0.6"/>${dots}`;
    },
  },
  {
    id: 'rosenknospe', name: 'Rosenknospe', cat: 'blumen', tags: 'rose blume romantisch', w: 200, h: 200, colors: ['#f4a3a0', '#7a9a5a'],
    draw: (c) => {
      const d = darken(c[0]!, 0.14),
        l = lighten(c[0]!, 0.3);
      return `<path d="M100 198 C98 176 100 160 100 146" stroke="${c[1]}" stroke-width="6" fill="none" stroke-linecap="round"/>${leaf(100, 172, 34, 10, -60, c[1]!)}<path d="M60 92 C58 50 82 22 100 16 C118 22 142 50 140 92 C138 128 118 146 100 146 C82 146 62 128 60 92Z" fill="${c[0]}"/><path d="M100 18 C84 40 82 72 100 94 C118 72 116 40 100 18Z" fill="${l}"/><path d="M100 40 C92 56 92 76 100 90" stroke="${d}" stroke-width="2" fill="none"/><path d="M60 92 C70 120 90 140 100 146 C84 120 78 96 84 68 C70 72 62 82 60 92Z" fill="${d}"/><path d="M140 92 C130 120 110 140 100 146 C116 120 122 96 116 68 C130 72 138 82 140 92Z" fill="${d}"/><path d="M66 118 C78 140 92 150 100 152 C108 150 122 140 134 118 C120 132 110 138 100 138 C90 138 80 132 66 118Z" fill="${c[1]}"/>`;
    },
  },
  {
    id: 'tulpe', name: 'Tulpe', cat: 'blumen', tags: 'tulpe frühling blume', w: 200, h: 200, colors: ['#f28aa5', '#5aa469'],
    draw: (c) => `<path d="M100 198 Q98 150 100 112" stroke="${c[1]}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M100 194 C70 172 56 140 60 108 C80 128 92 150 100 176Z" fill="${c[1]}"/><path d="M100 190 C130 168 146 140 142 116 C122 132 108 152 100 172Z" fill="${darken(c[1]!, 0.15)}"/><path d="M62 44 C60 84 74 114 100 116 C126 114 140 84 138 44 C124 58 112 60 100 36 C88 60 76 58 62 44Z" fill="${c[0]}"/><path d="M100 36 C86 60 82 94 100 116 C118 94 114 60 100 36Z" fill="${darken(c[0]!, 0.12)}"/><path d="M78 60 C76 80 82 96 92 106" stroke="#fff" stroke-width="4" fill="none" opacity="0.35" stroke-linecap="round"/>`,
  },
  {
    id: 'sonnenblume', name: 'Sonnenblume', cat: 'blumen', tags: 'sonnenblume sommer gelb', w: 200, h: 200, colors: ['#f7c948', '#6b4423'],
    draw: (c) => {
      const r = rng(9);
      let seeds = '';
      for (let i = 0; i < 70; i++) {
        const a = i * 2.39996,
          rad = Math.sqrt(i) * 3.6;
        seeds += `<circle cx="${f(100 + Math.cos(a) * rad)}" cy="${f(100 + Math.sin(a) * rad)}" r="${f(1.8 + r() * 0.8)}" fill="${darken(c[1]!, 0.35)}"/>`;
      }
      return `${petals(100, 100, 18, 60, 13, 34, darken(c[0]!, 0.12), 10)}${petals(100, 100, 18, 56, 12, 32, c[0]!, 0)}<circle cx="100" cy="100" r="34" fill="${c[1]}"/>${seeds}`;
    },
  },
  {
    id: 'kirschbluete', name: 'Kirschblüte', cat: 'blumen', tags: 'kirschblüte frühling sakura', w: 200, h: 200, colors: ['#f9c6d3', '#e2546f'],
    draw: (c) => {
      let p = '';
      for (let i = 0; i < 5; i++)
        p += `<path transform="rotate(${i * 72} 100 100)" d="M100 100 C76 82 70 40 88 26 L100 38 L112 26 C130 40 124 82 100 100Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.08)}" stroke-width="1.5"/>`;
      let st = '';
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const x = 100 + Math.cos(a) * 24,
          y = 100 + Math.sin(a) * 24;
        st += `<line x1="100" y1="100" x2="${f(x)}" y2="${f(y)}" stroke="${c[1]}" stroke-width="1.6"/><circle cx="${f(x)}" cy="${f(y)}" r="2.8" fill="#f7c948"/>`;
      }
      return `${p}<circle cx="100" cy="100" r="12" fill="${lighten(c[1]!, 0.3)}"/>${st}`;
    },
  },
  {
    id: 'lavendel', name: 'Lavendel', cat: 'blumen', tags: 'lavendel lila provence', w: 140, h: 220, colors: ['#a08be3', '#7a8f6a'],
    draw: (c) => {
      let s = `<path d="M70 216 C70 160 66 100 74 20" stroke="${c[1]}" stroke-width="4" fill="none" stroke-linecap="round"/>${leaf(70, 200, 50, 6, -28, c[1]!)}${leaf(70, 190, 46, 6, 26, c[1]!)}`;
      for (let i = 0; i < 14; i++) {
        const y = 24 + i * 7.5;
        const x = 73 - i * 0.2;
        const col = i % 2 ? c[0]! : darken(c[0]!, 0.15);
        s += `<ellipse cx="${f(x - 6)}" cy="${f(y)}" rx="6" ry="4.5" fill="${col}" transform="rotate(-25 ${f(x - 6)} ${f(y)})"/><ellipse cx="${f(x + 6)}" cy="${f(y + 3)}" rx="6" ry="4.5" fill="${col}" transform="rotate(25 ${f(x + 6)} ${f(y + 3)})"/>`;
      }
      return s;
    },
  },
  {
    id: 'eukalyptus', name: 'Eukalyptus', cat: 'blumen', tags: 'eukalyptus zweig grün hochzeit', w: 200, h: 220, colors: ['#9caf88'],
    draw: (c) => {
      let s = `<path d="M100 216 C96 160 110 90 98 12" stroke="${darken(c[0]!, 0.3)}" stroke-width="3" fill="none"/>`;
      for (let i = 0; i < 9; i++) {
        const y = 196 - i * 21;
        const x = 100 + Math.sin(i * 0.7) * 6;
        const side = i % 2 ? 1 : -1;
        const r = 18 - i * 1.1;
        s += `<circle cx="${f(x + side * (r + 2))}" cy="${f(y)}" r="${f(r)}" fill="${i % 3 === 0 ? lighten(c[0]!, 0.12) : c[0]}" stroke="${darken(c[0]!, 0.15)}" stroke-width="1.2"/>`;
      }
      return s;
    },
  },
  {
    id: 'monstera', name: 'Monstera-Blatt', cat: 'blumen', tags: 'monstera blatt tropisch sommer', w: 200, h: 200, colors: ['#2f7a4b'],
    draw: (c) => {
      let slits = '';
      for (let i = 0; i < 4; i++) {
        const y = 52 + i * 26;
        slits += `<path d="M${30 + i * 2} ${y} Q70 ${y + 4} 88 ${y + 10}" stroke="black" stroke-width="9" stroke-linecap="round"/><path d="M${170 - i * 2} ${y} Q130 ${y + 4} 112 ${y + 10}" stroke="black" stroke-width="9" stroke-linecap="round"/>`;
      }
      return `<defs><mask id="m"><rect width="200" height="200" fill="white"/>${slits}<ellipse cx="74" cy="92" rx="7" ry="10" fill="black"/><ellipse cx="126" cy="118" rx="7" ry="10" fill="black"/></mask></defs><path d="M100 196 L100 160" stroke="${darken(c[0]!, 0.2)}" stroke-width="7" stroke-linecap="round"/><path d="M100 164 C40 168 10 110 22 64 C34 22 80 10 100 34 C120 10 166 22 178 64 C190 110 160 168 100 164Z" fill="${c[0]}" mask="url(#m)"/><path d="M100 160 C98 120 100 70 100 36" stroke="${lighten(c[0]!, 0.25)}" stroke-width="3" fill="none"/>`;
    },
  },
  {
    id: 'trockenblume', name: 'Getrockneter Zweig', cat: 'blumen', tags: 'getrocknet vintage boho herbst', w: 200, h: 220, colors: ['#b8864a', '#7a5a32'],
    draw: (c) => {
      const r = rng(21);
      let s = '';
      const stems: [number, number, number, number][] = [
        [100, 216, 60, 40],
        [100, 216, 140, 30],
        [100, 216, 100, 20],
        [100, 216, 40, 90],
        [100, 216, 160, 86],
      ];
      for (const [x1, y1, x2, y2] of stems) s += `<path d="M${x1} ${y1} Q${(x1 + x2) / 2 + 8} ${(y1 + y2) / 2} ${x2} ${y2}" stroke="${c[1]}" stroke-width="2.4" fill="none"/>`;
      s += leaf(100, 190, 40, 9, -50, darken(c[0]!, 0.2)) + leaf(100, 176, 36, 8, 46, darken(c[0]!, 0.25));
      for (const [, , x, y] of stems)
        for (let k = 0; k < 6; k++) {
          const cx = x + (r() - 0.5) * 34,
            cy = y + (r() - 0.5) * 26;
          s += petals(cx, cy, 5, 5, 4, 5.5, k % 2 ? c[0]! : darken(c[0]!, 0.15), r() * 70) + `<circle cx="${f(cx)}" cy="${f(cy)}" r="2" fill="${c[1]}"/>`;
        }
      return s;
    },
  },
  {
    id: 'blumenstrauss', name: 'Blumenstrauß', cat: 'blumen', tags: 'strauß blumen geburtstag muttertag', w: 200, h: 220, colors: ['#f4a6b8', '#f7c948', '#a8dfe8', '#e8d4b8'],
    draw: (c) => {
      const fl = (x: number, y: number, col: string, n: number) => petals(x, y, n, 13, 10, 13, col) + `<circle cx="${x}" cy="${y}" r="8" fill="${darken(col, 0.25)}"/>`;
      return `${leaf(100, 130, 70, 14, -40, '#7aa86a')}${leaf(100, 130, 74, 14, 38, '#5f8f55')}${leaf(100, 130, 60, 12, -8, '#8fbf78')}${fl(66, 70, c[0]!, 6)}${fl(134, 66, c[2]!, 5)}${fl(100, 48, c[1]!, 8)}${fl(84, 98, c[1]!, 5)}${fl(120, 100, c[0]!, 6)}<path d="M60 120 L140 120 L112 214 L88 214Z" fill="${c[3]}"/><path d="M60 120 L100 140 L140 120" fill="none" stroke="${darken(c[3]!, 0.12)}" stroke-width="3"/><path d="M82 164 C92 172 108 172 118 164" stroke="#e2546f" stroke-width="6" fill="none" stroke-linecap="round"/>`;
    },
  },
  {
    id: 'farn', name: 'Farn', cat: 'blumen', tags: 'farn wald natur grün', w: 160, h: 220, colors: ['#5aa469'],
    draw: (c) => {
      let s = `<path d="M80 216 C76 150 84 80 70 10" stroke="${darken(c[0]!, 0.25)}" stroke-width="3" fill="none"/>`;
      for (let i = 0; i < 12; i++) {
        const y = 200 - i * 15.5;
        const x = 80 - i * 0.6;
        const len = 56 - i * 3.8;
        s += leaf(x, y, len, len * 0.18, -70 + i * 1.5, i % 2 ? c[0]! : darken(c[0]!, 0.1)) + leaf(x, y, len, len * 0.18, 70 - i * 1.5, i % 2 ? darken(c[0]!, 0.1) : c[0]!);
      }
      return s;
    },
  },
  {
    id: 'holunder', name: 'Gepresste Dolde', cat: 'blumen', tags: 'getrocknet gelb vintage scrapbook', w: 200, h: 220, colors: ['#f3dc9a', '#b49a5e'],
    draw: (c) => {
      const r = rng(33);
      let s = '';
      const heads: [number, number][] = [];
      for (let i = 0; i < 22; i++) {
        const a = -Math.PI / 2 + (r() - 0.5) * 2.2,
          d = 30 + r() * 52;
        heads.push([100 + Math.cos(a) * d * 1.1, 110 + Math.sin(a) * d]);
      }
      for (const [x, y] of heads) s += `<path d="M100 150 Q${f((100 + x) / 2)} ${f((150 + y) / 2 + 6)} ${f(x)} ${f(y)}" stroke="${c[1]}" stroke-width="1.6" fill="none"/>`;
      s += `<path d="M100 218 L100 150" stroke="${c[1]}" stroke-width="3"/>${leaf(100, 196, 50, 11, -55, darken(c[1]!, 0.1), lighten(c[1]!, 0.3))}${leaf(100, 182, 46, 10, 50, c[1]!, lighten(c[1]!, 0.3))}`;
      for (const [x, y] of heads) s += petals(x, y, 5, 6, 5, 6.5, r() > 0.5 ? c[0]! : darken(c[0]!, 0.1), r() * 72, `stroke="${darken(c[0]!, 0.22)}" stroke-width="0.8"`) + `<circle cx="${f(x)}" cy="${f(y)}" r="2.4" fill="${darken(c[0]!, 0.35)}"/>`;
      return s;
    },
  },

  // ---------------- Sterne & Glitzer ----------------
  {
    id: 'stern-klassisch', name: 'Stern', cat: 'sterne', tags: 'stern gold', w: 200, h: 200, colors: ['#f7c948'],
    draw: (c) => `<polygon points="${starPts(100, 106, 94, 40)}" fill="${c[0]}" stroke="${darken(c[0]!, 0.12)}" stroke-width="4" stroke-linejoin="round"/><polygon points="${starPts(100, 106, 50, 22)}" fill="${lighten(c[0]!, 0.35)}" opacity="0.6"/>`,
  },
  {
    id: 'stern-doodle', name: 'Stern-Skizze', cat: 'sterne', tags: 'stern doodle gezeichnet', w: 200, h: 200, colors: ['#2b2b2b'],
    draw: (c) => `<polygon points="${starPts(100, 106, 90, 38)}" fill="none" stroke="${c[0]}" stroke-width="6" stroke-linejoin="round"/><polygon points="${starPts(104, 102, 84, 36, 5, 3)}" fill="none" stroke="${c[0]}" stroke-width="2.5" stroke-linejoin="round" opacity="0.6"/>`,
  },
  {
    id: 'funkeln', name: 'Funkeln', cat: 'sterne', tags: 'glitzer funkeln stern', w: 200, h: 200, colors: ['#f7c948'],
    draw: (c) => `<path d="${sparkleD(92, 108, 86)}" fill="${c[0]}"/><path d="${sparkleD(160, 36, 24)}" fill="${c[0]}"/>`,
  },
  {
    id: 'funkel-trio', name: 'Funkel-Trio', cat: 'sterne', tags: 'glitzer funkeln magie', w: 200, h: 200, colors: ['#f7c948'],
    draw: (c) => `<path d="${sparkleD(78, 112, 64)}" fill="${c[0]}"/><path d="${sparkleD(152, 52, 34)}" fill="${lighten(c[0]!, 0.2)}"/><path d="${sparkleD(158, 152, 22)}" fill="${c[0]}"/>`,
  },
  {
    id: 'sternschnuppe', name: 'Sternschnuppe', cat: 'sterne', tags: 'sternschnuppe wunsch nacht', w: 220, h: 200, colors: ['#f7c948', '#f28aa5'],
    draw: (c) => `<path d="M18 182 Q90 140 150 70" stroke="${c[1]}" stroke-width="10" fill="none" stroke-linecap="round" opacity="0.5"/><path d="M40 190 Q100 150 156 82" stroke="${c[0]}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.6"/><path d="M10 160 Q80 124 144 62" stroke="${lighten(c[1]!, 0.3)}" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.6"/><polygon points="${starPts(160, 62, 50, 22, 5, 14)}" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="3" stroke-linejoin="round"/>`,
  },
  {
    id: 'stern-glitzer', name: 'Glitzerstern', cat: 'sterne', tags: 'glitzer gold stern luxus', w: 200, h: 200, colors: ['#d4af37'],
    draw: (c) => {
      const r = rng(5);
      let dots = '';
      for (let i = 0; i < 90; i++) dots += `<circle cx="${f(20 + r() * 160)}" cy="${f(20 + r() * 170)}" r="${f(0.8 + r() * 2.2)}" fill="#fff" opacity="${f(0.3 + r() * 0.6)}"/>`;
      return `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${lighten(c[0]!, 0.45)}"/><stop offset="0.5" stop-color="${c[0]}"/><stop offset="1" stop-color="${darken(c[0]!, 0.3)}"/></linearGradient><clipPath id="s"><polygon points="${starPts(100, 106, 94, 42)}"/></clipPath></defs><polygon points="${starPts(100, 106, 94, 42)}" fill="url(#g)"/><g clip-path="url(#s)">${dots}</g>`;
    },
  },
  {
    id: 'abzeichen', name: 'Strahlenabzeichen', cat: 'sterne', tags: 'abzeichen badge sale neu', w: 200, h: 200, colors: ['#e2546f'],
    draw: (c) => `<polygon points="${starPts(100, 100, 96, 82, 18)}" fill="${c[0]}"/><circle cx="100" cy="100" r="66" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/><path d="${sparkleD(100, 100, 30)}" fill="#fff"/>`,
  },
  {
    id: 'konfetti-explosion', name: 'Konfetti-Explosion', cat: 'sterne', tags: 'konfetti party feier', w: 200, h: 200, colors: ['#f28aa5', '#6cc3d5', '#f7c948', '#8fcf8f'],
    draw: (c) => {
      const r = rng(13);
      let s = '';
      for (let i = 0; i < 46; i++) {
        const a = r() * Math.PI * 2,
          d = 18 + r() * 78;
        const x = 100 + Math.cos(a) * d,
          y = 100 + Math.sin(a) * d;
        const col = c[i % 4]!;
        const k = i % 3;
        s +=
          k === 0
            ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 3)}" fill="${col}"/>`
            : k === 1
              ? `<rect x="${f(x - 6)}" y="${f(y - 2.5)}" width="12" height="5" rx="1.5" fill="${col}" transform="rotate(${f((a * 180) / Math.PI)} ${f(x)} ${f(y)})"/>`
              : `<polygon points="${starPts(x, y, 6, 2.6)}" fill="${col}"/>`;
      }
      return s;
    },
  },

  // ---------------- Schleifen & Bänder ----------------
  { id: 'schleife', name: 'Schleife', cat: 'schleifen', tags: 'schleife geschenk', w: 200, h: 200, colors: ['#e2546f'], draw: (c) => bowShape(c[0]!) },
  {
    id: 'schleife-punkte', name: 'Gepunktete Schleife', cat: 'schleifen', tags: 'schleife punkte süß', w: 200, h: 200, colors: ['#6cc3d5', '#ffffff'],
    draw: (c) => {
      let dots = '';
      for (let y = 50; y < 190; y += 16) for (let x = 20 + ((y / 16) % 2) * 8; x < 185; x += 16) dots += `<circle cx="${x}" cy="${y}" r="3.2" fill="${c[1]}"/>`;
      return `<defs><clipPath id="b"><path d="M100 92 C70 46 18 50 20 92 C22 134 70 130 100 104Z M100 92 C130 46 182 50 180 92 C178 134 130 130 100 104Z M92 102 L64 176 L80 166 L90 184 L104 108Z M108 102 L136 176 L120 166 L110 184 L96 108Z"/></clipPath></defs>${bowShape(c[0]!)}<g clip-path="url(#b)" opacity="0.9">${dots}</g><rect x="86" y="82" width="28" height="30" rx="10" fill="${darken(c[0]!, 0.18)}"/>`;
    },
  },
  {
    id: 'banner-band', name: 'Banner', cat: 'schleifen', tags: 'banner band titel', w: 240, h: 100, colors: ['#e2546f'],
    draw: (c) => {
      const d = darken(c[0]!, 0.18),
        dd = darken(c[0]!, 0.35);
      return `<path d="M14 34 L62 34 L62 84 L14 84 L28 59Z" fill="${d}"/><path d="M226 34 L178 34 L178 84 L226 84 L212 59Z" fill="${d}"/><path d="M50 70 L62 84 L62 66Z" fill="${dd}"/><path d="M190 70 L178 84 L178 66Z" fill="${dd}"/><path d="M50 22 Q120 8 190 22 L190 70 Q120 56 50 70Z" fill="${c[0]}"/><path d="M58 30 Q120 18 182 30" stroke="#fff" stroke-width="2" fill="none" opacity="0.4" stroke-dasharray="4 5"/>`;
    },
  },
  {
    id: 'rosette', name: 'Rosette', cat: 'schleifen', tags: 'rosette preis gewinner', w: 200, h: 220, colors: ['#d4af37', '#e2546f'],
    draw: (c) => `<path d="M76 120 L56 208 L76 196 L88 214 L100 130Z" fill="${darken(c[1]!, 0.12)}"/><path d="M124 120 L144 208 L124 196 L112 214 L100 130Z" fill="${c[1]}"/><polygon points="${starPts(100, 90, 78, 68, 24)}" fill="${c[1]}"/><circle cx="100" cy="90" r="56" fill="${lighten(c[1]!, 0.2)}"/><circle cx="100" cy="90" r="44" fill="${c[0]}"/><circle cx="100" cy="90" r="36" fill="none" stroke="${lighten(c[0]!, 0.4)}" stroke-width="3"/><polygon points="${starPts(100, 92, 20, 9)}" fill="${lighten(c[0]!, 0.5)}"/>`,
  },
  {
    id: 'haarschleife', name: 'Satinschleife', cat: 'schleifen', tags: 'schleife satin baby mädchen', w: 200, h: 160, colors: ['#f9b9c6'],
    draw: (c) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c[0]!, 0.3)}"/><stop offset="0.55" stop-color="${c[0]}"/><stop offset="1" stop-color="${darken(c[0]!, 0.1)}"/></linearGradient></defs><path d="M100 80 C60 20 6 30 12 80 C18 130 66 128 100 86Z" fill="url(#g)"/><path d="M100 80 C140 20 194 30 188 80 C182 130 134 128 100 86Z" fill="url(#g)"/><path d="M30 60 C46 50 70 60 92 80" stroke="#fff" stroke-width="5" fill="none" opacity="0.5" stroke-linecap="round"/><path d="M170 60 C154 50 130 60 108 80" stroke="#fff" stroke-width="5" fill="none" opacity="0.4" stroke-linecap="round"/><ellipse cx="100" cy="83" rx="16" ry="20" fill="${darken(c[0]!, 0.12)}"/>`,
  },
  {
    id: 'ringelband', name: 'Ringelband', cat: 'schleifen', tags: 'band locke geschenk party', w: 200, h: 200, colors: ['#a08be3'],
    draw: (c) => `<path d="M20 30 C70 20 80 70 50 80 C20 90 30 40 70 46 C120 54 120 110 90 118 C60 126 66 82 104 86 C150 92 150 150 120 160 C92 170 96 128 132 132 C170 136 176 176 186 190" stroke="${c[0]}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M20 30 C70 20 80 70 50 80" stroke="#fff" stroke-width="2.5" fill="none" opacity="0.5"/>`,
  },
  {
    id: 'geschenkschleife', name: 'Geschenkrosette', cat: 'schleifen', tags: 'geschenk schleife weihnachten', w: 200, h: 200, colors: ['#e2546f'],
    draw: (c) => `${petals(100, 100, 8, 50, 22, 44, darken(c[0]!, 0.1), 22)}${petals(100, 100, 8, 40, 18, 34, c[0]!, 0)}${petals(100, 100, 6, 22, 11, 20, lighten(c[0]!, 0.15), 10)}<circle cx="100" cy="100" r="14" fill="${darken(c[0]!, 0.15)}"/>`,
  },

  // ---------------- Party & Geburtstag ----------------
  {
    id: 'ballon', name: 'Ballon', cat: 'party', tags: 'ballon geburtstag party', w: 140, h: 220, colors: ['#e2546f'],
    draw: (c) => `<path d="M70 152 C62 172 80 182 68 200 C64 208 70 214 70 218" stroke="#9a8a7a" stroke-width="2.4" fill="none"/>${balloon(70, 78, 56, 70, c[0]!)}`,
  },
  {
    id: 'ballon-trio', name: 'Ballon-Trio', cat: 'party', tags: 'ballons geburtstag party feier', w: 200, h: 230, colors: ['#f28aa5', '#6cc3d5', '#f7c948'],
    draw: (c) => `<path d="M50 132 Q80 180 100 226 M150 128 Q120 180 100 226 M100 112 Q96 170 100 226" stroke="#9a8a7a" stroke-width="2" fill="none"/>${balloon(50, 76, 40, 50, c[0]!)}${balloon(150, 72, 40, 50, c[1]!)}${balloon(100, 56, 42, 52, c[2]!)}`,
  },
  {
    id: 'torte', name: 'Geburtstagstorte', cat: 'party', tags: 'torte kuchen geburtstag kerzen', w: 200, h: 200, colors: ['#f9b9c6', '#fff3c4', '#e2546f'],
    draw: (c) => {
      const candle = (x: number) => `<rect x="${x - 4}" y="38" width="8" height="32" rx="2" fill="${c[1]}"/><path d="M${x - 4} 46 l8 -5 M${x - 4} 56 l8 -5 M${x - 4} 66 l8 -5" stroke="${c[2]}" stroke-width="2"/><path d="M${x} 20 C${x + 7} 28 ${x + 5} 36 ${x} 36 C${x - 5} 36 ${x - 7} 28 ${x} 20Z" fill="#f7a33a"/><path d="M${x} 27 C${x + 3} 31 ${x + 2} 34 ${x} 34 C${x - 2} 34 ${x - 3} 31 ${x} 27Z" fill="#ffe08a"/>`;
      return `<ellipse cx="100" cy="186" rx="88" ry="10" fill="#e8dccb"/><rect x="26" y="118" width="148" height="66" rx="8" fill="${c[0]}"/><path d="M26 124 Q26 118 32 118 L168 118 Q174 118 174 124 L174 136 Q162 150 150 136 Q138 150 126 136 Q114 150 100 136 Q86 150 74 136 Q62 150 50 136 Q38 150 26 136Z" fill="${c[1]}"/><rect x="50" y="70" width="100" height="50" rx="7" fill="${darken(c[0]!, 0.06)}"/><path d="M50 76 Q50 70 56 70 L144 70 Q150 70 150 76 L150 86 Q140 98 130 86 Q120 98 110 86 Q100 98 90 86 Q80 98 70 86 Q60 98 50 86Z" fill="${c[1]}"/>${candle(76)}${candle(100)}${candle(124)}<circle cx="60" cy="160" r="4" fill="${c[2]}"/><circle cx="100" cy="164" r="4" fill="${c[2]}"/><circle cx="140" cy="160" r="4" fill="${c[2]}"/>`;
    },
  },
  {
    id: 'partyhut', name: 'Partyhut', cat: 'party', tags: 'partyhut geburtstag feier', w: 160, h: 200, colors: ['#6cc3d5', '#f7c948'],
    draw: (c) => `<defs><clipPath id="h"><path d="M80 24 L144 182 Q80 198 16 182Z"/></clipPath></defs><path d="M80 24 L144 182 Q80 198 16 182Z" fill="${c[0]}"/><g clip-path="url(#h)"><path d="M0 70 L160 40 M0 110 L160 80 M0 150 L160 120 M0 190 L160 160" stroke="${c[1]}" stroke-width="12"/></g><path d="M16 182 Q80 198 144 182" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>${petals(80, 22, 10, 10, 5, 12, '#f28aa5')}<circle cx="80" cy="22" r="8" fill="#f9b9c6"/>`,
  },
  {
    id: 'konfettikanone', name: 'Konfettikanone', cat: 'party', tags: 'konfetti feier silvester party', w: 200, h: 200, colors: ['#a08be3', '#f28aa5', '#f7c948', '#6cc3d5'],
    draw: (c) => {
      const r = rng(4);
      let s = '';
      for (let i = 0; i < 34; i++) {
        const a = -Math.PI / 4 + (r() - 0.5) * 1.6,
          d = 30 + r() * 90;
        const x = 92 + Math.cos(a) * d,
          y = 108 + Math.sin(a) * d;
        const col = c[1 + (i % 3)]!;
        s += i % 2 ? `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 3)}" fill="${col}"/>` : `<rect x="${f(x - 5)}" y="${f(y - 2)}" width="10" height="4.5" rx="1" fill="${col}" transform="rotate(${f(r() * 180)} ${f(x)} ${f(y)})"/>`;
      }
      return `${s}<defs><clipPath id="t"><path d="M18 190 L36 196 L104 118 L86 104Z"/></clipPath></defs><path d="M18 190 L36 196 L104 118 L86 104Z" fill="${c[0]}"/><g clip-path="url(#t)"><path d="M0 160 L120 120 M0 180 L120 140 M0 200 L120 160 M0 140 L120 100" stroke="#fff" stroke-width="5" opacity="0.6"/></g><ellipse cx="95" cy="111" rx="12" ry="5" fill="${darken(c[0]!, 0.25)}" transform="rotate(-48 95 111)"/>`;
    },
  },
  {
    id: 'wimpelkette', name: 'Wimpelkette', cat: 'party', tags: 'wimpel girlande party sommer', w: 300, h: 120, colors: ['#f28aa5', '#6cc3d5', '#f7c948', '#8fcf8f'],
    draw: (c) => {
      let s = `<path d="M6 16 Q150 66 294 16" stroke="#8a7a6a" stroke-width="2.5" fill="none"/>`;
      for (let i = 0; i < 7; i++) {
        const t = (i + 0.5) / 7;
        const x = 6 + t * 288;
        const y = 16 + 50 * 4 * t * (1 - t) * 0.5 * 2 - 2;
        const ang = (1 - 2 * t) * -18;
        s += `<path transform="rotate(${f(ang)} ${f(x)} ${f(y)})" d="M${f(x - 17)} ${f(y)} L${f(x + 17)} ${f(y)} L${f(x)} ${f(y + 46)}Z" fill="${c[i % 4]}"/><circle cx="${f(x)}" cy="${f(y + 14)}" r="3" fill="#fff" opacity="0.7"/>`;
      }
      return s;
    },
  },
  {
    id: 'geschenk', name: 'Geschenk', cat: 'party', tags: 'geschenk überraschung geburtstag weihnachten', w: 200, h: 200, colors: ['#a8dfe8', '#e2546f'],
    draw: (c) => `<rect x="30" y="86" width="140" height="100" rx="6" fill="${c[0]}"/><rect x="22" y="66" width="156" height="30" rx="6" fill="${lighten(c[0]!, 0.15)}"/><rect x="90" y="66" width="20" height="120" fill="${c[1]}"/><rect x="30" y="96" width="140" height="8" fill="${darken(c[0]!, 0.12)}" opacity="0.5"/><path d="M100 66 C80 30 50 34 56 54 C60 66 84 66 100 66Z" fill="${c[1]}"/><path d="M100 66 C120 30 150 34 144 54 C140 66 116 66 100 66Z" fill="${darken(c[1]!, 0.1)}"/>`,
  },
  {
    id: 'cupcake', name: 'Cupcake', cat: 'party', tags: 'cupcake kuchen süß geburtstag', w: 160, h: 200, colors: ['#f9b9c6', '#c49a6c'],
    draw: (c) => `<path d="M30 110 L130 110 L116 194 L44 194Z" fill="${c[1]}"/><path d="M48 112 L56 194 M66 112 L70 194 M84 112 L84 194 M102 112 L98 194 M118 112 L112 194" stroke="${darken(c[1]!, 0.15)}" stroke-width="3"/><path d="M24 112 C10 112 14 86 34 88 C26 66 50 56 60 66 C60 44 100 40 104 62 C118 52 138 66 128 86 C148 86 150 112 136 112Z" fill="${c[0]}"/><path d="M50 82 C70 74 96 74 116 82" stroke="#fff" stroke-width="4" fill="none" opacity="0.5" stroke-linecap="round"/><circle cx="82" cy="40" r="12" fill="#d64545"/><path d="M82 30 Q88 16 98 14" stroke="#5aa469" stroke-width="3" fill="none"/><rect x="54" y="94" width="8" height="3" rx="1.5" fill="#f7c948" transform="rotate(30 58 95)"/><rect x="94" y="88" width="8" height="3" rx="1.5" fill="#6cc3d5" transform="rotate(-20 98 89)"/><rect x="74" y="100" width="8" height="3" rx="1.5" fill="#8fcf8f"/>`,
  },
  {
    id: 'luftschlange', name: 'Luftschlange', cat: 'party', tags: 'luftschlange party karneval silvester', w: 200, h: 200, colors: ['#f7c948'],
    draw: (c) => `<path d="M14 40 C60 10 70 60 40 70 C10 80 30 30 80 50 C130 70 110 120 80 120 C50 120 70 80 120 100 C170 120 150 170 120 166 C96 162 110 136 150 150 C176 160 178 184 190 190" stroke="${c[0]}" stroke-width="11" fill="none" stroke-linecap="round"/><path d="M14 40 C60 10 70 60 40 70" stroke="${darken(c[0]!, 0.2)}" stroke-width="3" fill="none"/><circle cx="160" cy="40" r="5" fill="#f28aa5"/><circle cx="30" cy="150" r="4" fill="#6cc3d5"/><circle cx="176" cy="96" r="3.5" fill="#8fcf8f"/>`,
  },

  // ---------------- Tiere ----------------
  {
    id: 'katze', name: 'Katze', cat: 'tiere', tags: 'katze haustier süß', w: 200, h: 190, colors: ['#f2b880', '#f9b9c6'],
    draw: (c) => `<path d="M34 80 L40 14 L84 52Z" fill="${c[0]}"/><path d="M166 80 L160 14 L116 52Z" fill="${c[0]}"/><path d="M44 66 L47 32 L72 54Z" fill="${c[1]}"/><path d="M156 66 L153 32 L128 54Z" fill="${c[1]}"/><ellipse cx="100" cy="108" rx="78" ry="70" fill="${c[0]}"/><path d="M80 48 Q100 40 120 48 M84 60 L90 70 M116 60 L110 70 M100 54 L100 68" stroke="${darken(c[0]!, 0.2)}" stroke-width="4" fill="none" stroke-linecap="round"/><ellipse cx="70" cy="104" rx="9" ry="12" fill="#2b2b2b"/><ellipse cx="130" cy="104" rx="9" ry="12" fill="#2b2b2b"/><circle cx="73" cy="100" r="3" fill="#fff"/><circle cx="133" cy="100" r="3" fill="#fff"/><path d="M92 126 L108 126 L100 136Z" fill="${c[1]}"/><path d="M100 136 Q92 148 84 142 M100 136 Q108 148 116 142" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M30 120 L62 126 M30 136 L62 134 M170 120 L138 126 M170 136 L138 134" stroke="#7a5a3a" stroke-width="2" stroke-linecap="round"/><ellipse cx="52" cy="136" rx="10" ry="6" fill="${c[1]}" opacity="0.6"/><ellipse cx="148" cy="136" rx="10" ry="6" fill="${c[1]}" opacity="0.6"/>`,
  },
  {
    id: 'hund', name: 'Hund', cat: 'tiere', tags: 'hund haustier welpe', w: 200, h: 190, colors: ['#c49a6c', '#f4ede4'],
    draw: (c) => `<ellipse cx="100" cy="100" rx="70" ry="72" fill="${c[0]}"/><path d="M36 50 C10 60 8 120 30 140 C46 132 50 90 52 66Z" fill="${darken(c[0]!, 0.25)}"/><path d="M164 50 C190 60 192 120 170 140 C154 132 150 90 148 66Z" fill="${darken(c[0]!, 0.25)}"/><ellipse cx="100" cy="132" rx="40" ry="32" fill="${c[1]}"/><ellipse cx="128" cy="78" rx="18" ry="16" fill="${darken(c[0]!, 0.18)}" opacity="0.7"/><circle cx="74" cy="86" r="9" fill="#2b2b2b"/><circle cx="126" cy="86" r="9" fill="#2b2b2b"/><circle cx="77" cy="82" r="3" fill="#fff"/><circle cx="129" cy="82" r="3" fill="#fff"/><ellipse cx="100" cy="118" rx="14" ry="10" fill="#2b2b2b"/><path d="M100 128 L100 140 M100 140 Q90 150 80 144 M100 140 Q110 150 120 144" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M106 146 Q110 166 100 168 Q90 166 94 146Z" fill="#f28aa5"/>`,
  },
  {
    id: 'hase', name: 'Häschen', cat: 'tiere', tags: 'hase ostern süß kaninchen', w: 180, h: 220, colors: ['#f4ede4', '#f9b9c6'],
    draw: (c) => `<ellipse cx="62" cy="50" rx="16" ry="46" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="2" transform="rotate(-10 62 50)"/><ellipse cx="62" cy="54" rx="7" ry="34" fill="${c[1]}" transform="rotate(-10 62 54)"/><ellipse cx="114" cy="48" rx="16" ry="46" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="2" transform="rotate(12 114 48)"/><ellipse cx="114" cy="52" rx="7" ry="34" fill="${c[1]}" transform="rotate(12 114 52)"/><ellipse cx="92" cy="170" rx="62" ry="48" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="2"/><circle cx="156" cy="180" r="14" fill="#fff" stroke="${darken(c[0]!, 0.1)}" stroke-width="2"/><circle cx="88" cy="112" r="44" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="2"/><circle cx="72" cy="108" r="5.5" fill="#2b2b2b"/><circle cx="104" cy="108" r="5.5" fill="#2b2b2b"/><path d="M84 122 L92 122 L88 127Z" fill="${c[1]}"/><path d="M88 127 Q82 134 78 130 M88 127 Q94 134 98 130" stroke="#2b2b2b" stroke-width="2" fill="none"/><ellipse cx="62" cy="124" rx="8" ry="5" fill="${c[1]}" opacity="0.6"/><ellipse cx="114" cy="124" rx="8" ry="5" fill="${c[1]}" opacity="0.6"/><ellipse cx="66" cy="212" rx="16" ry="8" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="2"/><ellipse cx="116" cy="212" rx="16" ry="8" fill="${c[0]}" stroke="${darken(c[0]!, 0.1)}" stroke-width="2"/>`,
  },
  {
    id: 'voegelchen', name: 'Vögelchen', cat: 'tiere', tags: 'vogel frühling süß', w: 200, h: 180, colors: ['#6cc3d5', '#f7a33a'],
    draw: (c) => `<path d="M40 100 L6 80 L16 112Z" fill="${darken(c[0]!, 0.2)}"/><ellipse cx="96" cy="100" rx="66" ry="56" fill="${c[0]}"/><ellipse cx="104" cy="122" rx="40" ry="26" fill="${lighten(c[0]!, 0.5)}"/><path d="M60 92 C80 70 120 80 124 108 C104 124 74 118 60 92Z" fill="${darken(c[0]!, 0.18)}"/><path d="M158 88 L188 96 L158 106Z" fill="${c[1]}"/><circle cx="138" cy="80" r="8" fill="#2b2b2b"/><circle cx="140" cy="77" r="2.5" fill="#fff"/><path d="M86 154 L80 176 M80 176 L72 178 M80 176 L84 178 M108 154 L106 176 M106 176 L98 178 M106 176 L112 178" stroke="${c[1]}" stroke-width="3" stroke-linecap="round"/><path d="M92 46 Q96 30 108 34 Q100 38 100 46" fill="${darken(c[0]!, 0.2)}"/>`,
  },
  {
    id: 'schmetterling', name: 'Schmetterling', cat: 'tiere', tags: 'schmetterling frühling bunt', w: 200, h: 180, colors: ['#f28aa5', '#a08be3'],
    draw: (c) => `<path d="M100 80 C70 10 10 10 16 56 C20 90 60 98 100 90Z" fill="${c[0]}"/><path d="M100 80 C130 10 190 10 184 56 C180 90 140 98 100 90Z" fill="${c[0]}"/><path d="M100 96 C66 100 30 120 40 150 C50 176 90 150 100 104Z" fill="${c[1]}"/><path d="M100 96 C134 100 170 120 160 150 C150 176 110 150 100 104Z" fill="${c[1]}"/><circle cx="52" cy="50" r="12" fill="#fff" opacity="0.6"/><circle cx="148" cy="50" r="12" fill="#fff" opacity="0.6"/><circle cx="62" cy="134" r="8" fill="#fff" opacity="0.55"/><circle cx="138" cy="134" r="8" fill="#fff" opacity="0.55"/><ellipse cx="100" cy="98" rx="6" ry="40" fill="#3a2e27"/><path d="M98 62 Q86 34 74 30 M102 62 Q114 34 126 30" stroke="#3a2e27" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="74" cy="30" r="4" fill="#3a2e27"/><circle cx="126" cy="30" r="4" fill="#3a2e27"/>`,
  },
  {
    id: 'nachtfalter', name: 'Vintage-Falter', cat: 'tiere', tags: 'falter motte vintage scrapbook schmetterling', w: 220, h: 180, colors: ['#b08a5a', '#5a4027'],
    draw: (c) => {
      const wing = (sx: number) => {
        const t = (x: number) => 110 + (x - 110) * sx;
        let lines = '';
        for (let i = 0; i < 9; i++) lines += `<path d="M${f(t(108))} ${84} Q${f(t(70 - i * 6))} ${30 + i * 4} ${f(t(14 + i * 4))} ${f(44 + i * 7)}" stroke="${c[1]}" stroke-width="1.3" fill="none" opacity="0.55"/>`;
        return `<path d="M${t(108)} 80 C${t(80)} 20 ${t(30)} 14 ${t(8)} 40 C${t(-2)} 70 ${t(40)} 104 ${t(106)} 96Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="2"/>${lines}<path d="M${t(30)} 52 Q${t(56)} 66 ${t(84)} 58 Q${t(70)} 78 ${t(40)} 76Z" fill="${c[1]}" opacity="0.55"/><circle cx="${t(62)}" cy="54" r="6" fill="${lighten(c[0]!, 0.35)}" stroke="${c[1]}" stroke-width="1.5"/><path d="M${t(106)} 98 C${t(70)} 104 ${t(40)} 130 ${t(56)} 160 C${t(76)} 176 ${t(100)} 140 ${t(108)} 104Z" fill="${darken(c[0]!, 0.08)}" stroke="${c[1]}" stroke-width="2"/><path d="M${t(100)} 110 Q${t(76)} 128 ${t(66)} 154 M${t(104)} 112 Q${t(90)} 136 ${t(86)} 158" stroke="${c[1]}" stroke-width="1.2" fill="none" opacity="0.6"/>`;
      };
      return `${wing(1)}${wing(-1)}<ellipse cx="110" cy="100" rx="7" ry="36" fill="${c[1]}"/><path d="M106 68 Q94 40 76 30 M114 68 Q126 40 144 30" stroke="${c[1]}" stroke-width="2.4" fill="none"/><path d="M84 36 l-6 -3 M90 44 l-7 -2 M136 36 l6 -3 M130 44 l7 -2" stroke="${c[1]}" stroke-width="1.5"/>`;
    },
  },
  {
    id: 'biene', name: 'Biene', cat: 'tiere', tags: 'biene sommer honig', w: 200, h: 170, colors: ['#f7c948'],
    draw: (c) => `<ellipse cx="80" cy="50" rx="30" ry="40" fill="#dff3f6" opacity="0.85" stroke="#9ccbd6" stroke-width="2" transform="rotate(-20 80 50)"/><ellipse cx="118" cy="48" rx="28" ry="38" fill="#dff3f6" opacity="0.85" stroke="#9ccbd6" stroke-width="2" transform="rotate(20 118 48)"/><defs><clipPath id="b"><ellipse cx="100" cy="110" rx="70" ry="48"/></clipPath></defs><ellipse cx="100" cy="110" rx="70" ry="48" fill="${c[0]}"/><g clip-path="url(#b)"><rect x="74" y="50" width="18" height="120" fill="#2b2b2b"/><rect x="110" y="50" width="18" height="120" fill="#2b2b2b"/><rect x="146" y="50" width="18" height="120" fill="#2b2b2b"/></g><path d="M170 110 L188 116 L170 122Z" fill="#2b2b2b"/><circle cx="50" cy="102" r="7" fill="#2b2b2b"/><circle cx="52" cy="99" r="2" fill="#fff"/><path d="M44 120 Q52 128 60 120" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M48 66 Q40 44 30 40 M58 64 Q58 42 50 34" stroke="#2b2b2b" stroke-width="3" fill="none"/>`,
  },
  {
    id: 'fuchs', name: 'Fuchs', cat: 'tiere', tags: 'fuchs wald herbst', w: 200, h: 180, colors: ['#e2725b', '#fff8f0'],
    draw: (c) => `<path d="M30 20 L70 60 L44 86Z" fill="${c[0]}"/><path d="M170 20 L130 60 L156 86Z" fill="${c[0]}"/><path d="M36 30 L60 56 L46 70Z" fill="#3a2e27"/><path d="M164 30 L140 56 L154 70Z" fill="#3a2e27"/><path d="M24 70 Q100 30 176 70 Q170 120 100 170 Q30 120 24 70Z" fill="${c[0]}"/><path d="M24 70 Q60 100 100 104 Q140 100 176 70 Q170 120 100 170 Q30 120 24 70Z" fill="${c[1]}"/><circle cx="72" cy="88" r="7" fill="#2b2b2b"/><circle cx="128" cy="88" r="7" fill="#2b2b2b"/><ellipse cx="100" cy="158" rx="11" ry="8" fill="#2b2b2b"/>`,
  },
  {
    id: 'eule', name: 'Eule', cat: 'tiere', tags: 'eule wald herbst nacht', w: 180, h: 210, colors: ['#a68a6d', '#f4ede4'],
    draw: (c) => {
      let sc = '';
      for (let y = 130; y < 190; y += 14) for (let x = 64; x < 120; x += 16) sc += `<path d="M${x} ${y} q8 9 16 0" stroke="${darken(c[0]!, 0.25)}" stroke-width="2.5" fill="none"/>`;
      return `<path d="M30 40 L50 70 L60 30Z" fill="${darken(c[0]!, 0.2)}"/><path d="M150 40 L130 70 L120 30Z" fill="${darken(c[0]!, 0.2)}"/><ellipse cx="90" cy="120" rx="70" ry="86" fill="${c[0]}"/><ellipse cx="90" cy="150" rx="40" ry="48" fill="${c[1]}"/>${sc}<path d="M20 110 C10 150 30 186 52 190 C44 160 44 130 40 110Z" fill="${darken(c[0]!, 0.18)}"/><path d="M160 110 C170 150 150 186 128 190 C136 160 136 130 140 110Z" fill="${darken(c[0]!, 0.18)}"/><circle cx="62" cy="78" r="26" fill="#fff"/><circle cx="118" cy="78" r="26" fill="#fff"/><circle cx="64" cy="80" r="12" fill="#2b2b2b"/><circle cx="116" cy="80" r="12" fill="#2b2b2b"/><circle cx="68" cy="76" r="4" fill="#fff"/><circle cx="120" cy="76" r="4" fill="#fff"/><path d="M82 100 L98 100 L90 116Z" fill="#f2a03d"/><path d="M70 204 l-6 6 M78 204 l0 8 M102 204 l0 8 M110 204 l6 6" stroke="#f2a03d" stroke-width="4" stroke-linecap="round"/>`;
    },
  },
];
