# Stromstrecke

Orientierung für **neue E-Autos** in Deutschland, online unter [stromstrecke.de](https://stromstrecke.de). Ehrliche Autobahn-Reichweite als Spanne (Monat, Tempo, Temperatur) — kein Verkauf, kein Leasing-Vergleich.

Das Repository heißt noch `fahrklar`, der frühere Name. Warum das so bleibt, steht in `CLAUDE.md`.

Alle Zahlen entstehen im Browser (`lib/engine`). Kein Konto, keine Datenbank, kein LLM.

## Starten

```bash
npm install
npm test
npx tsc --noEmit
npm run build
npx next dev -p 3001
```

Öffnen: [http://localhost:3001](http://localhost:3001)

npm-Scripts sind Windows-tauglich (kein `VAR=1 cmd`).

## Veröffentlichen

`npm run build` erzeugt einen statischen Export in `out/`. Dessen **Inhalt** kommt ins Web-Verzeichnis bei lima-city, auch die versteckte Datei `.htaccess`. Sie setzt die Sicherheits-Header, leitet `www.` auf die Domain ohne `www.` um und regelt das Caching. Danach `/impressum/` und `/datenschutz/` live kontrollieren.

## Routen

| Pfad | Inhalt |
| --- | --- |
| `/` | Startseite mit gezeichneter Ladeszene und drei Kacheln |
| `/berater` | Fragen, dann Ergebnis mit Kontrollleiste, Karten und Autobahn-Check |
| `/datenschutz` | Datenschutzerklärung |
| `/impressum` | Impressum |

## Daten

- `data/cars.de.json`: 61 E-Neuwagen in fünf Karosserieformen, Einträge ohne Quellenprüfung sind in `notes` als `UNVERIFIED` markiert
- `data/climate-months.de.json`: typische Außentemperatur in Deutschland je Monat
- `data/routes.de.json`: die Autobahn-Strecke, die der Autobahn-Check auf der Karte zeichnet

## Technik

Next.js App Router, TypeScript, Tailwind 4, Zod, Vitest. CSP, System-Fonts, Sie-Form, localStorage nur mit Opt-in. Copy-Lock: `lib/copy.ts` und `lib/engine/labels.ts`, gebunden an `intake-lock.md` und `ladekurve-lock.md`.
