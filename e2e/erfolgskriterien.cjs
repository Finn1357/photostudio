/**
 * End-to-End-Test der 15 Erfolgskriterien (Vorlage, Fotoimport, Gesten, Sticker, Text, Undo,
 * Speichern, Neustart, Export). Voraussetzung: 'npm run dev' läuft (Standard: http://127.0.0.1:5173/).
 *   npm run test:e2e
 * Umgebungsvariablen: BASE (URL), BROWSER_CHANNEL (msedge | chrome), HEADLESS=0 für sichtbaren Browser.
 */
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, 'output') + path.sep;
fs.mkdirSync(OUT, { recursive: true });
const BASE = process.env.BASE || 'http://127.0.0.1:5173/';
const step = (s) => console.log('> ' + s);

async function makePhotos(page) {
  const list = await page.evaluate(async () => {
    const specs = [[1600, 1200, '#e8785e', '#ffd2a8'], [1200, 1600, '#3a7bd5', '#a8e0ff'], [1500, 1500, '#2f9e6a', '#d4f5c4'], [2000, 1100, '#8e44ad', '#f3c4ff'], [1100, 1700, '#d4a017', '#fff1b8']];
    const out = [];
    for (const [w, h, a, b] of specs) {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      const x = c.getContext('2d');
      const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, b); g.addColorStop(1, a);
      x.fillStyle = g; x.fillRect(0, 0, w, h);
      x.fillStyle = 'rgba(255,255,255,0.85)'; x.beginPath(); x.arc(w * 0.35, h * 0.4, Math.min(w, h) * 0.18, 0, 7); x.fill();
      x.fillStyle = '#222'; x.font = 'bold ' + Math.round(h / 8) + 'px sans-serif'; x.fillText(w + 'x' + h, w * 0.08, h * 0.9);
      out.push(c.toDataURL('image/jpeg', 0.9));
    }
    return out;
  });
  return list.map((d, i) => ({ name: 'foto' + (i + 1) + '.jpg', mimeType: 'image/jpeg', buffer: Buffer.from(d.split(',')[1], 'base64') }));
}

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || (process.platform === 'win32' ? 'msedge' : 'chrome'), headless: process.env.HEADLESS !== '0' });
  const ctx = await browser.newContext({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'de-DE' });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => { if (m.type() === 'error') logs.push('console.error: ' + m.text()); });
  page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
  const cdp = await ctx.newCDPSession(page);
  const touch = async (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([x, y], i) => ({ x, y, id: i + 1 })) });
  const drag = async (from, to, steps = 12) => {
    await touch('touchStart', [from]);
    for (let i = 1; i <= steps; i++) { await touch('touchMove', [[from[0] + ((to[0] - from[0]) * i) / steps, from[1] + ((to[1] - from[1]) * i) / steps]]); await page.waitForTimeout(16); }
    await touch('touchEnd', []);
  };
  const pinch = async (c, d0, d1, rotDeg = 0, steps = 14) => {
    const pts = (d, a) => [[c[0] - Math.cos(a) * d / 2, c[1] - Math.sin(a) * d / 2], [c[0] + Math.cos(a) * d / 2, c[1] + Math.sin(a) * d / 2]];
    await touch('touchStart', pts(d0, 0));
    for (let i = 1; i <= steps; i++) { await touch('touchMove', pts(d0 + ((d1 - d0) * i) / steps, (rotDeg * Math.PI / 180) * i / steps)); await page.waitForTimeout(16); }
    await touch('touchEnd', []);
  };
  const tap = async (x, y) => { await touch('touchStart', [[x, y]]); await page.waitForTimeout(40); await touch('touchEnd', []); await page.waitForTimeout(350); };
  const getDoc = () => page.evaluate(() => window.__ps.getState().doc);

  step('1. App oeffnen');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  const photos = await makePhotos(page);

  step('2. Vorlage waehlen (Polaroid-Pinnwand, 6 Felder)');
  await page.goto(BASE + '#/vorlagen?q=pinnwand', { waitUntil: 'networkidle' });
  await page.getByText('Polaroid-Pinnwand').first().click();
  await page.waitForURL(/#\/editor\//);
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + 'e1-template.png' });

  step('3./4. Fuenf Fotos importieren und in Platzhalter einsetzen');
  await page.getByRole('button', { name: 'Fotos', exact: true }).click();
  await page.waitForTimeout(300);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.getByRole('button', { name: 'Mediathek' }).click()]);
  await chooser.setFiles(photos);
  await page.waitForTimeout(4000);
  let doc = await getDoc();
  console.log('   Fotos gesetzt:', doc.elements.filter((e) => e.type === 'photo' && e.assetId).length, 'von', doc.elements.filter((e) => e.type === 'photo').length, 'Feldern');
  await page.getByRole('button', { name: 'Panel schließen' }).click().catch(() => {});
  await page.waitForTimeout(800);
  await page.screenshot({ path: OUT + 'e2-photos.png' });

  const box = await page.locator('.editor-canvas').first().boundingBox();
  const W = doc.width, H = doc.height;
  const pad = Math.max(12, Math.min(box.width, box.height) * 0.04);
  const scale = Math.min((box.width - pad * 2) / W, (box.height - pad * 2) / H);
  const ox = box.x + (box.width - W * scale) / 2, oy = box.y + (box.height - H * scale) / 2;
  const scr = (x, y) => [ox + x * scale, oy + y * scale];

  step('5. Foto mit dem Finger verschieben und per Pinch vergroessern/drehen');
  const photo0 = doc.elements.find((e) => e.type === 'photo' && e.assetId);
  const p0 = scr(photo0.x, photo0.y);
  await tap(p0[0], p0[1]);
  console.log('   ausgewaehlt nach Tippen:', (await page.evaluate(() => window.__ps.getState().selectedId)) === photo0.id);
  await drag(p0, [p0[0] + 40, p0[1] + 30]);
  await page.waitForTimeout(300);
  const p1 = [p0[0] + 40, p0[1] + 30];
  await pinch(p1, 80, 140, 20);
  await page.waitForTimeout(400);
  doc = await getDoc();
  const ph = doc.elements.find((e) => e.id === photo0.id);
  console.log('   vorher x/y/w/rot:', [photo0.x, photo0.y, photo0.width, photo0.rotation].map(Math.round).join('/'), ' nachher:', [ph.x, ph.y, ph.width, ph.rotation].map(Math.round).join('/'));

  step('6. Rahmen und Hintergrund aendern');
  await page.getByRole('button', { name: 'Rahmen', exact: true }).click();
  await page.getByRole('button', { name: 'Papierriss' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Auswahl aufheben' }).click();
  await page.getByRole('button', { name: 'Hintergrund', exact: true }).click();
  await page.getByRole('button', { name: 'Muster' }).click();
  await page.getByRole('button', { name: 'Herzen', exact: true }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Panel schließen' }).click();
  doc = await getDoc();
  console.log('   Rahmen:', doc.elements.find((e) => e.id === photo0.id).frame.kind, ' Hintergrund:', JSON.stringify(doc.background.fill));

  step('7. Sticker hinzufuegen');
  await page.getByRole('button', { name: 'Sticker', exact: true }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Schmetterling', exact: true }).click();
  await page.waitForTimeout(500);
  doc = await getDoc();
  console.log('   Sticker vorhanden:', doc.elements.some((e) => e.type === 'sticker' && e.stickerId === 'schmetterling'));

  step('8. Text schreiben, Schrift und Farbe aendern');
  await page.getByRole('button', { name: 'Auswahl aufheben' }).click().catch(() => {});
  await page.getByRole('button', { name: 'Text', exact: true }).click();
  await page.waitForTimeout(400);
  await page.keyboard.type('Hallo Welt!');
  await page.getByRole('button', { name: 'Pacifico' }).first().click();
  await page.getByRole('button', { name: '#e2546f' }).first().click();
  await page.getByRole('button', { name: 'Fertig', exact: true }).click();
  await page.waitForTimeout(800);
  const textEl = await page.evaluate(() => window.__ps.getState().doc.elements.find((e) => e.type === 'text' && e.text === 'Hallo Welt!'));
  console.log('   Text:', JSON.stringify({ text: textEl && textEl.text, font: textEl && textEl.fontFamily, color: textEl && textEl.color }));

  step('9. Text verschieben und drehen');
  const tpos = scr(textEl.x, textEl.y);
  await drag(tpos, [tpos[0], tpos[1] - 120]);
  await page.waitForTimeout(300);
  await pinch([tpos[0], tpos[1] - 120], 120, 120, -25);
  await page.waitForTimeout(400);
  const textAfter = await page.evaluate((id) => window.__ps.getState().doc.elements.find((e) => e.id === id), textEl.id);
  console.log('   Text y:', Math.round(textEl.y), '->', Math.round(textAfter.y), ' Rotation:', Math.round(textAfter.rotation));
  await page.screenshot({ path: OUT + 'e3-edited.png' });

  step('10. Aenderung rueckgaengig machen');
  await page.getByRole('button', { name: 'Rückgängig' }).click();
  await page.waitForTimeout(300);
  const undone = await page.evaluate((id) => window.__ps.getState().doc.elements.find((e) => e.id === id), textEl.id);
  console.log('   Rotation nach Undo:', Math.round(textAfter.rotation), '->', Math.round(undone.rotation));

  step('11. Projekt speichern');
  await page.waitForTimeout(1800);
  console.log('   Speicherstatus:', await page.evaluate(() => window.__ps.getState().saveState));
  const projectUrl = page.url();
  const snapshotBefore = await page.evaluate(() => JSON.stringify(window.__ps.getState().doc));

  step('12./13. App schliessen, neu oeffnen, Projekt weiter bearbeiten');
  await page.goto('about:blank');
  await page.goto(BASE + '#/projekte', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: OUT + 'e4-projects.png' });
  await page.locator('button:has(img)').first().click();
  await page.waitForURL(/#\/editor\//);
  await page.waitForTimeout(2000);
  const snapshotAfter = await page.evaluate(() => JSON.stringify(window.__ps.getState().doc));
  console.log('   Gleiches Projekt:', page.url() === projectUrl, ' Dokument identisch:', snapshotAfter === snapshotBefore);

  step('14. Hochaufloesenden Export erstellen');
  await page.getByRole('button', { name: 'Sichern', exact: true }).click();
  await page.getByRole('button', { name: /Maximal/ }).click();
  await page.getByRole('button', { name: 'Bild erstellen' }).click();
  await page.getByAltText('Exportiertes Bild').waitFor({ timeout: 90000 });
  const exp = await page.evaluate(async () => {
    const img = document.querySelector('img[alt="Exportiertes Bild"]');
    await img.decode();
    const blob = await (await fetch(img.src)).blob();
    return { w: img.naturalWidth, h: img.naturalHeight, kb: Math.round(blob.size / 1024), type: blob.type };
  });
  console.log('   Export:', JSON.stringify(exp));
  await page.screenshot({ path: OUT + 'e5-export.png' });
  const dataUrl = await page.evaluate(() => { const img = document.querySelector('img[alt="Exportiertes Bild"]'); const c = document.createElement('canvas'); c.width = 700; c.height = Math.round(700 * img.naturalHeight / img.naturalWidth); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.88); });
  fs.writeFileSync(OUT + 'e6-exported-image.jpg', Buffer.from(dataUrl.split(',')[1], 'base64'));

  console.log('\nFehler/Logs:\n' + (logs.join('\n') || '(keine)'));
  await browser.close();
})().catch((e) => { console.error('FAIL', e); process.exit(1); });
