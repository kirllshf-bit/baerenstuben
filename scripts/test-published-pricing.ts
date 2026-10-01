import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { DEFAULT_WEBSITE_PRICING } from "../src/lib/website-pricing";
import { fetchPublishedPricing } from "../src/lib/pricing-source";
import { getInquiryCombinations } from "../src/lib/combinations";
import { quoteInquiry } from "../src/lib/inquiry-price";

async function main() {
  const crmCore = new URL("../../baerenstuben-crm/src/lib/website-pricing.ts", import.meta.url);
  if (existsSync(crmCore)) {
    assert.equal(readFileSync(new URL("../src/lib/website-pricing.ts", import.meta.url), "utf8"), readFileSync(crmCore, "utf8"),
      `Preiskern muss mit ${fileURLToPath(crmCore)} identisch sein`);
}
const snapshot = structuredClone(DEFAULT_WEBSITE_PRICING);
snapshot.version = "crm-edited";
snapshot.rates.find(r => r.apartment_type === "apartment" && r.valid_from === "2026-10-02")!.price_per_night = 110;
const config = { url: "https://example.supabase.co", key: "public-anon-key" };
let requests = 0;
const fetcher: typeof fetch = async (_url, options) => {
  requests++;
  assert.equal(options?.cache, "no-store");
  return Response.json(snapshot);
};
assert.equal((await fetchPublishedPricing(config, fetcher)).version, "crm-edited");
assert.equal((await fetchPublishedPricing(config, fetcher)).version, "crm-edited");
assert.equal(requests, 2, "jede Anfrage liest den aktuellen Stand");
assert.equal((await fetchPublishedPricing({})).version, DEFAULT_WEBSITE_PRICING.version);
await assert.rejects(fetchPublishedPricing({ url: config.url }), /konfiguration/i);
await assert.rejects(fetchPublishedPricing(config, async () => Response.json({}, { status: 503 })));
await assert.rejects(fetchPublishedPricing(config, async () => Response.json({ ...snapshot, rates: [] })));

const input = { name: "Test Gast", email: "test@example.com", adults: 2, children: 0,
  checkIn: "2026-10-02", checkOut: "2026-10-04", unitIds: ["apt-1"],
  pricingVersion: snapshot.version, privacyConsent: true, totalPrice: 1, totalAfterDiscount: 1 };
const quote = quoteInquiry(input, snapshot);
assert.equal(quote.totalPrice, 220, "Server ignoriert manipulierte Browser-Preise");
assert.equal(quote.totalAfterDiscount, 220);
assert.equal(quote.nights, 2);
assert.throws(() => quoteInquiry({ ...input, pricingVersion: "old" }, snapshot), /Preise haben sich geändert/);
assert.throws(() => quoteInquiry({ ...input, unitIds: ["apt-1", "apt-1"] }, snapshot));
assert.throws(() => quoteInquiry({ ...input, checkIn: "2026-02-30" }, snapshot));
assert.throws(() => quoteInquiry({ ...input, adults: 10 }, snapshot));
assert.throws(() => quoteInquiry({ ...input, privacyConsent: false }, snapshot));
const groupInput = { ...input, adults: 6, children: 0, checkIn: "2027-07-01", checkOut: "2027-07-06", unitIds: ["apt-1", "apt-premium"] };
assert.equal(quoteInquiry(groupInput, snapshot).totalAfterDiscount, 1424, "Gruppenpreis stimmt mit den CRM-Wohnungspreisen überein");
const changed = structuredClone(snapshot);
changed.rates.find(r => r.apartment_type === "apartment-gross" && r.valid_from === "2026-10-02")!.price_per_night = 1000;
const recommendations = getInquiryCombinations(2, 2, 2, "2026-10-02", "2026-10-04", {}, changed, ["apt-gross"]);
assert(recommendations.some(combo => combo.units.length === 1 && combo.units[0].unitId === "apt-gross"), "gewählte Wohnung bleibt trotz neuer Sortierung erhalten");
console.log("Veröffentlichte Preise und serverseitige Anfrageberechnung: alle Prüfungen bestanden.");

}
main().catch(error => { console.error(error); process.exitCode = 1; });
