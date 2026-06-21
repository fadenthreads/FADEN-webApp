"use client";

import { useEffect, useId, useRef, useState } from "react";
import { MapPin, Store } from "lucide-react";
import { cn } from "@faden/utils";
import { useDiscoveryOptional } from "@/components/discovery/discovery-context";
import type { BoutiquePickerSuggestion } from "@/lib/boutique/discovery-search";

interface BoutiquePickerInputProps {
  slug: string;
  onSlugChange: (slug: string) => void;
  placeholder?: string;
}

export function BoutiquePickerInput({
  slug,
  onSlugChange,
  placeholder = "Start typing a boutique name…",
}: BoutiquePickerInputProps) {
  const discovery = useDiscoveryOptional();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(slug);
  const [suggestions, setSuggestions] = useState<BoutiquePickerSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  function appendLocationParams(params: URLSearchParams) {
    if (!discovery?.customerLocation) return;
    params.set("location", discovery.customerLocation.label);
    if (discovery.customerLocation.lat != null && discovery.customerLocation.lng != null) {
      params.set("lat", String(discovery.customerLocation.lat));
      params.set("lng", String(discovery.customerLocation.lng));
    }
  }

  useEffect(() => {
    if (!slug.trim()) {
      setQuery("");
      return;
    }

    let mounted = true;
    const params = new URLSearchParams({ slug: slug.trim() });
    appendLocationParams(params);

    fetch(`/api/boutiques/picker-suggestions?${params}`)
      .then((res) => res.json())
      .then((data: { boutique?: BoutiquePickerSuggestion | null }) => {
        if (!mounted) return;
        if (data.boutique) {
          setQuery(data.boutique.name);
        } else {
          setQuery(slug);
        }
      })
      .catch(() => {
        if (mounted) setQuery(slug);
      });

    return () => {
      mounted = false;
    };
  }, [slug, discovery?.customerLocation]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q: trimmed });
      appendLocationParams(params);

      fetch(`/api/boutiques/picker-suggestions?${params}`)
        .then((res) => res.json())
        .then((data: { suggestions?: BoutiquePickerSuggestion[] }) => {
          if (!mounted) return;
          setSuggestions(data.suggestions ?? []);
          setOpen((data.suggestions?.length ?? 0) > 0);
          setActiveIndex(-1);
        })
        .catch(() => {
          if (mounted) setSuggestions([]);
        })
        .finally(() => {
          if (mounted) setLoading(false);
        });
    }, 200);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [query, discovery?.customerLocation]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: BoutiquePickerSuggestion) {
    onSlugChange(suggestion.slug);
    setQuery(suggestion.name);
    setOpen(false);
    setActiveIndex(-1);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (event.key === "Escape") setOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? suggestions.length - 1 : index - 1));
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder={placeholder}
        className="faden-field"
        autoComplete="off"
        aria-autocomplete="list"
        aria-controls={open ? listboxId : undefined}
        aria-expanded={open}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onSlugChange(next.trim());
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        onKeyDown={handleKeyDown}
      />

      {open && (loading || suggestions.length > 0) && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.35rem)] z-50 max-h-60 overflow-y-auto rounded-xl border border-border bg-background-elevated py-1 shadow-lg"
        >
          {loading && suggestions.length === 0 ? (
            <li className="px-4 py-2 text-sm text-foreground-muted">Searching boutiques…</li>
          ) : (
            suggestions.map((suggestion, index) => (
              <li key={suggestion.slug} role="option" aria-selected={index === activeIndex}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectSuggestion(suggestion)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors",
                    index === activeIndex ? "bg-gold/10" : "hover:bg-background-soft",
                  )}
                >
                  <Store className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-foreground">{suggestion.name}</span>
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-foreground-muted">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                      {suggestion.location}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
