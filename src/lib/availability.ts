import { addDays, format, startOfDay } from "date-fns";
import { MIN_NIGHTS } from "./apartments";

/** Blockierte Tage einer einzelnen physischen Einheit. */
export interface UnitBlockedDates {
  blockedDates: string[];
}

/** Verfügbarkeitsfenster der API (12 Monate). */
export const AVAILABILITY_WINDOW_DAYS = 366;

/**
 * Tage, an denen keine Anreise möglich ist.
 *
 * Der zusammengeführte Kalender zeigt einen Tag nur dann als belegt, wenn ALLE
 * Einheiten belegt sind. Das reicht als Buchbarkeits-Signal nicht aus: Ist am
 * 4. nur Einheit A frei und am 5. nur Einheit B, sieht der Tag frei aus –
 * gebucht werden kann er trotzdem nicht, weil ein Aufenthalt in EINER Einheit
 * stattfindet und der Mindestaufenthalt {minNights} Nächte beträgt.
 *
 * Ein Tag ist als Anreisetag nur dann gültig, wenn mindestens eine Einheit ab
 * diesem Tag {minNights} Nächte am Stück frei hat.
 *
 * Nur für die Anreise relevant – als Abreisetag bleiben solche Tage gültig,
 * weil dort lediglich ausgecheckt wird.
 */
export function findUnbookableStartDates(
  units: Record<string, UnitBlockedDates>,
  from: Date,
  minNights: number = MIN_NIGHTS,
  windowDays: number = AVAILABILITY_WINDOW_DAYS
): Set<string> {
  const unbookable = new Set<string>();
  const blockedPerUnit = Object.values(units).map((u) => new Set(u.blockedDates));
  if (blockedPerUnit.length === 0) return unbookable;

  const start = startOfDay(from);
  for (let offset = 0; offset < windowDays; offset++) {
    const day = addDays(start, offset);
    const nights = Array.from({ length: minNights }, (_, i) =>
      format(addDays(day, i), "yyyy-MM-dd")
    );

    const someUnitFree = blockedPerUnit.some((blocked) =>
      nights.every((night) => !blocked.has(night))
    );
    if (!someUnitFree) unbookable.add(format(day, "yyyy-MM-dd"));
  }

  return unbookable;
}

/**
 * Mögliche Abreisetage für eine gegebene Anreise.
 *
 * Ein Aufenthalt findet in EINER Einheit statt: Vom Anreisetag an müssen dort
 * alle Nächte bis zur Vornacht der Abreise frei sein.
 *
 * Der Abreisetag selbst darf belegt sein – dort wird nur bis Check-out-Zeit
 * ausgecheckt, während der neue Gast erst am Nachmittag anreist. Ein iCal-
 * Eintrag, der an diesem Tag beginnt, sperrt also die Abreise nicht.
 */
export function findValidCheckOutDates(
  units: Record<string, UnitBlockedDates>,
  checkIn: Date,
  minNights: number = MIN_NIGHTS,
  windowDays: number = AVAILABILITY_WINDOW_DAYS
): Set<string> {
  const validCheckOuts = new Set<string>();
  const start = startOfDay(checkIn);

  for (const unit of Object.values(units)) {
    const blocked = new Set(unit.blockedDates);

    // Freie Nächte am Stück ab dem Anreisetag zählen
    let freeNights = 0;
    while (freeNights < windowDays) {
      const night = format(addDays(start, freeNights), "yyyy-MM-dd");
      if (blocked.has(night)) break;
      freeNights++;
    }

    // Abreise ist nach minNights bis freeNights Nächten möglich
    for (let nights = minNights; nights <= freeNights; nights++) {
      validCheckOuts.add(format(addDays(start, nights), "yyyy-MM-dd"));
    }
  }

  return validCheckOuts;
}
