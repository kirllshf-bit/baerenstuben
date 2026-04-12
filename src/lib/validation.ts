import { z } from "zod";

export const inquirySchema = z
  .object({
    apartmentType: z.enum(["apartment", "apartment-gross", "apartment-premium"]),
    checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum"),
    checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ungültiges Datum"),
    adults: z.number().min(1, "Mindestens 1 Erwachsener erforderlich"),
    children: z.number().min(0).max(4),
    childAges: z.array(z.number().min(0).max(17, "Kinderalter maximal 17 Jahre")),
    name: z.string().min(2, "Bitte geben Sie Ihren Namen ein."),
    email: z.string().email("Bitte geben Sie eine gültige E-Mail-Adresse ein."),
    phone: z.string().optional().default(""),
    message: z.string().optional().default(""),
    privacyConsent: z.literal(true, {
      error: "Bitte stimmen Sie der Datenschutzerklärung zu.",
    }),
  })
  .refine(
    (data) => {
      const checkIn = new Date(data.checkIn);
      const checkOut = new Date(data.checkOut);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      return diffDays >= 2;
    },
    { message: "Mindestaufenthalt: 2 Nächte.", path: ["checkOut"] }
  )
  .refine(
    (data) => data.childAges.length === data.children,
    { message: "Bitte geben Sie das Alter aller Kinder an.", path: ["childAges"] }
  )
  .refine(
    (data) => {
      const maxAdults = data.apartmentType === "apartment-premium" ? 4 : 2;
      return data.adults <= maxAdults;
    },
    { path: ["adults"], message: "Maximale Anzahl Erwachsener überschritten." }
  )
  .refine(
    (data) => {
      const maxGuests = data.apartmentType === "apartment-premium" ? 6 : 4;
      return data.adults + data.children <= maxGuests;
    },
    { path: ["children"], message: "Maximale Gästezahl überschritten." }
  );

export type InquiryInput = z.input<typeof inquirySchema>;
