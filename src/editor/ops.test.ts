import { describe, expect, it } from 'vitest';
import { createDoc, newSticker, newText } from './factory';
import { addElement, applyLayout, changeFormat, duplicateElement, moveLayer, placePhotos, referencedAssets, removeElement, setCollageSettings, slotPhotos, swapPhotos, updateElement } from './ops';
import type { PhotoElement } from '../types/doc';
import { buildTargets, snapAngle, snapBox } from './snapping';
import { useEditor } from './store';

const assets = (n: number) => Array.from({ length: n }, (_, i) => ({ id: 'a' + i, width: 1600, height: 1200 }));

describe('Dokument-Operationen', () => {
  it('Raster anlegen und Fotos der Reihe nach einsetzen', () => {
    let d = applyLayout(createDoc('1:1', 2400, 2400), 'l4-raster');
    expect(slotPhotos(d).length).toBe(4);
    d = placePhotos(d, assets(3)).doc;
    expect(slotPhotos(d).map((p) => p.assetId)).toEqual(['a0', 'a1', 'a2', null]);
  });

  it('überzählige Fotos werden frei platziert', () => {
    let d = applyLayout(createDoc('1:1', 2400, 2400), 'l2-spalten');
    d = placePhotos(d, assets(3)).doc;
    const free = d.elements.filter((e) => e.type === 'photo' && e.slot === undefined) as PhotoElement[];
    expect(free.length).toBe(1);
    expect(free[0]!.assetId).toBe('a2');
  });

  it('Rasterwechsel behält Bilder und merkt sich überzählige', () => {
    let d = placePhotos(applyLayout(createDoc('1:1', 2400, 2400), 'l4-raster'), assets(4)).doc;
    d = applyLayout(d, 'l2-spalten');
    expect(slotPhotos(d).map((p) => p.assetId)).toEqual(['a0', 'a1']);
    expect(d.overflow).toEqual(['a2', 'a3']);
    d = applyLayout(d, 'l4-raster');
    expect(slotPhotos(d).map((p) => p.assetId)).toEqual(['a0', 'a1', 'a2', 'a3']);
    expect(d.overflow).toEqual([]);
  });

  it('Rasterwechsel lässt andere Elemente unverändert über den Fotos', () => {
    let d = applyLayout(createDoc('1:1', 2400, 2400), 'l4-raster');
    const t = newText({ x: 1, y: 1, width: 100 });
    d = addElement(d, t);
    d = applyLayout(d, 'l6-raster');
    expect(d.elements[d.elements.length - 1]!.id).toBe(t.id);
  });

  it('Einstellungen ändern die Feldgeometrie', () => {
    const d = applyLayout(createDoc('1:1', 1000, 1000), 'l4-raster', { gap: 0, margin: 0 });
    const w0 = slotPhotos(d)[0]!.width;
    const d2 = setCollageSettings(d, { gap: 0.05 });
    expect(slotPhotos(d2)[0]!.width).toBeLessThan(w0);
  });

  it('Fotos tauschen inklusive Ausschnitt und Filter', () => {
    let d = placePhotos(applyLayout(createDoc('1:1', 2400, 2400), 'l2-spalten'), assets(2)).doc;
    const [a, b] = slotPhotos(d);
    d = updateElement<PhotoElement>(d, a!.id, { crop: { cx: 0.2, cy: 0.3, zoom: 2 } });
    d = swapPhotos(d, a!.id, b!.id);
    const [a2, b2] = slotPhotos(d);
    expect(a2!.assetId).toBe('a1');
    expect(b2!.assetId).toBe('a0');
    expect(b2!.crop.zoom).toBe(2);
  });

  it('Löschen eines Collage-Felds leert nur das Bild', () => {
    let d = placePhotos(applyLayout(createDoc('1:1', 2400, 2400), 'l2-spalten'), assets(2)).doc;
    const id = slotPhotos(d)[0]!.id;
    d = removeElement(d, id);
    expect(slotPhotos(d).length).toBe(2);
    expect(slotPhotos(d)[0]!.assetId).toBeNull();
  });

  it('Duplizieren und Ebenenreihenfolge', () => {
    let d = createDoc('1:1', 1000, 1000);
    const s1 = newSticker({ x: 100, y: 100, width: 50, height: 50, stickerId: 'herz-klassisch' });
    const s2 = newSticker({ x: 200, y: 200, width: 50, height: 50, stickerId: 'stern-klassisch' });
    d = addElement(addElement(d, s1), s2);
    const r = duplicateElement(d, s1.id);
    expect(r.doc.elements.length).toBe(3);
    expect(r.doc.elements[1]!.id).toBe(r.id);
    d = moveLayer(d, s1.id, 'top');
    expect(d.elements[1]!.id).toBe(s1.id);
    d = moveLayer(d, s1.id, 'bottom');
    expect(d.elements[0]!.id).toBe(s1.id);
  });

  it('Formatwechsel skaliert Elemente proportional', () => {
    let d = createDoc('1:1', 2400, 2400);
    d = addElement(d, newText({ x: 1200, y: 1200, width: 1000, fontSize: 100 }));
    d = changeFormat(d, '9:16', 1350, 2400);
    const t = d.elements[0]!;
    expect(t.x).toBeCloseTo(675);
    expect(t.y).toBeCloseTo(1200);
    expect(t.type === 'text' && t.fontSize).toBeLessThan(100);
    expect(d.width).toBe(1350);
  });

  it('ermittelt verwendete Bilder', () => {
    let d = placePhotos(applyLayout(createDoc('1:1', 2400, 2400), 'l2-spalten'), assets(2)).doc;
    d = { ...d, background: { ...d.background, fill: { kind: 'image', assetId: 'bg1' } } };
    expect([...referencedAssets(d)].sort()).toEqual(['a0', 'a1', 'bg1']);
  });
});

describe('Ausrichtungshilfen', () => {
  it('rastet an der Leinwandmitte ein', () => {
    const t = buildTargets(1000, 1000, []);
    const r = snapBox({ x: 396, y: 100, w: 200, h: 100 }, t, 8);
    expect(r.dx).toBe(4);
    expect(r.vx).toEqual([500]);
  });
  it('rastet Winkel nahe 90° ein', () => {
    expect(snapAngle(88)).toBe(90);
    expect(snapAngle(-2)).toBe(0);
    expect(snapAngle(45)).toBe(45);
  });
});

describe('Verlauf (Undo/Redo)', () => {
  const open = () =>
    useEditor.getState().open({ id: 'p1', name: 'Test', kind: 'free', createdAt: 0, updatedAt: 0, doc: createDoc('1:1', 1000, 1000) });

  it('macht Änderungen rückgängig und wiederholt sie', () => {
    open();
    const s = useEditor.getState();
    s.commit((d) => addElement(d, newText({ x: 1, y: 1, width: 10 })));
    expect(useEditor.getState().doc!.elements.length).toBe(1);
    useEditor.getState().undo();
    expect(useEditor.getState().doc!.elements.length).toBe(0);
    useEditor.getState().redo();
    expect(useEditor.getState().doc!.elements.length).toBe(1);
  });

  it('fasst Schieberegler-Änderungen zu einem Schritt zusammen', () => {
    open();
    const s = useEditor.getState();
    for (let i = 0; i < 10; i++) s.commit((d) => ({ ...d, background: { ...d.background, opacity: i / 10 } }), { coalesce: 'op' });
    expect(useEditor.getState().past.length).toBe(1);
  });

  it('Gesten erzeugen genau einen Verlaufsschritt', () => {
    open();
    const s = useEditor.getState();
    s.commit((d) => addElement(d, newText({ x: 1, y: 1, width: 10 })));
    const id = useEditor.getState().doc!.elements[0]!.id;
    const before = useEditor.getState().past.length;
    s.beginGesture();
    for (let i = 0; i < 20; i++) s.transient((d) => updateElement(d, id, { x: i }));
    s.endGesture();
    expect(useEditor.getState().past.length).toBe(before + 1);
    useEditor.getState().undo();
    expect(useEditor.getState().doc!.elements[0]!.x).toBe(1);
  });
});
