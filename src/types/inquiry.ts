import type { ApartmentType } from "./apartment";

export interface InquiryFormData {
  apartmentType: ApartmentType;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  childAges: number[];
  name: string;
  email: string;
  phone: string;
  message: string;
  privacyConsent: boolean;
}

export interface InquiryResponse {
  success: boolean;
  message: string;
}
