"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@faden/utils";
import {
  calendarMonthLabel,
  formatDateOnly,
  getCalendarDays,
  parseIsoDate,
  toIsoDateString,
} from "@/lib/datetime/format";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
  id?: string;
  className?: string;
}

function compareIsoDates(a: string, b: string): number {
  return a.localeCompare(b);
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
  id,
  className,
}: DatePickerProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = parseIsoDate(value);
  const initialView = selected ?? new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialView.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialView.getMonth());

  useEffect(() => {
    if (!selected) return;
    setViewYear(selected.getFullYear());
    setViewMonth(selected.getMonth());
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function shiftMonth(delta: number) {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  }

  function isDisabled(date: Date): boolean {
    const iso = toIsoDateString(date);
    if (min && compareIsoDates(iso, min) < 0) return true;
    if (max && compareIsoDates(iso, max) > 0) return true;
    return false;
  }

  function selectDate(date: Date) {
    if (isDisabled(date)) return;
    onChange(toIsoDateString(date));
    setOpen(false);
  }

  const days = getCalendarDays(viewYear, viewMonth);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="faden-field flex w-full items-center justify-between gap-3 text-left"
      >
        <span className={value ? "text-foreground" : "text-foreground-muted"}>
          {value ? formatDateOnly(value) : placeholder}
        </span>
        <Calendar className="h-4 w-4 shrink-0 text-gold" aria-hidden />
      </button>

      {open && (
        <div
          id={listboxId}
          role="dialog"
          aria-label="Choose date"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 rounded-xl border border-border bg-background-elevated p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-background-soft hover:text-gold"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <p className="text-sm font-medium text-foreground">
              {calendarMonthLabel(viewYear, viewMonth)}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-background-soft hover:text-gold"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-foreground-muted">
            {WEEKDAYS.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) {
                return <span key={`empty-${index}`} aria-hidden />;
              }

              const iso = toIsoDateString(date);
              const selectedDay = value === iso;
              const disabled = isDisabled(date);
              const isToday = iso === toIsoDateString(new Date());

              return (
                <button
                  key={iso}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "aspect-square rounded-lg text-sm transition-colors",
                    selectedDay
                      ? "bg-navy text-white font-semibold"
                      : isToday
                        ? "border border-gold/40 text-gold"
                        : "text-foreground hover:bg-gold/10",
                    disabled && "cursor-not-allowed opacity-30 hover:bg-transparent",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
