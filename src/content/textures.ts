/**
 * Prozedural erzeugte Texturen (Papier, Kraftpapier, Aquarell, Marmor, Glitzer …).
 * Vollständig eigene Generierung – keine fremden Bildressourcen.
 */
import { hexToRgb, mix, rgba } from '../lib/color';
import { rng } from '../lib/util';

export interface TextureDef {
  id: string;
  name: string;
  /** 'tile' = kachelbar, 'cover' = flächig einpassen */
  mode: 'tile' | 'cover';
  /** Standardfarbe (färbbar, falls gesetzt) */
  tint?: string;
  tags: string;
  /** Anzeigegröße der Kachel relativ zu 1000 Einheiten */
  display: number;
}

export const TEXTURES: TextureDef[] = [
  { id: 'paper', name: 'Papier', mode: 'tile', tint: '#f8f4ec', tags: 'papier weiß struktur', display: 700 },
  { id: 'kraft', name: 'Kraftpapier', mode: 'tile', tint: '#c49a6c', tags: 'kraftpapier braun vintage scrapbook', display: 700 },
  { id: 'vintage', name: 'Vintage-Papier', mode: 'cover', tint: '#efe0c2', tags: 'vintage alt papier retro', display: 1000 },
  { id: 'watercolor', name: 'Aquarell', mode: 'cover', tint: '#f4a6b8', tags: 'aquarell malen pastell hochzeit', display: 1000 },
  { id: 'marble', name: 'Marmor', mode: 'tile', tint: '#f4f2ef', tags: 'marmor luxus elegant stein', display: 1000 },
  { id: 'glitter', name: 'Glitzer', mode: 'tile', tint: '#d4af37', tags: 'glitzer gold party silvester', display: 500 },
  { id: 'linen', name: 'Leinen', mode: 'tile', tint: '#ece4d6', tags: 'leinen stoff boho natur', display: 500 },
  { id: 'newspaper', name: 'Zeitungspapier', mode: 'tile', tint: '#efe6d2', tags: 'zeitung vintage scrapbook text', display: 900 },
  { id: 'clouds', name: 'Pastell-Wolken', mode: 'tile', tint: '#c9bdf2', tags: 'wolken pastell himmel baby traum', display: 1000 },
  { id: 'bokeh', name: 'Lichter', mode: 'cover', tint: '#f7c948', tags: 'bokeh lichter party weihnachten nacht', display: 1000 },
  { id: 'wood', name: 'Holz', mode: 'tile', tint: '#b07a4f', tags: 'holz natur rustikal', display: 900 },
  { id: 'concrete', name: 'Beton', mode: 'tile', tint: '#b9b5ae', tags: 'beton modern grau stein', display: 800 },
  { id: 'starry', name: 'Sternenhimmel', mode: 'tile', tint: '#14213d', tags: 'sterne nacht himmel baby silvester', display: 800 },
  { id: 'snowfall', name: 'Schneefall', mode: 'tile', tint: '#7fa7c9', tags: 'schnee winter weihnachten', display: 800 },
  { id: 'cork', name: 'Kork', mode: 'tile', tint: '#c08a57', tags: 'kork pinnwand polaroid', display: 600 },
  { id: 'sunset', name: 'Abendrot', mode: 'cover', tint: '#ff9a7a', tags: 'sonnenuntergang sommer verlauf aquarell', display: 1000 },
];

const byId = new Map(TEXTURES.map((t) => [t.id, t]));
export const getTexture = (id: string) => byId.get(id);

const smooth = (t: number) => t * t * (3 - 2 * t);

/** Periodisches Value-Noise (nahtlos kachelbar). */
function periodicNoise(size: number, cells: number, r: () => number): Float32Array {
  const g = new Float32Array(cells * cells);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const out = new Float32Array(size * size);
  for (let y = 0; y < size; y++) {
    const fy = (y / size) * cells;
    const y0 = Math.floor(fy);
    const ty = smooth(fy - y0);
    const y1 = (y0 + 1) % cells;
    for (let x = 0; x < size; x++) {
      const fx = (x / size) * cells;
      const x0 = Math.floor(fx);
      const tx = smooth(fx - x0);
      const x1 = (x0 + 1) % cells;
      const a = g[y0 * cells + x0]!,
        b = g[y0 * cells + x1]!,
        c = g[y1 * cells + x0]!,
        d = g[y1 * cells + x1]!;
      const top = a + (b - a) * tx;
      const bot = c + (d - c) * tx;
      out[y * size + x] = top + (bot - top) * ty;
    }
  }
  return out;
}

function fbm(size: number, baseCells: number, octaves: number, seed: number): Float32Array {
  const r = rng(seed);
  const out = new Float32Array(size * size);
  let amp = 0.5,
    total = 0;
  for (let o = 0; o < octaves; o++) {
    const n = periodicNoise(size, baseCells << o, r);
    for (let i = 0; i < out.length; i++) out[i] = out[i]! + n[i]! * amp;
    total += amp;
    amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] = out[i]! / total;
  return out;
}

function canvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  return [c, c.getContext('2d')!];
}

/** Färbt per Pixel: base-Farbe moduliert durch Wert v (0..1) und Stärke amp. */
function paintNoise(ctx: CanvasRenderingContext2D, size: number, base: string, noise: Float32Array, amp: number, grain = 0, seed = 1) {
  const [r0, g0, b0] = hexToRgb(base);
  const img = ctx.createImageData(size, size);
  const d = img.data;
  const r = rng(seed);
  for (let i = 0; i < noise.length; i++) {
    const v = (noise[i]! - 0.5) * amp + (grain ? (r() - 0.5) * grain : 0);
    d[i * 4] = r0 + v * 255;
    d[i * 4 + 1] = g0 + v * 255;
    d[i * 4 + 2] = b0 + v * 255;
    d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}

function fibers(ctx: CanvasRenderingContext2D, size: number, color: string, count: number, seed: number, alpha = 0.18) {
  const r = rng(seed);
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineCap = 'round';
  for (let i = 0; i < count; i++) {
    const x = r() * size,
      y = r() * size,
      len = 6 + r() * 22,
      a = r() * Math.PI * 2;
    ctx.lineWidth = 0.6 + r() * 0.9;
    for (const dx of [-size, 0, size])
      for (const dy of [-size, 0, size]) {
        ctx.beginPath();
        ctx.moveTo(x + dx, y + dy);
        ctx.quadraticCurveTo(x + dx + Math.cos(a) * len * 0.5 + (r() - 0.5) * 4, y + dy + Math.sin(a) * len * 0.5, x + dx + Math.cos(a) * len, y + dy + Math.sin(a) * len);
        ctx.stroke();
      }
  }
}

const LOREM =
  'Es war einmal ein Sommer am Meer und die Tage waren lang und golden die Wellen rauschten leise am Strand während wir Muscheln sammelten und Geschichten erzählten von fernen Inseln und alten Leuchttürmen der Wind trug den Duft von Salz und Sonne über die Dünen und abends saßen wir am Feuer bis die Sterne kamen';

export function renderTexture(id: string, tintIn: string | null, size = 1024): HTMLCanvasElement {
  const def = byId.get(id) ?? TEXTURES[0]!;
  const tint = tintIn ?? def.tint ?? '#f8f4ec';
  const [c, ctx] = canvas(size);
  switch (def.id) {
    case 'paper': {
      paintNoise(ctx, size, tint, fbm(size, 4, 5, 11), 0.06, 0.05, 3);
      fibers(ctx, size, mix(tint, '#8a7a66', 0.6), 260, 5, 0.1);
      break;
    }
    case 'kraft': {
      paintNoise(ctx, size, tint, fbm(size, 3, 6, 21), 0.16, 0.08, 4);
      fibers(ctx, size, mix(tint, '#3a2a1a', 0.7), 520, 9, 0.22);
      fibers(ctx, size, mix(tint, '#ffffff', 0.5), 200, 10, 0.18);
      break;
    }
    case 'vintage': {
      paintNoise(ctx, size, tint, fbm(size, 2, 6, 31), 0.12, 0.05, 6);
      const r = rng(77);
      for (let i = 0; i < 14; i++) {
        const x = r() * size,
          y = r() * size,
          rad = size * (0.05 + r() * 0.16);
        const g = ctx.createRadialGradient(x, y, rad * 0.2, x, y, rad);
        g.addColorStop(0, rgba('#a57b45', 0.06 + r() * 0.06));
        g.addColorStop(0.85, rgba('#a57b45', 0.09));
        g.addColorStop(1, rgba('#a57b45', 0));
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, size, size);
      }
      const v = ctx.createRadialGradient(size / 2, size / 2, size * 0.3, size / 2, size / 2, size * 0.75);
      v.addColorStop(0, 'rgba(120,80,30,0)');
      v.addColorStop(1, 'rgba(120,80,30,0.35)');
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, size, size);
      fibers(ctx, size, '#6b4a2a', 200, 12, 0.12);
      break;
    }
    case 'watercolor': {
      ctx.fillStyle = '#fffdf9';
      ctx.fillRect(0, 0, size, size);
      const r = rng(5);
      const n = fbm(256, 3, 4, 41);
      const blobs = 9;
      for (let i = 0; i < blobs; i++) {
        const col = i % 3 === 0 ? mix(tint, '#ffffff', 0.35) : i % 3 === 1 ? tint : mix(tint, '#f7c948', 0.25);
        const x = r() * size,
          y = r() * size,
          rad = size * (0.18 + r() * 0.25);
        ctx.save();
        ctx.globalAlpha = 0.18 + r() * 0.14;
        ctx.beginPath();
        const steps = 48;
        for (let s = 0; s <= steps; s++) {
          const a = (s / steps) * Math.PI * 2;
          const nx = Math.floor((Math.cos(a) * 0.5 + 0.5) * 255),
            ny = Math.floor((Math.sin(a) * 0.5 + 0.5) * 255);
          const rr = rad * (0.7 + n[ny * 256 + nx]! * 0.6 + r() * 0.06);
          const px = x + Math.cos(a) * rr,
            py = y + Math.sin(a) * rr;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(x, y, rad * 0.1, x, y, rad * 1.2);
        g.addColorStop(0, rgba(col, 0.6));
        g.addColorStop(0.75, rgba(col, 0.85));
        g.addColorStop(1, rgba(mix(col, '#000000', 0.12), 1));
        ctx.fillStyle = g;
        ctx.fill();
        ctx.lineWidth = size * 0.004;
        ctx.strokeStyle = rgba(mix(col, '#000000', 0.15), 0.35);
        ctx.stroke();
        ctx.restore();
      }
      // Papierkorn
      const grain = ctx.getImageData(0, 0, size, size);
      const gr = rng(8);
      for (let i = 0; i < grain.data.length; i += 4) {
        const v = (gr() - 0.5) * 10;
        grain.data[i] = grain.data[i]! + v;
        grain.data[i + 1] = grain.data[i + 1]! + v;
        grain.data[i + 2] = grain.data[i + 2]! + v;
      }
      ctx.putImageData(grain, 0, 0);
      break;
    }
    case 'marble': {
      const n = fbm(size, 3, 6, 51);
      const [r0, g0, b0] = hexToRgb(tint);
      const img = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const i = y * size + x;
          const t = Math.sin(((x + y) / size) * Math.PI * 2 * 2 + n[i]! * 9);
          const vein = Math.pow(1 - Math.abs(t), 14);
          const soft = (n[i]! - 0.5) * 18;
          const dark = vein * 110 + soft;
          img.data[i * 4] = r0 - dark;
          img.data[i * 4 + 1] = g0 - dark;
          img.data[i * 4 + 2] = b0 - dark * 0.9;
          img.data[i * 4 + 3] = 255;
        }
      ctx.putImageData(img, 0, 0);
      break;
    }
    case 'glitter': {
      const base = tint;
      paintNoise(ctx, size, mix(base, '#000000', 0.25), fbm(size, 8, 3, 61), 0.25, 0.35, 13);
      const r = rng(17);
      for (let i = 0; i < 2600; i++) {
        const x = r() * size,
          y = r() * size;
        const b = r();
        ctx.fillStyle = b > 0.85 ? 'rgba(255,255,255,0.95)' : rgba(mix(base, '#ffffff', b * 0.7), 0.85);
        const s = 1 + r() * 2.6;
        ctx.fillRect(x, y, s, s);
      }
      for (let i = 0; i < 40; i++) {
        const x = r() * size,
          y = r() * size,
          s = 6 + r() * 14;
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - s, y);
        ctx.lineTo(x + s, y);
        ctx.moveTo(x, y - s);
        ctx.lineTo(x, y + s);
        ctx.stroke();
      }
      break;
    }
    case 'linen': {
      paintNoise(ctx, size, tint, fbm(size, 6, 3, 71), 0.06, 0.04, 14);
      const r = rng(19);
      for (let i = 0; i < size; i += 3) {
        ctx.fillStyle = rgba(r() > 0.5 ? '#ffffff' : '#6b5a44', 0.05 + r() * 0.06);
        ctx.fillRect(0, i, size, 1.2);
        ctx.fillStyle = rgba(r() > 0.5 ? '#ffffff' : '#6b5a44', 0.04 + r() * 0.05);
        ctx.fillRect(i, 0, 1.2, size);
      }
      break;
    }
    case 'newspaper': {
      paintNoise(ctx, size, tint, fbm(size, 3, 4, 81), 0.08, 0.06, 15);
      ctx.fillStyle = 'rgba(40,34,28,0.62)';
      const fs = size / 46;
      ctx.font = `${fs}px Georgia, 'Times New Roman', serif`;
      const colW = size / 3;
      const words = LOREM.split(' ');
      let wi = 0;
      for (let col = 0; col < 3; col++) {
        const x0 = col * colW + fs * 0.6;
        for (let y = fs * 1.4; y < size; y += fs * 1.32) {
          let line = '';
          while (ctx.measureText(line + words[wi % words.length] + ' ').width < colW - fs * 1.2) {
            line += words[wi % words.length] + ' ';
            wi++;
          }
          ctx.fillText(line, x0, y);
        }
      }
      break;
    }
    case 'clouds': {
      const n = fbm(size, 3, 5, 91);
      const a = hexToRgb(mix(tint, '#ffffff', 0.55));
      const b = hexToRgb(mix(tint, '#ffd6e0', 0.4));
      const img = ctx.createImageData(size, size);
      for (let i = 0; i < n.length; i++) {
        const t = smooth(Math.min(1, Math.max(0, (n[i]! - 0.3) * 2.2)));
        img.data[i * 4] = a[0] + (b[0] - a[0]) * t;
        img.data[i * 4 + 1] = a[1] + (b[1] - a[1]) * t;
        img.data[i * 4 + 2] = a[2] + (b[2] - a[2]) * t;
        img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      break;
    }
    case 'bokeh': {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, '#1b1420');
      g.addColorStop(1, '#2c1d2e');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const r = rng(23);
      const cols = [tint, mix(tint, '#ffffff', 0.4), '#f28aa5', '#ffe08a'];
      for (let i = 0; i < 70; i++) {
        const x = r() * size,
          y = r() * size,
          rad = size * (0.015 + r() * 0.06);
        const col = cols[i % cols.length]!;
        const rg = ctx.createRadialGradient(x, y, 0, x, y, rad);
        rg.addColorStop(0, rgba(col, 0.55));
        rg.addColorStop(0.7, rgba(col, 0.35));
        rg.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'wood': {
      const n = fbm(size, 2, 5, 101);
      const [r0, g0, b0] = hexToRgb(tint);
      const img = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const i = y * size + x;
          const t = Math.sin((y / size) * Math.PI * 2 * 14 + n[i]! * 12);
          const v = t * 22 + (n[i]! - 0.5) * 30;
          img.data[i * 4] = r0 + v;
          img.data[i * 4 + 1] = g0 + v * 0.8;
          img.data[i * 4 + 2] = b0 + v * 0.6;
          img.data[i * 4 + 3] = 255;
        }
      ctx.putImageData(img, 0, 0);
      break;
    }
    case 'concrete': {
      paintNoise(ctx, size, tint, fbm(size, 4, 6, 111), 0.18, 0.12, 16);
      const r = rng(29);
      for (let i = 0; i < 500; i++) {
        ctx.fillStyle = rgba(r() > 0.5 ? '#ffffff' : '#3a3a3a', 0.15);
        ctx.beginPath();
        ctx.arc(r() * size, r() * size, 0.6 + r() * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'starry':
    case 'snowfall': {
      paintNoise(ctx, size, tint, fbm(size, 2, 4, 121), 0.14, 0.02, 17);
      const r = rng(def.id === 'starry' ? 31 : 37);
      const count = def.id === 'starry' ? 420 : 260;
      for (let i = 0; i < count; i++) {
        const x = r() * size,
          y = r() * size;
        const rad = def.id === 'starry' ? 0.5 + r() * 1.6 : 1.5 + r() * 4.5;
        for (const dx of [-size, 0, size])
          for (const dy of [-size, 0, size]) {
            ctx.fillStyle = rgba('#ffffff', def.id === 'starry' ? 0.4 + r() * 0.6 : 0.55 + r() * 0.4);
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, rad, 0, Math.PI * 2);
            ctx.fill();
          }
      }
      break;
    }
    case 'cork': {
      paintNoise(ctx, size, tint, fbm(size, 8, 4, 131), 0.2, 0.2, 18);
      const r = rng(41);
      for (let i = 0; i < 3500; i++) {
        ctx.fillStyle = rgba(r() > 0.5 ? '#5a3a1f' : '#e9c398', 0.35);
        ctx.beginPath();
        ctx.arc(r() * size, r() * size, 0.6 + r() * 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case 'sunset': {
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0, mix(tint, '#7a5cc9', 0.45));
      g.addColorStop(0.45, tint);
      g.addColorStop(0.8, mix(tint, '#ffe08a', 0.6));
      g.addColorStop(1, '#fff3c4');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const n = fbm(size, 3, 4, 141);
      const img = ctx.getImageData(0, 0, size, size);
      for (let i = 0; i < n.length; i++) {
        const v = (n[i]! - 0.5) * 26;
        img.data[i * 4] = img.data[i * 4]! + v;
        img.data[i * 4 + 1] = img.data[i * 4 + 1]! + v;
        img.data[i * 4 + 2] = img.data[i * 4 + 2]! + v;
      }
      ctx.putImageData(img, 0, 0);
      break;
    }
  }
  return c;
}
