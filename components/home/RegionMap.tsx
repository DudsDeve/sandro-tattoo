"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

export function RegionMap({
  lat,
  lng,
  radius = 750,
  zoom = 14,
  className,
}: {
  lat: number;
  lng: number;
  radius?: number;
  zoom?: number;
  className?: string;
}) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let cancelled = false;
    let map: LeafletMap | null = null;

    void (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el) return;

      map = L.map(el, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: true,
        doubleClickZoom: false,
        minZoom: 5,
        maxZoom: 15,
      }).setView([lat, lng], zoomRef.current);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.circle([lat, lng], {
        radius,
        color: "#8B9A6B",
        weight: 2,
        fillColor: "#4C5634",
        fillOpacity: 0.32,
      }).addTo(map);

      mapRef.current = map;
      requestAnimationFrame(() => map?.invalidateSize());
      window.setTimeout(() => map?.invalidateSize(), 250);
    })();

    return () => {
      cancelled = true;
      map?.remove();
      mapRef.current = null;
    };
  }, [lat, lng, radius]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo([lat, lng], zoom, { duration: 1.2 });
  }, [lat, lng, zoom]);

  return <div ref={elRef} className={className} />;
}
