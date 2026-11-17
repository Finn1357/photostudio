import { describe, expect, it } from 'vitest';
import { TEMPLATES, CATEGORY_GROUPS, filterTemplates } from './templates';
import { STICKERS, STICKER_CATEGORIES, stickerSvg, getStickerDef } from './stickers';
import { PATTERNS, patternSvg } from './patterns';
import { TEXTURES } from './textures';
import { FONTS } from '../lib/fonts';
import { exportSizes, FORMATS, MAX_CANVAS_AREA, MAX_CANVAS_SIDE } from './formats';
import { TEXT_PRESETS } from './presets';

describe('Vorlagen', () => {
  it('mindestens 40 eigenständige Vorlagen mit eindeutigen IDs', () => {
    expect(TEMPLATES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(TEMPLATES.map((t) => t.id)).size).toBe(TEMPLATES.length);
    expect(new Set(TEMPLATES.map((t) => t.name)).size).toBe(TEMPLATES.length);
  });

  it('jede Kategorie hat mindestens eine Vorlage', () => {
    for (const g of CATEGORY_GROUPS) for (const c of g.cats) expect(filterTemplates({ category: c.id }).length, c.id).toBeGreaterThan(0);
  });

  it('Vorlagen unterscheiden sich in Komposition, Hintergrund und Typografie', () => {
    const signatures = new Set(
      TEMPLATES.map((t) => {
        const d = t.build();
        const fonts = d.elements.filter((e) => e.type === 'text').map((e) => (e.type === 'text' ? e.fontFamily : '')).join(',');
        return `${d.formatId}|${JSON.stringify(d.background.fill)}|${fonts}|${d.elements.length}`;
      }),
    );
    expect(signatures.size).toBe(TEMPLATES.length);
    const fontsUsed = new Set(TEMPLATES.flatMap((t) => t.build().elements.flatMap((e) => (e.type === 'text' ? [e.fontFamily] : []))));
    expect(fontsUsed.size).toBeGreaterThanOrEqual(20);
  });

  it('jede Vorlage baut ein gültiges Dokument mit Fotoplatzhaltern', () => {
    const fontNames = new Set(FONTS.map((f) => f.family));
    for (const t of TEMPLATES) {
      const d = t.build();
      expect(d.width).toBeGreaterThan(0);
      expect(t.photoCount, t.id).toBeGreaterThan(0);
      for (const e of d.elements) {
        if (e.type === 'text') expect(fontNames.has(e.fontFamily), `${t.id}: ${e.fontFamily}`).toBe(true);
        if (e.type === 'sticker') expect(getStickerDef(e.stickerId!), `${t.id}: ${e.stickerId}`).toBeTruthy();
        if (e.type === 'photo') expect(e.assetId).toBeNull();
        expect(Number.isFinite(e.x) && Number.isFinite(e.y) && e.width > 0 && e.height > 0).toBe(true);
      }
    }
  });

  it('Suche und Filter', () => {
    expect(filterTemplates({ query: 'hochzeit' }).length).toBeGreaterThan(0);
    expect(filterTemplates({ photoCount: 1 }).every((t) => t.photoCount === 1)).toBe(true);
    expect(filterTemplates({ shape: 'quer' }).length).toBeGreaterThan(0);
    expect(filterTemplates({ cardsOnly: true }).every((t) => t.card)).toBe(true);
  });
});

describe('Sticker', () => {
  it('mindestens 120 verschiedene Motive in allen Kategorien', () => {
    expect(STICKERS.length).toBeGreaterThanOrEqual(120);
    expect(new Set(STICKERS.map((s) => s.id)).size).toBe(STICKERS.length);
    for (const c of STICKER_CATEGORIES) expect(STICKERS.filter((s) => s.cat === c.id).length, c.id).toBeGreaterThanOrEqual(5);
  });

  it('jedes Motiv erzeugt ein wohlgeformtes, umfärbbares SVG', () => {
    for (const s of STICKERS) {
      const svg = stickerSvg(s);
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
      expect(svg).not.toMatch(/undefined|NaN/);
      expect(svg).not.toMatch(/<script|<foreignObject|href="http/i);
      const recolored = stickerSvg(s, s.colors.map(() => '#123456'));
      expect(recolored).toContain('#123456');
    }
  });
});

describe('Hintergründe, Schriften, Formate', () => {
  it('Muster sind gültig', () => {
    expect(PATTERNS.length).toBeGreaterThanOrEqual(20);
    for (const p of PATTERNS) expect(patternSvg(p.id, p.colors)).not.toMatch(/undefined|NaN/);
  });
  it('Texturen sind vorhanden', () => {
    expect(TEXTURES.length).toBeGreaterThanOrEqual(12);
  });
  it('Schriften in allen Stilrichtungen', () => {
    for (const c of ['hand', 'serif', 'sans', 'deko']) expect(FONTS.filter((f) => f.category === c).length).toBeGreaterThanOrEqual(5);
  });
  it('Textvorlagen nutzen vorhandene Schriften', () => {
    const names = new Set(FONTS.map((f) => f.family));
    for (const p of TEXT_PRESETS) expect(names.has(p.style.fontFamily!)).toBe(true);
  });
  it('Exportgrößen halten die iOS-Canvas-Grenzen ein', () => {
    for (const f of FORMATS) {
      const sizes = exportSizes(f.width, f.height);
      expect(sizes.length).toBeGreaterThanOrEqual(2);
      for (const s of sizes) {
        expect(s.width * s.height).toBeLessThanOrEqual(MAX_CANVAS_AREA);
        expect(Math.max(s.width, s.height)).toBeLessThanOrEqual(MAX_CANVAS_SIDE);
      }
      expect(Math.max(...sizes.map((s) => s.width))).toBeGreaterThanOrEqual(Math.min(f.width * 1.4, 2800));
    }
  });
});
