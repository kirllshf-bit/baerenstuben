/**
 * Bausteine für die Darstellung des Direktbucher-Vorteils.
 *
 * WICHTIG (rechtlich): Der durchgestrichene Preis ist KEIN früherer eigener
 * Preis, sondern der aktuelle Preis auf Buchungsportalen (portalPrice in
 * apartments.ts). Jede Verwendung muss über <OfferFootnote offer="direkt" />
 * auf die Erklärung im Footer verweisen – ein Streichpreis ohne erkennbare
 * Bezugsgröße ist wettbewerbsrechtlich angreifbar.
 *
 * Die beiden Teile sind bewusst getrennt, damit Streichpreis und Badge je
 * nach Platz nebeneinander oder untereinander gesetzt werden können.
 */

import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/utils";

/** Durchgestrichener Vergleichspreis in gedämpftem Terrakotta. */
export function StrikePrice({
  amount,
  suffix,
  className,
}: {
  amount: number;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={cn("text-error/75 line-through decoration-error/60", className)}>
      {formatEuro(amount)}
      {suffix}
    </span>
  );
}

/**
 * Spar-Badge. `variant`:
 *   "solid" — gefüllte Kapsel, für die prominente Preisvorschau
 *   "soft"  — heller Hintergrund, für Karten und Fließtext
 */
export function SavingsBadge({
  savings,
  variant = "solid",
  label,
  className,
}: {
  savings: number;
  variant?: "solid" | "soft";
  /** Ersetzt den Standardtext „Sie sparen X" – z.B. für „Bis zu X sparen". */
  label?: string;
  className?: string;
}) {
  if (savings <= 0) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full font-semibold",
        variant === "solid"
          ? "bg-error px-3 py-1 text-xs text-white shadow-[var(--shadow-soft)]"
          : "bg-error-light px-2.5 py-0.5 text-[11px] text-error",
        className
      )}
    >
      {label ?? `Sie sparen ${formatEuro(savings)}`}
    </span>
  );
}
