import type { ApartmentType } from "@/types/apartment";

/**
 * Saisonale Nachtpreise (Saison 2026/27).
 *
 * KONVENTION: `start` und `end` bezeichnen ÜBERNACHTUNGSDATEN, beide inklusive.
 * `end: "2026-10-04"` heißt also: die Nacht 04.→05.10. gehört noch zu diesem
 * Zeitraum, der nächste Zeitraum beginnt mit der Nacht 05.→06.10.
 * Die Zeiträume schließen deshalb lückenlos aneinander an.
 *
 * Nächte außerhalb aller Zeiträume werden mit `basePrice` aus apartments.ts
 * berechnet (Hauptsaison: 130 / 140 / 170).
 *
 * PFLEGE: Diese Preise gelten mit konkreten Jahreszahlen nur für die Saison
 * 2026/27. Für die Folgesaison muss diese Liste bewusst erweitert werden –
 * danach fallen die Zeiträume automatisch auf den Basispreis zurück.
 */
export interface SeasonPeriod {
  /** Erste Übernachtung, "yyyy-MM-dd", inklusive */
  start: string;
  /** Letzte Übernachtung, "yyyy-MM-dd", inklusive */
  end: string;
  label: string;
  /** Preis pro Nacht je Wohnungskategorie */
  prices: Record<ApartmentType, number>;
}

export const SEASON_PERIODS: readonly SeasonPeriod[] = [
  {
    start: "2026-09-07",
    end: "2026-10-04",
    label: "Nachsaison September",
    prices: { apartment: 115, "apartment-gross": 115, "apartment-premium": 145 },
  },
  {
    start: "2026-10-05",
    end: "2026-10-31",
    label: "Herbstferien",
    prices: { apartment: 130, "apartment-gross": 140, "apartment-premium": 170 },
  },
  {
    start: "2026-11-01",
    end: "2026-12-20",
    label: "Nebensaison Winter",
    prices: { apartment: 95, "apartment-gross": 105, "apartment-premium": 135 },
  },
  {
    start: "2026-12-21",
    end: "2027-01-03",
    label: "Weihnachten & Silvester",
    prices: { apartment: 140, "apartment-gross": 150, "apartment-premium": 180 },
  },
  {
    start: "2027-01-04",
    end: "2027-03-14",
    label: "Nebensaison Winter",
    prices: { apartment: 95, "apartment-gross": 105, "apartment-premium": 135 },
  },
] as const;

/**
 * Hochsaison-Fenster, in dem das Winterangebot (80/90/110 ab 5 Nächten)
 * NICHT gilt – sonst würde ein 5-Nächte-Aufenthalt über Silvester statt
 * 140 €/Nacht nur 80 €/Nacht kosten.
 *
 * Bewusst als Tag/Monat (jährlich wiederkehrend) definiert, passend zum
 * ebenfalls jährlich wiederkehrenden Winterfenster in apartments.ts – im
 * Gegensatz zu SEASON_PERIODS, die jahresgenau gepflegt werden.
 */
export const PEAK_HOLIDAY_LABEL = "21.12.–03.01.";

export function isPeakHolidayNight(month: number, day: number): boolean {
  if (month === 12 && day >= 21) return true;
  if (month === 1 && day <= 3) return true; // Nacht 03.→04.01. ist die letzte
  return false;
}

/**
 * Saisonpreis für eine einzelne Übernachtung, oder `null` wenn die Nacht in
 * keinen definierten Zeitraum fällt (→ Aufrufer nutzt den Basispreis).
 *
 * Vergleich per String: "yyyy-MM-dd" ist lexikographisch sortierbar und
 * damit frei von Zeitzonen-Fallstricken.
 */
export function seasonRate(type: ApartmentType, dateStr: string): number | null {
  const period = SEASON_PERIODS.find((p) => dateStr >= p.start && dateStr <= p.end);
  return period ? period.prices[type] : null;
}

/**
 * Preisspanne einer Kategorie über alle Saisonzeiträume plus Basispreis.
 * Für die „ab … bis …"-Anzeige in der Ausstattungs-Sektion.
 */
export function seasonPriceRange(
  type: ApartmentType,
  basePrice: number
): { min: number; max: number } {
  const all = [basePrice, ...SEASON_PERIODS.map((p) => p.prices[type])];
  return { min: Math.min(...all), max: Math.max(...all) };
}
