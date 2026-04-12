/**
 * Build-Time Script: Fetcht iCal-Daten und generiert statische JSON-Dateien.
 * Wird vor dem Build ausgeführt: `npx tsx scripts/generate-availability.ts`
 *
 * Die generierten JSON-Dateien liegen in public/data/ und werden
 * vom Client direkt als statische Dateien geladen.
 *
 * HINWEIS: Im Produktivbetrieb (Node.js-Server) werden die Daten live über
 * die API-Route /api/availability geholt. Dieses Script dient als Fallback.
 */

import { writeFileSync, mkdirSync } from "fs";
import { addDays, addMonths, startOfDay, format, isBefore, isAfter } from "date-fns";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

interface BlockedDateRange {
  start: Date;
  end: Date;
  unitId: string;
}

type ApartmentType = "apartment" | "apartment-gross" | "apartment-premium";

const ICAL_FEEDS: { apartmentType: ApartmentType; unitId: string; envKey: string }[] = [
  // Booking
  { apartmentType: "apartment", unitId: "apt-1", envKey: "ICAL_APARTMENT_1" },
  { apartmentType: "apartment", unitId: "apt-2", envKey: "ICAL_APARTMENT_2" },
  { apartmentType: "apartment", unitId: "apt-3", envKey: "ICAL_APARTMENT_3" },
  { apartmentType: "apartment-gross", unitId: "apt-gross", envKey: "ICAL_APARTMENT_GROSS" },
  { apartmentType: "apartment-premium", unitId: "apt-premium", envKey: "ICAL_APARTMENT_PREMIUM" },
  // Airbnb (gleiche unitId → Union mit Booking)
  { apartmentType: "apartment", unitId: "apt-1", envKey: "ICAL_APARTMENT_1_AIRBNB" },
  { apartmentType: "apartment", unitId: "apt-2", envKey: "ICAL_APARTMENT_2_AIRBNB" },
  { apartmentType: "apartment", unitId: "apt-3", envKey: "ICAL_APARTMENT_3_AIRBNB" },
  { apartmentType: "apartment-gross", unitId: "apt-gross", envKey: "ICAL_APARTMENT_GROSS_AIRBNB" },
  { apartmentType: "apartment-premium", unitId: "apt-premium", envKey: "ICAL_APARTMENT_PREMIUM_AIRBNB" },
];

function parseDuration(value: string): number {
  const match = value.match(/P(?:(\d+)D)?(?:T(?:(\d+)H)?)?/);
  if (!match) return 1;
  const days = parseInt(match[1] || "0");
  const hours = parseInt(match[2] || "0");
  return Math.max(1, days + Math.ceil(hours / 24));
}

function unfoldICalLines(text: string): string[] {
  return text.replace(/\r\n[ \t]/g, "").replace(/\n[ \t]/g, "").split(/\r?\n/);
}

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
      if (trimmed.startsWith("TRANSP") && trimmed.toUpperCase().includes("TRANSPARENT")) {
        transparent = true;
      }
    }

    if (transparent) continue;
    if (!dtstart) continue;

    if (!dtend) {
      const days = duration ? parseDuration(duration) : 1;
      dtend = addDays(dtstart, days);
    }

    if (isDateValue) {
      dtstart = startOfDay(dtstart);
      dtend = startOfDay(dtend);
    }

    events.push({ start: dtstart, end: dtend });
  }

  return events;
}

function parseICalDate(value: string): Date | null {
  const clean = value.replace(/[^0-9TZ]/g, "");

  if (clean.length >= 8) {
    const year = parseInt(clean.substring(0, 4));
    const month = parseInt(clean.substring(4, 6)) - 1;
    const day = parseInt(clean.substring(6, 8));

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    if (clean.length === 8) {
      return new Date(year, month, day);
    }

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

async function fetchICalFeed(url: string, unitId: string): Promise<BlockedDateRange[]> {
  try {
    console.log(`  Fetching ${unitId}...`);
    const response = await fetch(url, {
      headers: { "User-Agent": "Baerenstuben-Calendar/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(`  ❌ ${unitId}: HTTP ${response.status}`);
      return [];
    }

    const icalText = await response.text();
    const events = parseICalEvents(icalText);
    console.log(`  ✅ ${unitId}: ${events.length} Events gefunden`);

    return events.map((event) => ({
      start: startOfDay(event.start),
      end: startOfDay(event.end),
      unitId,
    }));
  } catch (error) {
    console.error(`  ❌ ${unitId}:`, error);
    return [];
  }
}

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
      const allBlocked = unitIds.every((unitId) => {
        const ranges = rangesByUnit.get(unitId) || [];
        return isDateBlocked(currentDate, ranges);
      });
      if (allBlocked) blockedDates.push(dateStr);
    } else {
      const ranges = rangesByUnit.get(unitIds[0]) || [];
      if (isDateBlocked(currentDate, ranges)) blockedDates.push(dateStr);
    }

    currentDate = addDays(currentDate, 1);
  }

  return blockedDates;
}

async function main() {
  console.log("🏠 Bärenstuben – Verfügbarkeitsdaten generieren\n");

  // Alle Feeds fetchen, mehrere Feeds pro Unit per Union zusammenführen
  const rangesByUnit = new Map<string, BlockedDateRange[]>();

  for (const config of ICAL_FEEDS) {
    const url = process.env[config.envKey];
    if (!url) {
      // Fehlende Airbnb-Feeds sind normal, keine Warnung dafür
      if (!config.envKey.endsWith("_AIRBNB")) {
        console.warn(`  ⚠️  Env-Variable ${config.envKey} fehlt, überspringe ${config.unitId}`);
      }
      if (!rangesByUnit.has(config.unitId)) {
        rangesByUnit.set(config.unitId, []);
      }
      continue;
    }
    const ranges = await fetchICalFeed(url, config.unitId);
    const existing = rangesByUnit.get(config.unitId) || [];
    rangesByUnit.set(config.unitId, [...existing, ...ranges]);
  }

  // Output-Verzeichnis erstellen
  mkdirSync("public/data", { recursive: true });

  // Pro Apartment-Typ blockierte Tage berechnen
  const types: { type: ApartmentType; unitIds: string[]; allMustBeBlocked: boolean }[] = [
    { type: "apartment", unitIds: ["apt-1", "apt-2", "apt-3"], allMustBeBlocked: true },
    { type: "apartment-gross", unitIds: ["apt-gross"], allMustBeBlocked: false },
    { type: "apartment-premium", unitIds: ["apt-premium"], allMustBeBlocked: false },
  ];

  for (const { type, unitIds, allMustBeBlocked } of types) {
    const blockedDates = computeBlockedDates(rangesByUnit, unitIds, allMustBeBlocked);
    const output = {
      blockedDates,
      lastUpdated: new Date().toISOString(),
      apartmentType: type,
    };

    const filePath = `public/data/availability-${type}.json`;
    writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`\n📁 ${filePath}: ${blockedDates.length} blockierte Tage`);
  }

  console.log("\n✅ Fertig! Führe jetzt `npm run build` aus.\n");
}

main().catch(console.error);
