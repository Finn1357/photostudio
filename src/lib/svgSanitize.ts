/**
 * Bereinigt importierte SVG-Dateien: entfernt Skripte, Ereignis-Attribute,
 * externe Verweise und eingebettete Fremdinhalte.
 */

const FORBIDDEN_TAGS = new Set([
  'script',
  'foreignobject',
  'iframe',
  'object',
  'embed',
  'audio',
  'video',
  'animate',
  'animatemotion',
  'animatetransform',
  'set',
  'handler',
  'listener',
  'link',
  'meta',
]);

function isSafeUrl(v: string): boolean {
  const s = v.trim().toLowerCase();
  return s.startsWith('#') || s.startsWith('data:image/png') || s.startsWith('data:image/jpeg') || s.startsWith('data:image/webp') || s.startsWith('data:image/gif');
}

export interface SanitizedSvg {
  svg: string;
  width: number;
  height: number;
}

export function sanitizeSvg(source: string): SanitizedSvg {
  const parser = new DOMParser();
  const docu = parser.parseFromString(source, 'image/svg+xml');
  const root = docu.documentElement;
  if (!root || root.nodeName.toLowerCase() !== 'svg' || docu.getElementsByTagName('parsererror').length) {
    throw new Error('Die Datei ist kein gültiges SVG.');
  }
  const walk = (el: Element) => {
    for (const child of Array.from(el.children)) {
      if (FORBIDDEN_TAGS.has(child.nodeName.toLowerCase())) {
        child.remove();
        continue;
      }
      walk(child);
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value;
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      else if ((name === 'href' || name === 'xlink:href' || name === 'src') && !isSafeUrl(value)) el.removeAttribute(attr.name);
      else if (/url\s*\(\s*['"]?\s*(?!#)/i.test(value)) el.removeAttribute(attr.name);
      else if (/javascript:/i.test(value)) el.removeAttribute(attr.name);
    }
    if (el.nodeName.toLowerCase() === 'style') {
      const css = el.textContent ?? '';
      if (/@import|url\s*\(\s*['"]?\s*(?!#)|expression\s*\(|javascript:/i.test(css)) el.remove();
    }
  };
  walk(root);
  if (!root.getAttribute('xmlns')) root.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  let width = parseFloat(root.getAttribute('width') ?? '');
  let height = parseFloat(root.getAttribute('height') ?? '');
  const vb = (root.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  if ((!width || !height || Number.isNaN(width) || Number.isNaN(height)) && vb.length === 4 && vb[2]! > 0 && vb[3]! > 0) {
    width = vb[2]!;
    height = vb[3]!;
  }
  if (!width || !height || Number.isNaN(width) || Number.isNaN(height)) {
    width = 512;
    height = 512;
  }
  if (vb.length !== 4 || vb.some(Number.isNaN)) root.setAttribute('viewBox', `0 0 ${width} ${height}`);
  // Große intrinsische Größe für scharfe Darstellung
  const scale = 1024 / Math.max(width, height);
  root.setAttribute('width', String(Math.round(width * scale)));
  root.setAttribute('height', String(Math.round(height * scale)));
  const svg = new XMLSerializer().serializeToString(root);
  return { svg, width: width * scale, height: height * scale };
}
