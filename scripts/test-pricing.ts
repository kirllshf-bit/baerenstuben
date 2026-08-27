/**
 * Pure-Function-Tests für die Saison- und Winter-Preislogik.
 * Ausführen mit: npx tsx scripts/test-pricing.ts
 *
 * Getestete Geschäftsregeln (mit dem Eigentümer abgestimmt):
 *  - Saisonpreise (src/lib/seasons.ts) werden NACHTGENAU angewendet; Nächte
 *    außerhalb aller Zeiträume kosten den Basispreis (130/140/170).
 *  - Winterangebot 80/90/110 gilt 01.11.–15.03. ab 5 Nächten, wenn der GESAMTE
 *    Aufenthalt hineinfällt – ausgenommen 21.12.–03.01. (Hochsaison).
 *  - Im Winter kein zusätzlicher 5%-Rabatt; Personen-Aufpreis gilt immer weiter.
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

// Hilfsfunktion: berechnet Preis für ein einzelnes Apartment mit gegebenem Zeitraum
function priceFor(checkIn: string, checkOut: string, adults: number, children: number, type: Parameters<typeof calculatePrice>[0] = "apartment") {
  const n = nights(checkIn, checkOut);
  const winter = isWinterStay(checkIn, checkOut, n);
  return calculatePrice(type, adults, children, n, winter, checkIn);
}

console.log("\n=== isWinterStay() ===");
check("10.11.26→17.11.26 (7N, reiner Winter)", isWinterStay("2026-11-10", "2026-11-17", 7), true);
check("01.11.26→06.11.26 (Start exakt 01.11., 5N)", isWinterStay("2026-11-01", "2026-11-06", 5), true);
check("10.03.27→15.03.27 (Abreise 15.03. erlaubt, 5N)", isWinterStay("2027-03-10", "2027-03-15", 5), true);
check("11.03.27→16.03.27 (Nacht 15→16 nicht Winter)", isWinterStay("2027-03-11", "2027-03-16", 5), false);
check("28.10.26→04.11.26 (kreuzt 01.11.)", isWinterStay("2026-10-28", "2026-11-04", 7), false);
check("20.12.26→23.12.26 (Winter aber <5N)", isWinterStay("2026-12-20", "2026-12-23", 3), false);
check("01.07.27→08.07.27 (Sommer)", isWinterStay("2027-07-01", "2027-07-08", 7), false);
check("25.02.27→02.03.27 (Feb→März, 5N)", isWinterStay("2027-02-25", "2027-03-02", 5), true);

console.log("\n=== isWinterStay() – Weihnachtsausnahme 21.12.–03.01. ===");
check("28.12.26→04.01.27 (über Silvester → KEIN Winterpreis)", isWinterStay("2026-12-28", "2027-01-04", 7), false);
check("16.12.26→21.12.26 (letzte Nacht 20.12. → Winter)", isWinterStay("2026-12-16", "2026-12-21", 5), true);
check("17.12.26→22.12.26 (Nacht 21.12. ist Hochsaison)", isWinterStay("2026-12-17", "2026-12-22", 5), false);
check("04.01.27→09.01.27 (erste Nacht 04.01. → Winter)", isWinterStay("2027-01-04", "2027-01-09", 5), true);
check("03.01.27→08.01.27 (Nacht 03.01. ist Hochsaison)", isWinterStay("2027-01-03", "2027-01-08", 5), false);

console.log("\n=== calculatePrice() – Winter ===");
{
  // 10.11.26→17.11.26, 7N, 2 Erw., apartment: Winter 80×7=560, kein Rabatt
  const p = priceFor("2026-11-10", "2026-11-17", 2, 0);
  check("Winter 7N basePrice=80", p.basePrice, 80);
  check("Winter 7N totalPrice=560", p.totalPrice, 560);
  check("Winter 7N discount=0", p.discount, 0);
  check("Winter 7N totalAfterDiscount=560", p.totalAfterDiscount, 560);
  check("Winter 7N pricingMode=winter", p.pricingMode, "winter");
  check("Winter 7N isMixedSeason=false", p.isMixedSeason, false);
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

console.log("\n=== calculatePrice() – Saisonpreise (einheitlicher Zeitraum) ===");
{
  // 10.09.26→12.09.26, 2N: Nachsaison September 115×2=230, kein Rabatt
  const p = priceFor("2026-09-10", "2026-09-12", 2, 0);
  check("Nachsaison Sep basePrice=115", p.basePrice, 115);
  check("Nachsaison Sep totalPrice=230", p.totalPrice, 230);
  check("Nachsaison Sep isMixedSeason=false", p.isMixedSeason, false);
}
{
  // 10.09.26→12.09.26, 2N premium: 145×2=290
  const p = priceFor("2026-09-10", "2026-09-12", 4, 0, "apartment-premium");
  check("Nachsaison Sep premium totalPrice=290", p.totalPrice, 290);
}
{
  // 10.11.26→12.11.26, 2N: Nebensaison 95×2=190 (unter 5N → kein Winterpreis)
  const p = priceFor("2026-11-10", "2026-11-12", 2, 0);
  check("Nebensaison Nov basePrice=95", p.basePrice, 95);
  check("Nebensaison Nov totalPrice=190", p.totalPrice, 190);
  check("Nebensaison Nov pricingMode=normal", p.pricingMode, "normal");
}
{
  // 10.11.26→12.11.26, 2N gross: 105×2=210
  const p = priceFor("2026-11-10", "2026-11-12", 2, 0, "apartment-gross");
  check("Nebensaison Nov gross totalPrice=210", p.totalPrice, 210);
}
{
  // 27.12.26→01.01.27, 5N über Silvester: Hochsaison 140×5=700 − 5% = 665.
  // Entscheidend: KEIN Winterpreis, obwohl im Winterfenster und ≥5 Nächte.
  const p = priceFor("2026-12-27", "2027-01-01", 2, 0);
  check("Silvester pricingMode=normal", p.pricingMode, "normal");
  check("Silvester basePrice=140", p.basePrice, 140);
  check("Silvester totalPrice=700", p.totalPrice, 700);
  check("Silvester discount=35", p.discount, 35);
  check("Silvester totalAfterDiscount=665", p.totalAfterDiscount, 665);
}
{
  // 27.12.26→01.01.27, 5N premium: 180×5=900 − 5% = 855
  const p = priceFor("2026-12-27", "2027-01-01", 4, 0, "apartment-premium");
  check("Silvester premium totalPrice=900", p.totalPrice, 900);
  check("Silvester premium totalAfterDiscount=855", p.totalAfterDiscount, 855);
}

console.log("\n=== calculatePrice() – nachtgenau über Zeitraumgrenzen ===");
{
  // 03.10.26→05.10.26, 2N: 03.+04.10. je 115 = 230 (Grenze 04./05.10.)
  const p = priceFor("2026-10-03", "2026-10-05", 2, 0);
  check("Grenze 04.10. inklusive: totalPrice=230", p.totalPrice, 230);
  check("Grenze 04.10. isMixedSeason=false", p.isMixedSeason, false);
}
{
  // 04.10.26→06.10.26, 2N: 04.10.=115 + 05.10.=130 → 245
  const p = priceFor("2026-10-04", "2026-10-06", 2, 0);
  check("Wechsel 04.→05.10. totalPrice=245", p.totalPrice, 245);
  check("Wechsel 04.→05.10. isMixedSeason=true", p.isMixedSeason, true);
  check("Wechsel 04.→05.10. segments", p.segments.map((s) => [s.rate, s.nights]), [[115, 1], [130, 1]]);
}
{
  // 28.10.26→04.11.26, 7N: 4×130 (Okt) + 3×95 (Nov) = 805 − 5% (40) = 765
  const p = priceFor("2026-10-28", "2026-11-04", 2, 0);
  check("Kreuzt 01.11. totalPrice=805", p.totalPrice, 805);
  check("Kreuzt 01.11. discount=40", p.discount, 40);
  check("Kreuzt 01.11. totalAfterDiscount=765", p.totalAfterDiscount, 765);
  check("Kreuzt 01.11. segments", p.segments.map((s) => [s.rate, s.nights]), [[130, 4], [95, 3]]);
}
{
  // 20.12.26→23.12.26, 3N: 20.12.=95 + 21.+22.12.=140 → 375, kein Rabatt (<5N)
  const p = priceFor("2026-12-20", "2026-12-23", 2, 0);
  check("Kreuzt 21.12. totalPrice=375", p.totalPrice, 375);
  check("Kreuzt 21.12. discount=0", p.discount, 0);
  check("Kreuzt 21.12. pricingMode=normal", p.pricingMode, "normal");
  check("Kreuzt 21.12. segments", p.segments.map((s) => [s.rate, s.nights]), [[95, 1], [140, 2]]);
}
{
  // 11.03.27→16.03.27, 5N: 4×95 (bis 14.03.) + 1×130 (15.03.) = 510 − 5% (26) = 484
  const p = priceFor("2027-03-11", "2027-03-16", 2, 0);
  check("Kreuzt 15.03. totalPrice=510", p.totalPrice, 510);
  check("Kreuzt 15.03. discountPercent=5", p.discountPercent, 5);
  check("Kreuzt 15.03. discount=26", p.discount, 26);
  check("Kreuzt 15.03. totalAfterDiscount=484", p.totalAfterDiscount, 484);
  check("Kreuzt 15.03. basePrice=Ø102", p.basePrice, 102);
  check("Kreuzt 15.03. segments", p.segments.map((s) => [s.rate, s.nights]), [[95, 4], [130, 1]]);
}
{
  // Personen-Aufpreis gilt in jedem Zeitraum: 04.10.→06.10., 3 Erw.
  // (115+130) + 5×2 = 255
  const p = priceFor("2026-10-04", "2026-10-06", 3, 0);
  check("Mixed + Aufpreis extraPersonFee=5", p.extraPersonFee, 5);
  check("Mixed + Aufpreis totalPrice=255", p.totalPrice, 255);
}

console.log("\n=== Außerhalb aller Saisonzeiträume → Basispreis ===");
{
  // 01.07.27→08.07.27, 7N Sommer: 130×7=910 − 5% (46) = 864
  const p = priceFor("2027-07-01", "2027-07-08", 2, 0);
  check("Sommer basePrice=130", p.basePrice, 130);
  check("Sommer totalPrice=910", p.totalPrice, 910);
  check("Sommer totalAfterDiscount=864", p.totalAfterDiscount, 864);
}
{
  // Nach Ende der gepflegten Saison 2026/27 fällt alles auf den Basispreis
  const p = priceFor("2027-11-10", "2027-11-12", 2, 0);
  check("Folgesaison ohne Einträge basePrice=130", p.basePrice, 130);
  check("Folgesaison ohne Einträge totalPrice=260", p.totalPrice, 260);
}

console.log("\n=== Regression: calculatePrice() OHNE checkIn (alte Aufrufe) ===");
{
  // Sommer 7N: 130×7=910 − 5% = 864
  const p = calculatePrice("apartment", 2, 0, 7);
  check("Regression 7N totalPrice=910", p.totalPrice, 910);
  check("Regression 7N totalAfterDiscount=864", p.totalAfterDiscount, 864);
  check("Regression 7N pricingMode=normal", p.pricingMode, "normal");
  check("Regression 7N isMixedSeason=false", p.isMixedSeason, false);
}
{
  // 2N: 130×2=260, kein Rabatt
  const p = calculatePrice("apartment", 2, 0, 2);
  check("Regression 2N totalPrice=260", p.totalPrice, 260);
  check("Regression 2N discount=0", p.discount, 0);
}

console.log("\n=== findCombinations() (keine Belegung) ===");
{
  // Großgruppe im reinen Winter: 6 Personen → mehrere Units, alle Winterpreis, kein Rabatt
  const checkIn = "2026-11-10";
  const checkOut = "2026-11-17"; // 7N
  const combos = findCombinations(6, 0, nights(checkIn, checkOut), checkIn, checkOut, {});
  const any = combos[0];
  check("Winter-Combo gefunden", combos.length > 0, true);
  if (any) {
    check("Winter-Combo pricingMode=winter", any.pricingMode, "winter");
    check("Winter-Combo discountPercent=0", any.discountPercent, 0);
    check("Winter-Combo totalAfterDiscount===totalPrice", any.totalAfterDiscount === any.totalPrice, true);
    const allWinter = any.units.every((u) => [80, 90, 110].includes(u.price.basePrice));
    check("Alle Units zum Winterpreis", allWinter, true);
  }
}
{
  // Silvester-Combo: kein Winterpreis, stattdessen Hochsaisonpreise
  const checkIn = "2026-12-27";
  const checkOut = "2027-01-01"; // 5N
  const combos = findCombinations(6, 0, nights(checkIn, checkOut), checkIn, checkOut, {});
  const any = combos[0];
  if (any) {
    check("Silvester-Combo pricingMode=normal", any.pricingMode, "normal");
    const noWinterRates = any.units.every((u) => [140, 150, 180].includes(u.price.basePrice));
    check("Silvester-Combo Units zu Hochsaisonpreisen", noWinterRates, true);
  }
}
{
  // Combo über eine Zeitraumgrenze: Gesamtpreis == Summe der Unit-Preise
  const checkIn = "2026-10-28";
  const checkOut = "2026-11-04"; // 7N, 130→95
  const combos = findCombinations(6, 0, nights(checkIn, checkOut), checkIn, checkOut, {});
  const any = combos[0];
  if (any) {
    check("Mixed-Combo isMixedSeason=true", any.isMixedSeason, true);
    const sum = any.units.reduce((s, u) => s + u.price.totalPrice, 0);
    check("Mixed-Combo totalPrice===Summe Units", any.totalPrice, sum);
    // rateSegments summieren die Nachtsätze aller Units auf
    const segTotal = any.rateSegments.reduce((s, seg) => s + seg.rate * seg.nights, 0);
    const extras = any.units.reduce((s, u) => s + u.price.extraPersonFee * u.price.nights, 0);
    check("Mixed-Combo rateSegments + Aufpreise === totalPrice", segTotal + extras, any.totalPrice);
  }
}
{
  // Sommer-Combo: 5% Rabatt aktiv, Basispreis
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

console.log("\n=== Direktbucher-Vorteil (portalTotal / savings) ===");
{
  // Winter 7N: direkt 7×80=560, Portal 7×140=980 → 420 gespart
  const p = priceFor("2026-11-10", "2026-11-17", 2, 0);
  check("Winter portalTotal=980", p.portalTotal, 980);
  check("Winter savings=420", p.savings, 420);
}
{
  // Nebensaison 2N: direkt 190, Portal 280 → 90 gespart
  const p = priceFor("2026-11-10", "2026-11-12", 2, 0);
  check("Nebensaison portalTotal=280", p.portalTotal, 280);
  check("Nebensaison savings=90", p.savings, 90);
}
{
  // Silvester 5N: direkt 700−5%=665, Portal 700 → nur der Rabatt bleibt als Vorteil
  const p = priceFor("2026-12-27", "2027-01-01", 2, 0);
  check("Silvester portalTotal=700", p.portalTotal, 700);
  check("Silvester savings=35 (nur Langzeitrabatt)", p.savings, 35);
}
{
  // Silvester 2N ohne Rabatt: direkt 280 = Portal 280 → kein Vorteil, kein Badge
  const p = priceFor("2026-12-27", "2026-12-29", 2, 0);
  check("Silvester 2N savings=0", p.savings, 0);
}
{
  // Personen-Aufpreis steht auf beiden Seiten → Ersparnis bleibt die Nachtdifferenz
  const ohne = priceFor("2026-11-10", "2026-11-12", 2, 0);
  const mit = priceFor("2026-11-10", "2026-11-12", 3, 0);
  check("Aufpreis verändert savings nicht", mit.savings, ohne.savings);
}
{
  // Premium Nebensaison 2N: direkt 270, Portal 360 → 90
  const p = priceFor("2026-11-10", "2026-11-12", 4, 0, "apartment-premium");
  check("Premium portalTotal=360", p.portalTotal, 360);
  check("Premium savings=90", p.savings, 90);
}
{
  // savings ist nie negativ
  const all = [
    priceFor("2026-12-27", "2026-12-29", 2, 0),
    priceFor("2027-07-01", "2027-07-03", 2, 0),
    priceFor("2026-09-10", "2026-09-12", 2, 0),
  ];
  check("savings nie negativ", all.every((p) => p.savings >= 0), true);
}
{
  // Kombination: portalTotal und savings summieren über alle Units
  const checkIn = "2026-11-10";
  const checkOut = "2026-11-17"; // 7N Winter
  const combos = findCombinations(6, 0, nights(checkIn, checkOut), checkIn, checkOut, {});
  const any = combos[0];
  if (any) {
    const sumPortal = any.units.reduce((s, u) => s + u.price.portalTotal, 0);
    check("Combo portalTotal===Summe Units", any.portalTotal, sumPortal);
    check("Combo savings===portalTotal−totalAfterDiscount", any.savings, any.portalTotal - any.totalAfterDiscount);
    check("Combo savings > 0", any.savings > 0, true);
  }
}

console.log(`\n=== Ergebnis: ${passed} bestanden, ${failed} fehlgeschlagen ===\n`);
process.exit(failed > 0 ? 1 : 0);
