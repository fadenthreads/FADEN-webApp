"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@faden/utils";
import { formatTimeLabel } from "@/lib/datetime/format";

const TIME_SLOTS = Array.from({ length: 24 * 2 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? "00" : "30";
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}).filter((slot) => {
  const hour = Number(slot.slice(0, 2));
  return hour >= 8 && hour <= 21;
});

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Pick a time",
  id,
  className,
}: TimePickerProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => setOpen((current) => !current)}
        className="faden-field flex w-full items-center justify-between gap-3 text-left"
      >
        <span className={value ? "text-foreground" : "text-foreground-muted"}>
          {value ? formatTimeLabel(value) : placeholder}
        </span>
        <Clock className="h-4 w-4 shrink-0 text-gold" aria-hidden />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-52 overflow-y-auto rounded-xl border border-border bg-background-elevated py-1 shadow-lg"
        >
          {TIME_SLOTS.map((slot) => {
            const selected = value === slot;
            return (
              <li key={slot} role="option" aria-selected={selected}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onChange(slot);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full px-4 py-2 text-left text-sm transition-colors",
                    selected ? "bg-gold/15 text-gold" : "hover:bg-background-soft",
                  )}
                >
                  {formatTimeLabel(slot)}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <label className="mt-2 block text-xs text-foreground-muted">
        Or enter a custom time
        <input
          type="time"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="faden-field mt-1 w-full"
        />
      </label>
    </div>
  );
}
