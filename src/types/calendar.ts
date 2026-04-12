export interface DateRange {
  checkIn: string | null;
  checkOut: string | null;
}

export interface AvailabilityData {
  blockedDates: string[];
  lastUpdated: string;
  apartmentType: string;
}

export type DayStatus = "available" | "blocked" | "past" | "selected" | "in-range" | "check-in" | "check-out";
