"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Shirt, Sparkles, Store } from "lucide-react";
import { cn } from "@faden/utils";
import { FeaturedBoutiquesToggle } from "@/components/discovery/featured-boutiques-toggle";
import { useDiscoveryOptional } from "@/components/discovery/discovery-context";
import { homeHref } from "@/lib/landing/home-nav";
import { parseSearchMinRating, parseSearchSort, searchHref } from "@/lib/boutique/search-nav";
import type { SearchSuggestion } from "@/lib/boutique/discovery-search";
import { suggestionKindLabel } from "@/lib/boutique/discovery-search";

interface SearchBarProps {
  className?: string;
  onFeaturedClick?: () => void;
}

function SuggestionIcon({ kind }: { kind: SearchSuggestion["kind"] }) {
  switch (kind) {
    case "boutique":
      return <Store className="h-4 w-4 shrink-0 text-gold" aria-hidden />;
    case "outfit":
      return <Shirt className="h-4 w-4 shrink-0 text-gold" aria-hidden />;
    case "fabric":
      return <Sparkles className="h-4 w-4 shrink-0 text-gold" aria-hidden />;
  }
}

export function SearchBar({ className, onFeaturedClick }: SearchBarProps) {
  const discovery = useDiscoveryOptional();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const isSearchPage = pathname === "/search";
  const urlQuery = isSearchPage ? (searchParams.get("q") ?? "") : "";
  const urlMinRating = isSearchPage ? parseSearchMinRating(searchParams.get("minRating") ?? undefined) : null;
  const urlSort = isSearchPage ? parseSearchSort(searchParams.get("sort") ?? undefined) : null;

  const [localQuery, setLocalQuery] = useState(urlQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  function appendLocationParams(params: URLSearchParams) {
    if (!discovery?.customerLocation) return;
    params.set("location", discovery.customerLocation.label);
    if (discovery.customerLocation.lat != null && discovery.customerLocation.lng != null) {
      params.set("lat", String(discovery.customerLocation.lat));
      params.set("lng", String(discovery.customerLocation.lng));
    }
  }

  useEffect(() => {
    if (isSearchPage) {
      setLocalQuery(urlQuery);
    }
  }, [isSearchPage, urlQuery]);

  useEffect(() => {
    const trimmed = localQuery.trim();
    if (trimmed.length < 1) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let mounted = true;
    setLoadingSuggestions(true);
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({ q: trimmed });
      appendLocationParams(params);

      fetch(`/api/boutiques/suggestions?${params}`)
        .then((res) => res.json())
        .then((data: { suggestions?: SearchSuggestion[] }) => {
          if (!mounted) return;
          setSuggestions(data.suggestions ?? []);
          setOpen((data.suggestions?.length ?? 0) > 0);
          setActiveIndex(-1);
        })
        .catch(() => {
          if (mounted) setSuggestions([]);
        })
        .finally(() => {
          if (mounted) setLoadingSuggestions(false);
        });
    }, 200);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [localQuery, discovery?.customerLocation]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const applySearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return;

      setLocalQuery(trimmed);
      setOpen(false);
      router.push(searchHref({ q: trimmed, minRating: urlMinRating, sort: urlSort }));
      onFeaturedClick?.();
    },
    [onFeaturedClick, router, urlMinRating, urlSort],
  );

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      applySearch(suggestions[activeIndex].value);
      return;
    }
    applySearch(localQuery);
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
      applySearch(suggestions[activeIndex].value);
    }
  }

  function handleFeaturedClick() {
    if (pathname !== "/") {
      router.push(`${homeHref()}#featured-boutiques`);
    } else {
      discovery?.focusFeaturedDiscovery();
    }
    onFeaturedClick?.();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex max-w-xl flex-1 items-center gap-2", className)}
      role="search"
    >
      <div ref={containerRef} className="relative min-w-0 flex-1">
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-indigo-400/80"
          aria-hidden
        />
        <input
          type="search"
          value={localQuery}
          onChange={(event) => {
            setLocalQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search outfit type, boutique, or fabric…"
          className="h-11 w-full rounded-full border border-border bg-background-elevated pl-11 pr-4 text-sm text-foreground placeholder:text-foreground-muted outline-none transition-all focus:border-gold/40 focus:ring-1 focus:ring-gold/30"
          aria-label="Search boutiques"
          aria-autocomplete="list"
          aria-controls={open ? listboxId : undefined}
          aria-expanded={open}
        />

        {open && (suggestions.length > 0 || loadingSuggestions) && (
          <ul
            id={listboxId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-xl border border-border bg-background-elevated py-1 shadow-lg"
          >
            {loadingSuggestions && suggestions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-foreground-muted">Searching…</li>
            ) : (
              suggestions.map((suggestion, index) => (
                <li key={`${suggestion.kind}-${suggestion.value}`} role="option" aria-selected={index === activeIndex}>
                  <button
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => applySearch(suggestion.value)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors",
                      index === activeIndex ? "bg-gold/10 text-gold" : "hover:bg-background-soft",
                    )}
                  >
                    <SuggestionIcon kind={suggestion.kind} />
                    <span className="min-w-0 flex-1 truncate font-medium">{suggestion.label}</span>
                    <span className="shrink-0 text-xs text-foreground-muted">
                      {suggestionKindLabel(suggestion.kind)}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <FeaturedBoutiquesToggle onClick={handleFeaturedClick} className="hidden sm:inline-flex" />
    </form>
  );
}
