"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_WEBSITE_PRICING, parsePricingSnapshot, type PricingSnapshot } from "@/lib/website-pricing";

const PricingContext = createContext({ pricing: DEFAULT_WEBSITE_PRICING, refresh: async () => {}, error: false });

export function PricingProvider({ initialPricing, children }: { initialPricing: PricingSnapshot; children: React.ReactNode }) {
  const [pricing, setPricing] = useState(initialPricing);
  const requestId = useRef(0);
  const active = useRef<AbortController | null>(null);
  const [error, setError] = useState(false);
  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    active.current?.abort();
    const controller = new AbortController();
    active.current = controller;
    let timedOut = false;
    const timeout = window.setTimeout(() => { timedOut = true; controller.abort(); }, 8_000);
    try {
      const response = await fetch("/api/pricing", { cache: "no-store", signal: controller.signal });
      if (!response.ok) throw new Error("Preise nicht verfügbar");
      const next = parsePricingSnapshot(await response.json());
      if (id !== requestId.current || controller.signal.aborted) return;
      setPricing(current => current.version === next.version ? current : next);
      setError(false);
    } catch {
      if (id === requestId.current && (!controller.signal.aborted || timedOut)) setError(true);
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);
  useEffect(() => {
    const poll = () => { if (!document.hidden) void refresh(); };
    const interval = window.setInterval(poll, 30_000);
    window.addEventListener("focus", poll);
    document.addEventListener("visibilitychange", poll);
    return () => { active.current?.abort(); window.clearInterval(interval); window.removeEventListener("focus", poll); document.removeEventListener("visibilitychange", poll); };
  }, [refresh]);
  return <PricingContext.Provider value={{ pricing, refresh, error }}>{children}</PricingContext.Provider>;
}

export function usePricing() { return useContext(PricingContext); }
