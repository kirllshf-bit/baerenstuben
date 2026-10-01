import "server-only";
import { fetchPublishedPricing } from "./pricing-source";

export function getWebsitePricing() {
  return fetchPublishedPricing({ url: process.env.CRM_SUPABASE_URL, key: process.env.CRM_SUPABASE_ANON_KEY });
}
