"use client";

/**
 * SeasonOffer — eigenständiges Saison-Angebot „5 % Rabatt ab 5 Nächten".
 *
 * WICHTIG: Bewusst getrennt vom Winterangebot (WinterOffer.tsx). Beide gelten
 * NICHT zusammen — der Preisrechner wendet je nach Reisezeitraum automatisch
 * nur das jeweils gültige Angebot an (siehe isWinterStay() in src/lib/apartments.ts).
 * Beide Karten dürfen aber ganzjährig sichtbar nebeneinander dargestellt werden.
 * Ruhiger grüner Akzent zur klaren Unterscheidung vom warm-braunen Winter-Element.
 *
 * Rabattwert: 5 % (entspricht DISCOUNT_PERCENT in src/lib/apartments.ts).
 *
 * Zwei Varianten über das `variant`-Prop (analog zu WinterOffer A & C):
 *   "strip" — schmaler Hinweis-Streifen
 *   "pill"  — dezentes Inline-Highlight (Kapsel, Default)
 */

import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";
import { OfferFootnote } from "@/components/ui/OfferFootnote";

interface SeasonOfferProps {
  variant?: "strip" | "pill";
  className?: string;
}

export function SeasonOffer({ variant = "pill", className }: SeasonOfferProps) {
  /* ── Variante A: Schmaler Hinweis-Streifen ───────────────────────── */
  if (variant === "strip") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-x-4 gap-y-2.5",
          "rounded-[var(--radius-btn)] border border-[#cfe0d1] bg-accent-green-light",
          "px-5 py-3 text-[15px] text-warm-900",
          className
        )}
      >
        <span className="inline-flex items-center gap-2 whitespace-nowrap font-semibold text-[#4f7a55]">
          <Percent className="w-[17px] h-[17px]" strokeWidth={2} />
          Saison-Angebot
        </span>
        <span className="h-3.5 w-px bg-[#b7ccb9]" />
        <span className="whitespace-nowrap">
          Ab 5 Nächten <span className="font-bold text-primary">5 % Rabatt</span>
          <OfferFootnote offer="saison" />
        </span>
      </div>
    );
  }

  /* ── Variante C: Dezentes Inline-Highlight (Kapsel) ──────────────── */
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3 rounded-full border border-[#cfe0d1] bg-warm-50",
        "py-2 pl-4 pr-2.5 shadow-[var(--shadow-soft)]",
        className
      )}
    >
      <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-accent-green-light">
        <Percent className="w-4 h-4 text-accent-green" strokeWidth={2} />
      </span>
      <span className="text-sm text-warm-700">
        <b className="font-semibold text-primary-dark">Saison-Angebot</b> · gültig ab 5 Nächten
      </span>
      <span className="whitespace-nowrap rounded-full bg-accent-green px-3.5 py-1.5 text-xs font-semibold text-white">
        5 % Rabatt
      </span>
      <OfferFootnote offer="saison" className="text-warm-500" />
    </div>
  );
}
