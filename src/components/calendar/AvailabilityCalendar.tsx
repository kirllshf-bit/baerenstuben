"use client";

import { useState, useMemo, useCallback } from "react";
import {
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths,
  subMonths, format, isSameMonth, isBefore, isAfter, isSameDay,
  startOfDay, differenceInCalendarDays,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailabilityCalendarProps {
  blockedDates: Set<string>;
  checkIn: string | null;
  checkOut: string | null;
  onSelectDate: (dateStr: string) => void;
  loading?: boolean;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function AvailabilityCalendar({
  blockedDates,
  checkIn,
  checkOut,
  onSelectDate,
  loading,
}: AvailabilityCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const today = useMemo(() => startOfDay(new Date()), []);

  const months = useMemo(
    () => [currentMonth, addMonths(currentMonth, 1)],
    [currentMonth]
  );

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const canGoPrev = isAfter(currentMonth, startOfMonth(today));

  const checkInDate = checkIn ? startOfDay(new Date(checkIn)) : null;
  const checkOutDate = checkOut ? startOfDay(new Date(checkOut)) : null;

  const getDayStatus = useCallback(
    (date: Date): { status: string; clickable: boolean } => {
      const dateStr = format(date, "yyyy-MM-dd");
      const isPast = isBefore(date, today) && !isSameDay(date, today);

      if (isPast) return { status: "past", clickable: false };
      if (blockedDates.has(dateStr)) return { status: "blocked", clickable: false };

      if (checkInDate && isSameDay(date, checkInDate))
        return { status: "check-in", clickable: true };
      if (checkOutDate && isSameDay(date, checkOutDate))
        return { status: "check-out", clickable: true };
      if (
        checkInDate &&
        checkOutDate &&
        isAfter(date, checkInDate) &&
        isBefore(date, checkOutDate)
      )
        return { status: "in-range", clickable: true };

      return { status: "available", clickable: true };
    },
    [blockedDates, checkInDate, checkOutDate, today]
  );

  const handleDayClick = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    const { clickable } = getDayStatus(date);
    if (!clickable) return;

    // Mindestaufenthalt 2 Nächte prüfen
    if (checkIn && !checkOut) {
      const checkInD = startOfDay(new Date(checkIn));
      const diff = differenceInCalendarDays(date, checkInD);
      if (diff < 2) return; // Weniger als 2 Nächte

      // Prüfe ob blockierte Tage im Bereich liegen
      let hasBlocked = false;
      let d = addDays(checkInD, 1);
      while (isBefore(d, date)) {
        if (blockedDates.has(format(d, "yyyy-MM-dd"))) {
          hasBlocked = true;
          break;
        }
        d = addDays(d, 1);
      }
      if (hasBlocked) return;
    }

    onSelectDate(dateStr);
  };

  return (
    <div>
      {/* Navigation */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <button
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="p-2 rounded-full active:bg-warm-100 sm:hover:bg-warm-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="w-5 h-5 text-warm-700" />
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-8 md:gap-12">
          {months.map((month, idx) => (
            <span
              key={month.toISOString()}
              className={cn(
                "font-serif text-base sm:text-lg font-medium text-primary-dark",
                idx === 1 && "hidden md:block"
              )}
            >
              {format(month, "MMMM yyyy", { locale: de })}
            </span>
          ))}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full active:bg-warm-100 sm:hover:bg-warm-100 transition-colors cursor-pointer"
          aria-label="Nächster Monat"
        >
          <ChevronRight className="w-5 h-5 text-warm-700" />
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {months.map((month) => (
            <MonthGrid
              key={month.toISOString()}
              month={month}
              getDayStatus={getDayStatus}
              onDayClick={handleDayClick}
            />
          ))}
        </div>
      )}

      {/* Legende */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-6 text-xs text-warm-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-warm-50 border border-warm-300" />
          Verfügbar
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-error/20 border border-error/30" />
          Belegt
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-primary" />
          Ihre Auswahl
        </span>
      </div>

      {/* Hinweis Mindestaufenthalt */}
      {checkIn && !checkOut && (
        <p className="text-center text-sm text-warm-500 mt-3">
          Bitte wählen Sie Ihr Abreisedatum (Mindestaufenthalt: 2 Nächte)
        </p>
      )}
    </div>
  );
}

function MonthGrid({
  month,
  getDayStatus,
  onDayClick,
}: {
  month: Date;
  getDayStatus: (date: Date) => { status: string; clickable: boolean };
  onDayClick: (date: Date) => void;
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
    <div>
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
            return <div key={date.toISOString()} className="h-10" />;
          }

          return (
            <button
              key={date.toISOString()}
              onClick={() => clickable && onDayClick(date)}
              disabled={!clickable}
              className={cn(
                "h-10 text-sm font-medium rounded-md transition-all duration-150 cursor-pointer",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                status === "past" && "text-warm-300 cursor-not-allowed",
                status === "blocked" && "bg-error/10 text-error/50 cursor-not-allowed line-through",
                status === "available" && "text-warm-700 hover:bg-primary-pale hover:text-primary",
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
