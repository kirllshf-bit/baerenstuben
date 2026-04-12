"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ShoppingBag, Utensils, Waves, Train, MapPin, Coffee, Bike } from "lucide-react";
import { MapboxMap } from "@/components/ui/MapboxMap";
import "mapbox-gl/dist/mapbox-gl.css";

const HIGHLIGHTS = [
  {
    icon: MapPin,
    label: "Innenstadt",
    distance: "Nur wenige Minuten entfernt",
  },
  {
    icon: ShoppingBag,
    label: "Einkaufsmöglichkeiten",
    distance: "In direkter Nähe",
  },
  {
    icon: Utensils,
    label: "Restaurants & Cafés",
    distance: "Fußläufig erreichbar",
  },
  {
    icon: Waves,
    label: "Strand & Nordsee",
    distance: "Küste und Badestrand in der Nähe",
  },
  {
    icon: Train,
    label: "ÖPNV-Anbindung",
    distance: "Bequem erreichbar",
  },
  {
    icon: Coffee,
    label: "Frühstück zubuchbar",
    distance: "Buffet mit Brötchen, Müsli, Honig, Kaffee & mehr",
  },
  {
    icon: Bike,
    label: "Fahrradverleih vor Ort",
    distance: "E-Bikes, Mountainbikes, Kinderräder & Anhänger",
  },
];

export function Location() {
  return (
    <section id="lage" className="py-(--spacing-section-sm) md:py-(--spacing-section) bg-primary-pale/50">
      <Container>
        <SectionHeading
          title="Perfekte Lage"
          subtitle="Zentral gelegen – alles bequem erreichbar"
        />

        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          {/* Textseite */}
          <div>
            <p className="text-warm-700 text-[15px] sm:text-base md:text-lg leading-relaxed mb-6 sm:mb-8">
              Unsere Ferienwohnungen befinden sich in einer hervorragenden Lage in Esens.
              Von hier aus erreichen Sie bequem die Innenstadt, zahlreiche Restaurants,
              Einkaufsmöglichkeiten – und die Nordseeküste mit ihren weitläufigen Stränden
              liegt in unmittelbarer Reichweite. Die Bärenstuben sind Ihr idealer
              Ausgangspunkt für Strand, Küstenluft und Erholung.
            </p>

            <div className="space-y-3 sm:space-y-4">
              {HIGHLIGHTS.map((item) => (
                <div key={item.label} className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white shadow-[var(--shadow-soft)] flex items-center justify-center">
                    <item.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary" />
                  </div>
                  <div>
                    <span className="font-medium text-warm-900 text-[13px] sm:text-sm md:text-base">{item.label}</span>
                    <span className="text-warm-500 text-xs sm:text-sm ml-1.5 sm:ml-2">– {item.distance}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mapbox-Karte */}
          <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] ring-1 ring-[#D4B896]/30">
            <MapboxMap />
          </div>
        </div>
      </Container>
    </section>
  );
}
