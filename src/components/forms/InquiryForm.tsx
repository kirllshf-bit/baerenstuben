"use client";

import { useState, useMemo } from "react";
import { format, differenceInCalendarDays } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { formatEuro } from "@/lib/utils";
import { findCombinations, MAX_TOTAL_ADULTS, MAX_TOTAL_GUESTS } from "@/lib/combinations";
import type { ApartmentCombination } from "@/lib/combinations";
import { Send, CheckCircle, AlertCircle, Info, Users, Percent } from "lucide-react";
import Link from "next/link";

interface InquiryFormProps {
  checkIn: string | null;
  checkOut: string | null;
  unitData: Record<string, { blockedDates: string[]; apartmentType: string }> | null;
}

export function InquiryForm({ checkIn, checkOut, unitData }: InquiryFormProps) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [selectedComboIndex, setSelectedComboIndex] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const nights = checkIn && checkOut
    ? differenceInCalendarDays(new Date(checkOut), new Date(checkIn))
    : 0;

  // Kombinationen berechnen
  const combinations = useMemo(() => {
    if (!checkIn || !checkOut || nights < 2 || !unitData) return [];
    return findCombinations(adults, children, nights, checkIn, checkOut, unitData);
  }, [adults, children, nights, checkIn, checkOut, unitData]);

  const selectedCombo = combinations[selectedComboIndex] || null;

  const handleChildrenChange = (count: number) => {
    setChildren(count);
    setChildAges((prev) => {
      if (count > prev.length) return [...prev, ...Array(count - prev.length).fill(0)];
      return prev.slice(0, count);
    });
    setSelectedComboIndex(0);
  };

  const handleChildAgeChange = (index: number, age: number) => {
    setChildAges((prev) => {
      const next = [...prev];
      next[index] = age;
      return next;
    });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!checkIn || !checkOut) errors.dates = "Bitte wählen Sie An- und Abreisedatum.";
    if (nights < 2) errors.dates = "Mindestaufenthalt: 2 Nächte.";
    if (!name.trim() || name.trim().length < 2) errors.name = "Bitte geben Sie Ihren Namen ein.";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Bitte geben Sie eine gültige E-Mail-Adresse ein.";
    if (!privacyConsent) errors.privacy = "Bitte stimmen Sie der Datenschutzerklärung zu.";
    if (!selectedCombo) errors.combo = "Bitte wählen Sie eine verfügbare Unterkunftskombination.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !selectedCombo) return;

    setStatus("submitting");
    setErrorMsg("");

    const checkInFormatted = checkIn ? format(new Date(checkIn), "dd.MM.yyyy") : "";
    const checkOutFormatted = checkOut ? format(new Date(checkOut), "dd.MM.yyyy") : "";

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim() || undefined,
          checkIn: checkInFormatted,
          checkOut: checkOutFormatted,
          nights,
          adults,
          children,
          childAges: children > 0 ? childAges : undefined,
          displayLabel: selectedCombo.displayLabel,
          totalPrice: selectedCombo.totalPrice,
          totalAfterDiscount: selectedCombo.totalAfterDiscount,
          discount: selectedCombo.discount,
          discountPercent: selectedCombo.discountPercent,
          website: honeypot,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Anfrage konnte nicht gesendet werden.");
      }

      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-accent-green-light rounded-[var(--radius-card)] p-6 sm:p-8 text-center">
        <CheckCircle className="w-12 h-12 text-accent-green mx-auto mb-4" />
        <h3 className="font-serif text-xl sm:text-2xl font-medium text-primary-dark mb-3">
          Vielen Dank für Ihre Anfrage!
        </h3>
        <p className="text-warm-700 leading-relaxed mb-2 text-sm sm:text-base">
          Ihre Anfrage wurde erfolgreich versendet. Sie erhalten in Kürze eine
          Bestätigung per E-Mail. Wir melden uns schnellstmöglich bei Ihnen –
          in der Regel innerhalb von 24 Stunden.
        </p>
        <p className="text-warm-500 text-xs sm:text-sm">
          Bei Fragen erreichen Sie uns jederzeit unter{" "}
          <a href="mailto:info@xn--brenstuben-q5a.de" className="text-primary underline">info@bärenstuben.de</a>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Datum-Anzeige */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Anreise</label>
          <div className={cn(
            "px-4 py-2.5 rounded-lg border bg-white text-sm",
            checkIn ? "border-primary/30 text-warm-900" : "border-warm-200 text-warm-400"
          )}>
            {checkIn
              ? format(new Date(checkIn), "dd. MMM yyyy", { locale: de })
              : "Im Kalender wählen"}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Abreise</label>
          <div className={cn(
            "px-4 py-2.5 rounded-lg border bg-white text-sm",
            checkOut ? "border-primary/30 text-warm-900" : "border-warm-200 text-warm-400"
          )}>
            {checkOut
              ? format(new Date(checkOut), "dd. MMM yyyy", { locale: de })
              : "Im Kalender wählen"}
          </div>
        </div>
      </div>
      {fieldErrors.dates && (
        <p className="text-error text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {fieldErrors.dates}
        </p>
      )}

      {/* Gäste */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Erwachsene</label>
          <select
            value={adults}
            onChange={(e) => { setAdults(Number(e.target.value)); setSelectedComboIndex(0); }}
            className="w-full px-4 py-2.5 rounded-lg border border-warm-200 bg-white text-sm text-warm-900 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          >
            {Array.from({ length: MAX_TOTAL_ADULTS }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Kinder</label>
          <select
            value={children}
            onChange={(e) => handleChildrenChange(Number(e.target.value))}
            className="w-full px-4 py-2.5 rounded-lg border border-warm-200 bg-white text-sm text-warm-900 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
          >
            {Array.from({ length: Math.max(0, MAX_TOTAL_GUESTS - adults) + 1 }, (_, i) => i).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kinderalter */}
      {children > 0 && (
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-1.5">Alter der Kinder</label>
          <div className="grid grid-cols-2 gap-2">
            {childAges.map((age, i) => (
              <select
                key={i}
                value={age}
                onChange={(e) => handleChildAgeChange(i, Number(e.target.value))}
                className="px-3 py-2 rounded-lg border border-warm-200 bg-white text-sm text-warm-900 focus:outline-none focus:border-primary/50"
              >
                {Array.from({ length: 18 }, (_, a) => a).map((a) => (
                  <option key={a} value={a}>
                    Kind {i + 1}: {a} {a === 1 ? "Jahr" : "Jahre"}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
      )}

      {/* Verfügbare Kombinationen */}
      {checkIn && checkOut && nights >= 2 && (
        <div>
          <label className="block text-sm font-medium text-warm-700 mb-2">
            Verfügbare Unterkünfte
          </label>
          {combinations.length === 0 ? (
            <div className="bg-warm-50 border border-warm-200 rounded-lg px-4 py-3 text-sm text-warm-500">
              <AlertCircle className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Leider keine passende Kombination für {adults + children} {adults + children === 1 ? "Person" : "Personen"} im gewählten Zeitraum verfügbar.
            </div>
          ) : (
            <div className="space-y-2">
              {combinations.slice(0, 5).map((combo, i) => (
                <CombinationCard
                  key={i}
                  combo={combo}
                  selected={selectedComboIndex === i}
                  onSelect={() => setSelectedComboIndex(i)}
                />
              ))}
            </div>
          )}
          {fieldErrors.combo && (
            <p className="text-error text-xs mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fieldErrors.combo}
            </p>
          )}
        </div>
      )}

      {/* Preisvorschau */}
      {selectedCombo && (
        <div className="bg-primary-pale/60 rounded-lg p-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-warm-700">
              {nights} {nights === 1 ? "Nacht" : "Nächte"} · {selectedCombo.units.length} {selectedCombo.units.length === 1 ? "Apartment" : "Apartments"}
            </span>
            <div className="text-right">
              {selectedCombo.discount > 0 && (
                <span className="text-warm-400 text-sm line-through mr-2">
                  {formatEuro(selectedCombo.totalPrice)}
                </span>
              )}
              <span className="font-serif text-xl font-medium text-primary">
                {formatEuro(selectedCombo.totalAfterDiscount)}
              </span>
            </div>
          </div>
          {selectedCombo.discount > 0 && (
            <div className="flex items-center gap-1.5 mt-1.5 text-accent-green">
              <Percent className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">
                5 % Langzeit-Rabatt ab 5 Nächten angewendet (−{formatEuro(selectedCombo.discount)})
              </span>
            </div>
          )}
          <div className="text-xs text-warm-500 mt-1">
            {selectedCombo.displayLabel}
            {selectedCombo.units.length === 1 && ` (${selectedCombo.units[0].size} m²)`}
            {": "}
            {formatEuro(selectedCombo.units.reduce((s, u) => s + u.price.totalPerNight, 0))}/Nacht
            {selectedCombo.units.some((u) => u.price.extraPersonFee > 0) && " (inkl. Aufpreis)"}
          </div>
        </div>
      )}

      <hr className="border-warm-200" />

      {/* Kontaktdaten */}
      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">
          Name <span className="text-error">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ihr vollständiger Name"
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border bg-white text-sm text-warm-900 placeholder:text-warm-400",
            "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            fieldErrors.name ? "border-error" : "border-warm-200"
          )}
        />
        {fieldErrors.name && <p className="text-error text-xs mt-1">{fieldErrors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">
          E-Mail <span className="text-error">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ihre@email.de"
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border bg-white text-sm text-warm-900 placeholder:text-warm-400",
            "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            fieldErrors.email ? "border-error" : "border-warm-200"
          )}
        />
        {fieldErrors.email && <p className="text-error text-xs mt-1">{fieldErrors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">
          Telefon <span className="text-warm-400">(optional)</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+49 123 456789"
          className="w-full px-4 py-2.5 rounded-lg border border-warm-200 bg-white text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-warm-700 mb-1.5">
          Nachricht <span className="text-warm-400">(optional)</span>
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Besondere Wünsche oder Fragen..."
          className="w-full px-4 py-2.5 rounded-lg border border-warm-200 bg-white text-sm text-warm-900 placeholder:text-warm-400 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>

      {/* Honeypot (unsichtbar für echte Nutzer, Spam-Schutz) */}
      <div className="absolute -left-[9999px]" aria-hidden="true" tabIndex={-1}>
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      {/* Datenschutz */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={privacyConsent}
          onChange={(e) => setPrivacyConsent(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-warm-300 text-primary focus:ring-primary/50"
        />
        <span className="text-xs text-warm-500 leading-relaxed">
          Ich stimme der Verarbeitung meiner Daten gemäß der{" "}
          <Link href="/datenschutz" className="text-primary underline hover:text-primary-light" target="_blank">
            Datenschutzerklärung
          </Link>{" "}
          zu. <span className="text-error">*</span>
        </span>
      </label>
      {fieldErrors.privacy && <p className="text-error text-xs">{fieldErrors.privacy}</p>}

      {/* Error Message */}
      {status === "error" && errorMsg && (
        <div className="bg-error/10 text-error rounded-lg px-4 py-3 text-sm flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={status === "submitting"}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" />
        Unverbindliche Anfrage senden
      </Button>

      {/* Hinweis */}
      <div className="flex items-start gap-2 text-xs text-warm-400">
        <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <span>
          Dies ist keine verbindliche Buchung. Die finale Verfügbarkeit und Bestätigung
          erfolgt per E-Mail durch uns.
        </span>
      </div>
    </form>
  );
}

/** Karte für eine Apartment-Kombination */
function CombinationCard({
  combo,
  selected,
  onSelect,
}: {
  combo: ApartmentCombination;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left px-4 py-3 rounded-lg border-2 transition-colors duration-200 cursor-pointer",
        selected
          ? "border-primary bg-primary-pale/50"
          : "border-warm-200 hover:border-warm-300 bg-white"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-warm-900">
            {combo.displayLabel}
          </span>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          {combo.discount > 0 && (
            <span className="text-warm-400 text-xs line-through mr-1.5">
              {formatEuro(combo.totalPrice)}
            </span>
          )}
          <span className="text-primary font-medium text-sm">
            {formatEuro(combo.totalAfterDiscount)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-1">
        <span className="text-xs text-warm-500 flex items-center gap-1">
          <Users className="w-3 h-3" />
          {combo.units.reduce((s, u) => s + u.adults, 0)} Erw.
          {combo.units.reduce((s, u) => s + u.children, 0) > 0 &&
            ` + ${combo.units.reduce((s, u) => s + u.children, 0)} Ki.`}
        </span>
        {combo.units.length > 1 && (
          <span className="text-xs text-warm-400">
            {combo.units.length} Apartments
          </span>
        )}
        {combo.discount > 0 && (
          <span className="text-xs text-accent-green font-medium flex items-center gap-0.5">
            <Percent className="w-3 h-3" />
            −5 %
          </span>
        )}
      </div>
    </button>
  );
}
