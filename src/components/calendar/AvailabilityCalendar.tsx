"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  subMonths, format, isSameMonth, isBefore, isAfter, isSameDay,
  startOfDay, differenceInCalendarDays,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Info, RotateCcw } from "lucide-react";
import { CHECK_IN_FROM, CHECK_OUT_UNTIL, MIN_NIGHTS } from "@/lib/apartments";
import {
  findUnbookableStartDates,
  findValidCheckOutDates,
  type UnitBlockedDates,
} from "@/lib/availability";
import { cn } from "@/lib/utils";

/** Modus der Datumsauswahl – der Kalender entscheidet, die Section setzt nur State. */
export type DateSelectionMode = "check-in" | "check-out";

interface AvailabilityCalendarProps {
  /**
   * Belegung je physischer Einheit. Bewusst nicht zusammengeführt: Ein
   * Aufenthalt findet in EINER Einheit statt, deshalb reicht "irgendeine
   * Einheit ist an diesem Tag frei" als Buchbarkeits-Signal nicht aus.
   */
  units: Record<string, UnitBlockedDates> | null;
  checkIn: string | null;
  checkOut: string | null;
  onSelectDate: (dateStr: string, mode: DateSelectionMode) => void;
  onReset: () => void;
  loading?: boolean;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

/** Wie lange ein Hinweis stehen bleibt, bevor er automatisch ausgeblendet wird. */
const NOTICE_TIMEOUT_MS = 8000;

/**
 * Ein Tag hat genau einen von diesen Zuständen. Rot ("unbookable") bedeutet
 * immer: nicht anklickbar – im jeweiligen Auswahlschritt nicht wählbar.
 */
type DayStatus =
  | "past"
  | "unbookable"
  | "available"
  | "too-short"
  | "check-in"
  | "check-out"
  | "in-range";

export function AvailabilityCalendar({
  units,
  checkIn,
  checkOut,
  onSelectDate,
  onReset,
  loading,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [notice, setNotice] = useState<string | null>(null);
  const today = useMemo(() => startOfDay(new Date()), []);

  const months = useMemo(
    () => [currentMonth, addMonths(currentMonth, 1)],
    [currentMonth]
  );

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const canGoPrev = isAfter(currentMonth, startOfMonth(today));

  const checkInDate = useMemo(
    () => (checkIn ? startOfDay(new Date(checkIn)) : null),
    [checkIn]
  );
  const checkOutDate = useMemo(
    () => (checkOut ? startOfDay(new Date(checkOut)) : null),
    [checkOut]
  );

  /** true, solange nur die Anreise feststeht und die Abreise gewählt werden muss. */
  const isPickingCheckOut = checkInDate !== null && checkOutDate === null;

  /** Tage, an denen kein Aufenthalt beginnen kann (gilt immer, unabhängig vom Schritt). */
  const unbookableStartDates = useMemo(
    () => (units ? findUnbookableStartDates(units, today) : new Set<string>()),
    [units, today]
  );

  /** Mögliche Abreisetage zur aktuellen Anreise – leer, wenn keine Anreise gewählt ist. */
  const validCheckOutDates = useMemo(
    () =>
      units && checkInDate && isPickingCheckOut
        ? findValidCheckOutDates(units, checkInDate)
        : new Set<string>(),
    [units, checkInDate, isPickingCheckOut]
  );

  /** Frühestmöglicher Abreisetag – für Hinweistexte. */
  const earliestCheckOut = useMemo(() => {
    if (validCheckOutDates.size === 0) return null;
    return [...validCheckOutDates].sort()[0];
  }, [validCheckOutDates]);

  // Hinweis nach einiger Zeit automatisch ausblenden
  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(null), NOTICE_TIMEOUT_MS);
    return () => clearTimeout(id);
  }, [notice]);

  /**
   * Kann an diesem Tag ein neuer Aufenthalt beginnen? Gilt für die Anreise-
   * Auswahl und für jeden Klick, der die Auswahl neu startet.
   */
  const canStartStay = useCallback(
    (dateStr: string) => !unbookableStartDates.has(dateStr),
    [unbookableStartDates]
  );

  const getDayStatus = useCallback(
    (date: Date): { status: DayStatus; clickable: boolean } => {
      const dateStr = format(date, "yyyy-MM-dd");
      if (isBefore(date, today) && !isSameDay(date, today))
        return { status: "past", clickable: false };

      // Bestehende Auswahl hat Vorrang bei der Darstellung
      if (checkInDate && isSameDay(date, checkInDate))
        return { status: "check-in", clickable: true };
      if (checkOutDate && isSameDay(date, checkOutDate))
        return { status: "check-out", clickable: true };
      if (
        checkInDate && checkOutDate &&
        isAfter(date, checkInDate) && isBefore(date, checkOutDate)
      )
        return { status: "in-range", clickable: true };

      // Abreise-Auswahl: Es zählt ausschließlich, ob der Tag eine gültige
      // Abreise ist. Alles andere ist gesperrt – zum Wechseln des Anreise-
      // tags dient "Auswahl zurücksetzen".
      if (isPickingCheckOut && checkInDate) {
        // Gültiger Abreisetag – der Tag selbst darf belegt sein, dort wird
        // nur ausgecheckt (Check-out 11:00, neue Anreise erst 14:00).
        if (validCheckOutDates.has(dateStr))
          return { status: "available", clickable: true };

        // Unter dem Mindestaufenthalt: sichtbar markieren, Klick erklärt es
        const nights = differenceInCalendarDays(date, checkInDate);
        if (nights > 0 && nights < MIN_NIGHTS)
          return { status: "too-short", clickable: true };

        return { status: "unbookable", clickable: false };
      }

      // Anreise-Auswahl: Ab hier muss ein Aufenthalt möglich sein.
      if (!canStartStay(dateStr)) return { status: "unbookable", clickable: false };

      return { status: "available", clickable: true };
    },
    [canStartStay, validCheckOutDates, checkInDate, checkOutDate, isPickingCheckOut, today]
  );

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { clickable } = getDayStatus(date);
    if (!clickable) return;

    // Noch keine Anreise gewählt oder Zeitraum vollständig → neu beginnen
    if (!checkInDate || checkOutDate) {
      setNotice(null);
      onSelectDate(dateStr, "check-in");
      return;
    }

    // Gültige Abreise
    if (validCheckOutDates.has(dateStr)) {
      setNotice(null);
      onSelectDate(dateStr, "check-out");
      return;
    }

    const nights = differenceInCalendarDays(date, checkInDate);

    // Mindestaufenthalt unterschritten → Anreise behalten, Grund erklären
    if (nights > 0 && nights < MIN_NIGHTS) {
      setNotice(
        earliestCheckOut
          ? `Mindestaufenthalt: ${MIN_NIGHTS} Nächte. Ihre Abreise ist frühestens am ` +
            `${format(new Date(earliestCheckOut), "EEEE, d. MMMM yyyy", { locale: de })} möglich.`
          : `Mindestaufenthalt: ${MIN_NIGHTS} Nächte.`
      );
      return;
    }

    // Verbleibt nur der Anreisetag selbst – alle übrigen Tage sind während
    // der Abreise-Auswahl gesperrt.
    setNotice(null);
    onSelectDate(dateStr, "check-in");
  };

  const handleReset = () => {
    setNotice(null);
    onReset();
  };

  const unbookableTooltip = isPickingCheckOut
    ? "Als Abreisetag nicht wählbar – bis dahin ist kein Apartment durchgehend frei"
    : `Nicht buchbar – ab diesem Tag ist kein Apartment ${MIN_NIGHTS} Nächte am Stück frei`;

  return (
    <div>
      {/* Navigation über den angezeigten Zeitraum */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-full active:bg-warm-100 sm:hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="w-5 h-5 text-warm-700" />
        </button>
        <span className="font-serif text-base sm:text-lg font-medium text-primary-dark text-center">
          {format(months[0], "MMMM", { locale: de })} –{" "}
          {format(months[1], "MMMM yyyy", { locale: de })}
        </span>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full active:bg-warm-100 sm:hover:bg-warm-100 transition-colors cursor-pointer"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="w-5 h-5 text-warm-700" />
        </button>
      </div>

      {/* Legende – direkt unter der Navigation, damit sie vor dem Gitter
          gelesen wird und nicht unter zwei Monaten verschwindet. */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-lg bg-warm-50 px-3 py-2.5 text-xs text-warm-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-white border border-warm-300" />
          {isPickingCheckOut ? "Abreise möglich" : "Verfügbar"}
        </span>
        <span className="flex items-center gap-1.5" title={unbookableTooltip}>
          <span className="w-3 h-3 rounded-sm bg-error/20 border border-error/30" />
          Nicht buchbar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary" />
          Ihre Auswahl
        </span>
        {isPickingCheckOut && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-warm-100 border border-dashed border-warm-400" />
            Unter Mindestaufenthalt
          </span>
        )}
      </div>

      {/* Hinweis Mindestaufenthalt + Anreisedatum wechseln */}
      {isPickingCheckOut && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-center text-sm text-warm-500">
          <span>
            {earliestCheckOut
              ? `Bitte wählen Sie Ihr Abreisedatum · Mindestaufenthalt ${MIN_NIGHTS} Nächte · ` +
                `frühestens ${format(new Date(earliestCheckOut), "d. MMMM", { locale: de })}`
              : "Von diesem Tag aus ist derzeit kein Aufenthalt möglich."}
          </span>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary-pale/60 px-3 py-1 font-medium text-primary transition-colors hover:bg-primary-pale cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Anderes Anreisedatum wählen
          </button>
        </div>
      )}

      {/* Kontextabhängiger Hinweis */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 flex items-start gap-2 rounded-lg bg-accent-blue-light px-4 py-3 text-sm text-warm-700"
        >
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent-blue" />
          <span>{notice}</span>
        </div>
      )}

      {/* Monate untereinander – füllt die Kalender-Spalte aus und lässt die
          Tage größer werden. Weiterhin nur aktueller + nächster Monat. */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-6 sm:gap-8">
          {months.map((month) => (
            <MonthGrid
              key={month.toISOString()}
              month={month}
              getDayStatus={getDayStatus}
              onDayClick={handleDayClick}
              unbookableTooltip={unbookableTooltip}
            />
          ))}
        </div>
      )}

      <p className="mt-5 text-center text-xs text-warm-400">
        Check-in ab {CHECK_IN_FROM} · Check-out bis {CHECK_OUT_UNTIL}
      </p>
    </div>
  );
}

function MonthGrid({
  month,
  getDayStatus,
  onDayClick,
  unbookableTooltip,
}: {
  month: Date;
  getDayStatus: (date: Date) => { status: DayStatus; clickable: boolean };
  onDayClick: (date: Date) => void;
  unbookableTooltip: string;
}) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = startOfWeek(monthStart, { locale: de });
  const calendarEnd = endOfWeek(monthEnd, { locale: de });

  const days: Date[] = [];
  let current = calendarStart;
  while (isBefore(current, calendarEnd) || isSameDay(current, calendarEnd)) {
    days.push(current);
    current = addDays(current, 1);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Monatsname – auch auf Mobile, sonst steht das zweite Gitter ohne Bezug da */}
      <h4 className="mb-2 text-center font-serif text-base sm:text-lg font-medium text-primary-dark">
        {format(month, "MMMM yyyy", { locale: de })}
      </h4>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-warm-400 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7">
        {days.map((date) => {
          const isCurrentMonth = isSameMonth(date, month);
          const { status, clickable } = getDayStatus(date);
          const dateStr = format(date, "d");

          if (!isCurrentMonth) {
            return <div key={date.toISOString()} className="h-11 sm:h-12" />;
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => clickable && onDayClick(date)}
              disabled={!clickable}
              title={
                status === "too-short"
                  ? `Mindestaufenthalt: ${MIN_NIGHTS} Nächte`
                  : status === "unbookable"
                    ? unbookableTooltip
                    : undefined
              }
              className={cn(
                "h-11 sm:h-12 text-sm sm:text-base font-medium rounded-md transition-all duration-150 cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                status === "past" && "text-warm-300 cursor-not-allowed",
                status === "unbookable" && "bg-error/10 text-error/50 cursor-not-allowed",
                status === "available" && "text-warm-700 hover:bg-primary-pale hover:text-primary",
                status === "too-short" &&
                  "bg-warm-100 text-warm-400 outline-1 outline-dashed -outline-offset-2 outline-warm-400 cursor-help",
                status === "check-in" && "bg-primary text-white rounded-l-lg rounded-r-md",
                status === "check-out" && "bg-primary text-white rounded-r-lg rounded-l-md",
                status === "in-range" && "bg-primary/15 text-primary",
                !clickable && "cursor-not-allowed"
              )}
            >
              {dateStr}
            </button>
          );
        })}
      </div>
    </div>
  );
}
