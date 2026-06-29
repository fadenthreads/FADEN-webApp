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
}

export function LocationSelector({ className }: LocationSelectorProps) {
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
  }

  const presetValue = CUSTOMER_LOCATIONS.includes(activeLocation.label as (typeof CUSTOMER_LOCATIONS)[number])
    ? activeLocation.label
    : "";

  return (
    <>
      <div
        className={cn(
          "flex max-w-[260px] items-center gap-1.5 rounded-md border border-border bg-background-elevated px-2 py-1.5 text-sm text-foreground-muted transition-colors hover:border-gold/40",
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

      <CustomerLocationMapDialog
        open={mapOpen}
        initialLocation={activeLocation}
        onClose={() => setMapOpen(false)}
        onConfirm={(next) => {
          setLocation(next);
          discovery?.setCustomerLocation(next);
          setMapOpen(false);
        }}
      />
    </>
  );
}
