/** Sticker: Washi-Tape, Papier, Scrapbook, Stempel, Kronen, Ornamente, Niedliches. Alle Motive original gestaltet. */
import { darken, lighten } from '../../lib/color';
import { rng } from '../../lib/util';
import { f, heartD, leaf, petals, sparkleD, starPts, tornPts, washiStrip, wobble, type StickerDef } from './helpers';

const fibers = (w: number, h: number, col: string, n: number, seed: number) => {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * w,
      y = r() * h,
      a = r() * Math.PI;
    s += `<path d="M${f(x)} ${f(y)} l${f(Math.cos(a) * 10)} ${f(Math.sin(a) * 10)}" stroke="${col}" stroke-width="0.8" opacity="0.35"/>`;
  }
  return s;
};

const grunge = (w: number, h: number, seed: number, n = 60) => {
  const r = rng(seed);
  let s = `<rect width="${w}" height="${h}" fill="white"/>`;
  for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(0.8 + r() * 3.2)}" fill="black"/>`;
  return s;
};

const SERIF = `Georgia, 'Times New Roman', serif`;
const MONO = `'Courier New', Courier, monospace`;

const WORDS = 'sommer meer erinnerung licht reise freunde abend sonne garten brief wind zeit liebe himmel blumen glück welle sand stille herz'.split(' ');

export const SET_C: StickerDef[] = [
  // ---------------- Washi-Tape ----------------
  {
    id: 'washi-punkte', name: 'Washi Punkte', cat: 'washi', tags: 'washi tape klebeband punkte', w: 400, h: 90, colors: ['#f9b9c6', '#ffffff'],
    draw: (c) => washiStrip(c[0]!, Array.from({ length: 40 }, (_, i) => `<circle cx="${12 + (i % 20) * 20}" cy="${i < 20 ? 28 : 62}" r="5" fill="${c[1]}"/>`).join(''), 1),
  },
  {
    id: 'washi-streifen', name: 'Washi Streifen', cat: 'washi', tags: 'washi tape streifen', w: 400, h: 90, colors: ['#a8dfe8', '#ffffff'],
    draw: (c) => washiStrip(c[0]!, Array.from({ length: 30 }, (_, i) => `<rect x="${i * 20 - 40}" y="-10" width="9" height="120" fill="${c[1]}" transform="rotate(30 ${i * 20 - 40} 45)"/>`).join(''), 2),
  },
  {
    id: 'washi-karo', name: 'Washi Karo', cat: 'washi', tags: 'washi tape karo vichy', w: 400, h: 90, colors: ['#ffffff', '#f28aa5'],
    draw: (c) => washiStrip(c[0]!, Array.from({ length: 20 }, (_, i) => `<rect x="${i * 20}" y="0" width="10" height="90" fill="${c[1]}" opacity="0.45"/>`).join('') + Array.from({ length: 5 }, (_, i) => `<rect x="0" y="${i * 20}" width="400" height="10" fill="${c[1]}" opacity="0.45"/>`).join(''), 3),
  },
  {
    id: 'washi-blumen', name: 'Washi Blumen', cat: 'washi', tags: 'washi tape blumen', w: 400, h: 90, colors: ['#fff3c4', '#f28aa5', '#8fcf8f'],
    draw: (c) => washiStrip(c[0]!, Array.from({ length: 9 }, (_, i) => petals(26 + i * 45, i % 2 ? 30 : 60, 5, 7, 6, 7, c[1]!) + `<circle cx="${26 + i * 45}" cy="${i % 2 ? 30 : 60}" r="4" fill="#fff"/>` + leaf(46 + i * 45, i % 2 ? 62 : 28, 14, 4, i % 2 ? 40 : -40, c[2]!)).join(''), 4),
  },
  {
    id: 'washi-herzen', name: 'Washi Herzen', cat: 'washi', tags: 'washi tape herzen liebe', w: 400, h: 90, colors: ['#fde2e4', '#e2546f'],
    draw: (c) => washiStrip(c[0]!, Array.from({ length: 12 }, (_, i) => `<path d="${heartD(18 + i * 34, i % 2 ? 30 : 60, 22)}" fill="${c[1]}"/>`).join(''), 5),
  },
  {
    id: 'washi-gitter', name: 'Washi Gitter', cat: 'washi', tags: 'washi tape gitter karo', w: 400, h: 90, colors: ['#e3f4dc', '#5aa469'],
    draw: (c) => washiStrip(c[0]!, `<path d="${Array.from({ length: 41 }, (_, i) => `M${i * 10} 0 V90`).join(' ')} ${Array.from({ length: 10 }, (_, i) => `M0 ${i * 10} H400`).join(' ')}" stroke="${c[1]}" stroke-width="1" opacity="0.6"/>`, 6),
  },
  {
    id: 'washi-sterne', name: 'Washi Sterne', cat: 'washi', tags: 'washi tape sterne nacht', w: 400, h: 90, colors: ['#1f3a63', '#f7c948'],
    draw: (c) => washiStrip(c[0]!, Array.from({ length: 14 }, (_, i) => `<polygon points="${starPts(16 + i * 29, i % 2 ? 28 : 62, i % 3 ? 8 : 11, i % 3 ? 3.5 : 5)}" fill="${c[1]}"/>`).join(''), 7),
  },
  {
    id: 'washi-kraft', name: 'Washi Pfirsich', cat: 'washi', tags: 'washi tape kraft schlicht vintage', w: 400, h: 90, colors: ['#f2b48a'],
    draw: (c) => washiStrip(c[0]!, fibers(400, 90, darken(c[0]!, 0.4), 60, 8) + `<rect width="400" height="90" fill="${lighten(c[0]!, 0.3)}" opacity="0.25"/>`, 8),
  },
  {
    id: 'washi-zickzack', name: 'Washi Zickzack', cat: 'washi', tags: 'washi tape zickzack', w: 400, h: 90, colors: ['#c9bdf2', '#ffffff'],
    draw: (c) => washiStrip(c[0]!, [24, 56].map((y) => `<path d="M0 ${y} ${Array.from({ length: 21 }, (_, i) => `L${i * 20 + 10} ${y + (i % 2 ? -10 : 10)}`).join(' ')}" stroke="${c[1]}" stroke-width="5" fill="none"/>`).join(''), 9),
  },

  // ---------------- Papierstücke ----------------
  {
    id: 'papier-weiss', name: 'Papierfetzen weiß', cat: 'papier', tags: 'papier riss weiß scrapbook', w: 300, h: 200, colors: ['#fbf8f2'],
    draw: (c) => `<polygon points="${tornPts(10, 12, 280, 176, 9, 11, 6)}" fill="${c[0]}"/>${fibers(300, 200, '#9a8a6a', 50, 2)}`,
  },
  {
    id: 'papier-kraft', name: 'Kraftpapier-Stück', cat: 'papier', tags: 'kraftpapier braun riss vintage', w: 300, h: 200, colors: ['#c49a6c'],
    draw: (c) => `<polygon points="${tornPts(10, 12, 280, 176, 10, 12, 6)}" fill="${c[0]}"/><defs><clipPath id="k"><polygon points="${tornPts(10, 12, 280, 176, 10, 12, 6)}"/></clipPath></defs><g clip-path="url(#k)">${fibers(300, 200, '#3a2a1a', 140, 3)}${fibers(300, 200, '#ffffff', 60, 4)}</g>`,
  },
  {
    id: 'zeitungsschnipsel', name: 'Zeitungsschnipsel', cat: 'papier', tags: 'zeitung text vintage scrapbook', w: 320, h: 180, colors: ['#efe6d2', '#3a2e27'],
    draw: (c) => {
      const r = rng(5);
      let lines = '';
      for (let y = 34; y < 176; y += 17) {
        let t = '';
        while (t.length < 46) t += WORDS[Math.floor(r() * WORDS.length)] + ' ';
        lines += `<text x="18" y="${y}" font-family="${SERIF}" font-size="14" fill="${c[1]}" opacity="0.8">${t}</text>`;
      }
      const poly = tornPts(8, 8, 304, 164, 8, 21, 6);
      return `<defs><clipPath id="z"><polygon points="${poly}"/></clipPath></defs><polygon points="${poly}" fill="${c[0]}"/><g clip-path="url(#z)">${lines}</g>`;
    },
  },
  {
    id: 'notizzettel', name: 'Notizblatt', cat: 'papier', tags: 'notiz papier liniert block', w: 240, h: 280, colors: ['#fffdf6', '#a9c4e0', '#e2546f'],
    draw: (c) => {
      const poly = tornPts(10, 24, 220, 246, 6, 31, 6, [true, false, false, false]);
      let lines = '';
      for (let y = 70; y < 262; y += 22) lines += `<line x1="10" y1="${y}" x2="230" y2="${y}" stroke="${c[1]}" stroke-width="1.5"/>`;
      return `<polygon points="${poly}" fill="${c[0]}"/>${lines}<line x1="44" y1="24" x2="44" y2="270" stroke="${c[2]}" stroke-width="1.5" opacity="0.7"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${30 + i * 26}" cy="40" r="5" fill="#d8d2c4"/>`).join('')}`;
    },
  },
  {
    id: 'karopapier', name: 'Karopapier', cat: 'papier', tags: 'karo papier schule', w: 260, h: 220, colors: ['#ffffff', '#b9c7d6'],
    draw: (c) => {
      const poly = tornPts(10, 10, 240, 200, 7, 41, 6);
      let g = '';
      for (let x = 0; x < 260; x += 14) g += `M${x} 0 V220 `;
      for (let y = 0; y < 220; y += 14) g += `M0 ${y} H260 `;
      return `<defs><clipPath id="g"><polygon points="${poly}"/></clipPath></defs><polygon points="${poly}" fill="${c[0]}"/><path d="${g}" stroke="${c[1]}" stroke-width="1" clip-path="url(#g)"/>`;
    },
  },
  {
    id: 'haftnotiz', name: 'Haftnotiz', cat: 'papier', tags: 'notiz zettel gelb', w: 220, h: 220, colors: ['#ffe08a'],
    draw: (c) => `<defs><linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0.6" stop-color="${c[0]}"/><stop offset="1" stop-color="${darken(c[0]!, 0.1)}"/></linearGradient></defs><path d="M14 14 L206 14 L206 176 Q190 200 160 206 L14 206Z" fill="url(#s)"/><path d="M206 176 Q186 182 160 206 Q176 186 180 172Z" fill="${darken(c[0]!, 0.2)}"/><rect x="14" y="14" width="192" height="20" fill="${darken(c[0]!, 0.06)}"/>`,
  },
  {
    id: 'luftpost', name: 'Luftpost-Streifen', cat: 'papier', tags: 'luftpost brief rand vintage reise', w: 420, h: 60, colors: ['#c62828', '#1f4e8c', '#fbf6ec'],
    draw: (c) => {
      let s = `<defs><clipPath id="l"><rect x="0" y="6" width="420" height="48"/></clipPath></defs><rect x="0" y="6" width="420" height="48" fill="${c[2]}"/><g clip-path="url(#l)">`;
      for (let i = 0; i < 22; i++) s += `<polygon points="${i * 24 - 20},54 ${i * 24 - 6},54 ${i * 24 + 14},6 ${i * 24},6" fill="${i % 2 ? c[1] : c[0]}"/>`;
      return s + `</g><rect x="0" y="20" width="420" height="20" fill="${c[2]}"/>`;
    },
  },
  {
    id: 'spiralrand', name: 'Spiralbindung', cat: 'papier', tags: 'spirale block notizbuch', w: 420, h: 70, colors: ['#9aa5b1', '#ffffff'],
    draw: (c) => `<rect x="0" y="30" width="420" height="40" fill="${c[1]}"/>${Array.from({ length: 16 }, (_, i) => `<circle cx="${18 + i * 26}" cy="50" r="5" fill="#d6d0c4"/><path d="M${12 + i * 26} 50 C${12 + i * 26} 20 ${24 + i * 26} 4 ${26 + i * 26} 30" stroke="${c[0]}" stroke-width="4" fill="none" stroke-linecap="round"/>`).join('')}`,
  },

  // ---------------- Scrapbook ----------------
  {
    id: 'bueroklammer', name: 'Büroklammer', cat: 'scrapbook', tags: 'klammer büro scrapbook', w: 90, h: 220, colors: ['#9aa5b1'],
    draw: (c) => `<path d="M30 70 L30 170 C30 196 70 196 70 170 L70 40 C70 10 18 10 18 40 L18 180 C18 214 82 214 82 180 L82 60" stroke="${c[0]}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M30 70 L30 170 C30 196 70 196 70 170" stroke="#fff" stroke-width="1.5" fill="none" opacity="0.6"/>`,
  },
  {
    id: 'reisszwecke', name: 'Pinnnadel', cat: 'scrapbook', tags: 'pin nadel pinnwand', w: 120, h: 160, colors: ['#e2546f'],
    draw: (c) => `<path d="M60 100 L64 156 L56 156Z" fill="#8a8f96"/><defs><radialGradient id="p" cx="0.35" cy="0.35" r="0.7"><stop offset="0" stop-color="${lighten(c[0]!, 0.4)}"/><stop offset="1" stop-color="${darken(c[0]!, 0.2)}"/></radialGradient></defs><ellipse cx="60" cy="104" rx="34" ry="12" fill="${darken(c[0]!, 0.2)}"/><rect x="44" y="50" width="32" height="52" fill="${c[0]}"/><circle cx="60" cy="46" r="40" fill="url(#p)"/><ellipse cx="46" cy="32" rx="10" ry="6" fill="#fff" opacity="0.5" transform="rotate(-30 46 32)"/>`,
  },
  {
    id: 'fotoecke', name: 'Fotoecke', cat: 'scrapbook', tags: 'fotoecke album vintage', w: 140, h: 140, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M10 10 L130 10 L10 130Z" fill="${c[0]}"/><path d="M20 20 L104 20 L20 104" stroke="${lighten(c[0]!, 0.3)}" stroke-width="2" fill="none"/>`,
  },
  {
    id: 'anhaenger', name: 'Anhänger', cat: 'scrapbook', tags: 'anhänger etikett label tag', w: 300, h: 160, colors: ['#e8d4b8', '#8a6a4a'],
    draw: (c) => `<path d="M40 20 L250 20 L290 80 L250 140 L40 140 Q20 140 20 120 L20 40 Q20 20 40 20Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.15)}" stroke-width="2"/><path d="M44 34 L242 34 L272 80 L242 126 L44 126 Q34 126 34 116 L34 44 Q34 34 44 34Z" fill="none" stroke="${c[1]}" stroke-width="3" stroke-dasharray="10 7"/><circle cx="252" cy="80" r="10" fill="#fff" stroke="${darken(c[0]!, 0.2)}" stroke-width="3"/><path d="M252 80 C280 60 300 110 270 120 C248 128 250 150 236 158" stroke="${c[1]}" stroke-width="3.5" fill="none"/>`,
  },
  {
    id: 'eintrittskarte', name: 'Eintrittskarte', cat: 'scrapbook', tags: 'ticket karte kino konzert reise', w: 320, h: 150, colors: ['#f2c879', '#8e3b22'],
    draw: (c) => `<defs><mask id="t"><rect width="320" height="150" fill="white"/><circle cx="10" cy="75" r="16" fill="black"/><circle cx="310" cy="75" r="16" fill="black"/></mask></defs><rect x="10" y="14" width="300" height="122" rx="8" fill="${c[0]}" mask="url(#t)"/><rect x="26" y="28" width="268" height="94" rx="4" fill="none" stroke="${c[1]}" stroke-width="2"/><line x1="230" y1="20" x2="230" y2="130" stroke="${c[1]}" stroke-width="2" stroke-dasharray="4 5"/><text x="128" y="78" text-anchor="middle" font-family="${SERIF}" font-weight="bold" font-size="34" fill="${c[1]}" letter-spacing="3">EINTRITT</text><text x="128" y="106" text-anchor="middle" font-family="${MONO}" font-size="16" fill="${c[1]}">EIN UNVERGESSLICHER TAG</text><text x="262" y="82" text-anchor="middle" font-family="${MONO}" font-size="18" fill="${c[1]}" transform="rotate(-90 262 76)">Nr. 0427</text>`,
  },
  {
    id: 'filmstreifen', name: 'Filmstreifen', cat: 'scrapbook', tags: 'film kino retro analog', w: 420, h: 130, colors: ['#262626', '#d9d4cc'],
    draw: (c) => `<rect x="0" y="0" width="420" height="130" fill="${c[0]}"/>${Array.from({ length: 21 }, (_, i) => `<rect x="${6 + i * 20}" y="8" width="10" height="12" rx="2" fill="#fff" opacity="0.9"/><rect x="${6 + i * 20}" y="110" width="10" height="12" rx="2" fill="#fff" opacity="0.9"/>`).join('')}${[0, 1, 2].map((i) => `<rect x="${16 + i * 134}" y="28" width="120" height="74" rx="2" fill="${c[1]}"/>`).join('')}`,
  },
  {
    id: 'knopf', name: 'Knopf', cat: 'scrapbook', tags: 'knopf nähen handgemacht', w: 160, h: 160, colors: ['#f28aa5'],
    draw: (c) => `<circle cx="80" cy="80" r="70" fill="${c[0]}"/><circle cx="80" cy="80" r="56" fill="none" stroke="${darken(c[0]!, 0.15)}" stroke-width="5"/><circle cx="62" cy="62" r="9" fill="${darken(c[0]!, 0.3)}"/><circle cx="98" cy="62" r="9" fill="${darken(c[0]!, 0.3)}"/><circle cx="62" cy="98" r="9" fill="${darken(c[0]!, 0.3)}"/><circle cx="98" cy="98" r="9" fill="${darken(c[0]!, 0.3)}"/><path d="M62 62 L98 98 M98 62 L62 98" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  },
  {
    id: 'klammer', name: 'Foldback-Klammer', cat: 'scrapbook', tags: 'klammer büro scrapbook', w: 160, h: 170, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M40 90 L30 10 L52 10 L60 90 M120 90 L130 10 L108 10 L100 90" stroke="#b7bcc2" stroke-width="7" fill="none" stroke-linejoin="round"/><path d="M14 90 L146 90 L132 160 L28 160Z" fill="${c[0]}"/><path d="M24 100 L136 100" stroke="${lighten(c[0]!, 0.3)}" stroke-width="3"/>`,
  },

  // ---------------- Stempel ----------------
  {
    id: 'briefmarke', name: 'Briefmarke', cat: 'stempel', tags: 'briefmarke post reise vintage', w: 170, h: 210, colors: ['#fbf6ec', '#e2725b', '#5aa469'],
    draw: (c) => {
      let holes = '';
      for (let x = 10; x <= 160; x += 15) holes += `<circle cx="${x}" cy="5" r="6" fill="black"/><circle cx="${x}" cy="205" r="6" fill="black"/>`;
      for (let y = 20; y <= 190; y += 15) holes += `<circle cx="5" cy="${y}" r="6" fill="black"/><circle cx="165" cy="${y}" r="6" fill="black"/>`;
      return `<defs><mask id="p"><rect width="170" height="210" fill="white"/>${holes}</mask></defs><rect x="0" y="0" width="170" height="210" fill="${c[0]}" mask="url(#p)"/><rect x="18" y="18" width="134" height="174" fill="${lighten(c[1]!, 0.6)}"/><circle cx="110" cy="64" r="20" fill="#ffe08a"/><path d="M18 150 L58 92 L84 124 L112 86 L152 140 L152 192 L18 192Z" fill="${c[2]}"/><path d="M18 170 Q60 150 100 166 T152 160 L152 192 L18 192Z" fill="${darken(c[2]!, 0.2)}"/><text x="32" y="44" font-family="${SERIF}" font-weight="bold" font-size="24" fill="${c[1]}">80</text>`;
    },
  },
  {
    id: 'poststempel', name: 'Poststempel', cat: 'stempel', tags: 'stempel post brief reise', w: 300, h: 160, colors: ['#3a4a6b'],
    draw: (c) => `<defs><mask id="g">${grunge(300, 160, 3, 80)}</mask><path id="cp" d="M80 80 m-52 0 a52 52 0 1 1 104 0 a52 52 0 1 1 -104 0"/></defs><g mask="url(#g)" opacity="0.85"><circle cx="80" cy="80" r="70" fill="none" stroke="${c[0]}" stroke-width="5"/><circle cx="80" cy="80" r="40" fill="none" stroke="${c[0]}" stroke-width="3"/><text font-family="${MONO}" font-size="17" font-weight="bold" fill="${c[0]}" letter-spacing="2"><textPath href="#cp">LUFTPOST ★ GRÜSSE ★ LUFTPOST ★</textPath></text><text x="80" y="88" text-anchor="middle" font-family="${MONO}" font-size="20" font-weight="bold" fill="${c[0]}">2026</text>${[50, 70, 90, 110].map((y) => `<path d="M150 ${y} q18 -12 36 0 t36 0 t36 0 t36 0" stroke="${c[0]}" stroke-width="4" fill="none"/>`).join('')}</g>`,
  },
  {
    id: 'stempel-love', name: 'Stempel LOVE', cat: 'stempel', tags: 'stempel liebe love', w: 260, h: 130, colors: ['#c2185b'],
    draw: (c) => `<defs><mask id="g">${grunge(260, 130, 5, 70)}</mask></defs><g mask="url(#g)" transform="rotate(-6 130 65)"><rect x="14" y="14" width="232" height="102" rx="10" fill="none" stroke="${c[0]}" stroke-width="7"/><rect x="26" y="26" width="208" height="78" rx="5" fill="none" stroke="${c[0]}" stroke-width="2.5"/><text x="130" y="90" text-anchor="middle" font-family="${SERIF}" font-weight="bold" font-size="62" fill="${c[0]}" letter-spacing="6">LOVE</text></g>`,
  },
  {
    id: 'stempel-erinnerungen', name: 'Stempel Erinnerungen', cat: 'stempel', tags: 'stempel erinnerungen rund', w: 200, h: 200, colors: ['#8e3b22'],
    draw: (c) => `<defs><mask id="g">${grunge(200, 200, 7, 70)}</mask><path id="cp" d="M100 100 m-66 0 a66 66 0 1 1 132 0 a66 66 0 1 1 -132 0"/></defs><g mask="url(#g)"><circle cx="100" cy="100" r="92" fill="none" stroke="${c[0]}" stroke-width="6"/><circle cx="100" cy="100" r="50" fill="none" stroke="${c[0]}" stroke-width="3"/><text font-family="${SERIF}" font-size="21" font-weight="bold" fill="${c[0]}" letter-spacing="3"><textPath href="#cp">ERINNERUNGEN · ERINNERUNGEN ·</textPath></text><polygon points="${starPts(100, 102, 30, 13)}" fill="${c[0]}"/></g>`,
  },
  {
    id: 'stempel-handgemacht', name: 'Stempel Mit Liebe', cat: 'stempel', tags: 'stempel handgemacht liebe', w: 280, h: 140, colors: ['#2f7a4b'],
    draw: (c) => `<defs><mask id="g">${grunge(280, 140, 9, 70)}</mask></defs><g mask="url(#g)"><rect x="12" y="12" width="256" height="116" fill="none" stroke="${c[0]}" stroke-width="5" stroke-dasharray="18 6"/><text x="140" y="62" text-anchor="middle" font-family="${MONO}" font-weight="bold" font-size="26" fill="${c[0]}" letter-spacing="2">MIT LIEBE</text><text x="140" y="100" text-anchor="middle" font-family="${MONO}" font-weight="bold" font-size="26" fill="${c[0]}" letter-spacing="2">GEMACHT</text><path d="${heartD(36, 80, 26)}" fill="${c[0]}"/><path d="${heartD(244, 80, 26)}" fill="${c[0]}"/></g>`,
  },
  {
    id: 'siegel', name: 'Wachssiegel', cat: 'stempel', tags: 'siegel wachs brief hochzeit', w: 200, h: 200, colors: ['#a4161a'],
    draw: (c) => {
      const r = rng(15);
      const pts: [number, number][] = [];
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        const rad = 82 + r() * 14;
        pts.push([100 + Math.cos(a) * rad, 100 + Math.sin(a) * rad]);
      }
      return `<polygon points="${pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ')}" fill="${c[0]}" stroke="${darken(c[0]!, 0.15)}" stroke-width="6" stroke-linejoin="round"/><circle cx="100" cy="100" r="62" fill="${darken(c[0]!, 0.1)}"/><circle cx="100" cy="100" r="62" fill="none" stroke="${lighten(c[0]!, 0.2)}" stroke-width="3"/><path d="${heartD(100, 104, 70)}" fill="${lighten(c[0]!, 0.12)}" stroke="${darken(c[0]!, 0.3)}" stroke-width="3"/><ellipse cx="64" cy="58" rx="14" ry="7" fill="#fff" opacity="0.25" transform="rotate(-40 64 58)"/>`;
    },
  },
  {
    id: 'stempel-tag', name: 'Stempel Bester Tag', cat: 'stempel', tags: 'stempel bester tag datum', w: 260, h: 160, colors: ['#1f6f99'],
    draw: (c) => `<defs><mask id="g">${grunge(260, 160, 11, 70)}</mask></defs><g mask="url(#g)" transform="rotate(4 130 80)"><ellipse cx="130" cy="80" rx="118" ry="66" fill="none" stroke="${c[0]}" stroke-width="6"/><ellipse cx="130" cy="80" rx="104" ry="54" fill="none" stroke="${c[0]}" stroke-width="2"/><text x="130" y="76" text-anchor="middle" font-family="${MONO}" font-weight="bold" font-size="30" fill="${c[0]}" letter-spacing="2">BESTER TAG</text><line x1="60" y1="94" x2="200" y2="94" stroke="${c[0]}" stroke-width="2"/><text x="130" y="118" text-anchor="middle" font-family="${MONO}" font-size="16" fill="${c[0]}">★ ★ ★</text></g>`,
  },

  // ---------------- Kronen ----------------
  {
    id: 'krone-gold', name: 'Goldkrone', cat: 'kronen', tags: 'krone gold königin könig', w: 220, h: 170, colors: ['#d4af37', '#e2546f'],
    draw: (c) => `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${lighten(c[0]!, 0.35)}"/><stop offset="1" stop-color="${darken(c[0]!, 0.2)}"/></linearGradient></defs><path d="M20 140 L10 40 L64 90 L110 20 L156 90 L210 40 L200 140Z" fill="url(#g)" stroke="${darken(c[0]!, 0.3)}" stroke-width="3" stroke-linejoin="round"/><rect x="20" y="132" width="180" height="26" rx="5" fill="${darken(c[0]!, 0.1)}"/><circle cx="10" cy="38" r="9" fill="${c[0]}"/><circle cx="110" cy="18" r="10" fill="${c[0]}"/><circle cx="210" cy="38" r="9" fill="${c[0]}"/><circle cx="110" cy="100" r="12" fill="${c[1]}"/><circle cx="60" cy="112" r="8" fill="#6cc3d5"/><circle cx="160" cy="112" r="8" fill="#6cc3d5"/><circle cx="60" cy="145" r="5" fill="#fff" opacity="0.7"/><circle cx="110" cy="145" r="5" fill="#fff" opacity="0.7"/><circle cx="160" cy="145" r="5" fill="#fff" opacity="0.7"/>`,
  },
  {
    id: 'krone-doodle', name: 'Kronen-Skizze', cat: 'kronen', tags: 'krone doodle gezeichnet', w: 220, h: 150, colors: ['#2b2b2b'],
    draw: (c) => `<path d="${wobble([[24, 130], [14, 36], [66, 86], [110, 18], [154, 86], [206, 36], [196, 130], [24, 130]], 7, 2.5)}" stroke="${c[0]}" stroke-width="5" fill="none" stroke-linejoin="round" stroke-linecap="round"/><path d="M28 112 L192 112" stroke="${c[0]}" stroke-width="3" stroke-linecap="round"/><circle cx="14" cy="30" r="6" fill="none" stroke="${c[0]}" stroke-width="3.5"/><circle cx="110" cy="12" r="6" fill="none" stroke="${c[0]}" stroke-width="3.5"/><circle cx="206" cy="30" r="6" fill="none" stroke="${c[0]}" stroke-width="3.5"/>`,
  },
  {
    id: 'diadem', name: 'Diadem', cat: 'kronen', tags: 'diadem tiara prinzessin hochzeit', w: 240, h: 130, colors: ['#c0c0c0', '#f28aa5'],
    draw: (c) => `<path d="M14 120 Q120 70 226 120" stroke="${c[0]}" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M40 106 Q60 40 90 80 Q120 0 150 80 Q180 40 200 106" stroke="${c[0]}" stroke-width="5" fill="none" stroke-linejoin="round"/><path d="M70 92 Q90 64 104 84 M136 84 Q150 64 170 92" stroke="${c[0]}" stroke-width="3" fill="none"/><path d="M120 22 L132 42 L120 62 L108 42Z" fill="${c[1]}" stroke="${darken(c[1]!, 0.2)}" stroke-width="2"/><circle cx="90" cy="76" r="7" fill="${c[1]}"/><circle cx="150" cy="76" r="7" fill="${c[1]}"/>${[40, 60, 80, 100, 140, 160, 180, 200].map((x, i) => `<circle cx="${x}" cy="${f(120 - 50 * (1 - Math.pow((x - 120) / 106, 2)) * 0.95)}" r="${i % 2 ? 4 : 5}" fill="#fff" stroke="${c[0]}" stroke-width="1.5"/>`).join('')}`,
  },
  {
    id: 'krone-prinzessin', name: 'Prinzessinnenkrone', cat: 'kronen', tags: 'krone prinzessin geburtstag mädchen', w: 220, h: 160, colors: ['#f9b9c6', '#f7c948'],
    draw: (c) => `<path d="M24 140 L18 60 L66 96 L110 40 L154 96 L202 60 L196 140Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.2)}" stroke-width="3" stroke-linejoin="round"/><rect x="24" y="128" width="172" height="22" rx="10" fill="${c[1]}"/><path d="${heartD(18, 48, 26)}" fill="${c[1]}"/><path d="${heartD(110, 26, 32)}" fill="${c[1]}"/><path d="${heartD(202, 48, 26)}" fill="${c[1]}"/><circle cx="110" cy="104" r="10" fill="#fff"/><path d="${sparkleD(70, 116, 9)}" fill="#fff"/><path d="${sparkleD(150, 116, 9)}" fill="#fff"/>`,
  },
  {
    id: 'koenigskrone', name: 'Königskrone', cat: 'kronen', tags: 'krone könig luxus vatertag', w: 210, h: 200, colors: ['#d4af37', '#c62828', '#1f6f99'],
    draw: (c) => `<path d="M30 160 L22 70 Q60 100 104 50 Q150 100 188 70 L180 160Z" fill="${c[1]}"/><path d="M30 160 L22 70 L48 110 L60 60 L80 104 L104 40 L128 104 L148 60 L160 110 L188 70 L180 160Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.3)}" stroke-width="3" stroke-linejoin="round"/><path d="M104 40 L104 10 M92 22 L116 22" stroke="${c[0]}" stroke-width="8" stroke-linecap="round"/><rect x="24" y="150" width="162" height="34" rx="6" fill="${darken(c[0]!, 0.1)}"/><circle cx="60" cy="167" r="9" fill="${c[2]}"/><circle cx="104" cy="167" r="10" fill="${c[1]}"/><circle cx="148" cy="167" r="9" fill="${c[2]}"/><circle cx="104" cy="118" r="11" fill="${c[2]}"/>`,
  },
  {
    id: 'blumenkranz-krone', name: 'Blumenkranz', cat: 'kronen', tags: 'blumenkranz boho hochzeit sommer', w: 260, h: 120, colors: ['#f4a6b8', '#9caf88', '#fff3c4'],
    draw: (c) => {
      let s = `<path d="M10 80 Q130 30 250 80" stroke="${darken(c[1]!, 0.3)}" stroke-width="3" fill="none"/>`;
      for (let i = 0; i < 9; i++) {
        const t = i / 8;
        const x = 20 + t * 220,
          y = 80 - Math.sin(t * Math.PI) * 36;
        s += leaf(x, y, 26, 8, -60 + i * 15, c[1]!) + leaf(x + 6, y + 4, 22, 7, 120 + i * 8, darken(c[1]!, 0.1));
      }
      for (let i = 0; i < 6; i++) {
        const t = (i + 0.5) / 6;
        const x = 20 + t * 220,
          y = 80 - Math.sin(t * Math.PI) * 36;
        const col = i % 2 ? c[0]! : c[2]!;
        s += petals(x, y, 6, 10, 8, 10, col) + `<circle cx="${f(x)}" cy="${f(y)}" r="5" fill="${darken(col, 0.3)}"/>`;
      }
      return s;
    },
  },

  // ---------------- Rahmenornamente ----------------
  {
    id: 'ecke-schnoerkel', name: 'Schnörkelecke', cat: 'ornamente', tags: 'ecke ornament elegant rahmen', w: 200, h: 200, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M10 190 L10 40 C10 20 20 10 40 10 L190 10" stroke="${c[0]}" stroke-width="4" fill="none"/><path d="M24 160 L24 54 C24 34 34 24 54 24 L160 24" stroke="${c[0]}" stroke-width="1.8" fill="none"/><path d="M40 40 C70 40 80 60 70 74 C62 84 48 76 54 66 C58 60 66 64 64 68 M40 40 C40 70 60 80 74 70 C84 62 76 48 66 54 C60 58 64 66 68 64" stroke="${c[0]}" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="40" cy="40" r="6" fill="${c[0]}"/><path d="M100 10 q10 10 20 0 M10 100 q10 10 0 20" stroke="${c[0]}" stroke-width="2.5" fill="none"/>`,
  },
  {
    id: 'ecke-floral', name: 'Blumenecke', cat: 'ornamente', tags: 'ecke blumen floral hochzeit', w: 220, h: 220, colors: ['#f4a6b8', '#9caf88', '#fff3c4'],
    draw: (c) => {
      let s = `<path d="M20 200 Q20 20 200 20" stroke="${darken(c[1]!, 0.3)}" stroke-width="3" fill="none"/>`;
      const pts: [number, number, number][] = [
        [24, 170, -20],
        [32, 120, -30],
        [48, 80, -45],
        [80, 48, -60],
        [120, 30, -75],
        [170, 22, -85],
      ];
      for (const [x, y, a] of pts) s += leaf(x, y, 30, 9, a + 70, c[1]!) + leaf(x, y, 26, 8, a - 100, darken(c[1]!, 0.1));
      s += petals(46, 46, 6, 15, 12, 15, c[0]!) + `<circle cx="46" cy="46" r="9" fill="${c[2]}"/>`;
      s += petals(100, 34, 5, 9, 8, 9, c[2]!) + `<circle cx="100" cy="34" r="5" fill="${darken(c[0]!, 0.2)}"/>`;
      s += petals(30, 104, 5, 9, 8, 9, c[2]!) + `<circle cx="30" cy="104" r="5" fill="${darken(c[0]!, 0.2)}"/>`;
      return s;
    },
  },
  {
    id: 'ecke-artdeco', name: 'Art-déco-Ecke', cat: 'ornamente', tags: 'ecke art deco gold luxus', w: 200, h: 200, colors: ['#d4af37'],
    draw: (c) => `<g stroke="${c[0]}" fill="none" stroke-width="3"><path d="M10 190 L10 10 L190 10"/><path d="M22 160 L22 22 L160 22"/><path d="M34 130 L34 34 L130 34"/><path d="M34 34 L70 70"/><path d="M46 34 L46 46 L34 46"/><path d="M58 34 L58 58 L34 58"/></g><path d="M70 70 L80 60 L90 70 L80 80Z" fill="${c[0]}"/><circle cx="10" cy="190" r="5" fill="${c[0]}"/><circle cx="190" cy="10" r="5" fill="${c[0]}"/>`,
  },
  {
    id: 'kranz-floral', name: 'Blütenkranz', cat: 'ornamente', tags: 'kranz rahmen blumen hochzeit', w: 220, h: 220, colors: ['#f4a6b8', '#9caf88', '#fff3c4'],
    draw: (c) => {
      let s = `<circle cx="110" cy="110" r="84" fill="none" stroke="${darken(c[1]!, 0.3)}" stroke-width="2.5"/>`;
      for (let i = 0; i < 18; i++) {
        const a = (i / 18) * Math.PI * 2;
        const x = 110 + Math.cos(a) * 84,
          y = 110 + Math.sin(a) * 84;
        const deg = (a * 180) / Math.PI;
        s += leaf(x, y, 24, 7, deg + 30, i % 2 ? c[1]! : darken(c[1]!, 0.12)) + leaf(x, y, 22, 7, deg + 150, i % 2 ? darken(c[1]!, 0.12) : c[1]!);
      }
      for (const a of [200, 235, 270, 30, 60]) {
        const r = (a * Math.PI) / 180;
        const x = 110 + Math.cos(r) * 84,
          y = 110 + Math.sin(r) * 84;
        const col = a % 2 ? c[2]! : c[0]!;
        s += petals(x, y, 6, 11, 9, 11, col) + `<circle cx="${f(x)}" cy="${f(y)}" r="6" fill="${darken(c[0]!, 0.25)}"/>`;
      }
      return s;
    },
  },
  {
    id: 'lorbeerkranz', name: 'Lorbeerkranz', cat: 'ornamente', tags: 'lorbeer kranz jubiläum gold', w: 220, h: 220, colors: ['#d4af37'],
    draw: (c) => {
      let s = `<path d="M96.1 188.8 A80 80 0 0 1 64.1 44.5" stroke="${c[0]}" stroke-width="3" fill="none"/><path d="M123.9 188.8 A80 80 0 0 0 155.9 44.5" stroke="${c[0]}" stroke-width="3" fill="none"/>`;
      for (const side of [-1, 1]) {
        for (let i = 0; i < 9; i++) {
          const t = i / 8;
          const angDeg = side === -1 ? 102 + t * 130 : 78 - t * 130;
          const a = (angDeg * Math.PI) / 180;
          const x = 110 + Math.cos(a) * 80,
            y = 110 + Math.sin(a) * 80;
          const travel = side === -1 ? angDeg + 90 : angDeg - 90;
          const len = 30 - t * 8;
          s += leaf(x, y, len, 8, travel + 90 - 32, c[0]!, darken(c[0]!, 0.25)) + leaf(x, y, len * 0.9, 7, travel + 90 + 32, lighten(c[0]!, 0.15));
        }
      }
      return s;
    },
  },
  {
    id: 'rahmen-oval', name: 'Ovaler Zierrahmen', cat: 'ornamente', tags: 'rahmen oval vintage elegant', w: 200, h: 240, colors: ['#b88a44'],
    draw: (c) => `<ellipse cx="100" cy="120" rx="86" ry="108" fill="none" stroke="${c[0]}" stroke-width="10"/><ellipse cx="100" cy="120" rx="74" ry="96" fill="none" stroke="${lighten(c[0]!, 0.3)}" stroke-width="3"/>${Array.from({ length: 28 }, (_, i) => {
      const a = (i / 28) * Math.PI * 2;
      return `<circle cx="${f(100 + Math.cos(a) * 92)}" cy="${f(120 + Math.sin(a) * 114)}" r="3.5" fill="${darken(c[0]!, 0.2)}"/>`;
    }).join('')}<path d="M80 10 Q100 -6 120 10 Q100 26 80 10Z M80 230 Q100 214 120 230 Q100 246 80 230Z" fill="${c[0]}"/>`,
  },
  {
    id: 'kringel', name: 'Kringel-Doodle', cat: 'ornamente', tags: 'kringel doodle schleife deko', w: 240, h: 120, colors: ['#2b2b2b'],
    draw: (c) => `<path d="M10 80 C40 80 50 30 80 40 C110 50 70 100 50 80 C30 60 90 20 120 60 C140 86 110 110 100 90 C90 70 150 40 170 60 C190 80 170 100 160 90 C150 80 190 50 230 60" stroke="${c[0]}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
  },

  // ---------------- Niedliche Illustrationen ----------------
  {
    id: 'sonne', name: 'Sonne', cat: 'niedlich', tags: 'sonne sommer lachen', w: 200, h: 200, colors: ['#f7c948', '#f2843d'],
    draw: (c) => `${Array.from({ length: 12 }, (_, i) => `<path transform="rotate(${i * 30} 100 100)" d="M100 6 L110 30 L90 30Z" fill="${i % 2 ? c[1] : c[0]}"/>`).join('')}<circle cx="100" cy="100" r="58" fill="${c[0]}"/><circle cx="80" cy="92" r="6" fill="#3a2e27"/><circle cx="120" cy="92" r="6" fill="#3a2e27"/><path d="M80 114 Q100 132 120 114" stroke="#3a2e27" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="68" cy="112" rx="9" ry="6" fill="#f28aa5" opacity="0.6"/><ellipse cx="132" cy="112" rx="9" ry="6" fill="#f28aa5" opacity="0.6"/>`,
  },
  {
    id: 'wolke', name: 'Wölkchen', cat: 'niedlich', tags: 'wolke himmel süß baby', w: 220, h: 150, colors: ['#ffffff', '#a8dfe8'],
    draw: (c) => `<path d="M50 130 C20 130 10 96 34 84 C30 52 70 40 86 60 C96 26 150 24 160 62 C192 56 210 90 192 110 C204 130 180 134 170 130Z" fill="${c[0]}" stroke="${c[1]}" stroke-width="5" stroke-linejoin="round"/><circle cx="90" cy="96" r="5" fill="#3a2e27"/><circle cx="130" cy="96" r="5" fill="#3a2e27"/><path d="M100 106 Q110 116 120 106" stroke="#3a2e27" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="78" cy="110" rx="8" ry="5" fill="#f9b9c6"/><ellipse cx="142" cy="110" rx="8" ry="5" fill="#f9b9c6"/>`,
  },
  {
    id: 'regenbogen', name: 'Regenbogen', cat: 'niedlich', tags: 'regenbogen bunt baby kinder', w: 240, h: 150, colors: ['#f28aa5', '#ffc59e', '#ffe08a', '#a8dfe8'],
    draw: (c) => `${[0, 1, 2, 3].map((i) => `<path d="M${30 + i * 16} 130 A${90 - i * 16} ${90 - i * 16} 0 0 1 ${210 - i * 16} 130" stroke="${c[i]}" stroke-width="16" fill="none"/>`).join('')}<path d="M8 140 C0 120 20 108 34 116 C40 100 64 104 64 120 C78 120 80 140 66 142Z" fill="#fff" stroke="#e5edf2" stroke-width="3"/><path d="M174 142 C160 140 162 120 176 120 C176 104 200 100 206 116 C220 108 240 120 232 140Z" fill="#fff" stroke="#e5edf2" stroke-width="3"/>`,
  },
  {
    id: 'mond', name: 'Schlafmond', cat: 'niedlich', tags: 'mond nacht schlafen baby', w: 200, h: 200, colors: ['#ffe08a', '#c9bdf2'],
    draw: (c) => `<path d="M128 20 C70 26 40 80 52 128 C64 176 120 194 166 168 C112 168 80 128 84 86 C88 52 104 30 128 20Z" fill="${c[0]}"/><path d="M88 108 Q96 116 104 108 M100 140 Q110 148 120 140" stroke="#3a2e27" stroke-width="3.5" fill="none" stroke-linecap="round"/><ellipse cx="86" cy="128" rx="8" ry="5" fill="#f9b9c6"/><path d="${sparkleD(160, 54, 16)}" fill="${c[1]}"/><path d="${sparkleD(178, 108, 10)}" fill="${c[1]}"/><path d="${sparkleD(40, 40, 10)}" fill="${c[1]}"/>`,
  },
  {
    id: 'kaffeetasse', name: 'Kaffeetasse', cat: 'niedlich', tags: 'kaffee tasse café gemütlich', w: 200, h: 200, colors: ['#f4ede4', '#c49a6c'],
    draw: (c) => `<path d="M70 60 C60 44 80 36 72 20 M100 60 C90 44 110 36 102 20 M130 60 C120 44 140 36 132 20" stroke="#bfb3a3" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="100" cy="180" rx="84" ry="14" fill="${darken(c[0]!, 0.08)}"/><path d="M150 96 C190 96 190 146 146 146" stroke="${c[0]}" stroke-width="14" fill="none"/><path d="M36 76 L164 76 L154 160 Q100 178 46 160Z" fill="${c[0]}" stroke="${darken(c[0]!, 0.12)}" stroke-width="3"/><ellipse cx="100" cy="78" rx="64" ry="10" fill="${c[1]}"/><path d="${heartD(100, 78, 26)}" fill="${lighten(c[1]!, 0.5)}" transform="scale(1 0.45) translate(0 96)"/><path d="${heartD(100, 120, 34)}" fill="#e2546f"/>`,
  },
  {
    id: 'kamera', name: 'Kamera', cat: 'niedlich', tags: 'kamera foto reise erinnerung', w: 220, h: 170, colors: ['#2b2b2b', '#f28aa5'],
    draw: (c) => `<rect x="40" y="26" width="50" height="22" rx="5" fill="${c[0]}"/><rect x="12" y="42" width="196" height="118" rx="16" fill="${c[1]}"/><rect x="12" y="74" width="196" height="54" fill="${darken(c[1]!, 0.12)}"/><circle cx="110" cy="100" r="44" fill="${c[0]}"/><circle cx="110" cy="100" r="32" fill="#4a5a6a"/><circle cx="110" cy="100" r="18" fill="#1a1a1a"/><circle cx="100" cy="90" r="6" fill="#fff" opacity="0.6"/><rect x="164" y="54" width="30" height="16" rx="4" fill="#fff" opacity="0.85"/><circle cx="34" cy="60" r="6" fill="#ffe08a"/>`,
  },
  {
    id: 'eis', name: 'Eistüte', cat: 'niedlich', tags: 'eis sommer süß', w: 150, h: 220, colors: ['#f9b9c6', '#e0a95a', '#a8dfe8'],
    draw: (c) => `<path d="M30 110 L120 110 L75 214Z" fill="${c[1]}"/><path d="M42 124 L100 182 M60 112 L112 164 M90 112 L50 160 M114 116 L66 196" stroke="${darken(c[1]!, 0.2)}" stroke-width="3"/><circle cx="52" cy="96" r="34" fill="${c[2]}"/><circle cx="98" cy="96" r="34" fill="${c[0]}"/><circle cx="75" cy="58" r="38" fill="${lighten(c[0]!, 0.3)}"/><circle cx="75" cy="20" r="10" fill="#d64545"/><rect x="60" y="48" width="8" height="3" rx="1.5" fill="#f7c948" transform="rotate(30 64 49)"/><rect x="84" y="62" width="8" height="3" rx="1.5" fill="#6cc3d5" transform="rotate(-20 88 63)"/><rect x="70" y="72" width="8" height="3" rx="1.5" fill="#8fcf8f"/>`,
  },
  {
    id: 'kaktus', name: 'Kaktus', cat: 'niedlich', tags: 'kaktus pflanze sommer', w: 160, h: 220, colors: ['#5aa469', '#e2725b'],
    draw: (c) => `<path d="M60 150 L60 50 C60 20 100 20 100 50 L100 150Z" fill="${c[0]}"/><path d="M60 110 L40 110 C26 110 22 100 22 90 L22 70 C22 58 38 58 38 70 L38 94 L60 94Z" fill="${c[0]}"/><path d="M100 96 L122 96 L122 66 C122 54 138 54 138 66 L138 96 C138 108 130 112 120 112 L100 112Z" fill="${c[0]}"/><path d="M80 40 L80 140" stroke="${darken(c[0]!, 0.15)}" stroke-width="3"/><circle cx="72" cy="80" r="3.5" fill="#3a2e27"/><circle cx="90" cy="80" r="3.5" fill="#3a2e27"/><path d="M76 90 Q81 96 86 90" stroke="#3a2e27" stroke-width="2.5" fill="none"/>${petals(80, 26, 5, 7, 6, 8, '#f28aa5')}<path d="M34 150 L126 150 L116 210 L44 210Z" fill="${c[1]}"/><rect x="28" y="142" width="104" height="20" rx="4" fill="${darken(c[1]!, 0.1)}"/>`,
  },
  {
    id: 'erdbeere', name: 'Erdbeere', cat: 'niedlich', tags: 'erdbeere obst sommer essen', w: 180, h: 200, colors: ['#e2546f', '#5aa469'],
    draw: (c) => {
      let seeds = '';
      const r = rng(2);
      for (let i = 0; i < 22; i++) {
        const x = 40 + r() * 100,
          y = 70 + r() * 90;
        if (Math.abs(x - 90) < 52 - (y - 70) * 0.4) seeds += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="2.5" ry="4" fill="#ffe08a"/>`;
      }
      return `<path d="M90 190 C40 160 20 110 30 76 C40 50 140 50 150 76 C160 110 140 160 90 190Z" fill="${c[0]}"/>${seeds}${leaf(90, 62, 34, 12, -70, c[1]!)}${leaf(90, 62, 34, 12, 70, c[1]!)}${leaf(90, 62, 30, 11, -20, darken(c[1]!, 0.1))}${leaf(90, 62, 30, 11, 20, darken(c[1]!, 0.1))}<path d="M90 50 L92 20" stroke="${c[1]}" stroke-width="6" stroke-linecap="round"/><ellipse cx="58" cy="96" rx="8" ry="14" fill="#fff" opacity="0.3" transform="rotate(20 58 96)"/>`;
    },
  },
  {
    id: 'flugzeug', name: 'Flugzeug', cat: 'niedlich', tags: 'flugzeug reise urlaub fliegen', w: 240, h: 150, colors: ['#6cc3d5', '#ffffff'],
    draw: (c) => `<path d="M8 120 Q40 140 70 120" stroke="#cfd6de" stroke-width="4" fill="none" stroke-dasharray="6 8" stroke-linecap="round"/><path d="M110 70 L60 20 L80 18 L150 64Z" fill="${darken(c[0]!, 0.15)}"/><path d="M40 70 L200 54 C226 52 232 76 208 84 L60 96 C40 98 30 80 40 70Z" fill="${c[1]}" stroke="${c[0]}" stroke-width="4"/><path d="M110 88 L74 134 L94 136 L150 84Z" fill="${c[0]}"/><path d="M52 72 L34 40 L50 40 L74 70Z" fill="${c[0]}"/>${[100, 122, 144, 166].map((x) => `<circle cx="${x}" cy="${f(70 - (x - 100) * 0.06)}" r="5" fill="${c[0]}"/>`).join('')}`,
  },
  {
    id: 'koffer', name: 'Reisekoffer', cat: 'niedlich', tags: 'koffer reise urlaub', w: 200, h: 200, colors: ['#e2725b', '#6b4423'],
    draw: (c) => `<path d="M76 46 L76 26 Q76 16 86 16 L114 16 Q124 16 124 26 L124 46" stroke="${c[1]}" stroke-width="9" fill="none"/><rect x="20" y="46" width="160" height="128" rx="16" fill="${c[0]}"/><rect x="54" y="46" width="14" height="128" fill="${c[1]}"/><rect x="132" y="46" width="14" height="128" fill="${c[1]}"/><circle cx="40" cy="186" r="9" fill="#3a2e27"/><circle cx="160" cy="186" r="9" fill="#3a2e27"/><circle cx="100" cy="96" r="18" fill="#ffe08a" transform="rotate(-10 100 96)"/><rect x="86" y="128" width="40" height="24" rx="4" fill="#a8dfe8" transform="rotate(8 106 140)"/><path d="${heartD(156, 140, 22)}" fill="#fff"/>`,
  },
  {
    id: 'palme', name: 'Palme', cat: 'niedlich', tags: 'palme urlaub strand sommer', w: 200, h: 220, colors: ['#5aa469', '#a68a6d'],
    draw: (c) => `<ellipse cx="100" cy="206" rx="80" ry="12" fill="#f2d9a6"/><path d="M96 206 C92 160 104 110 96 64 L108 64 C118 110 108 160 112 206Z" fill="${c[1]}"/><path d="M98 90 l12 -2 M98 120 l13 -2 M99 150 l13 -2 M100 180 l12 -2" stroke="${darken(c[1]!, 0.2)}" stroke-width="3"/><path d="M102 64 C70 30 30 40 14 70 C40 56 70 56 102 70Z" fill="${c[0]}"/><path d="M102 64 C134 30 174 40 190 70 C164 56 134 56 102 70Z" fill="${darken(c[0]!, 0.1)}"/><path d="M102 64 C90 30 60 10 40 14 C64 26 84 44 98 70Z" fill="${darken(c[0]!, 0.15)}"/><path d="M102 64 C114 30 144 10 164 14 C140 26 120 44 106 70Z" fill="${c[0]}"/><circle cx="96" cy="72" r="8" fill="#7a5a3a"/><circle cx="110" cy="74" r="8" fill="#6b4423"/>`,
  },
];
