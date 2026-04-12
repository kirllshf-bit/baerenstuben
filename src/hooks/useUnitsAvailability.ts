"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UnitsData {
  units: Record<string, { blockedDates: string[]; apartmentType: string }>;
  lastUpdated: string;
}

const POLL_INTERVAL_MS = 60 * 1000;

export function useUnitsAvailability() {
  const [data, setData] = useState<UnitsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch("/api/availability-units");
      if (!response.ok) throw new Error("Verfügbarkeitsdaten konnten nicht geladen werden.");
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
