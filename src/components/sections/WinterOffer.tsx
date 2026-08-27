"use client";

/**
 * WinterOffer — saisonales Winter-Angebots-Element für die Bärenstuben-Website.
 *
 * Inhalt: „Ab 5 Nächten nur 80 € pro Nacht“ · Zeitraum 01.11. – 15.03.
 * Mehrere dezente Stilvarianten — passend zum bestehenden Design.
 *
 * Tokens (bereits in globals.css definiert): primary, primary-pale, primary-dark,
 * secondary, secondary-light, accent-blue, accent-blue-light, warm-50/200/500/700/900.
 *
 * Hinweis: Die Angebots-Elemente werden GANZJÄHRIG angezeigt (nicht saisonal
 * ein-/ausgeblendet). isWinterSeason() bleibt als Hilfsfunktion verfügbar,
 * wird für die Sichtbarkeit aber bewusst nicht verwendet. Ob der Preisrechner
 * den Winterpreis tatsächlich anwendet, hängt allein vom Reisezeitraum ab
 * (siehe isWinterStay() in src/lib/apartments.ts).
 */

import { Snowflake } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferFootnote } from "@/components/ui/OfferFootnote";

type WinterVariant = "strip" | "card" | "pill" | "den" | "den-min" | "overlay";

/** Aktiv vom 01.11. bis einschließlich 15.03. (jahresübergreifend). */
export function isWinterSeason(date: Date = new Date()): boolean {
  const m = date.getMonth() + 1; // 1–12
  const d = date.getDate();
  if (m === 11 || m === 12 || m === 1 || m === 2) return true; // Nov–Feb
  if (m === 3 && d <= 15) return true;                          // bis 15.03.
  return false;
}

/** Bären-Glyph aus public/favbär.svg — Marken-Maskottchen. */
function BaerGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 78.95 83.519" className={className} fill="currentColor" aria-hidden="true">
      <path d="m68.04 50.9c5.59-9.49-0.4-20.81-4.43-28.83 7.41-5.46 3.53-16.86-3.72-17-3.93-0.08-5.59 2.2-9.75 5.69-4.95-1.01-7.2-1.33-13.66-1.34-5.13 0-8.57 0.8-12.89 1.65-3.52-3.31-5.74-5.59-9.68-5.5-7.25 0.17-10.19 10.41-3.93 16.19l0.45 0.48c-5.4 9.32-6.55 18.05-4.27 27.97-2.03 8.07-3.45 17-3.45 27.28l69.03-0.03c-0.13-8.03-1.6-16.68-3.7-26.56zm-50.36-38.35c-0.35-0.47-0.27-0.49-0.72-1.08-0.25-0.36 0.11-0.55 0.52-0.39 1.27 0.47 1.71 1.8 1.71 1.8-0.45 1.63-1.01 0.45-1.51-0.33zm5.55 19.66c0.01-3.25 4.58-2.9 5.37-1.72 0.78 1.18-0.58 3.05-0.97 2.53-1.22-1.71-2.88-0.47-3.32 0.71-0.37 0.97-1.1 0.05-1.08-1.52zm14.06 30.7c-6.16-0.94-11.7-6.89-11.96-10.87-0.12-2.27 3.85-18.77 8.97-20.68 2.59-0.95 6.5-0.61 8.08 0.98 3.73 3.74 5.66 15.51 6.06 17.88 1.08 6.16-6.25 13.43-11.15 12.69zm13.21-30.28c-1.44-0.86-2.55-1.21-3.65-0.45-0.74 0.54-1.02-0.7-0.68-1.49 0.87-2.11 4.93-1.05 4.93 0.39 0 1.03-0.02 1.89-0.6 1.55zm6.84-19.1c-0.63 0.98-1.55 0.96-1.62 0.36-0.1-0.77 1.69-3.18 2.5-2.69s-0.11 1.21-0.88 2.33z" />
      <path d="m43.78 47.46c-0.57-3.5-4.66-3.51-7.03-3.5-3.72 0.01-5.91 1.26-5.57 4.84 0.17 1.91 1.59 4.24 2.76 5.1 0.41 0.31 0.54 2.09-0.47 2.42-1.48 0.52-3.33-0.13-3.5 0.59-0.34 1.43 3.5 1.7 4.39 1.63 1.43-0.12 2.42-0.86 3.05-0.88 0.9-0.03 1.28 0.73 2.95 0.98 2.21 0.34 4.35-0.23 4.25-1.3-0.1-0.94-2.15-0.03-3.9-1.04-1.38-0.79-0.76-1.94-0.15-2.39 1.72-1.27 3.61-3.79 3.22-6.45z" />
    </svg>
  );
}

/** Kleiner, verschneiter Kiesel für die Bärenhöhle (Variante D1). */
function Pebble({ className }: { className?: string }) {
  return (
    <span
      className={cn("absolute rounded-full", className)}
      style={{
        background: "linear-gradient(160deg, #80705e, #4f4236)",
        boxShadow: "inset 0 -2px 3px rgba(0,0,0,0.35)",
      }}
    >
      <span
        className="absolute left-[22%] right-[22%] top-px rounded-full"
        style={{ height: "38%", background: "rgba(244,236,226,0.78)" }}
      />
    </span>
  );
}

/** Schlafender Bär — schlichte, eingerollte Silhouette (Variante „den"). */
function SleepingBear({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 116 64" className={className} aria-hidden="true">
      <ellipse cx="70" cy="44" rx="40" ry="17" fill="#f1e4cf" />
      <ellipse cx="86" cy="40" rx="24" ry="15" fill="#f1e4cf" />
      <circle cx="34" cy="42" r="16" fill="#f1e4cf" />
      <circle cx="27" cy="29" r="6.5" fill="#f1e4cf" />
      <ellipse cx="19" cy="45" rx="8" ry="6" fill="#f1e4cf" />
      <circle cx="13" cy="44" r="2.4" fill="#2a1a0e" />
      <path d="M24 41 q3.2 2.6 6.4 0" stroke="#2a1a0e" strokeWidth="1.7" fill="none" strokeLinecap="round" />
      <circle cx="56" cy="55" r="7.5" fill="#f1e4cf" />
    </svg>
  );
}

/**
 * Dezent herabrieselnde Schneeflocken für die „Bärenhöhle"-Varianten (D1/D2).
 * Reine CSS-Animation (denFall) — keine JS-DOM-Manipulation, daher SSR-/Hydration-sicher.
 * Werte sind fest gestreut (kein Math.random zur Render-Zeit), damit Server- und
 * Client-Markup identisch sind. Liegt absolut über dem Inhalt, pointer-events: none.
 */
const SNOWFLAKES = [
  { left: "6%", dur: "5.2s", delay: "-1.1s", size: "11px", opacity: 0.55 },
  { left: "14%", dur: "6.8s", delay: "-3.4s", size: "8px", opacity: 0.4 },
  { left: "23%", dur: "4.4s", delay: "-0.4s", size: "10px", opacity: 0.5 },
  { left: "31%", dur: "7.1s", delay: "-5.2s", size: "13px", opacity: 0.35 },
  { left: "40%", dur: "5.6s", delay: "-2.3s", size: "9px", opacity: 0.6 },
  { left: "49%", dur: "4.0s", delay: "-3.9s", size: "12px", opacity: 0.45 },
  { left: "57%", dur: "6.3s", delay: "-0.9s", size: "8px", opacity: 0.5 },
  { left: "65%", dur: "5.0s", delay: "-4.6s", size: "11px", opacity: 0.4 },
  { left: "72%", dur: "7.4s", delay: "-2.0s", size: "10px", opacity: 0.55 },
  { left: "80%", dur: "4.7s", delay: "-5.8s", size: "13px", opacity: 0.35 },
  { left: "87%", dur: "6.1s", delay: "-1.6s", size: "9px", opacity: 0.5 },
  { left: "93%", dur: "5.4s", delay: "-3.0s", size: "12px", opacity: 0.45 },
  { left: "37%", dur: "6.6s", delay: "-4.2s", size: "8px", opacity: 0.4 },
  { left: "61%", dur: "4.9s", delay: "-0.2s", size: "10px", opacity: 0.55 },
];

function Snowfall() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {SNOWFLAKES.map((f, i) => (
        <span
          key={i}
          className="wo-flake absolute top-[-12px] select-none leading-none text-white"
          style={{
            left: f.left,
            fontSize: f.size,
            opacity: f.opacity,
            animationDuration: f.dur,
            animationDelay: f.delay,
          }}
        >
          ❅
        </span>
      ))}
      <style>{`
        .wo-flake { animation-name: woDenFall; animation-timing-function: linear; animation-iteration-count: infinite; }
        @keyframes woDenFall {
          0%   { transform: translateY(-12px); opacity: 0; }
          15%  { opacity: 0.8; }
          100% { transform: translateY(240px); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .wo-flake { animation: none; opacity: 0.4 !important; }
        }
      `}</style>
    </div>
  );
}

interface WinterOfferProps {
  variant?: WinterVariant;
  className?: string;
}

export function WinterOffer({ variant = "card", className }: WinterOfferProps) {
  /* ── Variante A: Schmaler Hinweis-Streifen ───────────────────────── */
  if (variant === "strip") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5",
          "rounded-[var(--radius-btn)] border border-secondary-light bg-primary-pale",
          "px-5 py-3 text-[15px] text-primary-dark",
          className
        )}
      >
        <span className="inline-flex items-center gap-2 font-semibold">
          <Snowflake className="w-[17px] h-[17px] text-accent-blue" strokeWidth={1.75} />
          Winterangebot
        </span>
        <span className="h-3.5 w-px bg-secondary/70" />
        <span>
          Ab 5 Nächten nur <span className="font-bold text-primary">80 € pro Nacht</span>
          <OfferFootnote offer="winter" />
        </span>
        <span className="h-3.5 w-px bg-secondary/70" />
        <span className="text-[13px] tracking-wide text-warm-500">01.11. – 15.03.</span>
      </div>
    );
  }

  /* ── Variante C als Overlay: Glas-Kapsel über einem Bild (Hero/Galerie) ── */
  if (variant === "overlay") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-full px-3 py-2.5 pr-4.5",
          "shadow-[0_6px_24px_rgba(44,24,16,0.25)] backdrop-blur-md",
          className
        )}
        style={{ background: "rgba(253,252,250,0.92)" }}
      >
        <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-primary-pale">
          <Snowflake className="w-4 h-4 text-accent-blue" strokeWidth={1.75} />
        </span>
        <span className="text-sm text-warm-900">
          Ab 5 Nächten nur <b className="text-primary">80 €</b> / Nacht
          <span className="hidden sm:inline"> · Winter 01.11.–15.03.</span>
          <OfferFootnote offer="winter" />
        </span>
      </div>
    );
  }

  /* ── Variante C: Dezentes Inline-Preis-Highlight (Kapsel) ────────── */
  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-3 rounded-full border border-secondary bg-warm-50",
          "py-2 pl-4 pr-2.5 shadow-[var(--shadow-soft)]",
          className
        )}
      >
        <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-accent-blue-light">
          <Snowflake className="w-4 h-4 text-accent-blue" strokeWidth={1.75} />
        </span>
        <span className="text-sm text-warm-700">
          <b className="font-semibold text-primary-dark">Winterpreis</b> · ab 5 Nächten · 01.11.–15.03. (außer 21.12.–03.01.)
        </span>
        <span className="whitespace-nowrap rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-white">
          80 € / Nacht
        </span>
        <OfferFootnote offer="winter" className="text-warm-500" />
      </div>
    );
  }

  /* ── Variante D: „Bärenhöhle" — stimmungsvoll, abendlich ─────────
     D1 ("den")      = schlichter Felseingang mit verschneiten Kieseln
     D2 ("den-min")  = minimale, cleane Nische
     Der Marken-Bär im Winterschlaf in warmem Creme. Für ein eigenes
     Illustrations-Asset kann <BaerGlyph/> durch ein <Image/> ersetzt werden. */
  if (variant === "den" || variant === "den-min") {
    const isMin = variant === "den-min";
    return (
      <div
        className={cn(
          "relative mx-auto flex items-center overflow-hidden rounded-[var(--radius-card)] text-white",
          isMin ? "max-w-xl gap-6 p-8 sm:gap-7 sm:p-9" : "max-w-md gap-5 p-6",
          className
        )}
        style={{
          background:
            "radial-gradient(120% 90% at 78% 18%, rgba(141,164,180,0.18), transparent 60%), linear-gradient(155deg, #3a2412 0%, #2a1a0e 55%, #20140a 100%)",
          boxShadow: "0 14px 40px rgba(44,24,16,0.35)",
        }}
      >
        {/* Mondschein */}
        <span
          className="absolute right-6 top-[18px] h-[26px] w-[26px] rounded-full"
          style={{
            background: "radial-gradient(circle at 38% 35%, #fdf6e8, #e8d5be 70%)",
            boxShadow: "0 0 22px rgba(232,213,190,0.45)",
          }}
        />

        {/* dezent herabrieselnde Schneeflocken (D1/D2) */}
        <Snowfall />

        {isMin ? (
          /* D2 — minimale, cleane Nische */
          <div
            className="relative flex h-[120px] w-[120px] flex-shrink-0 items-end justify-center overflow-hidden rounded-full"
            style={{
              background: "radial-gradient(ellipse at 50% 36%, #2e1d10 0%, #160d06 84%)",
              boxShadow: "inset 0 6px 18px rgba(0,0,0,0.55), 0 0 0 1px rgba(232,213,190,0.14)",
            }}
          >
            <span className="absolute right-[20px] top-[18px] z-[3] font-serif text-[1rem] italic tracking-wider text-[#f4ece2] opacity-80">z Z z</span>
            <span
              className="absolute bottom-2 left-1/2 z-[1] h-[40px] w-[72px] -translate-x-1/2 rounded-full"
              style={{ background: "radial-gradient(ellipse, rgba(232,176,90,0.42), transparent 72%)" }}
            />
            <SleepingBear className="relative z-[2] mb-[18px] w-[80px]" />
          </div>
        ) : (
          /* D1 — Felseingang mit verschneiten Kieseln */
          <div
            className="relative flex h-[92px] w-[100px] flex-shrink-0 items-end justify-center"
            style={{
              borderRadius: "52% 52% 26% 26% / 64% 64% 36% 36%",
              background: "linear-gradient(158deg, #6b5847 0%, #4a3a2c 58%, #382a1e 100%)",
              boxShadow:
                "inset 0 7px 14px rgba(255,255,255,0.06), inset 0 -8px 16px rgba(0,0,0,0.45), 0 8px 18px rgba(0,0,0,0.3)",
            }}
          >
            {/* dunkler Höhlenmund */}
            <div
              className="relative flex h-[60px] w-[62px] items-end justify-center overflow-hidden"
              style={{
                borderRadius: "50% 50% 36% 36%",
                background: "radial-gradient(ellipse at 50% 34%, #2a1a0e 0%, #140c05 85%)",
                boxShadow: "inset 0 7px 16px rgba(0,0,0,0.7)",
              }}
            >
              <span className="absolute right-[9px] top-[9px] z-[3] font-serif text-[0.72rem] italic tracking-wider text-[#f4ece2] opacity-80">z Z z</span>
              <span
                className="absolute bottom-0.5 left-1/2 z-[1] h-[26px] w-[46px] -translate-x-1/2 rounded-full"
                style={{ background: "radial-gradient(ellipse, rgba(232,176,90,0.5), transparent 72%)" }}
              />
              <SleepingBear className="relative z-[2] mb-[7px] w-[50px]" />
            </div>
            {/* verschneite Kiesel */}
            <Pebble className="-left-[7px] bottom-[-3px] h-[15px] w-5" />
            <Pebble className="left-1 bottom-[9px] h-[11px] w-[13px]" />
            <Pebble className="-right-[5px] bottom-[-3px] h-[14px] w-[18px]" />
            <Pebble className="right-1.5 bottom-[11px] h-[9px] w-[11px]" />
          </div>
        )}

        <div className="relative z-[2]">
          <span className={cn(
            "inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.18em] text-secondary",
            isMin ? "mb-2.5 text-[0.78rem]" : "mb-2 text-[0.7rem]"
          )}>
            <Snowflake className={isMin ? "w-3.5 h-3.5" : "w-3 h-3"} strokeWidth={2} />
            {isMin ? "Winterruhe" : "Winterzeit"}
          </span>
          <p className={cn(
            "mb-2 font-serif italic leading-snug text-[#f4ece2]",
            isMin ? "text-[1.3rem]" : "text-[1.0625rem]"
          )}>
            „Auch wir ziehen uns in unsere Bärenhöhle zurück …&ldquo;
          </p>
          <p className={cn("text-white/70", isMin ? "text-[1rem]" : "text-[0.9rem]")}>
            {isMin ? "… und gönnen Ihnen Winterruhe: " : "… und schenken Ihnen Ruhe: "}
            ab 5 Nächten nur <b className="font-semibold text-white">80 € pro Nacht</b>
            <OfferFootnote offer="winter" className="text-white" />.
            <span className={cn("mt-1 block text-white/50", isMin ? "text-[0.85rem]" : "text-[0.78rem]")}>Winterangebot · 01.11. – 15.03.</span>
          </p>
        </div>
      </div>
    );
  }

  /* ── Variante B: Promo-Karte mit dösendem Bären (Default) ────────── */
  return (
    <div
      className={cn(
        "relative mx-auto flex max-w-md items-center gap-5 overflow-hidden",
        "rounded-[var(--radius-card)] border border-warm-200 bg-warm-50 p-7",
        "shadow-[var(--shadow-card)]",
        className
      )}
    >
      {/* dezente Schneeflocken */}
      <div className="pointer-events-none absolute inset-0">
        <Snowflake className="absolute right-6 top-4 w-3.5 h-3.5 text-secondary opacity-50" strokeWidth={1.5} />
        <Snowflake className="absolute right-12 top-10 w-2.5 h-2.5 text-secondary opacity-35" strokeWidth={1.5} />
        <Snowflake className="absolute bottom-5 right-8 w-3 h-3 text-secondary opacity-40" strokeWidth={1.5} />
      </div>

      {/* dösender Bär */}
      <div className="relative flex h-[76px] w-[76px] flex-shrink-0 items-end justify-center rounded-full bg-primary-pale">
        <span className="absolute right-1 top-1.5 font-serif text-[0.7rem] italic tracking-wider text-secondary">z z</span>
        <BaerGlyph className="mb-1.5 w-12 text-primary" />
      </div>

      <div>
        <span className="mb-1.5 inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
          <Snowflake className="w-3 h-3 text-accent-blue" strokeWidth={2} />
          Winterangebot
        </span>
        <div className="font-serif text-xl font-medium leading-tight text-primary-dark">
          Ab 5 Nächten nur <span className="font-semibold text-primary">80 € pro Nacht</span>
          <OfferFootnote offer="winter" />
        </div>
        <p className="mt-1.5 text-[13px] text-warm-500">
          Gültig vom 01.11. bis 15.03. · ausgenommen 21.12.–03.01.
        </p>
      </div>
    </div>
  );
}
