import { NextResponse } from "next/server";
import { getAllUnitsAvailability } from "@/lib/ical";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getAllUnitsAvailability();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Units availability API error:", error);
    return NextResponse.json(
      { error: "Verfügbarkeitsdaten konnten nicht geladen werden." },
      { status: 500 }
    );
  }
}
