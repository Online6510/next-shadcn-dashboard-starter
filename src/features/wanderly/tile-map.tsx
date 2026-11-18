'use client';
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Destination } from './catalog';
import type { Stop } from './model';

export type PlacePin = Destination & { stop: Stop };
export default function TileMap({
  places,
  active,
  select,
  offline
}: {
  places: PlacePin[];
  active?: string;
  select: (id: string) => void;
  offline: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef(new Map<string, L.Marker>());
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView([47, 103], 5);
    map.current = instance;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom: 19
    })
      .on('tileerror', offline)
      .addTo(instance);
    return () => {
      instance.remove();
      map.current = null;
    };
  }, [offline]);
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    const group = L.layerGroup().addTo(instance);
    const bounds = L.latLngBounds([]);
    places.forEach((place, i) => {
      const position = L.latLng(place.lat, place.lon);
      const marker = L.marker(position, {
        title: place.name,
        alt: place.name,
        icon: L.divIcon({ className: 'tile-pin', html: String(i + 1), iconSize: [30, 30] })
      })
        .addTo(group)
        .on('click', () => select(place.stop.id));
      markers.current.set(place.stop.id, marker);
      bounds.extend(position);
    });
    if (bounds.isValid()) instance.fitBounds(bounds.pad(0.2), { maxZoom: 11 });
    const pins = markers.current;
    return () => {
      group.remove();
      pins.clear();
    };
  }, [places, select]);
  useEffect(() => {
    markers.current.forEach((marker, id) => {
      marker.getElement()?.classList.toggle('chosen', id === active);
      marker.setZIndexOffset(id === active ? 500 : 0);
    });
    const marker = active && markers.current.get(active);
    if (marker) map.current?.panInside(marker.getLatLng(), { animate: false });
  }, [active, places]);
  return (
    <div ref={container} className='tile-map' aria-label='Зогсоолын интерактив газрын зураг' />
  );
}
