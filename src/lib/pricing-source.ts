import { DEFAULT_WEBSITE_PRICING, parsePricingSnapshot } from "./website-pricing";

export async function fetchPublishedPricing(config: { url?: string; key?: string }, fetcher: typeof fetch = fetch) {
  if (!config.url && !config.key) return DEFAULT_WEBSITE_PRICING;
  if (!config.url || !config.key) throw new Error("CRM-Preiskonfiguration ist unvollständig.");
  const url = new URL("/rest/v1/rpc/get_website_pricing", config.url);
  const response = await fetcher(url, {
    method: "POST", cache: "no-store", signal: AbortSignal.timeout(5_000),
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}`, "Content-Type": "application/json" },
    body: "{}",
  });
  if (!response.ok) throw new Error(`Website-Preise nicht verfügbar (${response.status}).`);
  return parsePricingSnapshot(await response.json());
}
