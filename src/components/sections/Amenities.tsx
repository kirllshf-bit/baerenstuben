"use client";

import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { APARTMENTS } from "@/lib/apartments";
import { formatEuro } from "@/lib/utils";
import {
  Maximize2, Users, BedDouble, Sofa, CookingPot, Bath,
  Wifi, Tv, Snowflake, Coffee, Wind,
  ParkingCircle, Shirt, KeyRound, Waves
} from "lucide-react";

import type { ApartmentType } from "@/types/apartment";

interface AmenityItem {
  icon: React.ElementType;
  label: string;
}

const COMMON_AMENITIES: AmenityItem[] = [
  { icon: Wifi, label: "Highspeed-WLAN" },
  { icon: Tv, label: "Smart-TV" },
  { icon: CookingPot, label: "Voll ausgestattete Küche" },
  { icon: Coffee, label: "Kaffeemaschine" },
  { icon: Bath, label: "Bodengleiche Dusche" },
  { icon: Maximize2, label: "Alle im Erdgeschoss" },
  { icon: BedDouble, label: "Bettwäsche & Handtücher" },
  { icon: Snowflake, label: "Kühlschrank" },
  { icon: Wind, label: "Föhn" },
  { icon: ParkingCircle, label: "Kostenloser Parkplatz" },
  { icon: Shirt, label: "Kleiderschrank" },
  { icon: KeyRound, label: "Schlüsselsafe / Self-Check-in" },
];

const APARTMENT_SPECIFIC: Record<ApartmentType, { features: AmenityItem[]; highlights: string[] }> = {
  apartment: {
    features: [
      { icon: Maximize2, label: "49 m² Wohnfläche" },
      { icon: Users, label: "Bis zu 4 Personen" },
      { icon: BedDouble, label: "Separates Schlafzimmer" },
      { icon: Sofa, label: "Gemütlicher Wohnbereich" },
    ],
    highlights: [
      "Separates Schlafzimmer mit Doppelbett",
      "Ausziehbare Schlafcouch im Wohnbereich",
      "Kompakte, voll ausgestattete Küchenzeile",
      "Modernes Bad mit Dusche",
      "Ideal für Paare und kleine Familien",
    ],
  },
  "apartment-gross": {
    features: [
      { icon: Maximize2, label: "58 m² Wohnfläche" },
      { icon: Users, label: "Bis zu 4 Personen" },
      { icon: BedDouble, label: "Großzügiges Schlafzimmer" },
      { icon: Sofa, label: "Separater Wohnbereich" },
    ],
    highlights: [
      "Großzügiges Schlafzimmer mit Doppelbett",
      "Separater Wohnbereich mit Schlafcouch",
      "Erweiterte Küchenzeile mit Essbereich",
      "Geräumiges Bad mit Dusche",
      "Mehr Platz für Ihren Komfort",
    ],
  },
  "apartment-premium": {
    features: [
      { icon: Maximize2, label: "60 m² Wohnfläche" },
      { icon: Users, label: "Bis zu 5 Personen" },
      { icon: BedDouble, label: "Zwei Schlafbereiche" },
      { icon: Waves, label: "Premium-Ausstattung" },
    ],
    highlights: [
      "Erstklassige Ausstattung und Einrichtung",
      "Großzügiger Wohn- und Essbereich",
      "Zwei separate Schlafbereiche",
      "Platz für bis zu 5 Personen",
      "Premium-Bad mit hochwertiger Ausstattung",
      "Das Beste, was die Bärenstuben bieten",
    ],
  },
};

const TABS: { type: ApartmentType; label: string }[] = [
  { type: "apartment", label: "Apartment (49 m²)" },
  { type: "apartment-gross", label: "Apartment Groß (58 m²)" },
  { type: "apartment-premium", label: "Apartment Premium (60 m²)" },
];

export function Amenities() {
  const [activeTab, setActiveTab] = useState<ApartmentType>("apartment");
  const config = APARTMENTS.find((a) => a.type === activeTab)!;
  const specific = APARTMENT_SPECIFIC[activeTab];

  return (
    <section id="ausstattung" className="py-(--spacing-section-sm) md:py-(--spacing-section)">
      <Container>
        <SectionHeading
          title="Unsere Wohnungen"
          subtitle="Drei Kategorien für unterschiedliche Ansprüche – alle hochwertig ausgestattet"
        />

        {/* Tabs */}
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-3 mb-10 sm:mb-12 md:mb-16">
          {TABS.map((tab) => (
            <button
              key={tab.type}
              onClick={() => setActiveTab(tab.type)}
              className={cn(
                "px-4 sm:px-5 py-3 rounded-[var(--radius-btn)] text-[13px] sm:text-sm md:text-base font-medium transition-colors duration-200 cursor-pointer",
                activeTab === tab.type
                  ? "bg-primary text-white shadow-md"
                  : "bg-warm-200 text-warm-700 active:bg-warm-300 sm:hover:bg-warm-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12">
          {/* Left: Apartment Details */}
          <div>
            <h3 className="font-serif text-2xl md:text-3xl font-medium text-primary-dark mb-2">
              {config.label}
            </h3>
            <p className="text-warm-500 text-base mb-6">{config.description}</p>

            {/* Key Features */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-8">
              {specific.features.map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-2 sm:gap-3 bg-primary-pale/60 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3"
                >
                  <feat.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-warm-900">{feat.label}</span>
                </div>
              ))}
            </div>

            {/* Highlights */}
            <div className="space-y-2.5 mb-8">
              {specific.highlights.map((h) => (
                <div key={h} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span className="text-warm-700 text-sm md:text-base">{h}</span>
                </div>
              ))}
            </div>

            {/* Preis-Badge */}
            <div className="bg-warm-50 border border-warm-200 rounded-[var(--radius-card)] p-5 md:p-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-serif text-3xl font-medium text-primary">
                  {formatEuro(config.basePrice)}
                </span>
                <span className="text-warm-500 text-sm">/ Nacht</span>
              </div>
              <p className="text-warm-500 text-sm">
                Inklusive {config.includedGuests} Personen · Jede weitere Person +{formatEuro(config.extraPersonPrice)}
              </p>
              <p className="text-warm-400 text-xs mt-2">
                Maximal {config.maxGuests} Personen · Mindestaufenthalt 2 Nächte
              </p>
            </div>
          </div>

          {/* Right: Common Amenities Grid */}
          <div>
            <h4 className="font-medium text-warm-900 text-base sm:text-lg mb-4 sm:mb-5">
              Ausstattung in allen Wohnungen
            </h4>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {COMMON_AMENITIES.map((amenity) => (
                <div
                  key={amenity.label}
                  className="flex items-center gap-2 sm:gap-3 bg-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 shadow-[var(--shadow-soft)]"
                >
                  <amenity.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-accent-green flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-warm-700">{amenity.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
