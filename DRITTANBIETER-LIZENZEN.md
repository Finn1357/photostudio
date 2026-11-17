# Drittanbieter-Ressourcen und Lizenzen

## Eigene Inhalte

Folgende Inhalte wurden eigens für PhotoStudio gestaltet bzw. werden zur Laufzeit prozedural erzeugt. Sie stammen nicht aus fremden Quellen, insbesondere nicht aus PicCollage oder anderen Apps:

- 47 Vorlagen (`src/content/templates/`)
- 158 Sticker/Motive als SVG-Code (`src/content/stickers/`)
- 26 Muster (`src/content/patterns.ts`) und 16 Texturen (`src/content/textures.ts`, prozedural erzeugt)
- 78 Collage-Raster, 12 Rahmenarten, Platzhalter-Illustrationen, Filter-Presets
- App-Icon (`public/logo.svg` und daraus erzeugte PNGs)

## Schriften (lokal gebündelt über Fontsource)

Alle Schriften dürfen frei verwendet, eingebettet und zusammen mit Software weitergegeben werden. Exportierte Bilder unterliegen keinen Einschränkungen.

| Schrift | Lizenz |
| --- | --- |
| Abril Fatface, Amatic SC, Bebas Neue, Bungee, Caveat, Cinzel, Comfortaa, Cormorant Garamond, Dancing Script, DM Serif Display, Fredoka, Great Vibes, Inter, Josefin Sans, Kalam, Libre Baskerville, Lobster, Lora, Montserrat, Nunito, Oswald, Pacifico, Parisienne, Playfair Display, Poppins, Righteous, Sacramento, Shadows Into Light | SIL Open Font License 1.1 |
| Homemade Apple, Permanent Marker, Special Elite | Apache License 2.0 |

Bereitgestellt über die npm-Pakete `@fontsource/*` (MIT-Lizenz für die Paketierung).

## Laufzeit-Bibliotheken

| Paket | Version | Lizenz | Zweck |
| --- | --- | --- | --- |
| react, react-dom | 19.3.1 | MIT | Benutzeroberfläche |
| konva | 10.9.1 | MIT | Canvas-Rendering, Transformationsgriffe |
| react-konva | 19.3.2 | MIT | React-Anbindung für Konva |
| zustand | 5.1.0 | MIT | Zustandsverwaltung |
| idb | 8.0.4 | ISC | IndexedDB-Zugriff |
| fflate | 0.8.3 | MIT | ZIP für Projektdateien |
| lucide-react | 1.74.0 | ISC | Symbole |
| workbox-window | 7.x | MIT | Service-Worker-Registrierung |

## Entwicklungswerkzeuge (nicht Teil der ausgelieferten App)

Vite (MIT), TypeScript (Apache-2.0), Tailwind CSS (MIT), vite-plugin-pwa / Workbox (MIT), @vite-pwa/assets-generator (MIT), Vitest (MIT), fake-indexeddb (Apache-2.0), jsdom (MIT), playwright-core (Apache-2.0).
