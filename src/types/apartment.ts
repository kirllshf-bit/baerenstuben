export type ApartmentType = "apartment" | "apartment-gross" | "apartment-premium";

export interface ApartmentConfig {
  type: ApartmentType;
  label: string;
  size: number;
  basePrice: number;
  includedGuests: number;
  maxGuests: number;
  maxAdults: number;
  extraPersonPrice: number;
  units: number;
  description: string;
}

export interface ApartmentPriceCalculation {
  basePrice: number;
  extraPersonFee: number;
  totalPerNight: number;
  nights: number;
  totalPrice: number;
  discount: number;        // Rabattbetrag in Euro
  discountPercent: number;  // 0 oder 5
  totalAfterDiscount: number;
}
