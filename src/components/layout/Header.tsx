"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Wohnungen", href: "#ausstattung" },
  { label: "Galerie", href: "#galerie" },
  { label: "Lage", href: "#lage" },
  { label: "Verfügbarkeit", href: "#verfuegbarkeit" },
  { label: "Kontakt", href: "#kontakt" },
];

export function Header() {
  // overHero: true = Logo über dunklem Hero → weißes Logo
  //           false = Hero verlassen → braunes Logo + heller Header
  const [overHero, setOverHero] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
      e.preventDefault();
      setMobileOpen(false);
      const anchor = hash.slice(1); // strip leading '#'
      if (pathname === "/") {
        // Bereits auf der Startseite → direkt scrollen
        const el = document.getElementById(anchor);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Unterseite → zur Startseite navigieren, dann scrollen
        router.push(`/#${anchor}`);
      }
    },
    [pathname, router]
  );

  // Nach Navigation von Unterseite → Startseite: Hash-Anker scrollen
  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash;
    if (!hash) return;
    const anchor = hash.slice(1);
    // Kurz warten bis die Seite gerendert ist
    const timer = setTimeout(() => {
      const el = document.getElementById(anchor);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const sentinel = document.getElementById("hero-sentinel");
    if (!sentinel) {
      // Keine Hero-Section (Impressum, Datenschutz etc.): Header fest im hellen Zustand
      setOverHero(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Sentinel sichtbar → wir sind noch im Hero-Bereich
        setOverHero(entry.isIntersecting);
      },
      {
        // rootMargin: Der Header ist ca. 80px hoch; sobald der Sentinel
        // hinter der unteren Kante des Headers verschwindet, gilt Hero als verlassen.
        rootMargin: "-80px 0px 0px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-[padding,background-color,box-shadow,border-color] duration-500 will-change-[padding,background-color]",
          overHero
            ? "py-6 bg-transparent"
            : "py-3 bg-[#FAF6F1]/96 backdrop-blur-lg shadow-[0_2px_20px_rgba(114,62,20,0.08)] border-b border-[#D4B896]/30"
        )}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* Logo – zwei Varianten übereinander, sanfte Opacity-Überblendung */}
          <Link href="/" className="flex-shrink-0 group" aria-label="Bärenstuben – Startseite">
            <div
              className={cn(
                "relative transition-[width,height] duration-500 ease-in-out group-hover:opacity-80",
                overHero ? "h-12" : "h-10"
              )}
              style={{ aspectRatio: "250 / 103" }}
            >
              {/* Weißes Logo (Hero-Zustand) */}
              <Image
                src="/logo-white.svg"
                alt=""
                aria-hidden="true"
                fill
                priority
                className={cn(
                  "object-contain transition-opacity duration-500 ease-in-out",
                  overHero ? "opacity-100" : "opacity-0"
                )}
              />
              {/* Braunes Logo (heller Hintergrund) */}
              <Image
                src="/logo.svg"
                alt="Bärenstuben Ferienwohnungen"
                fill
                priority
                className={cn(
                  "object-contain transition-opacity duration-500 ease-in-out",
                  overHero ? "opacity-0" : "opacity-100"
                )}
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={cn(
                  "text-sm font-medium tracking-wide transition-colors duration-200 relative",
                  "after:absolute after:bottom-[-3px] after:left-0 after:h-px after:w-0 after:transition-all after:duration-200 hover:after:w-full",
                  overHero
                    ? "text-white/85 hover:text-white after:bg-white/60"
                    : "text-[#5C4A3A] hover:text-primary after:bg-primary"
                )}
              >
                {item.label}
              </a>
            ))}

            {/* Instagram */}
            <a
              href="https://www.instagram.com/baerenstuben?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className={cn(
                "p-2 rounded-lg transition-colors duration-200",
                overHero ? "text-white/70 hover:text-white" : "text-[#5C4A3A]/60 hover:text-primary"
              )}
            >
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* CTA Button */}
            <a
              href="#verfuegbarkeit"
              onClick={(e) => handleNavClick(e, "#verfuegbarkeit")}
              className={cn(
                "text-sm font-medium px-5 py-2.5 rounded-[var(--radius-btn)] transition-all duration-200 tracking-wide",
                overHero
                  ? "bg-white/15 text-white border border-white/25 hover:bg-white/22"
                  : "bg-primary text-white hover:bg-primary-dark shadow-sm"
              )}
            >
              Anfrage senden
            </a>
          </nav>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              "md:hidden p-2 rounded-lg transition-colors",
              overHero
                ? "text-white hover:bg-white/10"
                : "text-[#5C4A3A] hover:bg-warm-100"
            )}
            aria-label="Menü öffnen"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 z-[70] w-72 bg-[#FAF6F1] shadow-2xl transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-5 border-b border-[#D4B896]/40">
          {/* Logo in Originalfarbe im Mobile-Menü */}
          <Image
            src="/logo.svg"
            alt="Bärenstuben"
            width={120}
            height={50}
            className="h-9 w-auto"
          />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg text-warm-500 hover:bg-warm-200 transition-colors"
            aria-label="Menü schließen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="p-5 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="px-4 py-3.5 text-[#5C4A3A] font-medium rounded-lg hover:bg-primary-pale hover:text-primary transition-colors text-[15px]"
            >
              {item.label}
            </a>
          ))}
          <div className="mt-5 pt-5 border-t border-[#D4B896]/40">
            <a
              href="#verfuegbarkeit"
              onClick={(e) => handleNavClick(e, "#verfuegbarkeit")}
              className="block text-center px-4 py-3.5 bg-primary text-white font-medium rounded-[var(--radius-btn)] hover:bg-primary-dark transition-colors shadow-sm text-[15px]"
            >
              Anfrage senden
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
