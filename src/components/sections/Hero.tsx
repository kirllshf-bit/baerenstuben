"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HERO_SLIDES = [
  { src: "/images/hero/IMG_6811.jpeg", alt: "Bärenstuben – Außenansicht" },
  { src: "/images/hero/IMG_6500.jpeg", alt: "Bärenstuben – Wohnbereich" },
  { src: "/images/hero/IMG_6525.jpeg", alt: "Bärenstuben – Schlafzimmer" },
  { src: "/images/hero/IMG_6532.jpeg", alt: "Bärenstuben – Küche" },
  { src: "/images/hero/IMG_6750.jpeg", alt: "Bärenstuben – Apartment" },
  { src: "/images/hero/IMG_6635.jpeg", alt: "Bärenstuben – Premium" },
];

const FIRST_SLIDE_DURATION = 13000;
const SLIDE_DURATION = 6000;
const TRANSITION_MS = 800;
const N = HERO_SLIDES.length;

export function Hero() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const scheduleNext = useCallback((duration: number) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      setCurrent((c: number) => (c + 1) % N);
      // Alle weiteren Slides: normaler Takt
      timerRef.current = null;
      // rekursiv mit normalem Takt
      scheduleNext(SLIDE_DURATION);
    }, duration);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scheduleNext(FIRST_SLIDE_DURATION);
    return clearTimer;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback((dir: "next" | "prev") => {
    clearTimer();
    setCurrent((c: number) => dir === "next" ? (c + 1) % N : (c - 1 + N) % N);
    scheduleNext(SLIDE_DURATION);
  }, [scheduleNext]);

  const handleDot = useCallback((index: number) => {
    clearTimer();
    setCurrent(index);
    scheduleNext(SLIDE_DURATION);
  }, [scheduleNext]);

  return (
    <section className="relative min-h-[100svh] flex items-end pb-20 sm:pb-32 overflow-hidden">

      {/* ── Slides ────────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            className="absolute inset-0"
            style={{
              opacity: i === current ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease-in-out`,
              zIndex: i === current ? 1 : 0,
            }}
          >
            <div
              className={`hero-slide-img${i === current ? " active" : ""}`}
              style={{
                backgroundImage: `url(${slide.src})`,
                // IMG_6750: leicht nach oben versetzt damit der Türrahmen nicht
                // auf einer Browser-Subpixel-Grenze liegt (verhindert weiße Linien)
                backgroundPosition: slide.src.includes("IMG_6750") ? "center 40%" : "center",
                animation: i === current
                  ? `kenBurns ${(SLIDE_DURATION + TRANSITION_MS) / 1000}s ease-out infinite alternate`
                  : "none",
                transform: i === current ? undefined : "scale(1.01) translateZ(0)",
              }}
              role="img"
              aria-label={slide.alt}
            />
          </div>
        ))}
      </div>

      {/* ── Overlays ──────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/70 via-black/20 to-black/5 pointer-events-none" />
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#723E14]/25 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 inset-x-0 z-20 h-36 bg-gradient-to-b from-black/35 to-transparent pointer-events-none" />

      {/* ── Pfeil links ───────────────────────────────────────────── */}
      <button
        onClick={() => navigate("prev")}
        aria-label="Vorheriges Bild"
        className={cn(
          "hidden sm:absolute sm:left-6 sm:top-1/2 sm:-translate-y-1/2 sm:z-30",
          "sm:w-11 sm:h-11 rounded-full sm:flex items-center justify-center",
          "bg-black/20 active:bg-black/40 sm:hover:bg-black/40",
          "border border-white/15",
          "text-white/80",
          "transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        )}
      >
        <ChevronLeft className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
      </button>

      {/* ── Pfeil rechts ──────────────────────────────────────────── */}
      <button
        onClick={() => navigate("next")}
        aria-label="Nächstes Bild"
        className={cn(
          "hidden sm:absolute sm:right-6 sm:top-1/2 sm:-translate-y-1/2 sm:z-30",
          "sm:w-11 sm:h-11 rounded-full sm:flex items-center justify-center",
          "bg-black/20 active:bg-black/40 sm:hover:bg-black/40",
          "border border-white/15",
          "text-white/80",
          "transition-colors duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
        )}
      >
        <ChevronRight className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
      </button>

      {/* ── Hero Content ──────────────────────────────────────────── */}
      <Container className="relative z-30 pb-2">
        <div className="max-w-2xl">
          <p
            className="inline-block text-[#5A3421] text-xs md:text-sm font-medium tracking-[0.25em] uppercase mb-4 sm:mb-5 opacity-0 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm"
            style={{ animation: "heroFadeUp 0.7s 0.2s ease-out forwards" }}
          >
            Ferienwohnungen · Esens
          </p>
          <h1
            className="font-serif text-[2rem] sm:text-5xl md:text-6xl lg:text-[4rem] font-medium text-white leading-[1.1] tracking-tight mb-5 sm:mb-6 opacity-0"
            style={{ animation: "heroFadeUp 0.7s 0.35s ease-out forwards" }}
          >
            Willkommen in den
            <br className="hidden sm:block" /> Bärenstuben
          </h1>
          <p
            className="text-[15px] sm:text-base md:text-lg text-white/75 max-w-lg leading-relaxed mb-8 sm:mb-10 opacity-0"
            style={{ animation: "heroFadeUp 0.7s 0.5s ease-out forwards" }}
          >
            Modern eingerichtete Apartments für Ihren erholsamen Aufenthalt –
            zentral gelegen, liebevoll gestaltet, persönlich vermietet.
          </p>
          <div
            className="flex flex-col sm:flex-row items-start gap-3 opacity-0"
            style={{ animation: "heroFadeUp 0.7s 0.65s ease-out forwards" }}
          >
            <a
              href="#verfuegbarkeit"
              className="inline-flex items-center justify-center px-7 py-3.5 sm:py-3.5 bg-primary text-white font-medium text-[15px] rounded-[var(--radius-btn)] hover:bg-primary-dark transition-colors duration-200 shadow-lg tracking-wide w-full sm:w-auto"
            >
              Verfügbarkeit prüfen
            </a>
            <a
              href="#ausstattung"
              className="inline-flex items-center justify-center px-7 py-3.5 sm:py-3.5 bg-white/10 text-white font-medium text-[15px] rounded-[var(--radius-btn)] border border-white/20 hover:bg-white/18 transition-colors duration-200 tracking-wide w-full sm:w-auto"
            >
              Unsere Wohnungen
            </a>
          </div>
        </div>
      </Container>

      {/* ── Dots ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 sm:gap-2">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => handleDot(i)}
            aria-label={`Bild ${i + 1}`}
            className="rounded-full cursor-pointer focus-visible:outline-none p-1 -m-1"
            style={{
              width: i === current ? "28px" : "8px",
              height: "8px",
              backgroundColor: i === current ? "white" : "rgba(255,255,255,0.4)",
              transition: "width 300ms ease, background-color 300ms ease",
            }}
          />
        ))}
      </div>

      {/* ── Bild-Zähler rechts unten ──────────────────────────────── */}
      <div className="absolute bottom-10 right-6 sm:right-8 z-30 hidden sm:flex items-center gap-2 select-none">
        <span className="text-white font-medium text-sm tabular-nums">
          {String(current + 1).padStart(2, "0")}
        </span>
        <div className="w-8 h-px bg-white/30" />
        <span className="text-white/40 text-sm tabular-nums">
          {String(N).padStart(2, "0")}
        </span>
      </div>

      {/* ── Hero-Sentinel für Header-Logo-Umschaltung ─────────────── */}
      <div id="hero-sentinel" className="absolute bottom-0 left-0 right-0 h-px pointer-events-none" />

      {/* ── Keyframes & Slide-Styles ──────────────────────────────── */}
      <style>{`
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes kenBurns {
          from { transform: scale(1.01) translateZ(0); }
          to   { transform: scale(1.08) translateZ(0); }
        }
        .hero-slide-img {
          position: absolute;
          inset: -2px;
          background-size: cover;
          background-position: center;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .hero-slide-img.active {
          will-change: transform;
        }
      `}</style>
    </section>
  );
}
