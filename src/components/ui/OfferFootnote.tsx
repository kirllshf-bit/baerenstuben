/**
 * OfferFootnote — kleine hochgestellte Fußnoten-Zahl, die zu den
 * Angebotskonditionen im Footer springt.
 *
 * Verwendung:
 *   <OfferFootnote offer="winter" />       → ¹  (springt zu #angebot-winter)
 *   <OfferFootnote offer="saison" />       → ²  (springt zu #angebot-saison)
 *   <OfferFootnote offer="saisonpreise" /> → ³  (springt zu #saisonpreise)
 *
 * Die Zielanker liegen im Footer (siehe Footer.tsx, Abschnitt „Angebotskonditionen").
 */

import { cn } from "@/lib/utils";

type Offer = "winter" | "saison" | "saisonpreise";

const CONFIG: Record<Offer, { num: string; anchor: string; label: string }> = {
  winter: { num: "1", anchor: "#angebot-winter", label: "Konditionen zum Winterangebot" },
  saison: { num: "2", anchor: "#angebot-saison", label: "Konditionen zum Saisonangebot" },
  saisonpreise: { num: "3", anchor: "#saisonpreise", label: "Übersicht der Saisonpreise" },
};

export function OfferFootnote({
  offer,
  className,
}: {
  offer: Offer;
  className?: string;
}) {
  const { num, anchor, label } = CONFIG[offer];
  return (
    <a
      href={anchor}
      aria-label={label}
      title={label}
      className={cn(
        "ml-0.5 align-super text-[0.65em] font-semibold text-current/70 no-underline hover:text-current hover:underline",
        className
      )}
    >
      {num}
    </a>
  );
}
