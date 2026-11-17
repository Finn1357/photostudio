/** Sticker: Weihnachten, Ostern, Herbst & Winter, Sprechblasen, Pfeile, Linien. Alle Motive original gestaltet. */
import { darken, lighten } from '../../lib/color';
import { f, heartD, leaf, starPts, wobble, type StickerDef } from './helpers';

const egg = (body: string, c0: string) =>
  `<defs><clipPath id="e"><path d="M100 14 C146 14 170 96 170 128 C170 170 140 194 100 194 C60 194 30 170 30 128 C30 96 54 14 100 14Z"/></clipPath></defs><path d="M100 14 C146 14 170 96 170 128 C170 170 140 194 100 194 C60 194 30 170 30 128 C30 96 54 14 100 14Z" fill="${c0}"/><g clip-path="url(#e)">${body}</g><ellipse cx="72" cy="70" rx="10" ry="22" fill="#fff" opacity="0.35" transform="rotate(20 72 70)"/>`;

const snowflakeG = (cx: number, cy: number, r: number, col: string, w: number, variant: number) => {
  let s = `<g stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none">`;
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    const ex = cx + Math.cos(a) * r,
      ey = cy + Math.sin(a) * r;
    s += `<line x1="${cx}" y1="${cy}" x2="${f(ex)}" y2="${f(ey)}"/>`;
    const branches = variant === 0 ? [0.45, 0.72] : [0.6];
    for (const t of branches) {
      const mx = cx + Math.cos(a) * r * t,
        my = cy + Math.sin(a) * r * t;
      const bl = r * (variant === 0 ? 0.28 : 0.4);
      for (const side of [-1, 1]) {
        const b = a + side * (variant === 0 ? 0.75 : 0.6);
        s += `<line x1="${f(mx)}" y1="${f(my)}" x2="${f(mx + Math.cos(b) * bl)}" y2="${f(my + Math.sin(b) * bl)}"/>`;
      }
    }
  }
  s += '</g>';
  if (variant === 1) s += `<polygon points="${starPts(cx, cy, r * 0.32, r * 0.16, 6)}" fill="${col}"/>`;
  else s += `<circle cx="${cx}" cy="${cy}" r="${f(r * 0.12)}" fill="${col}"/>`;
  return s;
};

const bubble = (inner: string, fill: string, stroke: string) => `<g fill="${fill}" stroke="${stroke}" stroke-width="5" stroke-linejoin="round">${inner}</g>`;

export const SET_B: StickerDef[] = [
  // ---------------- Weihnachten ----------------
  {
    id: 'tannenbaum', name: 'Tannenbaum', cat: 'weihnachten', tags: 'weihnachten baum tanne', w: 180, h: 220, colors: ['#2f7a4b', '#e2546f', '#f7c948'],
    draw: (c) => `<rect x="80" y="186" width="20" height="28" fill="#8a5a3a"/><path d="M90 30 L150 110 L124 110 L166 168 L132 168 L176 194 L4 194 L48 168 L14 168 L56 110 L30 110Z" fill="${c[0]}"/><path d="M50 126 Q90 140 136 118 M34 178 Q90 196 150 168" stroke="${lighten(c[0]!, 0.35)}" stroke-width="4" fill="none" stroke-dasharray="2 8" stroke-linecap="round"/><circle cx="70" cy="96" r="7" fill="${c[1]}"/><circle cx="112" cy="140" r="7" fill="${c[1]}"/><circle cx="60" cy="160" r="7" fill="${c[2]}"/><circle cx="124" cy="92" r="6" fill="${c[2]}"/><circle cx="96" cy="176" r="7" fill="${c[1]}"/><polygon points="${starPts(90, 26, 22, 9)}" fill="${c[2]}"/>`,
  },
  {
    id: 'christbaumkugel', name: 'Christbaumkugel', cat: 'weihnachten', tags: 'weihnachten kugel schmuck', w: 160, h: 200, colors: ['#c2185b', '#d4af37'],
    draw: (c) => `<path d="M80 4 C70 14 70 26 80 34 C90 26 90 14 80 4Z" fill="none" stroke="${c[1]}" stroke-width="3"/><rect x="64" y="30" width="32" height="20" rx="4" fill="${c[1]}"/><circle cx="80" cy="120" r="72" fill="${c[0]}"/><path d="M10 110 Q80 130 150 110 M14 140 Q80 160 146 140" stroke="${c[1]}" stroke-width="5" fill="none"/><path d="M30 124 l8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8 8 -8 8 8" stroke="${lighten(c[0]!, 0.4)}" stroke-width="3" fill="none"/><ellipse cx="52" cy="84" rx="14" ry="22" fill="#fff" opacity="0.35" transform="rotate(30 52 84)"/>`,
  },
  {
    id: 'zuckerstange', name: 'Zuckerstange', cat: 'weihnachten', tags: 'weihnachten süßigkeit', w: 140, h: 220, colors: ['#e2546f'],
    draw: (c) => `<defs><clipPath id="z"><path d="M50 210 L50 70 C50 20 120 20 120 70 L120 84 L96 84 L96 70 C96 50 74 50 74 70 L74 210Z"/></clipPath></defs><path d="M50 210 L50 70 C50 20 120 20 120 70 L120 84 L96 84 L96 70 C96 50 74 50 74 70 L74 210Z" fill="#fff" stroke="${darken(c[0]!, 0.1)}" stroke-width="3"/><g clip-path="url(#z)">${Array.from({ length: 14 }, (_, i) => `<rect x="20" y="${i * 18}" width="140" height="9" fill="${c[0]}" transform="rotate(-35 70 ${i * 18})"/>`).join('')}</g>`,
  },
  {
    id: 'lebkuchenmann', name: 'Lebkuchenmann', cat: 'weihnachten', tags: 'weihnachten lebkuchen plätzchen', w: 180, h: 210, colors: ['#c48a52', '#e2546f'],
    draw: (c) => `<path d="M90 8 C116 8 124 30 120 50 C140 50 170 56 170 72 C170 88 140 86 124 84 L130 130 L156 186 C162 202 140 206 132 192 L90 150 L48 192 C40 206 18 202 24 186 L50 130 L56 84 C40 86 10 88 10 72 C10 56 40 50 60 50 C56 30 64 8 90 8Z" fill="${c[0]}"/><path d="M90 16 C110 16 116 32 113 50 M20 66 Q40 72 58 64 M160 66 Q140 72 122 64 M38 188 Q46 178 54 186 M142 188 Q134 178 126 186" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="1 7"/><circle cx="80" cy="36" r="4.5" fill="#3a2e27"/><circle cx="100" cy="36" r="4.5" fill="#3a2e27"/><path d="M80 48 Q90 56 100 48" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="90" cy="84" r="6" fill="${c[1]}"/><circle cx="90" cy="106" r="6" fill="#5aa469"/><circle cx="90" cy="128" r="6" fill="${c[1]}"/>`,
  },
  {
    id: 'nikolausstiefel', name: 'Nikolausstiefel', cat: 'weihnachten', tags: 'weihnachten stiefel nikolaus', w: 170, h: 210, colors: ['#c62828', '#ffffff'],
    draw: (c) => `<path d="M40 40 L120 40 L120 130 C150 132 166 150 162 172 C158 196 130 202 100 196 L60 188 C36 184 30 166 40 150Z" fill="${c[0]}"/><path d="M56 86 l60 0 M60 110 l56 0" stroke="${darken(c[0]!, 0.2)}" stroke-width="4" stroke-dasharray="8 8"/><rect x="30" y="16" width="102" height="34" rx="16" fill="${c[1]}"/><ellipse cx="136" cy="176" rx="22" ry="18" fill="${c[1]}" opacity="0.9"/>`,
  },
  {
    id: 'stechpalme', name: 'Stechpalme', cat: 'weihnachten', tags: 'weihnachten ilex beeren', w: 200, h: 150, colors: ['#2f7a4b', '#c62828'],
    draw: (c) => {
      const holly = (rot: number, col: string) =>
        `<path transform="rotate(${rot} 100 80)" d="M100 80 C96 70 82 66 76 58 C70 62 62 58 60 50 C52 52 44 48 42 40 C34 40 26 36 24 28 C40 26 60 30 72 40 C84 48 96 62 100 80Z" fill="${col}"/>`;
      return `${holly(-10, c[0]!)}${holly(70, darken(c[0]!, 0.1))}${holly(160, c[0]!)}<circle cx="96" cy="84" r="13" fill="${c[1]}"/><circle cx="114" cy="92" r="12" fill="${darken(c[1]!, 0.1)}"/><circle cx="100" cy="104" r="12" fill="${c[1]}"/><circle cx="92" cy="80" r="4" fill="#fff" opacity="0.5"/>`;
    },
  },
  {
    id: 'weihnachtsmuetze', name: 'Weihnachtsmütze', cat: 'weihnachten', tags: 'weihnachten mütze nikolaus', w: 200, h: 180, colors: ['#c62828', '#ffffff'],
    draw: (c) => `<path d="M30 140 C40 60 90 20 140 30 C170 36 186 70 180 110 L166 112 C164 84 152 64 136 64 C110 64 96 100 90 140Z" fill="${c[0]}"/><path d="M50 120 C60 80 90 52 120 48" stroke="#fff" stroke-width="6" fill="none" opacity="0.2" stroke-linecap="round"/><rect x="16" y="128" width="168" height="40" rx="20" fill="${c[1]}"/><circle cx="174" cy="118" r="20" fill="${c[1]}"/>`,
  },
  {
    id: 'schneemann', name: 'Schneemann', cat: 'weihnachten', tags: 'schneemann winter schnee', w: 170, h: 220, colors: ['#ffffff', '#e2725b'],
    draw: (c) => `<circle cx="85" cy="160" r="56" fill="${c[0]}" stroke="#cfe0ea" stroke-width="3"/><circle cx="85" cy="76" r="40" fill="${c[0]}" stroke="#cfe0ea" stroke-width="3"/><rect x="50" y="14" width="70" height="12" rx="3" fill="#2b2b2b"/><rect x="60" y="-10" width="50" height="30" rx="4" fill="#2b2b2b"/><rect x="60" y="12" width="50" height="6" fill="${c[1]}"/><circle cx="72" cy="68" r="4.5" fill="#2b2b2b"/><circle cx="98" cy="68" r="4.5" fill="#2b2b2b"/><path d="M85 80 L114 88 L85 90Z" fill="#f2843d"/><path d="M70 96 Q85 104 100 96" stroke="#2b2b2b" stroke-width="3" fill="none" stroke-dasharray="1 6" stroke-linecap="round"/><path d="M50 108 Q85 124 120 108 L124 120 Q85 136 46 120Z" fill="${c[1]}"/><path d="M104 118 L112 158 L124 154 L114 116Z" fill="${darken(c[1]!, 0.1)}"/><circle cx="85" cy="140" r="5" fill="#2b2b2b"/><circle cx="85" cy="162" r="5" fill="#2b2b2b"/><path d="M34 140 L4 120 M140 140 L168 116" stroke="#8a5a3a" stroke-width="5" stroke-linecap="round"/>`,
  },

  // ---------------- Ostern ----------------
  {
    id: 'osterei-streifen', name: 'Osterei Streifen', cat: 'ostern', tags: 'ostern ei', w: 200, h: 200, colors: ['#f9b9c6', '#ffffff', '#a8dfe8'],
    draw: (c) => egg(`<path d="M20 86 Q60 70 100 86 T180 86" stroke="${c[1]}" stroke-width="12" fill="none"/><path d="M20 120 Q60 104 100 120 T180 120" stroke="${c[2]}" stroke-width="12" fill="none"/><path d="M20 154 Q60 138 100 154 T180 154" stroke="${c[1]}" stroke-width="12" fill="none"/>`, c[0]!),
  },
  {
    id: 'osterei-punkte', name: 'Osterei Punkte', cat: 'ostern', tags: 'ostern ei punkte', w: 200, h: 200, colors: ['#a8dfe8', '#ffffff'],
    draw: (c) => {
      let d = '';
      for (let y = 30; y < 200; y += 26) for (let x = 30 + ((y / 26) % 2) * 13; x < 180; x += 26) d += `<circle cx="${x}" cy="${y}" r="6" fill="${c[1]}"/>`;
      return egg(d, c[0]!);
    },
  },
  {
    id: 'osterei-zickzack', name: 'Osterei Zickzack', cat: 'ostern', tags: 'ostern ei', w: 200, h: 200, colors: ['#ffe08a', '#8fcf8f', '#f28aa5'],
    draw: (c) => egg(`<path d="M20 100 l14 -16 14 16 14 -16 14 16 14 -16 14 16 14 -16 14 16 14 -16 14 16 14 -16" stroke="${c[1]}" stroke-width="9" fill="none" stroke-linejoin="round"/><rect x="20" y="124" width="160" height="10" fill="${c[2]}"/><rect x="20" y="60" width="160" height="6" fill="${c[2]}"/>`, c[0]!),
  },
  {
    id: 'kueken', name: 'Küken', cat: 'ostern', tags: 'küken ostern frühling', w: 200, h: 190, colors: ['#ffe08a', '#f2a03d'],
    draw: (c) => `<ellipse cx="100" cy="120" rx="70" ry="62" fill="${c[0]}"/><path d="M40 120 C30 100 46 84 66 100" fill="${darken(c[0]!, 0.08)}"/><path d="M160 120 C170 100 154 84 134 100" fill="${darken(c[0]!, 0.08)}"/><path d="M92 58 C88 40 100 32 104 44 C108 30 120 38 112 56" fill="${c[0]}"/><circle cx="78" cy="104" r="7" fill="#2b2b2b"/><circle cx="122" cy="104" r="7" fill="#2b2b2b"/><circle cx="80" cy="101" r="2" fill="#fff"/><circle cx="124" cy="101" r="2" fill="#fff"/><path d="M90 118 L110 118 L100 132Z" fill="${c[1]}"/><ellipse cx="64" cy="126" rx="9" ry="6" fill="#f28aa5" opacity="0.5"/><ellipse cx="136" cy="126" rx="9" ry="6" fill="#f28aa5" opacity="0.5"/><path d="M80 178 l-6 8 M80 178 l6 8 M120 178 l-6 8 M120 178 l6 8" stroke="${c[1]}" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: 'hasenohren', name: 'Hasenohren', cat: 'ostern', tags: 'hase ohren ostern', w: 200, h: 200, colors: ['#f4ede4', '#f9b9c6'],
    draw: (c) => `<path d="M70 190 C40 120 40 30 66 14 C92 0 104 100 96 190Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.12)}" stroke-width="3"/><path d="M74 170 C58 120 56 50 68 34 C82 24 88 100 86 170Z" fill="${c[1]}"/><path d="M130 190 C160 120 166 40 140 22 C116 8 98 100 104 190Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.12)}" stroke-width="3"/><path d="M126 170 C142 120 148 56 138 40 C124 30 114 100 114 170Z" fill="${c[1]}"/><rect x="40" y="176" width="120" height="20" rx="10" fill="${darken(c[0]!, 0.1)}"/>`,
  },
  {
    id: 'karotte', name: 'Karotte', cat: 'ostern', tags: 'karotte möhre ostern gemüse', w: 150, h: 220, colors: ['#f2843d', '#5aa469'],
    draw: (c) => `${leaf(75, 60, 56, 10, -20, c[1]!)}${leaf(75, 60, 60, 10, 10, darken(c[1]!, 0.1))}${leaf(75, 60, 50, 9, 36, c[1]!)}<path d="M40 64 C40 50 110 50 110 64 C110 120 86 190 75 212 C64 190 40 120 40 64Z" fill="${c[0]}"/><path d="M52 90 l14 2 M86 110 l14 -2 M58 136 l12 2 M82 160 l10 -2" stroke="${darken(c[0]!, 0.2)}" stroke-width="3" stroke-linecap="round"/>`,
  },
  {
    id: 'osternest', name: 'Osternest', cat: 'ostern', tags: 'osternest korb eier', w: 220, h: 170, colors: ['#c49a6c', '#f9b9c6', '#a8dfe8', '#ffe08a'],
    draw: (c) => {
      const e = (x: number, y: number, rot: number, col: string) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="30" fill="${col}" transform="rotate(${rot} ${x} ${y})"/><path d="M${x - 20} ${y} q20 -8 40 0" stroke="#fff" stroke-width="4" fill="none" transform="rotate(${rot} ${x} ${y})"/>`;
      let weave = '';
      for (let i = 0; i < 9; i++) weave += `<path d="M${24 + i * 20} 92 q10 30 0 64" stroke="${darken(c[0]!, 0.2)}" stroke-width="3" fill="none"/>`;
      return `${e(70, 70, -20, c[1]!)}${e(112, 60, 5, c[2]!)}${e(152, 72, 22, c[3]!)}<path d="M14 90 Q110 70 206 90 L190 150 Q110 170 30 150Z" fill="${c[0]}"/>${weave}<path d="M14 90 Q110 70 206 90 Q110 110 14 90Z" fill="${darken(c[0]!, 0.15)}"/><path d="M30 86 q8 -8 16 0 M60 80 q8 -8 16 0 M150 80 q8 -8 16 0 M176 84 q8 -8 16 0" stroke="#8fcf8f" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    },
  },

  // ---------------- Herbst & Winter ----------------
  {
    id: 'ahornblatt', name: 'Ahornblatt', cat: 'herbst', tags: 'herbst blatt ahorn', w: 200, h: 210, colors: ['#d9480f'],
    draw: (c) => `<path d="M100 200 L100 150" stroke="${darken(c[0]!, 0.3)}" stroke-width="5" stroke-linecap="round"/><path d="M100 152 L96 124 L50 136 L58 116 L14 92 L32 82 L22 52 L54 58 L60 40 L84 64 L78 20 L92 28 L100 6 L108 28 L122 20 L116 64 L140 40 L146 58 L178 52 L168 82 L186 92 L142 116 L150 136 L104 124Z" fill="${c[0]}"/><path d="M100 150 L100 30 M100 110 L40 90 M100 110 L160 90 M100 90 L60 54 M100 90 L140 54" stroke="${darken(c[0]!, 0.25)}" stroke-width="2.5" fill="none"/>`,
  },
  {
    id: 'eichenblatt', name: 'Eichenblatt', cat: 'herbst', tags: 'herbst blatt eiche', w: 150, h: 220, colors: ['#b7791f'],
    draw: (c) => `<path d="M75 214 L75 180" stroke="${darken(c[0]!, 0.3)}" stroke-width="5" stroke-linecap="round"/><path d="M75 184 C60 184 50 176 54 166 C38 168 30 156 40 146 C22 146 18 130 32 122 C18 116 18 100 34 96 C22 86 26 70 42 70 C34 56 44 44 56 48 C54 32 64 18 75 10 C86 18 96 32 94 48 C106 44 116 56 108 70 C124 70 128 86 116 96 C132 100 132 116 118 122 C132 130 128 146 110 146 C120 156 112 168 96 166 C100 176 90 184 75 184Z" fill="${c[0]}"/><path d="M75 182 L75 24 M75 150 L46 136 M75 120 L40 108 M75 92 L48 74 M75 150 L104 136 M75 120 L110 108 M75 92 L102 74" stroke="${darken(c[0]!, 0.25)}" stroke-width="2.2" fill="none"/>`,
  },
  {
    id: 'eichel', name: 'Eichel', cat: 'herbst', tags: 'herbst eichel wald', w: 160, h: 200, colors: ['#c27c3c', '#6b4423'],
    draw: (c) => `<path d="M80 6 C84 16 82 24 78 30" stroke="${c[1]}" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M30 90 C30 140 60 190 80 194 C100 190 130 140 130 90Z" fill="${c[0]}"/><path d="M50 110 C52 140 64 168 76 180" stroke="#fff" stroke-width="6" fill="none" opacity="0.25" stroke-linecap="round"/><path d="M18 80 C18 40 142 40 142 80 C142 100 18 100 18 80Z" fill="${c[1]}"/><path d="M30 64 l100 0 M24 78 l112 0 M40 52 l80 0" stroke="${lighten(c[1]!, 0.25)}" stroke-width="2.5" stroke-dasharray="6 6"/>`,
  },
  {
    id: 'kuerbis', name: 'Kürbis', cat: 'herbst', tags: 'kürbis herbst halloween ernte', w: 210, h: 190, colors: ['#f2843d', '#5aa469'],
    draw: (c) => `<path d="M104 40 C102 26 110 12 120 8" stroke="${c[1]}" stroke-width="9" fill="none" stroke-linecap="round"/>${leaf(110, 40, 40, 12, 60, c[1]!)}<ellipse cx="60" cy="112" rx="46" ry="66" fill="${darken(c[0]!, 0.08)}"/><ellipse cx="150" cy="112" rx="46" ry="66" fill="${darken(c[0]!, 0.08)}"/><ellipse cx="80" cy="112" rx="42" ry="70" fill="${c[0]}"/><ellipse cx="130" cy="112" rx="42" ry="70" fill="${c[0]}"/><ellipse cx="105" cy="112" rx="34" ry="72" fill="${lighten(c[0]!, 0.08)}"/><path d="M105 42 L105 182" stroke="${darken(c[0]!, 0.15)}" stroke-width="2"/>`,
  },
  {
    id: 'pilz', name: 'Fliegenpilz', cat: 'herbst', tags: 'pilz wald herbst glück', w: 180, h: 200, colors: ['#d64545', '#f4ede4'],
    draw: (c) => `<path d="M64 110 C60 150 56 180 52 192 L128 192 C124 180 120 150 116 110Z" fill="${c[1]}" stroke="${darken(c[1]!, 0.12)}" stroke-width="3"/><path d="M60 140 Q90 150 120 140" stroke="${darken(c[1]!, 0.15)}" stroke-width="3" fill="none"/><path d="M10 112 C10 50 50 14 90 14 C130 14 170 50 170 112 Q90 128 10 112Z" fill="${c[0]}"/><circle cx="52" cy="70" r="11" fill="#fff"/><circle cx="96" cy="44" r="9" fill="#fff"/><circle cx="132" cy="76" r="12" fill="#fff"/><circle cx="90" cy="92" r="8" fill="#fff"/><circle cx="34" cy="100" r="6" fill="#fff"/><circle cx="150" cy="104" r="6" fill="#fff"/>`,
  },
  {
    id: 'schneeflocke', name: 'Schneeflocke', cat: 'herbst', tags: 'schnee winter flocke', w: 200, h: 200, colors: ['#7fb6d9'],
    draw: (c) => snowflakeG(100, 100, 88, c[0]!, 9, 0),
  },
  {
    id: 'eiskristall', name: 'Eiskristall', cat: 'herbst', tags: 'schnee winter kristall', w: 200, h: 200, colors: ['#a8dfe8'],
    draw: (c) => snowflakeG(100, 100, 86, c[0]!, 7, 1),
  },
  {
    id: 'faeustling', name: 'Fäustling', cat: 'herbst', tags: 'winter handschuh', w: 160, h: 210, colors: ['#c62828', '#ffffff'],
    draw: (c) => `<path d="M40 150 L36 70 C34 30 60 12 90 14 C120 16 134 40 132 74 L130 110 C146 100 158 110 154 126 C148 146 132 150 126 152 L126 160 L40 160Z" fill="${c[0]}"/><path d="M50 128 l70 0" stroke="${c[1]}" stroke-width="4" stroke-dasharray="6 6" opacity="0.8"/>${snowflakeG(84, 82, 24, c[1]!, 4, 0)}<rect x="30" y="152" width="106" height="40" rx="10" fill="${c[1]}"/><path d="M44 160 v24 M60 160 v24 M76 160 v24 M92 160 v24 M108 160 v24 M124 160 v24" stroke="${darken(c[1]!, 0.12)}" stroke-width="4"/>`,
  },
  {
    id: 'gespenst', name: 'Gespenst', cat: 'herbst', tags: 'halloween gespenst geist', w: 180, h: 210, colors: ['#ffffff'],
    draw: (c) => `<path d="M20 200 L20 90 C20 40 50 10 90 10 C130 10 160 40 160 90 L160 200 L136 184 L114 202 L90 184 L66 202 L44 184Z" fill="${c[0]}" stroke="#cfd6de" stroke-width="4" stroke-linejoin="round"/><ellipse cx="66" cy="88" rx="10" ry="14" fill="#2b2b2b"/><ellipse cx="114" cy="88" rx="10" ry="14" fill="#2b2b2b"/><ellipse cx="90" cy="124" rx="12" ry="16" fill="#2b2b2b"/><ellipse cx="50" cy="114" rx="9" ry="5" fill="#f9b9c6" opacity="0.6"/><ellipse cx="130" cy="114" rx="9" ry="5" fill="#f9b9c6" opacity="0.6"/>`,
  },
  {
    id: 'fledermaus', name: 'Fledermaus', cat: 'herbst', tags: 'halloween fledermaus nacht', w: 220, h: 130, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M110 40 C96 40 92 54 92 62 C70 30 34 20 6 34 C24 44 28 60 22 76 C40 66 56 72 60 90 C70 76 84 78 92 90 C96 98 104 104 110 104 C116 104 124 98 128 90 C136 78 150 76 160 90 C164 72 180 66 198 76 C192 60 196 44 214 34 C186 20 150 30 128 62 C128 54 124 40 110 40Z" fill="${c[0]}"/><path d="M98 44 L96 26 L106 40 M122 44 L124 26 L114 40" fill="${c[0]}" stroke="${c[0]}" stroke-width="3" stroke-linejoin="round"/><circle cx="103" cy="60" r="4" fill="#f7c948"/><circle cx="117" cy="60" r="4" fill="#f7c948"/>`,
  },

  // ---------------- Sprechblasen ----------------
  {
    id: 'blase-rund', name: 'Sprechblase rund', cat: 'sprechblasen', tags: 'sprechblase comic text', w: 220, h: 180, colors: ['#ffffff', '#2b2b2b'],
    draw: (c) => bubble(`<path d="M110 14 C166 14 206 44 206 82 C206 120 166 150 110 150 C98 150 86 148 76 146 L34 170 L46 132 C24 118 14 100 14 82 C14 44 54 14 110 14Z"/>`, c[0]!, c[1]!),
  },
  {
    id: 'blase-eckig', name: 'Sprechblase eckig', cat: 'sprechblasen', tags: 'sprechblase text', w: 220, h: 170, colors: ['#ffffff', '#2b2b2b'],
    draw: (c) => bubble(`<path d="M30 12 L190 12 Q208 12 208 30 L208 110 Q208 128 190 128 L150 128 L170 162 L114 128 L30 128 Q12 128 12 110 L12 30 Q12 12 30 12Z"/>`, c[0]!, c[1]!),
  },
  {
    id: 'gedankenblase', name: 'Gedankenblase', cat: 'sprechblasen', tags: 'gedanke wolke traum', w: 220, h: 190, colors: ['#ffffff', '#2b2b2b'],
    draw: (c) => bubble(`<path d="M60 36 C64 12 100 6 116 24 C132 6 168 12 172 38 C200 40 212 70 196 92 C210 112 192 140 166 134 C156 158 120 160 108 142 C92 160 56 156 52 132 C24 136 8 108 24 90 C8 72 26 40 60 36Z"/><circle cx="48" cy="158" r="12"/><circle cx="24" cy="180" r="7"/>`, c[0]!, c[1]!),
  },
  {
    id: 'ausruf-blase', name: 'Ausruf-Blase', cat: 'sprechblasen', tags: 'comic ausruf peng', w: 220, h: 200, colors: ['#ffe08a', '#2b2b2b'],
    draw: (c) => bubble(`<polygon points="${starPts(110, 100, 96, 66, 12, 8)}"/>`, c[0]!, c[1]!),
  },
  {
    id: 'herz-blase', name: 'Herzblase', cat: 'sprechblasen', tags: 'liebe sprechblase', w: 200, h: 200, colors: ['#f9b9c6', '#c2185b'],
    draw: (c) => `<path d="${heartD(100, 96, 176)}" fill="${c[0]}" stroke="${c[1]}" stroke-width="5"/><path d="M70 160 L50 196 L96 170Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="5" stroke-linejoin="round"/><path d="M72 158 L94 168" stroke="${c[0]}" stroke-width="7"/>`,
  },
  {
    id: 'blase-doodle', name: 'Gekritzelte Blase', cat: 'sprechblasen', tags: 'doodle sprechblase handgezeichnet', w: 220, h: 180, colors: ['#2b2b2b'],
    draw: (c) => `<path d="${wobble([[110, 16], [180, 26], [206, 70], [190, 120], [130, 146], [80, 144], [44, 168], [56, 132], [20, 106], [18, 56], [56, 22], [112, 16]], 4, 3)}" fill="none" stroke="${c[0]}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="${wobble([[106, 22], [176, 32], [198, 72], [184, 116], [128, 140], [78, 138]], 9, 3)}" fill="none" stroke="${c[0]}" stroke-width="2" opacity="0.5"/>`,
  },
  {
    id: 'wow-burst', name: 'WOW!', cat: 'sprechblasen', tags: 'wow comic text', w: 220, h: 200, colors: ['#f7c948', '#e2546f'],
    draw: (c) => `<polygon points="${starPts(110, 100, 98, 70, 14, 4)}" fill="${c[1]}"/><polygon points="${starPts(110, 100, 84, 62, 14, 10)}" fill="${c[0]}"/><text x="110" y="122" text-anchor="middle" font-family="'Arial Black', 'Helvetica Neue', Arial, sans-serif" font-weight="900" font-size="58" fill="${c[1]}" stroke="#fff" stroke-width="3" paint-order="stroke">WOW!</text>`,
  },

  // ---------------- Pfeile & Symbole ----------------
  {
    id: 'pfeil-schwung', name: 'Pfeil geschwungen', cat: 'pfeile', tags: 'pfeil doodle hinweis', w: 220, h: 160, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M14 120 C40 40 120 20 190 60" stroke="${c[0]}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M168 36 L194 62 L160 74" stroke="${c[0]}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'pfeil-schleife', name: 'Pfeil mit Schleife', cat: 'pfeile', tags: 'pfeil schleife doodle', w: 220, h: 180, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M12 150 C50 150 80 120 100 90 C120 60 100 30 80 50 C60 70 90 110 130 110 C170 110 190 80 200 52" stroke="${c[0]}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M180 60 L202 46 L208 72" stroke="${c[0]}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'pfeil-zickzack', name: 'Zickzack-Pfeil', cat: 'pfeile', tags: 'pfeil zickzack', w: 220, h: 120, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M10 60 L40 30 L70 90 L100 30 L130 90 L160 40 L196 60" stroke="${c[0]}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M176 36 L200 60 L172 76" stroke="${c[0]}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'pfeil-fett', name: 'Pfeil', cat: 'pfeile', tags: 'pfeil richtung', w: 220, h: 140, colors: ['#e2546f'],
    draw: (c) => `<path d="M10 52 L130 52 L130 14 L210 70 L130 126 L130 88 L10 88Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.15)}" stroke-width="4" stroke-linejoin="round"/>`,
  },
  {
    id: 'haken', name: 'Haken', cat: 'pfeile', tags: 'haken erledigt ok', w: 200, h: 180, colors: ['#5aa469'],
    draw: (c) => `<path d="M16 100 L72 156 L186 24" stroke="${c[0]}" stroke-width="24" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
  },
  {
    id: 'musiknote', name: 'Musiknoten', cat: 'pfeile', tags: 'musik noten lied', w: 200, h: 200, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M70 150 L70 40 L170 20 L170 130" stroke="${c[0]}" stroke-width="10" fill="none" stroke-linejoin="round"/><path d="M70 40 L170 20 L170 48 L70 68Z" fill="${c[0]}"/><ellipse cx="50" cy="152" rx="24" ry="18" fill="${c[0]}" transform="rotate(-20 50 152)"/><ellipse cx="150" cy="132" rx="24" ry="18" fill="${c[0]}" transform="rotate(-20 150 132)"/>`,
  },
  {
    id: 'ortsmarke', name: 'Ortsmarke', cat: 'pfeile', tags: 'ort reise karte pin urlaub', w: 160, h: 210, colors: ['#e2546f'],
    draw: (c) => `<ellipse cx="80" cy="198" rx="30" ry="8" fill="#000" opacity="0.15"/><path d="M80 196 C60 160 14 120 14 76 C14 38 44 10 80 10 C116 10 146 38 146 76 C146 120 100 160 80 196Z" fill="${c[0]}"/><circle cx="80" cy="76" r="26" fill="#fff"/><path d="M58 40 C66 30 80 28 90 30" stroke="#fff" stroke-width="5" fill="none" opacity="0.4" stroke-linecap="round"/>`,
  },
  {
    id: 'unendlich', name: 'Unendlich', cat: 'pfeile', tags: 'unendlich liebe für immer', w: 220, h: 120, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M110 60 C80 20 20 20 20 60 C20 100 80 100 110 60 C140 20 200 20 200 60 C200 100 140 100 110 60Z" stroke="${c[0]}" stroke-width="12" fill="none"/>`,
  },

  // ---------------- Dekorative Linien ----------------
  {
    id: 'trenner-schnoerkel', name: 'Schnörkel-Trenner', cat: 'linien', tags: 'trenner linie elegant hochzeit', w: 320, h: 70, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M10 35 L120 35 C132 35 136 20 148 20 C160 20 160 35 150 38 C142 40 140 30 148 28 M310 35 L200 35 C188 35 184 50 172 50 C160 50 160 35 170 32 C178 30 180 40 172 42" stroke="${c[0]}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M160 22 L170 35 L160 48 L150 35Z" fill="${c[0]}"/>`,
  },
  {
    id: 'herzlinie', name: 'Herzlinie', cat: 'linien', tags: 'herz linie liebe trenner', w: 320, h: 60, colors: ['#e2546f'],
    draw: (c) => `<path d="M10 32 L126 32 M194 32 L310 32" stroke="${c[0]}" stroke-width="3" stroke-linecap="round"/><path d="${heartD(160, 32, 44)}" fill="${c[0]}"/><path d="${heartD(136, 32, 18)}" fill="${c[0]}"/><path d="${heartD(184, 32, 18)}" fill="${c[0]}"/>`,
  },
  {
    id: 'wellenlinie', name: 'Wellenlinie', cat: 'linien', tags: 'welle linie meer', w: 320, h: 50, colors: ['#3a9fbf'],
    draw: (c) => `<path d="M10 25 Q30 5 50 25 T90 25 T130 25 T170 25 T210 25 T250 25 T290 25 T310 20" stroke="${c[0]}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  },
  {
    id: 'bogenkante', name: 'Bogenkante', cat: 'linien', tags: 'bogen spitze rand', w: 320, h: 50, colors: ['#f28aa5'],
    draw: (c) => {
      let d = 'M10 14';
      for (let x = 10; x < 310; x += 20) d += ` A10 10 0 0 0 ${x + 20} 14`;
      return `<path d="${d} L310 6 L10 6Z" fill="${c[0]}"/>${Array.from({ length: 15 }, (_, i) => `<circle cx="${20 + i * 20}" cy="16" r="2.5" fill="#fff"/>`).join('')}`;
    },
  },
  {
    id: 'lorbeer-trenner', name: 'Lorbeer-Trenner', cat: 'linien', tags: 'lorbeer zweig trenner natur', w: 320, h: 70, colors: ['#9caf88'],
    draw: (c) => {
      let s = `<path d="M20 35 L300 35" stroke="${darken(c[0]!, 0.25)}" stroke-width="2.5"/>`;
      for (let i = 0; i < 13; i++) {
        const x = 30 + i * 21;
        s += leaf(x, 35, 22, 6, 50, i % 2 ? c[0]! : darken(c[0]!, 0.1)) + leaf(x + 10, 35, 22, 6, 130, i % 2 ? darken(c[0]!, 0.1) : c[0]!);
      }
      return s;
    },
  },
  {
    id: 'sternenlinie', name: 'Sternenlinie', cat: 'linien', tags: 'sterne linie glitzer', w: 320, h: 60, colors: ['#f7c948'],
    draw: (c) => Array.from({ length: 9 }, (_, i) => `<polygon points="${starPts(20 + i * 35, 30, i % 2 ? 9 : 14, i % 2 ? 4 : 6)}" fill="${c[0]}"/>`).join('') + `<path d="M20 30 L300 30" stroke="${c[0]}" stroke-width="1.5" stroke-dasharray="2 6" opacity="0.7"/>`,
  },
  {
    id: 'naht', name: 'Nahtlinie', cat: 'linien', tags: 'naht stich handgemacht', w: 320, h: 30, colors: ['#a68a6d'],
    draw: (c) => `<path d="M10 15 L310 15" stroke="${c[0]}" stroke-width="4" stroke-dasharray="14 9" stroke-linecap="round"/>`,
  },
];
