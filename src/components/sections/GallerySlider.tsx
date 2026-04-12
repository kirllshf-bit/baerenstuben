"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GallerySliderProps {
  title: string;
  subtitle: string;
  images: string[];
}

export function GallerySlider({ title, subtitle, images }: GallerySliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  // Verhindert, dass handleScroll den Index zurückschreibt während scrollTo läuft
  const isProgrammaticScroll = useRef(false);
  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollTo = useCallback((index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[index] as HTMLElement | undefined;
    if (!child) return;

    isProgrammaticScroll.current = true;
    setCurrentIndex(index);
    el.scrollTo({ left: child.offsetLeft, behavior: "smooth" });

    // Flag zurücksetzen sobald Scroll-Animation fertig
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = setTimeout(() => {
      isProgrammaticScroll.current = false;
    }, 500);
  }, []);

  // Nur aktiv bei echtem Touch/Drag-Scroll, nicht bei programmatischem scrollTo
  const handleScroll = useCallback(() => {
    if (isProgrammaticScroll.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.children[0] as HTMLElement | undefined;
    const secondChild = el.children[1] as HTMLElement | undefined;
    if (!firstChild) return;
    // Gap aus dem DOM lesen — korrekt auf allen Breakpoints (gap-3 mobile, gap-4 desktop)
    const gap = secondChild
      ? secondChild.offsetLeft - firstChild.offsetLeft - firstChild.offsetWidth
      : 12;
    const itemWidth = firstChild.offsetWidth + gap;
    const newIndex = Math.min(
      images.length - 1,
      Math.max(0, Math.round(el.scrollLeft / itemWidth))
    );
    setCurrentIndex(newIndex);
  }, [images.length]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, []);

  const prev = useCallback(() => scrollTo(Math.max(0, currentIndex - 1)), [currentIndex, scrollTo]);
  const next = useCallback(() => scrollTo(Math.min(images.length - 1, currentIndex + 1)), [currentIndex, images.length, scrollTo]);

  return (
    <div>
      {/* Header: Titel + Pfeile */}
      <div className="flex items-end justify-between mb-4 sm:mb-5 gap-3">
        <div className="min-w-0">
          <h3 className="font-serif text-lg sm:text-xl md:text-2xl font-medium text-primary-dark">
            {title}
          </h3>
          <p className="text-warm-500 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          <button
            onClick={prev}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-warm-100 text-warm-700 active:bg-warm-200 sm:hover:bg-warm-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Vorheriges Bild"
          >
            <ChevronLeft className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
          <span className="text-warm-400 text-xs tabular-nums w-10 text-center hidden sm:block">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={next}
            disabled={currentIndex === images.length - 1}
            className="p-2 rounded-full bg-warm-100 text-warm-700 active:bg-warm-200 sm:hover:bg-warm-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
            aria-label="Nächstes Bild"
          >
            <ChevronRight className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Slider */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory pb-4 -mx-5 px-5 sm:mx-0 sm:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {images.map((src, i) => (
          <div
            key={src}
            className="flex-shrink-0 w-[80%] sm:w-[60%] md:w-[45%] lg:w-[38%] snap-start"
          >
            <div className="relative aspect-[4/3] rounded-[var(--radius-card)] overflow-hidden bg-warm-200 shadow-[var(--shadow-card)]">
              <img
                src={src}
                alt={`${title} – Bild ${i + 1}`}
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dots — auf Mobile nur Zähler, ab sm echte Dots */}
      <div className="flex items-center justify-center mt-3 sm:mt-4">
        <span className="text-warm-400 text-xs tabular-nums sm:hidden">
          {currentIndex + 1} / {images.length}
        </span>
        <div className="hidden sm:flex items-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Bild ${i + 1}`}
              className="rounded-full cursor-pointer focus-visible:outline-none"
              style={{
                width: i === currentIndex ? "24px" : "8px",
                height: "8px",
                backgroundColor: i === currentIndex
                  ? "var(--color-primary)"
                  : "var(--color-secondary-light, #e8d5be)",
                transition: "width 250ms ease, background-color 250ms ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
