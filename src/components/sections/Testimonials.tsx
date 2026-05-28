"use client";

/**
 * Testimonials — Bewertungen / Gästestimmen als durchlaufender Slider.
 *
 * Aktuell PLATZHALTER-Inhalte. Die echten Bewertungen werden später manuell
 * im REVIEWS-Array unten eingesetzt — entweder als Text-Bewertung
 * (Zitat + Gast + Quelle) oder als Screenshot-Slot (echtes Bewertungs-Bild).
 *
 * Verhalten: Endlos durchlaufender Slider, der zusätzlich MANUELL bedienbar ist —
 * per Touch-Wischen (Mobile), Trackpad/Scroll und Pfeil-Buttons (Desktop). Der
 * Auto-Lauf pausiert während der Interaktion (und beim Hovern) und setzt danach
 * sanft fort. Weiche Rand-Maske links/rechts, Scrollbar ausgeblendet.
 * Respektiert prefers-reduced-motion (dann kein Auto-Lauf, aber weiterhin scrollbar).
 */

import { useRef, useEffect, useCallback } from "react";
import { Star, StarHalf, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type Source = "airbnb" | "booking";

interface Review {
  text: string;
  name: string;
  source: Source;
  /**
   * Original-Bewertung in der Skala der jeweiligen Plattform:
   * Airbnb → 1–5 (Sterne, halbe erlaubt), Booking → 1–10 (Zahlenwert).
   */
  rating: number;
}

// ── Echte Gästebewertungen ───────────────────────────────────────────
// Airbnb: 5er-Skala (Sterne). Booking: 10er-Skala (Zahlenwert) — jeweils
// in der originalen Plattform-Skala dargestellt, keine Umrechnung.
const REVIEWS: Review[] = [
  {
    source: "airbnb",
    name: "Caroline",
    rating: 5,
    text:
      "Wir haben uns sehr wohl gefühlt! Die Unterkunft ist modern eingerichtet und war sehr sauber. Besonders schön ist das Badezimmer und die große Dusche, bei der man verschiedene Einstellungen des Duschkopfs vornehmen kann. Das Bett ist sehr bequem und die Küche hat alles, was man benötigt. Von der Unterkunft aus kann man super die verschiedenen Strände mit dem Fahrrad erreichen. Ein Edeka ist fußläufig zu erreichen und hat sogar sonntags auf. Der Empfang lief reibungslos und pünktlich zu der von uns angegebenen Uhrzeit. Wir haben so dann auch die Kurkarte bekommen. Bei unserem nächsten Aufenthalt in Esens würden wir jederzeit wieder die Bärenstube buchen :-)",
  },
  {
    source: "airbnb",
    name: "Wiebke",
    rating: 4,
    text:
      "Wir haben einen Kurzurlaub in Esens verbracht und sind von dort aus mit dem Rad an die Nordsee gefahren. Die innenstadtnahe Lage hat uns gefallen, Bäcker und Geschäfte waren sogar fußläufig zu erreichen. Die Wohnung ist sehr sauber und sieht genauso aus wie auf den Bildern. Der Gastgeber ist sehr freundlich und hilfsbereit.",
  },
  {
    source: "airbnb",
    name: "Sandra",
    rating: 5,
    text:
      "Javed ist ein sehr höflicher und zuverlässiger Gastgeber. Wir haben uns in der Unterkunft sehr wohl gefühlt. Es blieben keine Wünsche offen. Wir können die Unterkunft uneingeschränkt weiterempfehlen.",
  },
  {
    source: "booking",
    name: "Sarah",
    rating: 10,
    text:
      "Alles zu unserer Zufriedenheit. Sauber, freundlich, mit viel Liebe zum Detail. Freundliche Gastgeber. Tolle Lage! Wir würden wiederkommen :-)",
  },
  {
    source: "booking",
    name: "Anna",
    rating: 10,
    text:
      "Nette Vermieter, unkomplizierter freundlicher Kontakt, sehr schöne Ferienwohnung, gute Lage.",
  },
  {
    source: "booking",
    name: "Judith",
    rating: 9,
    text:
      "Rundum empfehlenswert – sehr gerne wieder.",
  },
];

const STAR = "#E8B05A";

/** Airbnb-Bewertung: 5 Sterne (halbe erlaubt). */
function Stars({ value = 5 }: { value?: number }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  return (
    <div className="flex gap-[3px]" aria-label={`${value} von 5 Sternen`}>
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) {
          return <Star key={i} className="w-4 h-4" style={{ color: STAR, fill: STAR }} />;
        }
        if (i === full && hasHalf) {
          return <StarHalf key={i} className="w-4 h-4" style={{ color: STAR, fill: STAR }} />;
        }
        return <Star key={i} className="w-4 h-4 text-warm-300" />;
      })}
    </div>
  );
}

/** Booking-Bewertung: Zahlenwert auf 10er-Skala (z. B. „9,4 / 10"). */
function BookingScore({ value }: { value: number }) {
  const formatted = value.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-semibold"
      style={{ color: "#003580" }}
      aria-label={`${formatted} von 10 Punkten`}
    >
      <Star className="w-4 h-4" style={{ color: STAR, fill: STAR }} />
      {formatted}
      <span className="text-xs font-normal text-warm-500">/ 10</span>
    </span>
  );
}

/** Zeigt die Bewertung in der Skala der jeweiligen Plattform an. */
function Rating({ source, value }: { source: Source; value: number }) {
  return source === "airbnb" ? <Stars value={value} /> : <BookingScore value={value} />;
}

/** Dezentes Plattform-Badge (Airbnb / Booking.com). */
function SourceBadge({ source }: { source: Source }) {
  const isAir = source === "airbnb";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
      style={{ background: isAir ? "#FF5A5F" : "#003580" }}
    >
      {isAir ? "Airbnb" : "Booking.com"}
    </span>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <div className="flex w-80 flex-shrink-0 flex-col gap-3 self-stretch rounded-[var(--radius-card)] border border-warm-200 bg-warm-50 p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between gap-3">
        <Rating source={r.source} value={r.rating} />
        <SourceBadge source={r.source} />
      </div>
      <p className="flex-1 text-[0.95rem] leading-relaxed text-warm-700">
        <span className="mr-0.5 font-serif text-xl text-secondary">&ldquo;</span>
        {r.text}
      </p>
      <div className="flex items-center gap-3 border-t border-warm-200 pt-3">
        <span className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-primary-pale font-serif font-semibold text-primary">
          {r.name.charAt(0)}
        </span>
        <div className="text-sm font-semibold text-warm-900">{r.name}</div>
      </div>
    </div>
  );
}

/** Normalisiert die Bewertung plattformübergreifend auf 0–1 (Airbnb /5, Booking /10). */
function normalizedRating(r: Review): number {
  return r.source === "airbnb" ? r.rating / 5 : r.rating / 10;
}

// Beste Bewertungen zuerst (stabil: gleiche Werte behalten ihre Reihenfolge).
const SORTED_REVIEWS = [...REVIEWS].sort((a, b) => normalizedRating(b) - normalizedRating(a));

/** Pixel pro Frame für den Auto-Lauf (≈ Marquee-Tempo). */
const AUTO_SPEED = 0.5;
/** Pause-Dauer nach manueller Interaktion, bevor der Auto-Lauf fortsetzt (ms). */
const RESUME_DELAY = 2500;

function ReviewSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  // Die Liste wird verdoppelt → bei Erreichen der Hälfte nahtlos zurücksetzen (Endlos-Gefühl).
  const items = [...SORTED_REVIEWS, ...SORTED_REVIEWS];

  // Pausiert den Auto-Lauf (Hover, aktive Touch-/Pointer-Interaktion) …
  const pausedRef = useRef(false);
  // … bzw. setzt nach manuellem Scrollen/Buttons verzögert wieder fort.
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pause = useCallback(() => {
    pausedRef.current = true;
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  }, []);

  const resumeSoon = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      pausedRef.current = false;
    }, RESUME_DELAY);
  }, []);

  // Kontinuierlicher Auto-Lauf via requestAnimationFrame. Nahtloses Zurücksetzen
  // bei der Hälfte (= eine vollständige Listenlänge), da die Liste verdoppelt ist.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return; // kein Auto-Lauf, manuelles Scrollen bleibt möglich

    let raf = 0;
    const step = () => {
      if (!pausedRef.current) {
        const half = el.scrollWidth / 2;
        if (half > 0) {
          let next = el.scrollLeft + AUTO_SPEED;
          if (next >= half) next -= half; // nahtlos zurück
          el.scrollLeft = next;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Manuelles Scrollen (Touch/Trackpad) hält den Auto-Lauf an und keeps it endlos:
  // beim Erreichen einer Hälftengrenze sanft umsetzen, damit man unbegrenzt wischen kann.
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const half = el.scrollWidth / 2;
    if (half <= 0) return;
    if (el.scrollLeft >= half) el.scrollLeft -= half;
    else if (el.scrollLeft <= 0) el.scrollLeft += half;
  }, []);

  // Pfeil-Navigation: um ~eine Kartenbreite weiter.
  const nudge = useCallback((dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    pause();
    el.scrollBy({ left: dir * 332, behavior: "smooth" }); // 320px Karte + 12px Lücke
    resumeSoon();
  }, [pause, resumeSoon]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        onMouseEnter={pause}
        onMouseLeave={resumeSoon}
        onPointerDown={pause}
        onPointerUp={resumeSoon}
        onTouchStart={pause}
        onTouchEnd={resumeSoon}
        className="ts-slider flex snap-x snap-mandatory items-stretch gap-[18px] overflow-x-auto px-4 pb-2 sm:px-6"
      >
        {items.map((r, i) => (
          <div key={i} className="snap-start">
            <ReviewCard r={r} />
          </div>
        ))}
      </div>

      {/* Pfeile (Desktop) */}
      <button
        type="button"
        aria-label="Vorherige Bewertungen"
        onClick={() => nudge(-1)}
        className="absolute left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-warm-200 bg-warm-50/95 text-primary shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-primary hover:text-white sm:flex cursor-pointer"
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Weitere Bewertungen"
        onClick={() => nudge(1)}
        className="absolute right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-warm-200 bg-warm-50/95 text-primary shadow-[var(--shadow-card)] backdrop-blur transition-colors hover:bg-primary hover:text-white sm:flex cursor-pointer"
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2} />
      </button>

      <style>{`
        .ts-slider {
          -webkit-mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
          scrollbar-width: none;            /* Firefox */
          -ms-overflow-style: none;         /* alte Edge/IE */
        }
        .ts-slider::-webkit-scrollbar { display: none; }   /* WebKit */
      `}</style>
    </div>
  );
}

export function Testimonials({ className }: { className?: string }) {
  return (
    <section id="bewertungen" className={cn("py-(--spacing-section-sm) md:py-(--spacing-section)", className)}>
      <Container>
        <SectionHeading title="Das sagen unsere Gäste" subtitle="Bewertet auf Airbnb und Booking.com" />
      </Container>

      <ReviewSlider />
    </section>
  );
}
