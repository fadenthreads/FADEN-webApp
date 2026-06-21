"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { MapPin, Navigation, X } from "lucide-react";
import { Button } from "@faden/ui";
import type { CustomerLocation } from "@/lib/location/customer-location-types";
import { resolveCityCoordinates } from "@/lib/location/city-coordinates";
import { getDefaultCustomerLocation } from "@/lib/location/customer-location";

const CustomerLocationMapInner = dynamic(
  () =>
    import("@/components/location/customer-location-map-inner").then(
      (mod) => mod.CustomerLocationMapInner,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[min(50dvh,420px)] min-h-[280px] items-center justify-center rounded-xl border border-border bg-background-elevated text-sm text-foreground-muted">
        Loading map…
      </div>
    ),
  },
);

interface CustomerLocationMapDialogProps {
  open: boolean;
  initialLocation?: CustomerLocation;
  onClose: () => void;
  onConfirm: (location: CustomerLocation) => void;
}

async function reverseGeocodeLabel(lat: number, lng: number): Promise<string> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { Accept: "application/json" } },
    );
    if (!response.ok) return `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    const json = (await response.json()) as {
      address?: { suburb?: string; city?: string; state?: string };
      display_name?: string;
    };
    const parts = [
      json.address?.suburb,
      json.address?.city,
      json.address?.state,
    ].filter(Boolean);
    if (parts.length) return parts.join(", ");
    return json.display_name?.split(",").slice(0, 3).join(", ") ?? `Pinned location`;
  } catch {
    return `Pinned location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  }
}

export function CustomerLocationMapDialog({
  open,
  initialLocation,
  onClose,
  onConfirm,
}: CustomerLocationMapDialogProps) {
  const fallback = initialLocation ?? getDefaultCustomerLocation();
  const fallbackCoords =
    fallback.lat != null && fallback.lng != null
      ? { lat: fallback.lat, lng: fallback.lng }
      : resolveCityCoordinates(fallback.label) ?? { lat: 17.385, lng: 78.4867 };

  const [coords, setCoords] = useState(fallbackCoords);
  const [label, setLabel] = useState(fallback.label);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCoords(fallbackCoords);
    setLabel(fallback.label);
  }, [open, fallback.label, fallbackCoords.lat, fallbackCoords.lng]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const handlePick = useCallback(async (next: { lat: number; lng: number }) => {
    setCoords(next);
    const nextLabel = await reverseGeocodeLabel(next.lat, next.lng);
    setLabel(nextLabel);
  }, []);

  const handleUseMyLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const next = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCoords(next);
        setLabel(await reverseGeocodeLabel(next.lat, next.lng));
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-location-map-title"
        className="flex max-h-[100dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl sm:max-h-[92dvh] sm:rounded-2xl"
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-border px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-start gap-3">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
            <div className="min-w-0">
              <h2 id="customer-location-map-title" className="font-display text-lg font-semibold sm:text-xl">
                Your location
              </h2>
              <p className="mt-1 text-sm text-foreground-muted">
                Tap the map or drag the pin. We use this for distance and nearby sorting.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-2 text-foreground-muted transition-colors hover:bg-background-soft hover:text-foreground"
            aria-label="Close map"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 shrink-0 px-4 py-4 sm:px-5">
          <CustomerLocationMapInner
            key={`map-${open ? "open" : "closed"}`}
            active={open}
            lat={coords.lat}
            lng={coords.lng}
            onPick={handlePick}
          />
          <p className="mt-3 text-sm text-foreground">
            <span className="text-foreground-muted">Selected: </span>
            {label}
          </p>
          <Button
            type="button"
            variant="luxury-outline"
            className="mt-3 w-full"
            disabled={locating}
            onClick={handleUseMyLocation}
          >
            <Navigation className="mr-2 h-4 w-4" aria-hidden />
            {locating ? "Finding your location…" : "Use my current location"}
          </Button>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-2 border-t border-border px-4 py-4 sm:px-5">
          <Button type="button" variant="luxury-outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="luxury"
            onClick={() =>
              onConfirm({
                label,
                lat: coords.lat,
                lng: coords.lng,
                source: "map",
              })
            }
          >
            Save location
          </Button>
        </div>
      </div>
    </div>
  );
}
