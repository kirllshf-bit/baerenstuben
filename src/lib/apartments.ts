import type { ApartmentConfig, ApartmentType, ApartmentPriceCalculation } from "@/types/apartment";

export const APARTMENTS: ApartmentConfig[] = [
  {
    type: "apartment",
    label: "Apartment",
    size: 49,
    basePrice: 130,
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

const DISCOUNT_MIN_NIGHTS = 5;
const DISCOUNT_PERCENT = 5;

export function calculatePrice(
  type: ApartmentType,
  adults: number,
  children: number,
  nights: number
): ApartmentPriceCalculation {
  const config = getApartmentConfig(type);
  const totalGuests = adults + children;
  const extraGuests = Math.max(0, totalGuests - config.includedGuests);
  const extraPersonFee = extraGuests * config.extraPersonPrice;
  const totalPerNight = config.basePrice + extraPersonFee;
  const totalPrice = totalPerNight * nights;

  const discountPercent = nights >= DISCOUNT_MIN_NIGHTS ? DISCOUNT_PERCENT : 0;
  const discount = Math.round(totalPrice * discountPercent / 100);
  const totalAfterDiscount = totalPrice - discount;

  return {
    basePrice: config.basePrice,
    extraPersonFee,
    totalPerNight,
    nights,
    totalPrice,
    discount,
    discountPercent,
    totalAfterDiscount,
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
