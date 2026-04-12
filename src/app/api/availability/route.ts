import { NextRequest, NextResponse } from "next/server";
import { getAvailability, clearAvailabilityCache } from "@/lib/ical";
import type { ApartmentType } from "@/types/apartment";

// Next.js darf diese Route nie cachen — immer frisch ausführen
export const dynamic = "force-dynamic";

const VALID_TYPES: ApartmentType[] = ["apartment", "apartment-gross", "apartment-premium"];

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") as ApartmentType;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: "Ungültiger Apartment-Typ" }, { status: 400 });
  }

  try {
    // ?refresh=1 → Cache leeren und sofort neu von Booking/Airbnb fetchen
    if (request.nextUrl.searchParams.get("refresh") === "1") {
      clearAvailabilityCache();
    }

    const data = await getAvailability(type);
    return NextResponse.json(data, {
      headers: {
        // Browser soll nicht cachen – frische Daten alle 60s vom Server
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Availability API error:", error);
    return NextResponse.json(
      { error: "Verfügbarkeitsdaten konnten nicht geladen werden." },
      { status: 500 }
    );
  }
}
