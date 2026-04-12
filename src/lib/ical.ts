import { addDays, addMonths, startOfDay, format, isBefore, isAfter } from "date-fns";
import { ICAL_FEEDS } from "./apartments";
import type { ApartmentType } from "@/types/apartment";

interface BlockedDateRange {
  start: Date;
  end: Date;
  unitId: string;
}

interface CachedData {
  blockedRanges: BlockedDateRange[];
  fetchedAt: number;
}

const cache = new Map<string, CachedData>();
const CACHE_TTL_MS = 60 * 1000; // 1 Minute

/** Cache manuell leeren – erzwingt sofortigen Re-Fetch beim nächsten Aufruf */
export function clearAvailabilityCache() {
  cache.clear();
}

/**
 * Parst eine iCal DURATION (z.B. "P2D", "P1DT12H", "PT24H") in Tage (mind. 1).
 */
function parseDuration(value: string): number {
  const match = value.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?)?/);
  if (!match) return 1;
  const days = parseInt(match[1] || "0");
  const hours = parseInt(match[2] || "0");
  return Math.max(1, days + Math.ceil(hours / 24));
}

/**
 * Parst alle VEVENTs aus einem iCal-Feed.
 * Blockierungslogik:
 * - Jedes VEVENT blockiert standardmäßig (OPAQUE)
 * - Nur Events mit TRANSP:TRANSPARENT werden ignoriert
 * - Kein Filtern nach SUMMARY — auch manuelle Sperrungen zählen
 */
function parseICalEvents(icalText: string): { start: Date; end: Date }[] {
  const events: { start: Date; end: Date }[] = [];
  const blocks = icalText.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    if (!block) continue;

    let dtstart: Date | null = null;
    let dtend: Date | null = null;
    let duration: string | null = null;
    let transparent = false;
    let isDateValue = false;

    const lines = unfoldICalLines(block);
    for (const line of lines) {
      const trimmed = line.trim();

      // DTSTART: alle Varianten — DTSTART:, DTSTART;VALUE=DATE:, DTSTART;TZID=...:
      if (trimmed.startsWith("DTSTART")) {
        isDateValue = trimmed.includes("VALUE=DATE") && !trimmed.includes("VALUE=DATE-TIME");
        const value = trimmed.split(":").pop()?.trim();
        if (value) dtstart = parseICalDate(value);
      }
      if (trimmed.startsWith("DTEND")) {
        const value = trimmed.split(":").pop()?.trim();
        if (value) dtend = parseICalDate(value);
      }
      if (trimmed.startsWith("DURATION")) {
        const value = trimmed.split(":").pop()?.trim();
        if (value) duration = value;
      }
      // TRANSP:TRANSPARENT → Event blockiert nicht
      if (trimmed.startsWith("TRANSP") && trimmed.toUpperCase().includes("TRANSPARENT")) {
        transparent = true;
      }
    }

    // Transparente Events überspringen — die blockieren nicht
    if (transparent) continue;
    if (!dtstart) continue;

    // DTEND fehlt → aus DURATION berechnen, oder 1 Tag als Fallback
    if (!dtend) {
      const days = duration ? parseDuration(duration) : 1;
      dtend = addDays(dtstart, days);
    }

    // Für All-Day-Events normalisieren (Beginn = startOfDay)
    if (isDateValue) {
      dtstart = startOfDay(dtstart);
      dtend = startOfDay(dtend);
    }

    events.push({ start: dtstart, end: dtend });
  }

  return events;
}

/**
 * iCal Line Unfolding: Zeilen die mit Whitespace beginnen gehören zur vorherigen Zeile.
 * RFC 5545 §3.1
 */
function unfoldICalLines(text: string): string[] {
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

function parseICalDate(value: string): Date | null {
  // Format: 20260415 or 20260415T140000Z or 20260415T140000
  const clean = value.replace(/[^0-9TZ]/g, "");

  if (clean.length >= 8) {
    const year = parseInt(clean.substring(0, 4));
    const month = parseInt(clean.substring(4, 6)) - 1;
    const day = parseInt(clean.substring(6, 8));

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    // Für DATE-Werte (ganztägig) nur das Datum nehmen
    if (clean.length === 8) {
      return new Date(year, month, day);
    }

    // Für DATETIME-Werte
    if (clean.includes("T") && clean.length >= 15) {
      const hours = parseInt(clean.substring(9, 11));
      const minutes = parseInt(clean.substring(11, 13));
      const seconds = parseInt(clean.substring(13, 15));

      if (clean.endsWith("Z")) {
        return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
      }
      return new Date(year, month, day, hours, minutes, seconds);
    }

    return new Date(year, month, day);
  }

  return null;
}

/**
 * Fetcht einen einzelnen iCal-Feed und gibt die blockierten Zeiträume zurück.
 */
async function fetchICalFeed(url: string, unitId: string): Promise<BlockedDateRange[]> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Baerenstuben-Calendar/1.0" },
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`iCal fetch failed for ${unitId}: HTTP ${response.status}`);
      return [];
    }

    const icalText = await response.text();
    const events = parseICalEvents(icalText);

    return events.map((event) => ({
      start: startOfDay(event.start),
      end: startOfDay(event.end),
      unitId,
    }));
  } catch (error) {
    console.error(`iCal fetch error for ${unitId}:`, error);
    return [];
  }
}

/**
 * Prüft ob ein bestimmtes Datum in einem der gegebenen Zeiträume liegt.
 * DTEND ist exklusiv (RFC 5545): ein Event von 14.–16. blockiert den 14. und 15., nicht den 16.
 */
function isDateBlocked(date: Date, ranges: BlockedDateRange[]): boolean {
  const day = startOfDay(date);
  return ranges.some(
    (r) =>
      (isAfter(day, r.start) || day.getTime() === r.start.getTime()) &&
      isBefore(day, r.end)
  );
}

function computeBlockedDates(
  rangesByUnit: Map<string, BlockedDateRange[]>,
  unitIds: string[],
  allMustBeBlocked: boolean
): string[] {
  const today = startOfDay(new Date());
  const endWindow = addMonths(today, 12);
  const blockedDates: string[] = [];

  let currentDate = today;
  while (isBefore(currentDate, endWindow)) {
    const dateStr = format(currentDate, "yyyy-MM-dd");

    if (allMustBeBlocked) {
      // Für den Typ "apartment": Alle 3 Einheiten müssen blockiert sein
      const allBlocked = unitIds.every((unitId) => {
        const ranges = rangesByUnit.get(unitId) || [];
        return isDateBlocked(currentDate, ranges);
      });
      if (allBlocked) blockedDates.push(dateStr);
    } else {
      // Für einzelne Einheiten: blockiert wenn die eine Einheit blockiert ist
      const ranges = rangesByUnit.get(unitIds[0]) || [];
      if (isDateBlocked(currentDate, ranges)) blockedDates.push(dateStr);
    }

    currentDate = addDays(currentDate, 1);
  }

  return blockedDates;
}

export async function getAvailability(
  apartmentType: ApartmentType
): Promise<{ blockedDates: string[]; lastUpdated: string }> {
  const configs = ICAL_FEEDS.filter((f) => f.apartmentType === apartmentType);
  const unitIds = [...new Set(configs.map((c) => c.unitId))];

  // Cache prüfen
  const cacheKey = apartmentType;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    const rangesByUnit = new Map<string, BlockedDateRange[]>();
    for (const unitId of unitIds) {
      rangesByUnit.set(
        unitId,
        cached.blockedRanges.filter((r) => r.unitId === unitId)
      );
    }
    const allMustBeBlocked = unitIds.length > 1;
    const blockedDates = computeBlockedDates(rangesByUnit, unitIds, allMustBeBlocked);

    return {
      blockedDates,
      lastUpdated: new Date(cached.fetchedAt).toISOString(),
    };
  }

  // Alle Feeds parallel fetchen (mehrere Feeds pro Unit werden per Union zusammengeführt)
  const results = await Promise.allSettled(
    configs.map((config) => {
      const url = process.env[config.envKey];
      if (!url) {
        console.warn(`Missing env var: ${config.envKey}`);
        return Promise.resolve([]);
      }
      return fetchICalFeed(url, config.unitId);
    })
  );

  const rangesByUnit = new Map<string, BlockedDateRange[]>();
  const allRanges: BlockedDateRange[] = [];

  results.forEach((result, index) => {
    const unitId = configs[index].unitId;
    const existing = rangesByUnit.get(unitId) || [];

    if (result.status === "fulfilled") {
      // Union: Ranges aus diesem Feed zu den bestehenden Ranges der Unit hinzufügen
      const combined = [...existing, ...result.value];
      rangesByUnit.set(unitId, combined);
      allRanges.push(...result.value);
    } else {
      console.error(`Failed to fetch iCal for ${unitId}:`, result.reason);
      if (cached) {
        const cachedRanges = cached.blockedRanges.filter((r) => r.unitId === unitId);
        const combined = [...existing, ...cachedRanges];
        rangesByUnit.set(unitId, combined);
      } else if (!rangesByUnit.has(unitId)) {
        rangesByUnit.set(unitId, []);
      }
    }
  });

  // Cache aktualisieren
  cache.set(cacheKey, {
    blockedRanges: allRanges,
    fetchedAt: Date.now(),
  });

  const allMustBeBlocked = unitIds.length > 1;
  const blockedDates = computeBlockedDates(rangesByUnit, unitIds, allMustBeBlocked);

  return {
    blockedDates,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Gibt pro Unit die blockierten Tage zurück (nicht zusammengeführt).
 * Wird für die Gruppen-Kombinations-Suche benötigt.
 */
export async function getAllUnitsAvailability(): Promise<{
  units: Record<string, { blockedDates: string[]; apartmentType: ApartmentType }>;
  lastUpdated: string;
}> {
  // Alle 3 Apartment-Typen parallel fetchen (nutzt den bestehenden Cache)
  const types: ApartmentType[] = ["apartment", "apartment-gross", "apartment-premium"];
  await Promise.all(types.map((t) => getAvailability(t)));

  const today = startOfDay(new Date());
  const endWindow = addMonths(today, 12);

  // Jetzt alle Caches auslesen und pro Unit aufschlüsseln
  const units: Record<string, { blockedDates: string[]; apartmentType: ApartmentType }> = {};

  for (const type of types) {
    const configs = ICAL_FEEDS.filter((f) => f.apartmentType === type);
    const cached = cache.get(type);
    if (!cached) continue;

    const unitIds = [...new Set(configs.map((c) => c.unitId))];
    for (const unitId of unitIds) {
      const ranges = cached.blockedRanges.filter((r) => r.unitId === unitId);
      const blockedDates: string[] = [];

      let currentDate = today;
      while (isBefore(currentDate, endWindow)) {
        if (isDateBlocked(currentDate, ranges)) {
          blockedDates.push(format(currentDate, "yyyy-MM-dd"));
        }
        currentDate = addDays(currentDate, 1);
      }

      units[unitId] = { blockedDates, apartmentType: type };
    }
  }

  return { units, lastUpdated: new Date().toISOString() };
}
