import { NextResponse } from "next/server";
import { getWebsitePricing } from "@/lib/server-pricing";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return NextResponse.json(await getWebsitePricing(), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Die aktuellen Preise konnten nicht geladen werden." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
