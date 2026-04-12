"use client";

import { useEffect, useRef } from "react";
import type mapboxgl from "mapbox-gl";

const LNG = 7.6131;
const LAT = 53.6434;
const ZOOM = 15.2;
const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

const POIS = [
  { lng: 7.6093556, lat: 53.6431922, icon: "🛒", label: "EDEKA",          color: "#4A7C59" },
  { lng: 7.6103356, lat: 53.6437022, icon: "🚲", label: "Fahrradverleih", color: "#5A7A4A" },
  { lng: 7.6116424, lat: 53.6470144, icon: "🏦", label: "Volksbank", color: "#2C5F8A" },
  { lng: 7.613008,  lat: 53.645814,  icon: "🏘️", label: "Innenstadt",     color: "#8B5A2B" },
];

function createPoiMarker(icon: string, label: string, color: string): HTMLElement {
  // Feste Gesamtgröße – Hover verändert nur opacity, kein Layout-Shift
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    position: relative;
    width: 34px;
    height: 34px;
    cursor: default;
  `;

  const circle = document.createElement("div");
  circle.style.cssText = `
    width: 34px;
    height: 34px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    border: 2px solid ${color}33;
    box-shadow: 0 2px 6px rgba(0,0,0,0.16);
    transition: box-shadow 0.2s ease;
  `;
  circle.textContent = icon;
  circle.title = label;

  // Label: absolute positioniert unter dem Kreis, fixed width verhindert Reflow
  const pill = document.createElement("div");
  pill.style.cssText = `
    position: absolute;
    top: 38px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    color: #3a3a3a;
    font-size: 9px;
    font-weight: 600;
    font-family: system-ui, sans-serif;
    letter-spacing: 0.03em;
    padding: 1px 5px;
    border-radius: 20px;
    white-space: nowrap;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    pointer-events: none;
  `;
  pill.textContent = label;

  wrapper.appendChild(circle);
  wrapper.appendChild(pill);

  wrapper.onmouseenter = () => { circle.style.boxShadow = "0 4px 12px rgba(0,0,0,0.22)"; };
  wrapper.onmouseleave = () => { circle.style.boxShadow = "0 2px 6px rgba(0,0,0,0.16)"; };

  return wrapper;
}

export function MapboxMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  // Verhindert doppelte Init durch React StrictMode (mount→unmount→mount)
  const initializingRef = useRef(false);

  useEffect(() => {
    if (mapRef.current || initializingRef.current || !containerRef.current) return;
    initializingRef.current = true;

    let map: mapboxgl.Map;
    let destroyed = false;

    import("mapbox-gl").then((mod) => {
      // Cleanup wurde bereits aufgerufen (StrictMode unmount) → abbrechen
      if (destroyed || !containerRef.current) {
        initializingRef.current = false;
        return;
      }

      const mapboxgl = mod.default;
      mapboxgl.accessToken = TOKEN;

      map = new mapboxgl.Map({
        container: containerRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [LNG, LAT],
        zoom: ZOOM,
        attributionControl: false,
        scrollZoom: false,
      });

      // Haupt-Marker (Bärenstuben)
      const el = document.createElement("div");
      el.style.cssText = `
        position: relative;
        width: 22px;
        height: 22px;
        background: #723E14;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 3px 10px rgba(114,62,20,0.45);
        cursor: pointer;
        z-index: 2;
      `;

      // Label unter Haupt-Marker
      const mainLabel = document.createElement("div");
      mainLabel.style.cssText = `
        position: absolute;
        top: 26px;
        left: 50%;
        transform: translateX(-50%);
        background: #723E14;
        color: white;
        font-size: 9px;
        font-weight: 700;
        font-family: system-ui, sans-serif;
        letter-spacing: 0.04em;
        padding: 2px 6px;
        border-radius: 20px;
        white-space: nowrap;
        box-shadow: 0 2px 6px rgba(114,62,20,0.3);
      `;
      mainLabel.textContent = "Bärenstuben";

      const ring = document.createElement("div");
      ring.style.cssText = `
        position: absolute;
        inset: -7px;
        border: 2px solid rgba(114,62,20,0.25);
        border-radius: 50%;
        animation: mapPulse 2.2s ease-out infinite;
        pointer-events: none;
      `;

      const outerRing = document.createElement("div");
      outerRing.style.cssText = `
        position: absolute;
        inset: -14px;
        border: 1.5px solid rgba(114,62,20,0.12);
        border-radius: 50%;
        animation: mapPulse 2.2s ease-out 0.4s infinite;
        pointer-events: none;
      `;

      el.appendChild(ring);
      el.appendChild(outerRing);
      el.appendChild(mainLabel);

      map.on("load", () => {
        new mapboxgl.Marker({ element: el, anchor: "center" })
          .setLngLat([LNG, LAT])
          .addTo(map);

        POIS.forEach(({ lng, lat, icon, label, color }) => {
          const poiEl = createPoiMarker(icon, label, color);
          new mapboxgl.Marker({ element: poiEl, anchor: "center" })
            .setLngLat([lng, lat])
            .addTo(map);
        });
      });

      mapRef.current = map;
      initializingRef.current = false;
    });

    return () => {
      destroyed = true;
      initializingRef.current = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      {/* Adress-Badge */}
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${LAT},${LNG}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white text-[#5C4A3A] text-[11px] sm:text-xs font-medium px-2.5 sm:px-3 py-1.5 rounded-full shadow-sm"
      >
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="#723E14" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        Vor dem Drostentor 7, Esens
      </a>

      <style>{`
        @keyframes mapPulse {
          0%   { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
