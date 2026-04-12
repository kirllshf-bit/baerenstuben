"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ApartmentType } from "@/types/apartment";
import type { AvailabilityData } from "@/types/calendar";

const POLL_INTERVAL_MS = 60 * 1000; // 1 Minute

interface UseAvailabilityResult {
  data: AvailabilityData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useAvailability(apartmentType: ApartmentType): UseAvailabilityResult {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);

    try {
      const response = await fetch(`/api/availability?type=${apartmentType}`);
      if (!response.ok) {
        throw new Error("Verfügbarkeitsdaten konnten nicht geladen werden.");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }, [apartmentType]);

  useEffect(() => {
    // Sofort laden
    fetchData();

    // Alle 60 Sekunden aktualisieren
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
