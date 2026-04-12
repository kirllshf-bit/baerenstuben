import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { Wifi, BedDouble, Car, MapPin, Sparkles } from "lucide-react";

const USPS = [
  {
    icon: Wifi,
    title: "Highspeed-WLAN",
    text: "Kostenloses schnelles Internet in allen Apartments",
  },
  {
    icon: BedDouble,
    title: "Bettwäsche & Handtücher",
    text: "Frisch bezogene Betten und Handtücher inklusive",
  },
  {
    icon: Car,
    title: "Kostenloser Parkplatz",
    text: "Bequem parken direkt an der Unterkunft",
  },
  {
    icon: MapPin,
    title: "Zentrale Lage",
    text: "Alles Wichtige bequem erreichbar",
  },
  {
    icon: Sparkles,
    title: "Moderner Komfort",
    text: "Hochwertig eingerichtete Wohnungen",
  },
];

export function USPs() {
  return (
    <section className="relative -mt-16 z-20 pb-8">
      <Container>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {USPS.map((usp, i) => (
            <div
              key={usp.title}
              className={cn(
                "bg-white rounded-[var(--radius-card)] shadow-[var(--shadow-card)] p-4 sm:p-5 md:p-6 text-center hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300",
                // 5. Item: auf 2-col-Grid zentriert, ab sm (3-col) normal
                i === 4 && "col-span-2 sm:col-span-1 max-w-[calc(50%-0.375rem)] sm:max-w-none mx-auto sm:mx-0"
              )}
            >
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary-pale mb-3 sm:mb-4">
                <usp.icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="font-medium text-[13px] sm:text-sm md:text-base text-warm-900 mb-1">
                {usp.title}
              </h3>
              <p className="text-[11px] sm:text-xs md:text-sm text-warm-500 leading-relaxed">
                {usp.text}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
