"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  customerLocationToGeoPoint,
  getDefaultCustomerLocation,
  getStoredCustomerLocation,
  setStoredCustomerLocation,
} from "@/lib/location/customer-location";
import type { CustomerLocation } from "@/lib/location/customer-location-types";
import { isBrowserSupabaseConfigured } from "@/lib/supabase/client";

interface DiscoveryContextValue {
  customerLocation: CustomerLocation;
  locationLabel: string;
  customerCoordinates: { lat: number; lng: number } | null;
  setCustomerLocation: (location: CustomerLocation) => void;
  setLocationLabel: (location: string) => void;
  focusFeaturedDiscovery: () => void;
}

const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [customerLocation, setCustomerLocationState] = useState<CustomerLocation>(getDefaultCustomerLocation);

  useEffect(() => {
    setCustomerLocationState(getStoredCustomerLocation());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isBrowserSupabaseConfigured()) return;

    fetch("/api/account/location")
      .then((res) => res.json())
      .then((data: { location?: CustomerLocation | null }) => {
        if (!data.location?.label) return;
        const hasStoredPin = getStoredCustomerLocation().source === "map";
        if (hasStoredPin) return;
        setCustomerLocationState(data.location);
        setStoredCustomerLocation(data.location);
      })
      .catch(() => {
        /* guest or offline */
      });
  }, []);

  const setCustomerLocation = useCallback((location: CustomerLocation) => {
    setCustomerLocationState(location);
    setStoredCustomerLocation(location);

    if (!isBrowserSupabaseConfigured()) return;

    fetch("/api/account/location", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label: location.label,
        lat: location.lat,
        lng: location.lng,
      }),
    }).catch(() => {
      /* guest users */
    });
  }, []);

  const setLocationLabel = useCallback((label: string) => {
    const coords = customerLocationToGeoPoint({ label, lat: null, lng: null, source: "preset" });
    setCustomerLocation({
      label,
      lat: coords?.lat ?? null,
      lng: coords?.lng ?? null,
      source: "preset",
    });
  }, [setCustomerLocation]);

  const customerCoordinates = useMemo(() => customerLocationToGeoPoint(customerLocation), [customerLocation]);

  const focusFeaturedDiscovery = useCallback(() => {
    if (typeof window === "undefined") return;
    window.location.hash = "featured-boutiques";
    requestAnimationFrame(() => {
      document.getElementById("featured-boutiques")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const value = useMemo(
    () => ({
      customerLocation,
      locationLabel: customerLocation.label,
      customerCoordinates,
      setCustomerLocation,
      setLocationLabel,
      focusFeaturedDiscovery,
    }),
    [customerLocation, customerCoordinates, setCustomerLocation, setLocationLabel, focusFeaturedDiscovery],
  );

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext);
  if (!ctx) throw new Error("useDiscovery must be used within DiscoveryProvider");
  return ctx;
}

export function useDiscoveryOptional() {
  return useContext(DiscoveryContext);
}
