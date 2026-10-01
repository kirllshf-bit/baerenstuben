import { z } from "zod";
import { findCombinations, ALL_UNITS, MAX_TOTAL_ADULTS, MAX_TOTAL_GUESTS } from "./combinations";
import { MIN_NIGHTS } from "./apartments";
import { MAX_STAY_NIGHTS, validDate, type PricingSnapshot } from "./website-pricing";

export class InquiryPriceError extends Error {
  constructor(message: string, public status: number) { super(message); }
}
const date = z.string().refine(validDate, "Ungültiges Datum");
const inputSchema = z.object({
  name: z.string().trim().min(2).max(120), email: z.email().max(254),
  phone: z.string().trim().max(100).optional(), message: z.string().trim().max(4_000).optional(),
  checkIn: date, checkOut: date, adults: z.number().int().min(1).max(MAX_TOTAL_ADULTS),
  children: z.number().int().min(0).max(MAX_TOTAL_GUESTS), childAges: z.array(z.number().int().min(0).max(17)).max(MAX_TOTAL_GUESTS).optional(),
  unitIds: z.array(z.enum(["apt-1", "apt-2", "apt-3", "apt-gross", "apt-premium"])).min(1).max(5),
  pricingVersion: z.string().min(1).max(100), privacyConsent: z.literal(true), website: z.string().max(200).optional(),
});

export function quoteInquiry(value: unknown, snapshot: PricingSnapshot) {
  const parsed = inputSchema.safeParse(value);
  if (!parsed.success) throw new InquiryPriceError("Bitte prüfen Sie Ihre Angaben.", 400);
  const input = parsed.data;
  if (input.pricingVersion !== snapshot.version) throw new InquiryPriceError("Die Preise haben sich geändert. Bitte prüfen Sie den aktualisierten Preis und senden Sie die Anfrage erneut.", 409);
  const nights = Math.round((Date.parse(input.checkOut) - Date.parse(input.checkIn)) / 86_400_000);
  if (nights < MIN_NIGHTS || nights > MAX_STAY_NIGHTS || new Set(input.unitIds).size !== input.unitIds.length ||
      input.adults + input.children > MAX_TOTAL_GUESTS || (input.children > 0 && input.childAges?.length !== input.children)) {
    throw new InquiryPriceError("Bitte prüfen Sie Zeitraum, Personenzahl und Unterkunftsauswahl.", 400);
  }
  if (!input.unitIds.every(id => ALL_UNITS.some(unit => unit.unitId === id))) throw new InquiryPriceError("Ungültige Unterkunftsauswahl.", 400);
  const combo = findCombinations(input.adults, input.children, nights, input.checkIn, input.checkOut, {}, snapshot, input.unitIds)[0];
  if (!combo) throw new InquiryPriceError("Die ausgewählten Wohnungen passen nicht zur Personenzahl.", 400);
  const formatDate = (iso: string) => iso.split("-").reverse().join(".");
  return { ...input, checkIn: formatDate(input.checkIn), checkOut: formatDate(input.checkOut), nights,
    displayLabel: combo.displayLabel, totalPrice: combo.totalPrice, totalAfterDiscount: combo.totalAfterDiscount,
    discount: combo.discount, discountPercent: combo.discountPercent, pricingMode: combo.pricingMode, rateSegments: combo.rateSegments };
}
