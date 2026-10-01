# Bärenstuben Website

Buchungsanfragen und Verfügbarkeit für die fünf Ferienwohnungen in Esens.
Next.js 16, React 19 und Tailwind CSS 4; Betrieb als Node.js-Anwendung auf Hostinger.

## Lokal arbeiten

```bash
npm install
# .env.example nach .env.local kopieren und konfigurieren
npm run dev
npm run test:pricing
npm run lint
npx tsc --noEmit
npm run build
npm run start
```

Verfügbarkeit wird über die konfigurierten iCal-Feeds geladen. Anfragen werden
über SMTP an den Gastgeber und als Bestätigung an den Gast geschickt.

## Preise im CRM pflegen

Administratoren ändern im Projekt `baerenstuben-crm` unter **Einstellungen →
Festpreise pro Nacht** die Website-Grundpreise, Saisonzeiträume und
Personenaufschläge. Unter **Winterangebot und Website-Vergleichspreise** werden die Winterpreise und
Portal-Vergleichspreise gepflegt. Die Website berechnet jeden Übernachtungstag
mit den gültigen Preisen. Saisonenden sind inklusive Übernachtungsdaten.

Neue Seitenaufrufe lesen direkt den aktuellen CRM-Stand. Bereits offene Seiten
aktualisieren sich alle 30 Sekunden und beim Fensterfokus. Preisänderungen gelten
auch für Angebotskarten, Preisbedingungen und neue Anfragen. Ändert sich ein
Preis vor dem Absenden, muss der Gast den aktualisierten Preis erneut prüfen.
Der Server berechnet den Betrag selbst; vom Browser gesendete Beträge werden ignoriert.

Die Regeln für Mindestaufenthalt, 5 % Rabatt ab fünf Nächten sowie die
Weihnachtsausnahme des Winterangebots bleiben im gemeinsamen Preiskern
`src/lib/website-pricing.ts`. Dieser liegt identisch im CRM und auf der Website;
Änderungen müssen in beiden Projekten erfolgen. `npm run test:pricing` prüft
die Dateiparität, wenn der CRM-Ordner daneben liegt.

## CRM-Verbindung live einrichten

1. Im CRM-Supabase-Projekt die Migration
   `supabase/migrations/0009_website_pricing.sql` einmal ausführen. Sie erhält
   vorhandene Preise und ergänzt nur fehlende Saisonzeiträume.
2. Das aktualisierte CRM veröffentlichen.
3. Auf dem Website-Host `CRM_SUPABASE_URL` und `CRM_SUPABASE_ANON_KEY` setzen.
   Die Werte entsprechen der öffentlichen URL und dem anonymen Schlüssel des CRM.
   **Keinen Service-Role-Schlüssel verwenden.**
4. Die Website mit `npm run build` bauen und mit `npm run start` starten.
5. `/api/pricing` prüfen und einen Website-Preis im CRM ändern: Nach spätestens
   30 Sekunden muss eine offene Website-Seite denselben Preis zeigen.

Die öffentliche Datenbankschnittstelle `get_website_pricing()` liefert
ausschließlich Preisdaten. Gäste-, Buchungs- und Finanzdaten werden nicht veröffentlicht.
Gespeicherte Buchungspreise bleiben bei einer Preisänderung erhalten; die
ausdrückliche CRM-Neuberechnung kann sie nach Vorschau aktualisieren.

Ohne beide CRM-Variablen gelten die bisherigen eingebauten Website-Preise.
Bei einer unvollständigen Konfiguration oder einem Ausfall einer eingerichteten
Verbindung zeigt ein neuer Seitenaufruf einen Fehler. Auf einer bereits offenen
Seite bleibt der letzte geprüfte Stand mit einem Hinweis sichtbar; die
Anfrage-API akzeptiert während des Ausfalls keine neue Anfrage (HTTP 503).
