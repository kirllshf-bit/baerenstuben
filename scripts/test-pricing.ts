/**
 * Pure-Function-Tests für die Winter-Preislogik.
 * Ausführen mit: npx tsx scripts/test-pricing.ts
 *
 * Testet calculatePrice(), isWinterStay() und findCombinations() gegen die
 * mit dem Eigentümer abgestimmten Geschäftsregeln (Winter 01.11.–15.03., ab 5 Nächten,
 * 80/90/110 €, kein zusätzlicher 5%-Rabatt im Winter; Personen-Aufpreis gilt weiter).
 */

import { calculatePrice, isWinterStay } from "../src/lib/apartments";
import { findCombinations } from "../src/lib/combinations";
import { differenceInCalendarDays } from "date-fns";

let passed = 0;
let failed = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}\n      erwartet: ${JSON.stringify(expected)}\n      erhalten: ${JSON.stringify(actual)}`);
  }
}

function nights(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(new Date(checkOut), new Date(checkIn));
}

// Hilfsfunktion: berechnet Preis für ein einzelnes "apartment" mit gegebenem Zeitraum
function priceFor(checkIn: string, checkOut: string, adults: number, children: number, type: Parameters<typeof calculatePrice>[0] = "apartment") {
  const n = nights(checkIn, checkOut);
  const winter = isWinterStay(checkIn, checkOut, n);
  return calculatePrice(type, adults, children, n, winter);
}

console.log("\n=== isWinterStay() ===");
check("28.12.26→04.01.27 (jahresübergreifend, 7N)", isWinterStay("2026-12-28", "2027-01-04", 7), true);
check("01.11.26→06.11.26 (Start exakt 01.11., 5N)", isWinterStay("2026-11-01", "2026-11-06", 5), true);
check("10.03.27→15.03.27 (Abreise 15.03. erlaubt, 5N)", isWinterStay("2027-03-10", "2027-03-15", 5), true);
check("11.03.27→16.03.27 (Nacht 15→16 nicht Winter)", isWinterStay("2027-03-11", "2027-03-16", 5), false);
check("28.10.26→04.11.26 (kreuzt 01.11.)", isWinterStay("2026-10-28", "2026-11-04", 7), false);
check("20.12.26→23.12.26 (Winter aber <5N)", isWinterStay("2026-12-20", "2026-12-23", 3), false);
check("01.07.27→08.07.27 (Sommer)", isWinterStay("2027-07-01", "2027-07-08", 7), false);
check("25.02.27→02.03.27 (Feb→März, 5N)", isWinterStay("2027-02-25", "2027-03-02", 5), true);

console.log("\n=== calculatePrice() – Winter ===");
{
  // 28.12.26→04.01.27, 7N, 2 Erw., apartment: Winter 80×7=560, kein Rabatt
  const p = priceFor("2026-12-28", "2027-01-04", 2, 0);
  check("Winter 7N basePrice=80", p.basePrice, 80);
  check("Winter 7N totalPrice=560", p.totalPrice, 560);
  check("Winter 7N discount=0", p.discount, 0);
  check("Winter 7N totalAfterDiscount=560", p.totalAfterDiscount, 560);
  check("Winter 7N pricingMode=winter", p.pricingMode, "winter");
}
{
  // 10.01.27→15.01.27, 5N, 3 Erw. apartment: Winter (80+5)×5=425
  const p = priceFor("2027-01-10", "2027-01-15", 3, 0);
  check("Winter 3 Erw. extraPersonFee=5", p.extraPersonFee, 5);
  check("Winter 3 Erw. totalPerNight=85", p.totalPerNight, 85);
  check("Winter 3 Erw. totalPrice=425", p.totalPrice, 425);
  check("Winter 3 Erw. discount=0", p.discount, 0);
}
{
  // 10.03.27→15.03.27, 5N premium: Winter 110×5=550
  const p = priceFor("2027-03-10", "2027-03-15", 4, 0, "apartment-premium");
  check("Winter premium basePrice=110", p.basePrice, 110);
  check("Winter premium totalPrice=550", p.totalPrice, 550);
}

console.log("\n=== calculatePrice() – Normal & Teil-Überschneidung ===");
{
  // 11.03.27→16.03.27, 5N, 2 Erw.: Normal 130×5=650 − 5% = 617
  const p = priceFor("2027-03-11", "2027-03-16", 2, 0);
  check("Normal (kreuzt 15.03.) basePrice=130", p.basePrice, 130);
  check("Normal totalPrice=650", p.totalPrice, 650);
  check("Normal discountPercent=5", p.discountPercent, 5);
  check("Normal discount=33", p.discount, 33);
  check("Normal totalAfterDiscount=617", p.totalAfterDiscount, 617);
  check("Normal pricingMode=normal", p.pricingMode, "normal");
}
{
  // 28.10.26→04.11.26, 7N: Normal 130×7=910 − 5% = 864
  const p = priceFor("2026-10-28", "2026-11-04", 2, 0);
  check("Normal (kreuzt 01.11.) totalPrice=910", p.totalPrice, 910);
  check("Normal 7N discount=46", p.discount, 46);
  check("Normal 7N totalAfterDiscount=864", p.totalAfterDiscount, 864);
}
{
  // 20.12.26→23.12.26, 3N: Winter-Datum aber <5N → Normal, kein Rabatt
  const p = priceFor("2026-12-20", "2026-12-23", 2, 0);
  check("Winter-Datum <5N basePrice=130", p.basePrice, 130);
  check("Winter-Datum <5N totalPrice=390", p.totalPrice, 390);
  check("Winter-Datum <5N discount=0", p.discount, 0);
  check("Winter-Datum <5N pricingMode=normal", p.pricingMode, "normal");
}

console.log("\n=== Regression: calculatePrice() OHNE 5. Argument (alte Aufrufe) ===");
{
  // Sommer 7N: 130×7=910 − 5% = 864
  const p = calculatePrice("apartment", 2, 0, 7);
  check("Regression Sommer 7N totalPrice=910", p.totalPrice, 910);
  check("Regression Sommer 7N totalAfterDiscount=864", p.totalAfterDiscount, 864);
  check("Regression Sommer 7N pricingMode=normal", p.pricingMode, "normal");
}
{
  // 2N: 130×2=260, kein Rabatt
  const p = calculatePrice("apartment", 2, 0, 2);
  check("Regression 2N totalPrice=260", p.totalPrice, 260);
  check("Regression 2N discount=0", p.discount, 0);
}

console.log("\n=== findCombinations() – Winter-Combo (keine Belegung) ===");
{
  // Großgruppe im Winter: 6 Personen → mehrere Units, alle Winterpreis, kein Rabatt
  const checkIn = "2026-12-28";
  const checkOut = "2027-01-04"; // 7N
  const combos = findCombinations(6, 0, nights(checkIn, checkOut), checkIn, checkOut, {});
  const any = combos[0];
  check("Combo gefunden", combos.length > 0, true);
  if (any) {
    check("Combo pricingMode=winter", any.pricingMode, "winter");
    check("Combo discountPercent=0", any.discountPercent, 0);
    check("Combo totalAfterDiscount===totalPrice", any.totalAfterDiscount === any.totalPrice, true);
    // Jede Unit muss Winterpreis (basePrice ∈ {80,90,110}) haben
    const allWinter = any.units.every((u) => [80, 90, 110].includes(u.price.basePrice));
    check("Alle Units zum Winterpreis", allWinter, true);
  }
}
{
  // Sommer-Combo: 5% Rabatt aktiv
  const checkIn = "2027-07-01";
  const checkOut = "2027-07-08"; // 7N
  const combos = findCombinations(2, 0, nights(checkIn, checkOut), checkIn, checkOut, {});
  const any = combos[0];
  if (any) {
    check("Sommer-Combo pricingMode=normal", any.pricingMode, "normal");
    check("Sommer-Combo discountPercent=5", any.discountPercent, 5);
    check("Sommer-Combo basePrice=130", any.units[0].price.basePrice, 130);
  }
}

console.log(`\n=== Ergebnis: ${passed} bestanden, ${failed} fehlgeschlagen ===\n`);
process.exit(failed > 0 ? 1 : 0);
