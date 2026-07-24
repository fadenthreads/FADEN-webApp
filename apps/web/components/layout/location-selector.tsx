"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { cn } from "@faden/utils";
import { Button } from "@faden/ui";
import {
  CUSTOMER_LOCATIONS,
  getDefaultCustomerLocation,
  getStoredCustomerLocation,
} from "@/lib/location/customer-location";
import { resolveCityCoordinates } from "@/lib/location/city-coordinates";
import { useDiscoveryOptional } from "@/components/discovery/discovery-context";
import { CustomerLocationMapDialog } from "@/components/location/customer-location-map-dialog";

interface LocationSelectorProps {
  className?: string;
  variant?: "inline" | "drawer";
  onLocationChange?: () => void;
}

export function LocationSelector({ className, variant = "inline", onLocationChange }: LocationSelectorProps) {
  const discovery = useDiscoveryOptional();
  const [location, setLocation] = useState(getDefaultCustomerLocation);
  const [mapOpen, setMapOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredCustomerLocation();
    setLocation(stored);
  }, []);

  useEffect(() => {
    if (discovery?.customerLocation) {
      setLocation(discovery.customerLocation);
    }
  }, [discovery?.customerLocation]);

  const activeLocation = discovery?.customerLocation ?? location;

  function handlePresetChange(nextLabel: string) {
    const coords = resolveCityCoordinates(nextLabel);
    const next = {
      label: nextLabel,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      source: "preset" as const,
    };
    setLocation(next);
    discovery?.setCustomerLocation(next);
    onLocationChange?.();
  }

  const presetValue = CUSTOMER_LOCATIONS.includes(activeLocation.label as (typeof CUSTOMER_LOCATIONS)[number])
    ? activeLocation.label
    : "";

  const mapDialog = (
    <CustomerLocationMapDialog
      open={mapOpen}
      initialLocation={activeLocation}
      onClose={() => setMapOpen(false)}
      onConfirm={(next) => {
        setLocation(next);
        discovery?.setCustomerLocation(next);
        setMapOpen(false);
        onLocationChange?.();
      }}
    />
  );

  if (variant === "drawer") {
    return (
      <>
        <div className="rounded-xl border border-navy/12 bg-background-elevated p-4 shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-navy">Your location</p>
          <div className="mt-2 flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden />
            <p className="text-sm font-medium leading-snug text-navy" title={activeLocation.label}>
              {activeLocation.label}
            </p>
          </div>
          <label className="mt-3 block">
            <span className="sr-only">Select your city</span>
            <select
              value={presetValue}
              onChange={(event) => handlePresetChange(event.target.value)}
              className="faden-field mt-1 w-full text-sm"
              aria-label="Select your city"
            >
              <option value="" disabled>
                Change city
              </option>
              {CUSTOMER_LOCATIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <Button
            type="button"
            variant="luxury-outline"
            className="mt-3 h-10 w-full text-sm"
            onClick={() => setMapOpen(true)}
          >
            Pick on map
          </Button>
        </div>
        {mapDialog}
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          "flex max-w-[260px] items-center gap-1.5 rounded-md border border-border bg-background-elevated px-2 py-1.5 text-sm text-foreground-muted transition-colors hover:border-navy/25",
          className ?? "hidden md:flex",
        )}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-gold" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs text-foreground" title={activeLocation.label}>
            {activeLocation.label.split(",")[0]?.trim() || activeLocation.label}
          </p>
          <select
            value={presetValue}
            onChange={(event) => handlePresetChange(event.target.value)}
            className="mt-0.5 w-full cursor-pointer bg-transparent text-[11px] outline-none"
            aria-label="Select your city"
          >
            <option value="" disabled>
              Change city
            </option>
            {CUSTOMER_LOCATIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="luxury-outline"
          className="h-7 shrink-0 px-2 text-xs"
          onClick={() => setMapOpen(true)}
        >
          Map
        </Button>
      </div>
      {mapDialog}
    </>
  );
}
