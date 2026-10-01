import { z } from "zod";

// Keep this module identical in the CRM and website; the parity test enforces it.
export const PRICING_TYPES = ["apartment", "apartment-gross", "apartment-premium"] as const;
export type PricingApartmentType = typeof PRICING_TYPES[number];
export const WINTER_MIN_NIGHTS = 5;
export const LONG_STAY_MIN_NIGHTS = 5;
export const LONG_STAY_DISCOUNT_PERCENT = 5;
export const MAX_STAY_NIGHTS = 366;

export function validDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString().slice(0, 10) === value;
}
const date = z.string().refine(validDate, "Ungültiges Datum");
const money = z.number().positive().max(10_000).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001, "Höchstens zwei Nachkommastellen");
const prices = z.object({ apartment: money, "apartment-gross": money, "apartment-premium": money });
export const pricingSettingsSchema = z.object({ winterPrices: prices, portalPrices: prices });
const rateSchema = z.object({
  apartment_type: z.enum(PRICING_TYPES),
  price_per_night: money,
  included_guests: z.number().int().min(1).max(10),
  extra_person_price: z.number().min(0).max(1_000),
  valid_from: date,
  valid_to: date.nullable(),
}).refine(r => r.valid_to === null || r.valid_to >= r.valid_from, "Ungültiger Preiszeitraum");
const snapshotSchema = z.object({
  version: z.string().min(1).max(100),
  rates: z.array(rateSchema).min(3).max(2_000),
  settings: pricingSettingsSchema,
});
export type WebsitePricingSettings = z.infer<typeof pricingSettingsSchema>;
export type WebsiteRate = z.infer<typeof rateSchema>;
export type PricingSnapshot = z.infer<typeof snapshotSchema>;

export function parsePricingSnapshot(value: unknown): PricingSnapshot {
  const snapshot = snapshotSchema.parse(value);
  for (const type of PRICING_TYPES) {
    if (!snapshot.rates.some(r => r.apartment_type === type && r.valid_from <= "2000-01-01" && r.valid_to === null)) {
      throw new Error(`Unbefristeter Website-Grundpreis fehlt: ${type}`);
    }
  }
  const keys = snapshot.rates.map(r => `${r.apartment_type}|${r.valid_from}|${r.valid_to}`);
  if (new Set(keys).size !== keys.length) throw new Error("Doppelter Website-Preiszeitraum");
  return snapshot;
}

const basePrices = [130, 140, 170];
const periods: [string, string, number[]][] = [
  ["2026-09-07", "2026-10-01", [115, 120, 145]],
  ["2026-10-02", "2026-10-31", [130, 140, 170]],
  ["2026-11-01", "2026-12-20", [95, 105, 135]],
  ["2026-12-21", "2027-01-03", [140, 150, 180]],
  ["2027-01-04", "2027-03-14", [95, 105, 135]],
];
export const DEFAULT_WEBSITE_PRICING: PricingSnapshot = {
  version: "legacy-2026-27",
  rates: PRICING_TYPES.flatMap((type, i) => [
    { apartment_type: type, price_per_night: basePrices[i], included_guests: i === 2 ? 4 : 2, extra_person_price: 5, valid_from: "2000-01-01", valid_to: null },
    ...periods.map(([from, to, amounts]) => ({ apartment_type: type, price_per_night: amounts[i], included_guests: i === 2 ? 4 : 2, extra_person_price: 5, valid_from: from, valid_to: to })),
  ]),
  settings: {
    winterPrices: { apartment: 80, "apartment-gross": 90, "apartment-premium": 110 },
    portalPrices: { apartment: 140, "apartment-gross": 150, "apartment-premium": 180 },
  },
};

export function rateForNight(snapshot: PricingSnapshot, type: PricingApartmentType, night: string): WebsiteRate {
  const matches = snapshot.rates.filter(r => r.apartment_type === type && r.valid_from <= night && (r.valid_to === null || night <= r.valid_to));
  matches.sort((a, b) => b.valid_from.localeCompare(a.valid_from) || (a.valid_to ?? "9999-12-31").localeCompare(b.valid_to ?? "9999-12-31"));
  if (!matches[0]) throw new Error(`Kein Website-Preis für ${type} am ${night}`);
  return matches[0];
}

export function isWinterNight(date: Date): boolean {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  if ((month === 12 && day >= 21) || (month === 1 && day <= 3)) return false;
  return month === 11 || month === 12 || month === 1 || month === 2 || (month === 3 && day <= 14);
}
export function winterStay(checkIn: string, nights: number): boolean {
  if (!validDate(checkIn) || !Number.isInteger(nights) || nights < WINTER_MIN_NIGHTS || nights > MAX_STAY_NIGHTS) return false;
  const current = new Date(checkIn);
  for (let i = 0; i < nights; i++) {
    if (!isWinterNight(current)) return false;
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return true;
}

export function calculateStay(snapshot: PricingSnapshot, type: PricingApartmentType, checkIn: string, nights: number, guests: number | null) {
  if (!validDate(checkIn) || !Number.isInteger(nights) || nights < 1 || nights > MAX_STAY_NIGHTS || (guests !== null && (!Number.isInteger(guests) || guests < 0 || guests > 30))) {
    throw new Error("Ungültiger Aufenthalt");
  }
  const winter = winterStay(checkIn, nights);
  const segments: { rate: number; nights: number; label: string }[] = [];
  const current = new Date(checkIn);
  let accommodation = 0;
  let extras = 0;
  for (let i = 0; i < nights; i++) {
    const night = current.toISOString().slice(0, 10);
    const row = rateForNight(snapshot, type, night);
    const rate = winter ? snapshot.settings.winterPrices[type] : row.price_per_night;
    accommodation += rate;
    extras += Math.max(0, (guests ?? row.included_guests) - row.included_guests) * row.extra_person_price;
    const last = segments.at(-1);
    if (last?.rate === rate) last.nights++;
    else segments.push({ rate, nights: 1, label: winter ? "Winterpreis" : "Saisonpreis" });
    current.setUTCDate(current.getUTCDate() + 1);
  }
  const totalPrice = Math.round((accommodation + extras + Number.EPSILON) * 100) / 100;
  const discountPercent = winter || nights < LONG_STAY_MIN_NIGHTS ? 0 : LONG_STAY_DISCOUNT_PERCENT;
  const discount = Math.round(totalPrice * discountPercent / 100);
  const totalAfterDiscount = Math.round((totalPrice - discount) * 100) / 100;
  const portalTotal = Math.round((snapshot.settings.portalPrices[type] * nights + extras) * 100) / 100;
  const basePrice = Math.round(accommodation / nights * 100) / 100;
  const extraPersonFee = Math.round(extras / nights * 100) / 100;
  return { basePrice, extraPersonFee, totalPerNight: basePrice + extraPersonFee, nights, totalPrice, discount, discountPercent, totalAfterDiscount, pricingMode: winter ? "winter" as const : "normal" as const, segments, isMixedSeason: segments.length > 1, portalTotal, savings: Math.max(0, Math.round((portalTotal - totalAfterDiscount) * 100) / 100) };
}

/** Marketing describes effective rates inside the website's 12-month booking window. */
export function effectiveFutureRates(snapshot: PricingSnapshot, type: PricingApartmentType, from?: string): WebsiteRate[] {
  if (!from) {
    const parts = new Intl.DateTimeFormat("en", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const part = (name: string) => parts.find(p => p.type === name)!.value;
    from = `${part("year")}-${part("month")}-${part("day")}`;
  }
  if (!validDate(from)) throw new Error("Ungültiges Startdatum");
  const effective = new Set<WebsiteRate>();
  const current = new Date(from);
  for (let i = 0; i < MAX_STAY_NIGHTS; i++) {
    effective.add(rateForNight(snapshot, type, current.toISOString().slice(0, 10)));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return [...effective];
}

export function priceRange(snapshot: PricingSnapshot, type: PricingApartmentType, from?: string) {
  const amounts = effectiveFutureRates(snapshot, type, from).map(r => r.price_per_night);
  return { min: Math.min(...amounts), max: Math.max(...amounts) };
}
