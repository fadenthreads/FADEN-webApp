"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@faden/ui";
import { CustomerLocationMapDialog } from "@/components/location/customer-location-map-dialog";
import { FormField, TextArea } from "@/components/ui/form-field";
import type { CustomerLocation } from "@/lib/location/customer-location-types";
import {
  getDefaultCustomerLocation,
  getStoredCustomerLocation,
} from "@/lib/location/customer-location";

interface HomeVisitLocationPickerProps {
  locationLabel: string;
  lat: number | null;
  lng: number | null;
  landmarkNotes: string;
  onLocationChange: (patch: {
    homeVisitLocationLabel: string;
    homeVisitLat: number | null;
    homeVisitLng: number | null;
  }) => void;
  onLandmarkNotesChange: (homeVisitNotes: string) => void;
}

function toMapLocation(
  label: string,
  lat: number | null,
  lng: number | null,
): CustomerLocation {
  const fallback = getStoredCustomerLocation();
  return {
    label: label.trim() || fallback.label,
    lat: lat ?? fallback.lat ?? getDefaultCustomerLocation().lat,
    lng: lng ?? fallback.lng ?? getDefaultCustomerLocation().lng,
    source: lat != null && lng != null ? "map" : fallback.source,
  };
}

export function HomeVisitLocationPicker({
  locationLabel,
  lat,
  lng,
  landmarkNotes,
  onLocationChange,
  onLandmarkNotesChange,
}: HomeVisitLocationPickerProps) {
  const [mapOpen, setMapOpen] = useState(false);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (seeded || locationLabel || lat != null) return;
    const stored = getStoredCustomerLocation();
    if (stored.lat != null && stored.lng != null) {
      onLocationChange({
        homeVisitLocationLabel: stored.label,
        homeVisitLat: stored.lat,
        homeVisitLng: stored.lng,
      });
    }
    setSeeded(true);
  }, [seeded, locationLabel, lat, onLocationChange]);

  const hasPin = lat != null && lng != null;

  return (
    <>
      <FormField
        label="Visit location on map"
        hint="Pin where the boutique team should come. You can adjust the marker on the map."
      >
        <div className="rounded-xl border border-border bg-background-elevated p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-red-accent" aria-hidden />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {hasPin ? locationLabel || "Pinned location" : "No location selected yet"}
                </p>
                {hasPin && (
                  <p className="mt-0.5 text-xs text-foreground-muted">
                    {lat!.toFixed(5)}, {lng!.toFixed(5)}
                  </p>
                )}
              </div>
            </div>
            <Button type="button" variant="luxury-outline" size="sm" onClick={() => setMapOpen(true)}>
              {hasPin ? "Change on map" : "Choose on map"}
            </Button>
          </div>
        </div>
      </FormField>

      <FormField
        label="Landmark / flat / gate details"
        hint="Building name, floor, gate code, or nearby landmark to help the team find you."
      >
        <TextArea
          placeholder="e.g. Green Valley Apartments, Flat 402, near City Mall gate 2…"
          value={landmarkNotes}
          onChange={(event) => onLandmarkNotesChange(event.target.value)}
        />
      </FormField>

      <CustomerLocationMapDialog
        open={mapOpen}
        initialLocation={toMapLocation(locationLabel, lat, lng)}
        onClose={() => setMapOpen(false)}
        onConfirm={(location) => {
          onLocationChange({
            homeVisitLocationLabel: location.label,
            homeVisitLat: location.lat,
            homeVisitLng: location.lng,
          });
          setMapOpen(false);
        }}
      />
    </>
  );
}
