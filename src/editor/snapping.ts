/** Ausrichtungshilfen: Einrasten an Leinwandmitte, -rändern und anderen Elementen (rein, testbar). */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SnapResult {
  dx: number;
  dy: number;
  /** vertikale Hilfslinien (x-Positionen) */
  vx: number[];
  /** horizontale Hilfslinien (y-Positionen) */
  hy: number[];
}

export interface SnapTargets {
  xs: number[];
  ys: number[];
}

export function buildTargets(W: number, H: number, others: Box[]): SnapTargets {
  const xs = [0, W / 2, W];
  const ys = [0, H / 2, H];
  for (const b of others) {
    xs.push(b.x, b.x + b.w / 2, b.x + b.w);
    ys.push(b.y, b.y + b.h / 2, b.y + b.h);
  }
  return { xs, ys };
}

function best(cands: number[], targets: number[], threshold: number): { d: number; line: number } | null {
  let res: { d: number; line: number } | null = null;
  for (const c of cands)
    for (const t of targets) {
      const d = t - c;
      if (Math.abs(d) <= threshold && (!res || Math.abs(d) < Math.abs(res.d))) res = { d, line: t };
    }
  return res;
}

/** Liefert die Korrektur, mit der `box` an den nächsten Zielen einrastet. */
export function snapBox(box: Box, targets: SnapTargets, threshold: number): SnapResult {
  const bx = best([box.x, box.x + box.w / 2, box.x + box.w], targets.xs, threshold);
  const by = best([box.y, box.y + box.h / 2, box.y + box.h], targets.ys, threshold);
  return {
    dx: bx?.d ?? 0,
    dy: by?.d ?? 0,
    vx: bx ? [bx.line] : [],
    hy: by ? [by.line] : [],
  };
}

/** Rastet einen Winkel nahe 0/90/180/270 Grad ein. */
export function snapAngle(deg: number, tolerance = 4): number {
  const n = ((deg % 360) + 360) % 360;
  for (const t of [0, 90, 180, 270, 360]) if (Math.abs(n - t) <= tolerance) return deg - n + t;
  return deg;
}
