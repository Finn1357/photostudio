/** Illustrierte Platzhalter für leere Fotofelder (eigene, prozedurale Grafiken). */

const SCENES: { sky: [string, string]; sun: string; layers: string[] }[] = [
  { sky: ['#ffd6c2', '#fff1e0'], sun: '#fff8ea', layers: ['#f2b8a0', '#e39a86', '#c97f74'] },
  { sky: ['#bfe3f2', '#eef8fb'], sun: '#ffffff', layers: ['#9fcfe0', '#7db6cc', '#5d9ab3'] },
  { sky: ['#e6dcf7', '#f8f3ff'], sun: '#fffaf0', layers: ['#c9b8ea', '#a996d9', '#8a78c4'] },
  { sky: ['#d9ecd0', '#f4faef'], sun: '#fffdf2', layers: ['#b4d7a5', '#93c084', '#74a768'] },
  { sky: ['#fbe3b8', '#fff6e2'], sun: '#ffffff', layers: ['#f2c879', '#e0a95a', '#c98a45'] },
  { sky: ['#f9d3dc', '#fff2f5'], sun: '#ffffff', layers: ['#f2aabd', '#e48aa3', '#cc6f8a'] },
];

export function placeholderColors(i: number): { light: string; mid: string } {
  const s = SCENES[i % SCENES.length]!;
  return { light: s.sky[1], mid: s.layers[0]! };
}

export function renderPlaceholder(i: number, size = 640): HTMLCanvasElement {
  const s = SCENES[i % SCENES.length]!;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const g = ctx.createLinearGradient(0, 0, 0, size);
  g.addColorStop(0, s.sky[0]);
  g.addColorStop(1, s.sky[1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = s.sun;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.arc(size * 0.7, size * 0.32, size * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  s.layers.forEach((col, li) => {
    ctx.fillStyle = col;
    ctx.beginPath();
    const base = size * (0.58 + li * 0.13);
    ctx.moveTo(0, size);
    ctx.lineTo(0, base);
    const peaks = 3 + li;
    for (let k = 0; k <= peaks; k++) {
      const x = (k / peaks) * size;
      const y = base - (k % 2 === 0 ? size * (0.12 - li * 0.03) : 0) + li * 6;
      ctx.quadraticCurveTo(x - size / peaks / 2, y - size * 0.05, x, y);
    }
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();
  });
  return c;
}
