// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { sanitizeSvg } from './svgSanitize';

describe('SVG-Bereinigung', () => {
  it('entfernt Skripte, Ereignisse und externe Verweise', () => {
    const evil = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" onload="alert(1)">
      <script>alert(1)</script>
      <foreignObject><div>x</div></foreignObject>
      <image href="https://evil.example/x.png" width="10" height="10"/>
      <a href="javascript:alert(1)"><rect width="5" height="5" onclick="alert(2)"/></a>
      <rect width="10" height="10" fill="url(https://evil.example/p)"/>
      <circle cx="5" cy="5" r="3" fill="red"/>
    </svg>`;
    const { svg, width, height } = sanitizeSvg(evil);
    expect(svg).not.toMatch(/script|onload|onclick|foreignObject|evil\.example|javascript:/i);
    expect(svg).toContain('<circle');
    expect(Math.max(width, height)).toBe(1024);
  });

  it('ergänzt fehlende Größenangaben', () => {
    const { svg, width, height } = sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect width="200" height="100"/></svg>');
    expect(width / height).toBeCloseTo(2);
    expect(svg).toMatch(/width="1024"/);
  });

  it('lehnt Nicht-SVG ab', () => {
    expect(() => sanitizeSvg('<html><body>nein</body></html>')).toThrow();
  });
});
