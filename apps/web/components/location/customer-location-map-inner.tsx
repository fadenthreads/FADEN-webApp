"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface CustomerLocationMapInnerProps {
  lat: number;
  lng: number;
  active?: boolean;
  onPick: (coords: { lat: number; lng: number }) => void;
}

const DEFAULT_ZOOM = 13;

export function CustomerLocationMapInner({
  lat,
  lng,
  active = true,
  onPick,
}: CustomerLocationMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const onPickRef = useRef(onPick);

  useEffect(() => {
    onPickRef.current = onPick;
  }, [onPick]);

  useEffect(() => {
    if (!active || !containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true,
      touchZoom: true,
      dragging: true,
    });

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
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
      if (!mapRef.current) return;
      mapRef.current.invalidateSize({ animate: false });
    };

    invalidate();
    const timers = [50, 150, 350, 700, 1200].map((delay) => window.setTimeout(invalidate, delay));
    const observer = new ResizeObserver(invalidate);
    observer.observe(containerRef.current);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    if (!active || !mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: false });
    mapRef.current.invalidateSize({ animate: false });
  }, [lat, lng, active]);

  return (
    <div
      ref={containerRef}
      className="relative isolate z-[1] h-[min(50dvh,420px)] min-h-[280px] w-full touch-manipulation rounded-xl border border-border bg-background-soft [&_.leaflet-container]:!z-[1] [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full [&_.leaflet-container]:rounded-xl [&_.leaflet-pane]:!z-[1] [&_.leaflet-top]:!z-[2]"
      style={{ WebkitTapHighlightColor: "transparent" }}
    />
  );
}
