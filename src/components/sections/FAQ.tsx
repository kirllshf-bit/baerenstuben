"use client";

/**
 * FAQ — Accordion-Sektion im Bärenstuben-Stil.
 *
 * Aktuell PLATZHALTER-Inhalte. Die echten Fragen/Antworten und ihre Reihenfolge
 * werden später im FAQS-Array unten ersetzt.
 *
 * Verhalten: Einfach-geöffnetes Accordion (immer nur eine Frage offen),
 * erstes Element beim Laden geöffnet. Animierte Höhe über grid-rows-Trick.
 *
 * Struktur eines Eintrags: { q: "Frage?", a: ["Absatz 1", "Absatz 2", …] }
 */

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * Antwort-Block: entweder ein Text-Absatz ({ text }), eine Aufzählung
 * ({ list }) oder eine Zwischenüberschrift ({ subheading }).
 */
type FaqBlock =
  | { text: string }
  | { list: string[] }
  | { subheading: string };

interface FaqEntry {
  q: string;
  a: FaqBlock[];
}

const FAQS: FaqEntry[] = [
  {
    q: "Was ist alles im Preis inbegriffen?",
    a: [
      { text: "Im Preis enthalten sind unter anderem:" },
      {
        list: [
          "Handtücher",
          "Bettwäsche",
          "Toilettenpapier",
          "Kaffee",
          "Salz, Pfeffer & Zucker",
          "verschiedene Küchenutensilien",
          "weitere kleine Hygiene- und Alltagsartikel",
        ],
      },
    ],
  },
  {
    q: "Wie sieht es mit der Erreichbarkeit aus?",
    a: [
      {
        text:
          "Wir sind jederzeit erreichbar und helfen bei Fragen oder Problemen schnell weiter – innerhalb weniger Minuten sind wir vor Ort und natürlich immer telefonisch erreichbar.",
      },
    ],
  },
  {
    q: "Was ist die NordseeCard?",
    a: [
      {
        text:
          "Die NordseeCard ist der offizielle Gästebeitrag (Kurbeitrag) der Region Esens-Bensersiel. Er ist verpflichtend und wird direkt an die Kurverwaltung abgeführt. Im Gegenzug erhalten Sie verschiedene Vorteile und Vergünstigungen in der Region.",
      },
      { subheading: "15.03. – 31.10." },
      {
        list: [
          "Erwachsene ab 16 Jahren: 3,20 € pro Nacht",
          "Kinder von 6–15 Jahren: 1,00 € pro Nacht",
          "Kinder unter 6 Jahren: kostenlos",
        ],
      },
      { subheading: "01.11. – 14.03." },
      {
        list: [
          "Erwachsene ab 16 Jahren: 1,00 € pro Nacht",
          "Kinder von 6–15 Jahren: 0,50 € pro Nacht",
          "Kinder unter 6 Jahren: kostenlos",
        ],
      },
    ],
  },
  {
    q: "Wie sieht es mit den Parkmöglichkeiten aus?",
    a: [
      {
        text:
          "Kostenlose Parkplätze befinden sich direkt hinter dem Haus – ruhig und etwas abseits der Hauptstraße gelegen. Lange Laufwege gibt es also nicht.",
      },
    ],
  },
  {
    q: "Wie flexibel sind die Ankunftszeiten?",
    a: [
      {
        text:
          "Der Check-in ist ab 12:00 Uhr möglich. Danach können Sie flexibel anreisen – ob nachmittags oder spät abends.",
      },
      {
        text:
          "Für späte Anreisen stehen Schlüsselboxen zur Verfügung. Den persönlichen Code erhalten Sie vor der Anreise.",
      },
    ],
  },
  {
    q: "Sind Haustiere erlaubt?",
    a: [
      {
        text:
          "Leider sind Haustiere nicht erlaubt. So möchten wir auch Gästen mit Tierhaarallergien einen angenehmen Aufenthalt ermöglichen.",
      },
    ],
  },
  {
    q: "Kann man Fahrräder abstellen?",
    a: [
      {
        text:
          "Ja, Fahrräder können sicher bei uns abgestellt und angeschlossen werden. Eine überdachte Abstellmöglichkeit ist bereits geplant und folgt in Kürze.",
      },
    ],
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-(--spacing-section-sm) md:py-(--spacing-section)">
      <Container narrow>
        <SectionHeading
          title="Häufige Fragen"
          subtitle="Antworten auf die wichtigsten Fragen rund um Ihren Aufenthalt"
        />

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={cn(
                  "overflow-hidden rounded-[var(--radius-card)] border bg-warm-50 transition-[box-shadow,border-color] duration-300",
                  isOpen
                    ? "border-secondary-light shadow-[var(--shadow-card)]"
                    : "border-warm-200"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left sm:gap-[18px] sm:px-6"
                >
                  <span className="flex-shrink-0 font-serif text-[0.95rem] text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-[1.0625rem] font-semibold leading-snug text-warm-900">
                    {item.q}
                  </span>
                  <span
                    className={cn(
                      "flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color] duration-300",
                      isOpen ? "rotate-180 bg-primary text-white" : "bg-primary-pale text-primary"
                    )}
                  >
                    <ChevronDown className="w-[17px] h-[17px]" strokeWidth={2} />
                  </span>
                </button>

                {/* animierte Höhe via grid-rows */}
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="px-6 pb-6 pl-[60px] text-base leading-relaxed text-warm-700">
                      {item.a.map((block, j) => {
                        if ("list" in block) {
                          return (
                            <ul key={j} className={cn("space-y-1.5", j > 0 && "mt-3")}>
                              {block.list.map((li, k) => (
                                <li key={k} className="flex items-start gap-2.5">
                                  <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                  <span>{li}</span>
                                </li>
                              ))}
                            </ul>
                          );
                        }
                        if ("subheading" in block) {
                          return (
                            <p key={j} className={cn("font-semibold text-warm-900", j > 0 && "mt-4")}>
                              {block.subheading}
                            </p>
                          );
                        }
                        return (
                          <p key={j} className={j > 0 ? "mt-3" : undefined}>
                            {block.text}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
