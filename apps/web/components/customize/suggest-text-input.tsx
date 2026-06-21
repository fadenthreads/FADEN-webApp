"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@faden/utils";
import {
  applySuggestionToValue,
  filterFabricSuggestions,
  getActiveToken,
} from "@/data/fabric-options";

interface SuggestTextInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: readonly string[];
  placeholder?: string;
  /** Allow comma-separated values (e.g. multiple colours). */
  multi?: boolean;
  id?: string;
}

export function SuggestTextInput({
  value,
  onChange,
  suggestions,
  placeholder,
  multi = true,
  id,
}: SuggestTextInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [cursorIndex, setCursorIndex] = useState<number | null>(null);

  const activeToken = getActiveToken(value, cursorIndex);
  const filtered = filterFabricSuggestions(suggestions, activeToken);
  const showSuggestions = open && activeToken.length > 0 && filtered.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function applySuggestion(suggestion: string) {
    const next = multi
      ? applySuggestionToValue(value, cursorIndex, suggestion, true)
      : suggestion;
    onChange(next);
    setOpen(false);
    setActiveIndex(-1);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % filtered.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? filtered.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      applySuggestion(filtered[activeIndex]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        className="faden-field"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-expanded={showSuggestions}
        onChange={(event) => {
          onChange(event.target.value);
          setCursorIndex(event.target.selectionStart);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={(event) => {
          setCursorIndex(event.target.selectionStart);
          setOpen(true);
        }}
        onClick={(event) => setCursorIndex(event.currentTarget.selectionStart)}
        onKeyUp={(event) => setCursorIndex(event.currentTarget.selectionStart)}
        onKeyDown={handleKeyDown}
      />

      {showSuggestions && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-52 overflow-y-auto rounded-xl border border-border bg-background-elevated py-1 shadow-lg"
        >
          {filtered.map((suggestion, index) => (
            <li key={suggestion} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => applySuggestion(suggestion)}
                className={cn(
                  "flex w-full px-4 py-2 text-left text-sm transition-colors",
                  index === activeIndex ? "bg-gold/10 text-gold" : "hover:bg-background-soft",
                )}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
