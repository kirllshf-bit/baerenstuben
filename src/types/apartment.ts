export type ApartmentType = "apartment" | "apartment-gross" | "apartment-premium";

/** Preismodus: regulärer Preis (ggf. mit Langzeit-Rabatt) oder saisonaler Winterpreis. */
export type PricingMode = "normal" | "winter";

export interface ApartmentConfig {
  type: ApartmentType;
  label: string;
  size: number;
  /** Regulärer Preis/Nacht (Hauptsaison). Gilt für Nächte ohne Saison-Eintrag. */
  basePrice: number;
  /** Preis/Nacht im Winterzeitraum (01.11.–15.03. außer 21.12.–03.01., ab 5 Nächten). Ersetzt basePrice. */
  winterPrice: number;
  includedGuests: number;
  maxGuests: number;
  maxAdults: number;
  extraPersonPrice: number;
  units: number;
  description: string;
}

/** Ein Preisblock innerhalb eines Aufenthalts: n Nächte zum selben Satz. */
export interface NightlyRateSegment {
  rate: number;
  nights: number;
  label: string;
}

export interface ApartmentPriceCalculation {
  /**
   * Preis/Nacht ohne Personen-Aufpreis. Bei einem Aufenthalt über mehrere
   * Saisonzeiträume der gerundete DURCHSCHNITT – für die Anzeige, nicht für
   * die Berechnung. `totalPrice` wird immer nachtgenau aus `segments` summiert.
   */
  basePrice: number;
  extraPersonFee: number;
  /** basePrice + extraPersonFee (bei gemischter Saison ein Durchschnitt) */
  totalPerNight: number;
  nights: number;
  totalPrice: number;
  discount: number;        // Rabattbetrag in Euro
  discountPercent: number;  // 0 oder 5
  totalAfterDiscount: number;
  pricingMode: PricingMode; // "normal" oder "winter"
  /** Nachtgenaue Aufschlüsselung, chronologisch. Bei einheitlichem Preis genau ein Eintrag. */
  segments: NightlyRateSegment[];
  /** true, wenn der Aufenthalt mehrere Preisstufen umfasst (segments.length > 1) */
  isMixedSeason: boolean;
}
