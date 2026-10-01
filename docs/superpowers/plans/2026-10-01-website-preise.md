# CRM-Preise auf der Website

Ziel: Die bestehende CRM-Preisverwaltung veröffentlicht Website-Preise, einschließlich Saison- und Winterpreisen. Beide Anwendungen rechnen jede Übernachtung mit denselben Regeln. Der Nutzer hat die beschriebene Umsetzung mit „umsetzen“ beauftragt; die Arbeit erfolgt in den beiden vorhandenen Checkouts.

## Schnittstelle und Entscheidungen

- `get_website_pricing()` liefert ausschließlich Website-Nachtpreise, Personenregeln sowie Winter- und Portalvergleichspreise als versioniertes JSON. Gast-, Buchungs- und Finanzdaten bleiben geschützt. Kein Service-Role-Schlüssel in der Website.
- Neue Tabelle `website_pricing_settings`: sechs Geldbeträge für Winter- und Vergleichspreise; vorhandene Adminrechte schützen Änderungen. Bestehende `channel_prices` bleiben die Quelle für normale Preise und Zeiträume.
- Preislogik `src/lib/website-pricing.ts` liegt identisch in beiden eigenständig deploybaren Projekten; ein Test vergleicht beide Dateien. Die festen Angebotsregeln bleiben 5 Nächte, 5 % Rabatt, Winter 01.11.–14.03. außer 21.12.–03.01.
- Neue Besucher erhalten aktuelle Preise ohne Servercache. Offene Seiten laden spätestens nach 30 Sekunden oder beim Fensterfokus erneut. Bei temporärem Abruffehler bleibt der letzte geprüfte Stand sichtbar; vor dem Senden prüft der Server die Preisversion und berechnet den Preis neu.
- Ohne konfigurierte CRM-Verbindung gelten die bisherigen Website-Preise. Bei konfigurierter, ausgefallener Verbindung werden keine eingebauten Ersatzpreise für neue Anfragen verwendet.
- Bestehende gespeicherte Buchungspreise ändern sich nur über die bereits vorhandene ausdrückliche Neuberechnung. Die Datenmigration überschreibt keine bestehenden Preise und ergänzt fehlende Saisonzeiträume aus der Website.

## Umsetzung

1. Tests für Saisonwechsel, aktualisierte Beträge, Weihnachtsausnahme, nächtliche Personenaufschläge, ungültige Daten und Parität schreiben, rot ausführen; gemeinsamen Preiskern implementieren und grün prüfen.
2. SQL-Migration, geschützte CRM-Einstellungen und nächtliche CRM-Berechnung ergänzen; keine automatische Änderung gespeicherter Buchungen.
3. Website-Loader, Preis-API und Preis-Kontext ergänzen; alle Preisangaben dynamisch rendern. Anfrage vor E-Mail-Versand anhand ISO-Daten, Wohnungseinheiten und aktueller Preisversion auf dem Server berechnen.
4. Tests, TypeScript, Lint und Produktions-Builds beider Anwendungen ausführen; unabhängige Codeprüfung und erforderliche Korrekturen abschließen. Einrichtung und Veröffentlichung dokumentieren.

## Prüfschwerpunkte

Saisonwechsel, Weihnachten/Silvester, unterschiedliche Saisonsegmentierung mehrerer Wohnungen, Preisänderung bei offener Anfrage, unveränderte bestehende Buchungen, gesperrte Adminaktionen, fehlerhafte Konfiguration sowie ausschließlich öffentliche Preisdaten in der Schnittstelle.

## Stand

- Implementiert in beiden Projekten. Der Nutzer hat Datenbankmigration, CRM-Anbindung und Veröffentlichung ausdrücklich freigegeben.
- Preiskern und Regressionen zunächst rot geprüft, anschließend grün. CRM: 97 Tests in 12 Dateien. Website: 100 bestehende Preisprüfungen plus veröffentlichte Preise, Servervalidierung, Gruppenrundung, Auswahlstabilität und Dateiparität.
- Alle neun Datenbankmigrationen in isoliertem PostgreSQL (PGlite) ausgeführt: bestehender Oktoberpreis bleibt erhalten, RPC veröffentlicht nur die vorgesehenen Felder, anonyme Nutzer sehen weder Testgast noch Testbuchung und können nicht schreiben; Viewer können Angebote nicht ändern, Admins können sie ändern.
- TypeScript, ESLint und Produktions-Builds beider Anwendungen bestanden. Homepage und Preis-API sind dynamisch.
- Unabhängige Architektur-, React- und TypeScript-Prüfung abgeschlossen; gefundene Fehler behoben und nachgeprüft. Notizkorrekturen erhalten gespeicherte Preise, Split kalkuliert vor dem Schreiben, Neuberechnung erhält Personenaufschläge.
- Browserprüfung mit isolierter Preisdatenbank bestanden: Winterpreisänderung ohne Neuladen, Angebotsbedingungen und Preiskarten, konkrete Anfrage von 220 € auf 400 € bei erhaltener Wohnungsauswahl, Fehlerantworten 400/409/503 vor E-Mail-Versand, Wiederholen nach Preisausfall und Aktualisierung ohne `AbortSignal.any`.
- CRM-Browserprüfung in geschützter lokaler Demo bestanden: sechs Angebotsfelder, Dezimaleingabe, mobile Darstellung, Schreibschutz und Weiterleitung für Viewer.
- Einrichtungs- und Veröffentlichungsreihenfolge in beiden READMEs dokumentiert, Website-Konfiguration in `.env.example` ergänzt. Live-Schaltung erfordert Migration 0009, neue Website-Umgebungsvariablen und Veröffentlichung beider Anwendungen.
- Migration 0009 wurde am 01.10.2026 nach einem Test mit der Kopie aller tatsächlichen Website-Preise in der Produktionsdatenbank angewandt. Alle 18 vorhandenen Preise und alle 142 gespeicherten Buchungen sind unverändert. Öffentliche Preis-RPC antwortet mit HTTP 200 und nur Preisdaten.
- Veröffentlichung wartet derzeit auf den Zugriff auf das Hostinger-Konto mit `xn--brenstuben-q5a.de` und `crm.xn--brenstuben-q5a.de`. Die aktuell verbundene API gehört zu einem anderen Konto; der Nutzer hat dies bestätigt.
