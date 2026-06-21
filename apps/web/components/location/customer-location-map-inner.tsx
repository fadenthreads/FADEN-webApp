"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CustomerLocationMapInnerProps {
  lat: number;
  lng: number;
  onPick: (coords: { lat: number; lng: number }) => void;
}

const DEFAULT_ZOOM = 13;

export function CustomerLocationMapInner({ lat, lng, onPick }: CustomerLocationMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("dragend", () => {
      const position = marker.getLatLng();
      onPickRef.current({ lat: position.lat, lng: position.lng });
    });

    map.on("click", (event) => {
      marker.setLatLng(event.latlng);
      onPickRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
    });

    mapRef.current = map;
    markerRef.current = marker;

    const invalidate = () => {
      map.invalidateSize({ animate: false });
    };

    invalidate();
    const timers = [100, 300, 600].map((delay) => window.setTimeout(invalidate, delay));
    const observer = new ResizeObserver(invalidate);
    observer.observe(containerRef.current);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Map initializes once; lat/lng updates handled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: false });
    mapRef.current.invalidateSize({ animate: false });
  }, [lat, lng]);

  return (
    <div
      ref={containerRef}
      className="h-[min(52vh,420px)] min-h-[240px] w-full rounded-xl border border-border [&_.leaflet-container]:z-0 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl"
    />
  );
}
