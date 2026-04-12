"use client";

import { useState, useMemo } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AvailabilityCalendar } from "@/components/calendar/AvailabilityCalendar";
import { InquiryForm } from "@/components/forms/InquiryForm";
import { useUnitsAvailability } from "@/hooks/useUnitsAvailability";
import { Info, RefreshCw } from "lucide-react";

export function AvailabilityInquiry() {
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [checkOut, setCheckOut] = useState<string | null>(null);

  const { data, loading, error, refetch } = useUnitsAvailability();

  // Kalender zeigt nur Tage als blockiert, an denen ALLE Units belegt sind
  const allBlockedDates = useMemo(() => {
    if (!data?.units) return new Set<string>();

    const unitIds = Object.keys(data.units);
    if (unitIds.length === 0) return new Set<string>();

    // Für jede Unit ein Set der blockierten Tage
    const unitSets = unitIds.map(
      (id) => new Set(data.units[id].blockedDates)
    );

    // Schnittmenge: nur Tage die in ALLEN Units blockiert sind
    const allDates = unitSets[0];
    const result = new Set<string>();
    for (const date of allDates) {
      if (unitSets.every((s) => s.has(date))) {
        result.add(date);
      }
    }
    return result;
  }, [data]);

  const handleSelectDate = (dateStr: string) => {
    if (!checkIn || checkOut) {
      setCheckIn(dateStr);
      setCheckOut(null);
    } else {
      const checkInDate = new Date(checkIn);
      const selectedDate = new Date(dateStr);
      if (selectedDate > checkInDate) {
        setCheckOut(dateStr);
      } else {
        setCheckIn(dateStr);
        setCheckOut(null);
      }
    }
  };

  return (
    <section id="verfuegbarkeit" className="py-(--spacing-section-sm) md:py-(--spacing-section)">
      <Container>
        <SectionHeading
          title="Verfügbarkeit & Anfrage"
          subtitle="Prüfen Sie die Verfügbarkeit und senden Sie uns Ihre unverbindliche Anfrage"
        />

        {/* Hinweisbox */}
        <div className="max-w-3xl mx-auto mb-8 sm:mb-10 bg-accent-blue-light rounded-[var(--radius-card)] px-4 sm:px-5 py-3.5 sm:py-4 flex items-start gap-2.5 sm:gap-3">
          <Info className="w-5 h-5 text-accent-blue mt-0.5 flex-shrink-0" />
          <div className="text-[13px] sm:text-sm text-warm-700 leading-relaxed">
            <p className="font-medium mb-1">So funktioniert Ihre Anfrage:</p>
            <p>
              Wählen Sie Ihren Wunschzeitraum im Kalender und geben Sie Ihre Gruppengröße ein.
              Wir zeigen Ihnen passende, verfügbare Apartment-Kombinationen.
              Dies ist <strong>keine verbindliche Buchung</strong> –
              wir bestätigen Ihnen alles persönlich per E-Mail.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-error/10 rounded-lg px-5 py-4 flex items-center justify-between">
            <p className="text-error text-sm">{error}</p>
            <button
              onClick={refetch}
              className="flex items-center gap-1.5 text-sm text-error font-medium hover:underline cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Erneut laden
            </button>
          </div>
        )}

        {/* Main Content: Calendar + Form */}
        <div className="grid lg:grid-cols-5 gap-5 sm:gap-8 lg:gap-12">
          {/* Calendar (3/5) */}
          <div className="lg:col-span-3 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 sm:p-5 md:p-8">
            <AvailabilityCalendar
              blockedDates={allBlockedDates}
              checkIn={checkIn}
              checkOut={checkOut}
              onSelectDate={handleSelectDate}
              loading={loading}
            />
          </div>

          {/* Form (2/5) */}
          <div className="lg:col-span-2 bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 sm:p-5 md:p-8">
            <h3 className="font-serif text-lg sm:text-xl font-medium text-primary-dark mb-5 sm:mb-6">
              Ihre Anfrage
            </h3>
            <InquiryForm
              checkIn={checkIn}
              checkOut={checkOut}
              unitData={data?.units || null}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
