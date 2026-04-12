import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { MapPin, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="kontakt" className="bg-primary-dark text-white/90">
      <Container className="py-12 sm:py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Logo & Beschreibung */}
          <div>
            <Image
              src="/logo.svg"
              alt="Bärenstuben Ferienwohnungen"
              width={150}
              height={62}
              className="h-12 w-auto brightness-0 invert mb-5"
            />
            <p className="text-white/60 text-sm leading-relaxed max-w-xs mb-5">
              Komfortable Ferienwohnungen für Ihren erholsamen Aufenthalt.
              Modern ausgestattet, liebevoll eingerichtet.
            </p>
            <a
              href="https://www.instagram.com/baerenstuben?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors group"
            >
              <span className="w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </span>
              @baerenstuben
            </a>
          </div>

          {/* Kontakt */}
          <div>
            <h3 className="font-serif text-lg font-medium text-white mb-5">Kontakt</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-secondary flex-shrink-0" />
                <span className="text-white/70">
                  Vor dem Drostentor 7<br />
                  26427 Esens
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-secondary flex-shrink-0" />
                <a href="tel:+491623994428" className="text-white/70 hover:text-white transition-colors">
                  +49 162 3994428
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                <a href="mailto:info@xn--brenstuben-q5a.de" className="text-white/70 hover:text-white transition-colors">
                  info@bärenstuben.de
                </a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-serif text-lg font-medium text-white mb-5">Informationen</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#ausstattung" className="text-white/70 hover:text-white transition-colors">
                  Unsere Wohnungen
                </a>
              </li>
              <li>
                <a href="#verfuegbarkeit" className="text-white/70 hover:text-white transition-colors">
                  Verfügbarkeit & Anfrage
                </a>
              </li>
              <li>
                <Link href="/impressum" className="text-white/70 hover:text-white transition-colors">
                  Impressum
                </Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-white/70 hover:text-white transition-colors">
                  Datenschutzerklärung
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>&copy; {new Date().getFullYear()} Bärenstuben Ferienwohnungen. Alle Rechte vorbehalten.</p>
          <div className="flex gap-4">
            <Link href="/impressum" className="hover:text-white/60 transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-white/60 transition-colors">Datenschutz</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
