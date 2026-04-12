import { APARTMENTS, calculatePrice } from "./apartments";
import type { ApartmentType, ApartmentPriceCalculation } from "@/types/apartment";

/** Eine einzelne Einheit in einer Kombination */
export interface UnitAllocation {
  unitId: string;
  apartmentType: ApartmentType;
  label: string;
  size: number;
  adults: number;
  children: number;
  price: ApartmentPriceCalculation;
}

/** Eine gültige Kombination von Apartments für die Gruppe */
export interface ApartmentCombination {
  units: UnitAllocation[];
  /** Anzeige-Label: z.B. "Apartment + Apartment Groß" (nie "Apartment 1") */
  displayLabel: string;
  totalPrice: number;
  totalAfterDiscount: number;
  discount: number;
  discountPercent: number;
  nights: number;
}

/**
 * Alle physischen Einheiten.
 * Die 3 identischen Apartments (49m²) werden intern getrennt gehalten,
 * im Frontend aber nur als Typ "Apartment" angezeigt.
 */
const ALL_UNITS = [
  { unitId: "apt-1", type: "apartment" as ApartmentType, size: 49 },
  { unitId: "apt-2", type: "apartment" as ApartmentType, size: 49 },
  { unitId: "apt-3", type: "apartment" as ApartmentType, size: 49 },
  { unitId: "apt-gross", type: "apartment-gross" as ApartmentType, size: 58 },
  { unitId: "apt-premium", type: "apartment-premium" as ApartmentType, size: 60 },
];

/** Anzeige-Labels pro Typ (nie "Apartment 1/2/3") */
const TYPE_LABELS: Record<ApartmentType, string> = {
  apartment: "Apartment",
  "apartment-gross": "Apartment Groß",
  "apartment-premium": "Apartment Premium",
};

const TYPE_SIZES: Record<ApartmentType, number> = {
  apartment: 49,
  "apartment-gross": 58,
  "apartment-premium": 60,
};

// Maximale Gäste über alle Einheiten hinweg (absolute Obergrenze)
export const MAX_TOTAL_GUESTS = ALL_UNITS.reduce((sum, u) => {
  const config = APARTMENTS.find((a) => a.type === u.type)!;
  return sum + config.maxGuests;
}, 0);

export const MAX_TOTAL_ADULTS = ALL_UNITS.reduce((sum, u) => {
  const config = APARTMENTS.find((a) => a.type === u.type)!;
  return sum + config.maxAdults;
}, 0);

/**
 * Prüft ob eine Unit im gegebenen Zeitraum komplett verfügbar ist.
 */
function isUnitAvailable(
  unitId: string,
  checkIn: string,
  checkOut: string,
  unitBlockedDates: Record<string, { blockedDates: string[] }>
): boolean {
  const unitData = unitBlockedDates[unitId];
  if (!unitData) return true;

  const blocked = new Set(unitData.blockedDates);
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const current = new Date(start);

  while (current < end) {
    const dateStr = current.toISOString().split("T")[0];
    if (blocked.has(dateStr)) return false;
    current.setDate(current.getDate() + 1);
  }

  return true;
}

/**
 * Verteile Gäste auf eine Menge von Units.
 */
function distributeGuests(
  unitTypes: ApartmentType[],
  totalAdults: number,
  totalChildren: number
): { adults: number; children: number }[] | null {
  const configs = unitTypes.map((t) => APARTMENTS.find((a) => a.type === t)!);

  const maxAdults = configs.reduce((s, c) => s + c.maxAdults, 0);
  const maxGuests = configs.reduce((s, c) => s + c.maxGuests, 0);
  if (totalAdults > maxAdults) return null;
  if (totalAdults + totalChildren > maxGuests) return null;

  const allocation = configs.map(() => ({ adults: 0, children: 0 }));
  let remainingAdults = totalAdults;
  let remainingChildren = totalChildren;

  for (let i = 0; i < configs.length; i++) {
    const a = Math.min(remainingAdults, configs[i].maxAdults);
    allocation[i].adults = a;
    remainingAdults -= a;
  }
  if (remainingAdults > 0) return null;

  for (let i = 0; i < configs.length; i++) {
    const used = allocation[i].adults;
    const space = configs[i].maxGuests - used;
    const c = Math.min(remainingChildren, space);
    allocation[i].children = c;
    remainingChildren -= c;
  }
  if (remainingChildren > 0) return null;

  return allocation;
}

/**
 * Erzeugt die Typ-Signatur einer Kombination für Deduplizierung.
 * z.B. "apartment+apartment-gross" oder "apartment×2"
 */
function typeSignature(types: ApartmentType[]): string {
  const counts = new Map<ApartmentType, number>();
  for (const t of types) counts.set(t, (counts.get(t) || 0) + 1);
  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([t, n]) => n > 1 ? `${t}×${n}` : t)
    .join("+");
}

/**
 * Erzeugt das Anzeige-Label für eine Kombination.
 * Nie "Apartment 1" — immer nur Typnamen.
 */
function displayLabel(types: ApartmentType[]): string {
  const counts = new Map<ApartmentType, number>();
  for (const t of types) counts.set(t, (counts.get(t) || 0) + 1);

  // Reihenfolge: apartment → apartment-gross → apartment-premium
  const order: ApartmentType[] = ["apartment", "apartment-gross", "apartment-premium"];
  return order
    .filter((t) => counts.has(t))
    .map((t) => {
      const n = counts.get(t)!;
      const label = TYPE_LABELS[t];
      return n > 1 ? `${n}× ${label}` : label;
    })
    .join(" + ");
}

/**
 * Findet sinnvolle Apartment-Kombinationen für eine Gruppe.
 *
 * Filterregeln:
 * 1. Nur Kombinationen die die Gruppe aufnehmen können
 * 2. Deduplizierung nach Typ-Signatur (apt-1+gross = apt-2+gross = "Apartment + Groß")
 * 3. Wenn Einzel-Apartments reichen → keine Multi-Combos anzeigen
 * 4. Maximal 4 Ergebnisse
 */
export function findCombinations(
  adults: number,
  children: number,
  nights: number,
  checkIn: string,
  checkOut: string,
  unitBlockedDates: Record<string, { blockedDates: string[] }>
): ApartmentCombination[] {
  // Alle verfügbaren Units ermitteln
  const availableUnits = ALL_UNITS.filter((u) =>
    isUnitAvailable(u.unitId, checkIn, checkOut, unitBlockedDates)
  );

  // Alle möglichen Subsets durchprobieren (2^n, max 32)
  const n = availableUnits.length;
  const rawResults: ApartmentCombination[] = [];

  for (let mask = 1; mask < (1 << n); mask++) {
    const selectedUnits = availableUnits.filter((_, i) => mask & (1 << i));
    const selectedTypes = selectedUnits.map((u) => u.type);

    // Kapazität prüfen
    const configs = selectedTypes.map((t) => APARTMENTS.find((a) => a.type === t)!);
    const maxGuests = configs.reduce((s, c) => s + c.maxGuests, 0);
    const maxAdults = configs.reduce((s, c) => s + c.maxAdults, 0);
    if (adults + children > maxGuests || adults > maxAdults) continue;

    // Gäste verteilen
    const allocation = distributeGuests(selectedTypes, adults, children);
    if (!allocation) continue;

    // Preis berechnen
    const unitAllocations: UnitAllocation[] = selectedUnits.map((unit, i) => {
      const price = calculatePrice(unit.type, allocation[i].adults, allocation[i].children, nights);
      return {
        unitId: unit.unitId,
        apartmentType: unit.type,
        label: TYPE_LABELS[unit.type],
        size: TYPE_SIZES[unit.type],
        adults: allocation[i].adults,
        children: allocation[i].children,
        price,
      };
    });

    const totalPrice = unitAllocations.reduce((s, u) => s + u.price.totalPrice, 0);
    const discountPercent = nights >= 5 ? 5 : 0;
    const discount = Math.round(totalPrice * discountPercent / 100);
    const totalAfterDiscount = totalPrice - discount;

    rawResults.push({
      units: unitAllocations,
      displayLabel: displayLabel(selectedTypes),
      totalPrice,
      totalAfterDiscount,
      discount,
      discountPercent,
      nights,
    });
  }

  // Sortieren: weniger Units → günstigster Preis
  rawResults.sort((a, b) => {
    if (a.units.length !== b.units.length) return a.units.length - b.units.length;
    return a.totalAfterDiscount - b.totalAfterDiscount;
  });

  // Deduplizierung: gleiche Typ-Signatur → nur die günstigste behalten
  const seen = new Set<string>();
  const deduped = rawResults.filter((combo) => {
    const sig = typeSignature(combo.units.map((u) => u.apartmentType));
    if (seen.has(sig)) return false;
    seen.add(sig);
    return true;
  });

  // Intelligente Filterung
  const singles = deduped.filter((c) => c.units.length === 1);
  const multis = deduped.filter((c) => c.units.length > 1);
  const totalGuests = adults + children;

  // Kleine Gruppe (≤3 Gäste): nur Einzel-Optionen wenn vorhanden
  if (totalGuests <= 3 && singles.length > 0) {
    return singles.slice(0, 3);
  }

  // Größere Gruppe (4+ Gäste): Singles + Multi-Combos als Alternativen
  // Singles zuerst (kompakteste Lösung), dann Multi-Combos
  return [...singles.slice(0, 2), ...multis.slice(0, 4 - Math.min(singles.length, 2))].slice(0, 4);
}
