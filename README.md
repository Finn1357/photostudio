# PhotoStudio

Foto-Collagen, Grußkarten und Scrapbooks direkt auf dem iPhone gestalten – als installierbare Web-App (PWA).
Komplett auf Deutsch, ohne Konto, ohne Werbung, ohne Wasserzeichen. **Alle Fotos bleiben auf dem Gerät.**

---

## Funktionsumfang

| Bereich | Umfang |
| --- | --- |
| **Startseite** | Neue Collage (Fotos wählen → passendes Raster entsteht automatisch), Vorlagen, freies Design, Grußkarten, Meine Projekte, Zuletzt verwendet, Suche nach Vorlagen und Motiven |
| **Collage-Raster** | 78 Raster für 1–12 Fotos: gleichmäßig, asymmetrisch, Mosaik, diagonal, Kreise, Herzen, Bögen, Polaroid, Magazin, Scrapbook. Abstand, Außenrand und Ecken einstellbar, Fotos mischen, Raster lösen |
| **Fotos im Raster** | Bildausschnitt mit einem Finger verschieben, mit zwei Fingern zoomen; Fotos per langem Drücken auf ein anderes Feld ziehen und tauschen (alternativ: Schaltfläche „Tauschen“) |
| **Vorlagen** | 47 eigens gestaltete Vorlagen in 45 Kategorien (Feiern, Jahreszeiten, Alltag, Stile). Suche, Kategorien, Filter nach Fotoanzahl, Format und Favoriten, eigene Vorlagen speichern |
| **Freier Editor** | Beliebig viele Fotos, Texte, Sticker, Formen und Zeichnungen. Verschieben (1 Finger), Skalieren und Drehen (2 Finger), Griffe zum Skalieren/Drehen, Duplizieren, Spiegeln, Deckkraft, Ebenenreihenfolge, Sperren, Ausblenden |
| **Ausrichtung** | Einrasten an Leinwandmitte, -rändern und anderen Elementen (mit Hilfslinien), Winkel rasten bei 0/90/180/270° ein |
| **Sticker** | 158 eigene SVG-Motive in 19 Kategorien, umfärbbar, mit optionalem Schatten. Import eigener PNG-/SVG-Dateien (SVGs werden bereinigt) |
| **Hintergründe** | Farben, 16 Verläufe (bearbeitbar), 26 Muster (umfärbbar, skalierbar), 16 prozedurale Texturen (Papier, Kraftpapier, Vintage, Aquarell, Marmor, Glitzer …), eigenes Foto mit Zoom, Position, Weichzeichnen, Helligkeit, Sättigung; Deckkraft, transparent |
| **Text** | 31 lokal eingebettete Schriften (Handschrift, elegant, modern, verspielt), Größe, Farbe, Farbverlauf, Fett/Kursiv/Unterstrichen/Durchgestrichen/Großbuchstaben, Ausrichtung, Zeilen- und Buchstabenabstand, Kontur, Schatten, gebogener Text, 8 Hintergründe (Fläche, Pille, Papier, Tape, Etikett, Notiz, Pinsel), 22 fertige Textstile |
| **Fotobearbeitung** | 20 Filter mit Live-Vorschau, Helligkeit, Kontrast, Sättigung, Wärme, Farbton, Belichtung, Verblassen, Schwarzweiß, Sepia, Weichzeichnen, Schärfen, Vignette, Deckkraft; Zuschneiden (Seitenverhältnisse + Zoom), 90°-Drehung, Spiegeln, Formen (Kreis, Herz, Stern, Bogen …), freie Form per Lasso, Radierer/Wiederherstellen zum Freistellen, Umrandung, Schatten (folgt freigestellten Konturen) |
| **Rahmen** | 12 Rahmenarten: klassisch, Polaroid, Film, Papierriss, Vintage-Büttenrand, Briefmarke, Wellenrand, Doppellinie, Washi-Tape, Fotoecken, Blüten, Bleistift – Farbe, Akzent und Stärke einstellbar |
| **Zeichnen** | Stift, Marker, Radierer, Pinselstärke, Farbe, Deckkraft, Rückgängig |
| **Formate** | 1:1, 4:5, 9:16, 16:9, 3:2, 2:3, DIN A4 hoch/quer, eigene Größe; beim Wechsel werden Elemente proportional angepasst |
| **Projekte** | Automatisches Speichern (IndexedDB), Umbenennen, Duplizieren, Löschen, Vorschaubilder, Änderungsdatum, Projektdatei sichern und importieren (`.photostudio.zip` inkl. aller Bilder) |
| **Export** | PNG (optional transparent) oder JPEG (Qualität einstellbar), bis ca. 4096 px Kantenlänge, ohne Wasserzeichen. iOS-Teilen-Menü („Bild sichern“ → Fotos), Download, Bild gedrückt halten → „Zu Fotos hinzufügen“ |
| **Bedienung** | Rückgängig/Wiederholen (80 Schritte, Gesten = ein Schritt), Kopieren/Einfügen, Zoom der Arbeitsfläche (2 Finger auf leerer Fläche, Doppeltippen = einpassen), Tastaturkürzel auf iPad/Desktop |
| **PWA / iPhone** | Installierbar, Vollbild, offline nutzbar, Safe-Area (Notch/Dynamic Island), Hoch- und Querformat, helles/dunkles Erscheinungsbild, keine Seiten-Zooms oder Scrollen beim Bearbeiten, Texteingabe immer oberhalb der Tastatur |

---

## Installation & lokale Entwicklung

Voraussetzung: [Node.js](https://nodejs.org/) ab Version 20 (getestet mit Node 24).

```bash
npm install          # Abhängigkeiten installieren
npm run dev          # Entwicklungsserver auf http://localhost:5173 (auch im WLAN erreichbar)
```

**Auf dem iPhone im WLAN testen:** `npm run dev` zeigt eine „Network“-Adresse (z. B. `http://192.168.1.20:5173`). Diese in Safari öffnen.
Hinweis: Installation als App, Service Worker und Teilen-Menü funktionieren nur über **HTTPS** (siehe unten). Zum Ausprobieren der Bedienung reicht die WLAN-Adresse.

### Prüfungen

```bash
npm run typecheck    # TypeScript (strict) für App und Konfiguration
npm test             # 50 Unit-Tests (Filter, Raster, Dokument-Operationen, Undo, Inhalte, IndexedDB, Projektdateien, SVG-Bereinigung)
npm run test:e2e     # Ende-zu-Ende-Test der 15 Erfolgskriterien (benötigt laufendes `npm run dev` und Edge oder Chrome)
npm run build        # Produktions-Build nach dist/ (inkl. Service Worker)
npm run preview      # Produktions-Build lokal ansehen
```

Für `test:e2e` wird ein installierter Edge- oder Chrome-Browser verwendet (`BROWSER_CHANNEL=chrome` bzw. `msedge`, `HEADLESS=0` für ein sichtbares Fenster). Screenshots und das exportierte Testbild landen in `e2e/output/`.

---

## Bereitstellung als HTTPS-Web-App

`npm run build` erzeugt den Ordner `dist/` – reine statische Dateien, **kein Server/Backend nötig**. Die App verwendet relative Pfade und Hash-Routing; sie läuft daher auch in Unterordnern.

Beliebige statische Hosting-Dienste mit HTTPS funktionieren, z. B.:

- **Netlify** (einfachste Variante): auf <https://app.netlify.com/drop> den Ordner `dist/` per Drag & Drop hochladen. Die mitgelieferte Datei `_headers` sorgt für korrekte Cache-Regeln.
- **Cloudflare Pages / Vercel**: Repository verbinden, Build-Befehl `npm run build`, Ausgabeverzeichnis `dist`.
- **GitHub Pages** (im Repo vorbereitet): Unter *Settings → Pages → Source* „GitHub Actions“ wählen. Danach baut der Workflow `.github/workflows/pages.yml` die App bei jedem Push auf `main` (inkl. Typprüfung und Tests) und veröffentlicht sie unter `https://<name>.github.io/<repo>/`. Relative Pfade sorgen dafür, dass das im Unterordner funktioniert.
- **Eigener Webserver** (nginx, Apache …): `dist/` ausliefern. Empfohlen: `sw.js`, `index.html` und `manifest.webmanifest` mit `Cache-Control: no-cache`, Dateien unter `assets/` dürfen lange gecacht werden.

Updates: Nach einem neuen Deployment lädt die App die neue Version automatisch im Hintergrund; sie ist beim nächsten Start aktiv.

---

## Installation auf dem iPhone-Home-Bildschirm

1. Die HTTPS-Adresse der App in **Safari** öffnen.
2. Unten auf **Teilen** (Quadrat mit Pfeil) tippen.
3. **„Zum Home-Bildschirm“** wählen und bestätigen.
4. PhotoStudio startet nun wie eine App im Vollbild und funktioniert auch offline.

**Wichtig für deine Daten:** Safari löscht Website-Daten von *nicht installierten* Seiten, die 7 Tage nicht benutzt wurden. Als Home-Bildschirm-App gilt diese Regel nicht. Zusätzlich empfiehlt sich für wichtige Projekte: *Projekt → Projektdatei sichern* (z. B. in „Dateien“ oder iCloud Drive).

---

## Architektur

```text
src/
├─ types/doc.ts            Einheitliches Dokument- und Elementmodell (Foto, Text, Sticker, Form, Zeichnung)
├─ editor/
│  ├─ ops.ts               Reine Dokument-Operationen (Raster, Platzieren, Tauschen, Format, Ebenen …)
│  ├─ collage.ts           Raster-Geometrie (Abstand, Rand, Polygone, Formen)
│  ├─ store.ts             Zustand-Store mit Undo/Redo und Gesten-Transaktionen
│  ├─ EditorStage.tsx      Arbeitsfläche: Touch-Gesten, Auswahl, Transformationsgriffe, Einrasten
│  ├─ persistence.ts       Automatisches Speichern + Vorschaubilder
│  ├─ actions.ts           Höhere Aktionen (Fotos importieren, Text/Sticker hinzufügen …)
│  └─ ui/                  Werkzeugleiste, Panels, Texteditor, Export, Projektmenü
├─ render/
│  ├─ Nodes.tsx            react-konva-Komponenten – identisch für Editor, Vorschau und Export
│  ├─ paint.ts             Natives Canvas-Zeichnen (Fotos, Masken, Rahmen, Text-Hintergründe, Formen, Zeichnungen)
│  └─ exportDoc.tsx        Rendering in Exportauflösung (versteckte Stage)
├─ lib/                    Bildimport (EXIF, Verkleinerung), Bild-Pipeline/Caches, Filter (Pixelfunktionen),
│                          IndexedDB, Projektdateien (zip), SVG-Bereinigung, Teilen, Schriften
├─ content/                Raster, Vorlagen, Sticker, Muster, Texturen, Platzhalter, Formate, Text-Presets
├─ screens/                Start, Vorlagen, Projekte, Editor
└─ ui/                     Gemeinsame UI-Bausteine
```

Kernideen:

- **Ein Dokumentmodell:** Collage-Felder sind normale Foto-Elemente mit `slot`-Index; ihre Geometrie wird aus Raster + Einstellungen berechnet. Vorlagen sind fertige Dokumente mit Platzhaltern. Dadurch funktionieren alle Werkzeuge überall.
- **Export = Editoransicht:** Export und Vorschaubilder verwenden dieselben Render-Komponenten wie der Editor, nur mit Originalbildern statt Vorschaubildern.
- **Speicherschonend auf dem iPhone:** Fotos werden beim Import auf ≤ 4096 px (Original) und ≤ 1280 px (Arbeitsvorschau) gebracht; der Editor arbeitet mit der Vorschau, der Export mit dem Original. Exportgrößen bleiben unter der Canvas-Grenze von iOS (16,7 Mio. Pixel).
- **Datenschutz:** Keine externen Dienste, keine Analyse, keine Uploads. Schriften und Grafiken sind gebündelt.

### Inhalte erweitern

- **Sticker:** In `src/content/stickers/` ein Objekt mit `id`, `name`, `cat`, `w`, `h`, `colors` und einer `draw(colors)`-Funktion (SVG-Markup) ergänzen. Farbslots machen das Motiv automatisch umfärbbar.
- **Vorlagen:** In `src/content/templates/` mit `template({...})` und den Bausteinen `P` (Foto), `T` (Text), `S` (Sticker), `R` (Form) sowie `bgColor/bgGrad/bgPattern/bgTexture` beschreiben. Koordinaten sind relativ (0–1), dadurch formatunabhängig. Nach Designänderungen `TEMPLATE_THUMB_VERSION` in `src/lib/thumbs.ts` erhöhen.
- **Raster:** In `src/content/layouts.ts` (Rechtecke, Polygone, Formen, gestreute Polaroids).
- **Muster/Texturen:** `src/content/patterns.ts` (SVG-Kacheln) bzw. `src/content/textures.ts` (prozedural).
- **Schriften:** `@fontsource/<name>` installieren, in `src/lib/fonts.ts` importieren und in `FONTS` eintragen.

---

## Technische Einschränkungen & bewusste Entscheidungen

- **Automatische Hintergrundentfernung (KI) ist nicht enthalten.** Freistellen funktioniert manuell mit Radierer/Wiederherstellen und der freien Lasso-Form. Lokal lauffähige Bibliotheken dafür sind entweder sehr groß (zig MB Modell) oder unter AGPL lizenziert; das wurde für Version 1 bewusst ausgelassen.
- **Video, GIF, Animation:** bewusst nicht enthalten (nur statische Bilder).
- **Maximale Exportgröße:** ca. 4096 px an der längsten Seite bzw. 16,7 Megapixel (Canvas-Grenze von iOS Safari). DIN A4 entspricht damit ca. 350 dpi.
- **HEIC:** Bei der Fotoauswahl wandelt iOS Bilder automatisch in JPEG um. Direkt geöffnete HEIC-Dateien funktionieren nur, wenn der Browser HEIC dekodieren kann (Safari ab iOS 17).
- **Sehr große Originale** (z. B. 48 MP) werden beim Import auf 4096 px verkleinert, da größere Bilder auf iOS nicht zuverlässig verarbeitet werden können.
- **Text:** Ein Textfeld hat einen einheitlichen Stil (keine gemischten Schriftarten innerhalb eines Feldes). Schriften mit nur einem Schnitt werden bei „Fett“ vom Browser künstlich verstärkt.
- **Hintergrund-Anpassungen** (Weichzeichnen, Helligkeit, Sättigung) wirken auf Foto-Hintergründe; Muster und Texturen werden über ihre Farben angepasst.
- **Fotos im Feld** lassen sich in 90°-Schritten drehen; freie Fotos zusätzlich stufenlos.
- **Mehrfachauswahl** mehrerer Elemente gleichzeitig wird nicht unterstützt.
- **Teilen-Menü:** iOS erlaubt das Teilen nur direkt nach einem Tippen. Die App erstellt das Bild daher zuerst und bietet danach die Schaltfläche „Teilen / In Fotos sichern“ an.
- **Speicherplatz:** Wie viel gespeichert werden kann, bestimmt iOS (meist mehrere GB). Die Einstellungen zeigen die aktuelle Belegung; nicht mehr verwendete Bilder werden automatisch aufgeräumt.
- **Getestet** wurde in Microsoft Edge (Chromium) mit iPhone-Emulation (393 × 852, Touch-Ereignisse) sowie per Unit-Tests. Ein Test auf einem echten iPhone mit Safari steht noch aus. Bitte besonders Kamera-Aufnahme, Teilen-Menü und Home-Bildschirm-Installation dort prüfen.

---

## Lizenzen

Alle Vorlagen, Sticker, Muster, Texturen, Platzhalter-Illustrationen und das App-Icon wurden eigens für dieses Projekt erstellt. Übersicht der verwendeten Open-Source-Bibliotheken und Schriften: [DRITTANBIETER-LIZENZEN.md](DRITTANBIETER-LIZENZEN.md).
