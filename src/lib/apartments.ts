import type { ApartmentConfig, ApartmentType, ApartmentPriceCalculation, PricingMode } from "@/types/apartment";

export const APARTMENTS: ApartmentConfig[] = [
  {
    type: "apartment",
    label: "Apartment",
    size: 49,
    basePrice: 130,
    winterPrice: 80,
    includedGuests: 2,
    maxGuests: 4,
    maxAdults: 2,
    extraPersonPrice: 5,
    units: 3,
    description: "Komfortables Apartment mit allem, was Sie für einen erholsamen Aufenthalt brauchen.",
  },
  {
    type: "apartment-gross",
    label: "Apartment Groß",
    size: 58,
    basePrice: 140,
    winterPrice: 90,
    includedGuests: 2,
    maxGuests: 4,
    maxAdults: 2,
    extraPersonPrice: 5,
    units: 1,
    description: "Großzügiges Apartment mit mehr Platz für Ihren Komfort.",
  },
  {
    type: "apartment-premium",
    label: "Apartment Premium",
    size: 60,
    basePrice: 170,
    winterPrice: 110,
    includedGuests: 4,
    maxGuests: 5,
    maxAdults: 4,
    extraPersonPrice: 5,
    units: 1,
    description: "Unser Premium-Apartment – erstklassig ausgestattet mit Raum für die ganze Familie.",
  },
];

export function getApartmentConfig(type: ApartmentType): ApartmentConfig {
  const config = APARTMENTS.find((a) => a.type === type);
  if (!config) throw new Error(`Unknown apartment type: ${type}`);
  return config;
}

/**
 * Mindestaufenthalt in Nächten. Einzige Quelle für Kalender, Anfrageformular,
 * Zod-Validierung und API-Route – nicht an anderer Stelle hartkodieren.
 */
export const MIN_NIGHTS = 2;

/**
 * Check-in-/Check-out-Zeiten als Anzeigetext (FAQ, Kalender-Fußnote).
 * Weil der Vorgänger bis {CHECK_OUT_UNTIL} abgereist ist, kann am selben Tag
 * ab {CHECK_IN_FROM} bereits der nächste Gast anreisen – der Abreisetag einer
 * Buchung wird deshalb bewusst NICHT als belegt behandelt (siehe lib/ical.ts).
 */
export const CHECK_IN_FROM = "14:00 Uhr";
export const CHECK_OUT_UNTIL = "11:00 Uhr";

export const DISCOUNT_MIN_NIGHTS = 5;
export const DISCOUNT_PERCENT = 5;

/**
 * Regulärer Langzeit-Rabatt (in %) für eine gegebene Nächtezahl.
 * Einzige Quelle für die "ab 5 Nächten = 5%"-Regel – wird in calculatePrice
 * und combinations.ts wiederverwendet, um Duplizierung zu vermeiden.
 */
export function normalDiscountPercent(nights: number): number {
  return nights >= DISCOUNT_MIN_NIGHTS ? DISCOUNT_PERCENT : 0;
}

/**
 * Prüft, ob eine einzelne Übernachtung in den Winterzeitraum fällt.
 * Winterfenster: 01.11. – 14.03. (jahresübergreifend, jährlich wiederkehrend).
 * Die Nacht 14.→15.03. ist die letzte Winter-Nacht; eine Abreise am 15.03.
 * ist somit erlaubt (Abreisetag wird nicht übernachtet).
 * Verwendet UTC (wie isUnitAvailable in combinations.ts), da Datums-Strings
 * im Format "yyyy-MM-dd" als UTC-Mitternacht geparst werden.
 */
function isWinterNight(date: Date): boolean {
  const month = date.getUTCMonth() + 1; // 1..12
  const day = date.getUTCDate();
  if (month === 11 || month === 12) return true; // Nov, Dez
  if (month === 1 || month === 2) return true; // Jan, Feb
  if (month === 3 && day <= 14) return true; // Mär 1.–14. (Nacht 14→15 = letzte Winternacht)
  return false;
}

/**
 * Prüft, ob ein Aufenthalt vollständig im Winterzeitraum liegt UND ≥ 5 Nächte hat.
 * Nur dann gilt der Winterpreis. Andernfalls (auch bei Teil-Überschneidung) Normalpreis.
 *
 * @param checkIn  Anreisedatum als "yyyy-MM-dd"
 * @param checkOut Abreisedatum als "yyyy-MM-dd"
 * @param nights   Anzahl Nächte
 */
export function isWinterStay(checkIn: string, checkOut: string, nights: number): boolean {
  if (nights < DISCOUNT_MIN_NIGHTS) return false; // Winterpreis erst ab 5 Nächten
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  // Jede Nacht (Anreise bis Abreise−1) muss eine Winternacht sein.
  const current = new Date(start);
  while (current < end) {
    if (!isWinterNight(current)) return false;
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return true;
}

export function calculatePrice(
  type: ApartmentType,
  adults: number,
  children: number,
  nights: number,
  isWinter = false
): ApartmentPriceCalculation {
  const config = getApartmentConfig(type);
  const totalGuests = adults + children;
  const extraGuests = Math.max(0, totalGuests - config.includedGuests);
  const extraPersonFee = extraGuests * config.extraPersonPrice;

  // Winterpreis ersetzt den Basispreis; der Personen-Aufpreis gilt weiterhin.
  const effectiveBase = isWinter ? config.winterPrice : config.basePrice;
  const pricingMode: PricingMode = isWinter ? "winter" : "normal";

  const totalPerNight = effectiveBase + extraPersonFee;
  const totalPrice = totalPerNight * nights;

  // Im Winter kein zusätzlicher Prozent-Rabatt (Winterpreis IST der Rabatt).
  const discountPercent = isWinter ? 0 : normalDiscountPercent(nights);
  const discount = Math.round(totalPrice * discountPercent / 100);
  const totalAfterDiscount = totalPrice - discount;

  return {
    basePrice: effectiveBase,
    extraPersonFee,
    totalPerNight,
    nights,
    totalPrice,
    discount,
    discountPercent,
    totalAfterDiscount,
    pricingMode,
  };
}

/**
 * iCal Feed-Konfiguration.
 * Pro Unit können mehrere Feeds existieren (z.B. Booking + Airbnb).
 * Blockierte Zeiträume aller Feeds einer Unit werden per Union zusammengeführt:
 * → Sobald ein Feed einen Zeitraum als blockiert meldet, gilt er als nicht verfügbar.
 *
 * Airbnb-Feeds: Sobald vorhanden, neue Einträge mit separatem envKey hinzufügen,
 * z.B. { ..., unitId: "apt-1", envKey: "ICAL_APARTMENT_1_AIRBNB" }
 * Die gleiche unitId sorgt dafür, dass die Ranges automatisch zusammengeführt werden.
 */
export const ICAL_FEEDS = [
  // Booking-Feeds
  { apartmentType: "apartment" as ApartmentType, unitId: "apt-1", envKey: "ICAL_APARTMENT_1" },
  { apartmentType: "apartment" as ApartmentType, unitId: "apt-2", envKey: "ICAL_APARTMENT_2" },
  { apartmentType: "apartment" as ApartmentType, unitId: "apt-3", envKey: "ICAL_APARTMENT_3" },
  { apartmentType: "apartment-gross" as ApartmentType, unitId: "apt-gross", envKey: "ICAL_APARTMENT_GROSS" },
  { apartmentType: "apartment-premium" as ApartmentType, unitId: "apt-premium", envKey: "ICAL_APARTMENT_PREMIUM" },
  // Airbnb-Feeds (gleiche unitId → Union mit Booking)
  { apartmentType: "apartment" as ApartmentType, unitId: "apt-1", envKey: "ICAL_APARTMENT_1_AIRBNB" },
  { apartmentType: "apartment" as ApartmentType, unitId: "apt-2", envKey: "ICAL_APARTMENT_2_AIRBNB" },
  { apartmentType: "apartment" as ApartmentType, unitId: "apt-3", envKey: "ICAL_APARTMENT_3_AIRBNB" },
  { apartmentType: "apartment-gross" as ApartmentType, unitId: "apt-gross", envKey: "ICAL_APARTMENT_GROSS_AIRBNB" },
  { apartmentType: "apartment-premium" as ApartmentType, unitId: "apt-premium", envKey: "ICAL_APARTMENT_PREMIUM_AIRBNB" },
];
