export type ApartmentType = "apartment" | "apartment-gross" | "apartment-premium";

/** Preismodus: regulärer Preis (ggf. mit Langzeit-Rabatt) oder saisonaler Winterpreis. */
export type PricingMode = "normal" | "winter";

export interface ApartmentConfig {
  type: ApartmentType;
  label: string;
  size: number;
  basePrice: number;
  /** Preis/Nacht im Winterzeitraum (01.11.–15.03., ab 5 Nächten). Ersetzt basePrice. */
  winterPrice: number;
  includedGuests: number;
  maxGuests: number;
  maxAdults: number;
  extraPersonPrice: number;
  units: number;
  description: string;
}

export interface ApartmentPriceCalculation {
  basePrice: number;        // tatsächlich berechneter Basispreis/Nacht (normal oder Winter)
  extraPersonFee: number;
  totalPerNight: number;
  nights: number;
  totalPrice: number;
  discount: number;        // Rabattbetrag in Euro
  discountPercent: number;  // 0 oder 5
  totalAfterDiscount: number;
  pricingMode: PricingMode; // "normal" oder "winter"
}
