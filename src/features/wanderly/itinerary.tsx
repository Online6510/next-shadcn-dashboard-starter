'use client';

import { useState } from 'react';
import { destinations, dateLabel, money } from './catalog';
import { ActionForm, StopForm } from './forms';
import type { Stop } from './model';
import boundary from './boundary.json';
import lakeBoundary from './lake-boundary.json';

const countryBounds = { left: 86, right: 121, bottom: 40, top: 54 };

function Map({
  stops,
  selected,
  select
}: {
  stops: Stop[];
  selected?: string;
  select: (id: string) => void;
}) {
  const [country, setCountry] = useState(false);
  const places = stops.flatMap((stop) => {
    const place = destinations.find((item) => item.id === stop.destination);
    return place ? [{ ...place, stop }] : [];
  });
  const active = places.find((place) => place.stop.id === selected);
  const bounds =
    country || !places.length
      ? countryBounds
      : {
          left: Math.min(...places.map((place) => place.lon)) - 0.7,
          right: Math.max(...places.map((place) => place.lon)) + 0.7,
          bottom: Math.min(...places.map((place) => place.lat)) - 0.4,
          top: Math.max(...places.map((place) => place.lat)) + 0.4
        };
  const x = (lon: number) => ((lon - bounds.left) / (bounds.right - bounds.left)) * 100;
  const y = (lat: number) => ((bounds.top - lat) / (bounds.top - bounds.bottom)) * 100;
  return (
    <div className='panel map-panel'>
      <div className='panel-heading'>
        <h3>Газрын зураг</h3>
        <button
          type='button'
          className='small-button'
          onClick={() => setCountry(!country)}
          aria-pressed={country}
        >
          {country ? 'Ойртуулах' : 'Монгол орон'}
        </button>
      </div>
      <div className='map' aria-label='Өдрийн зогсоолуудын газрын зураг'>
        <svg viewBox='0 0 100 100' preserveAspectRatio='none' aria-hidden='true'>
          <polygon points={boundary.map(([lon, lat]) => x(lon) + ',' + y(lat)).join(' ')} />
          <polygon
            className='map-lake'
            points={lakeBoundary.map(([lon, lat]) => x(lon) + ',' + y(lat)).join(' ')}
          />
        </svg>
        <span className='compass' aria-hidden='true'>
          ↑<br />Х
        </span>
        {places.map((place, i) => (
          <button
            type='button'
            title={place.name}
            key={place.stop.id}
            className={'map-pin' + (selected === place.stop.id ? ' active-pin' : '')}
            style={{ left: x(place.lon) + '%', top: y(place.lat) + '%' }}
            aria-label={`Зогсоол ${i + 1}, ${place.name}`}
            aria-pressed={selected === place.stop.id}
            onClick={() => select(place.stop.id)}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {active ? (
        <p className='map-caption'>
          <a
            className='text-link'
            href={`https://www.openstreetmap.org/?mlat=${active.lat}&mlon=${active.lon}#map=10/${active.lat}/${active.lon}`}
            target='_blank'
            rel='noreferrer'
          >
            {active.name} →
          </a>{' '}
          · {active.lat.toFixed(2)}°, {active.lon.toFixed(2)}°
        </p>
      ) : (
        <p className='map-caption'>Зогсоол нэмэхэд байршил энд харагдана.</p>
      )}
      <p className='meta'>Байршлын бүдүүвч · Замын маршрут харуулахгүй</p>
    </div>
  );
}

export function Itinerary({
  trip,
  days,
  day,
  stops,
  selection
}: {
  trip: string;
  days: string[];
  day: string;
  stops: Stop[];
  selection?: string;
}) {
  const [selected, select] = useState(stops[0]?.id);
  const active = stops.some((stop) => stop.id === selected) ? selected : stops[0]?.id;
  return (
    <>
      <div className='timeline'>
        <div className='panel-heading'>
          <div>
            <p className='eyebrow'>ӨДРИЙН ХӨТӨЛБӨР</p>
            <h2>{dateLabel(day)}</h2>
          </div>
        </div>
        <details className='panel editor' open={selection ? true : undefined}>
          <summary>＋ Зогсоол нэмэх</summary>
          <StopForm trip={trip} days={days} day={day} selection={selection} />
        </details>
        {!stops.length && <p className='panel'>Энэ өдөрт зогсоол төлөвлөөгүй байна.</p>}
        {stops.map((stop, i) => {
          const destination = destinations.find((place) => place.id === stop.destination);
          return (
            <article
              className={'panel stop' + (active === stop.id ? ' selected-stop' : '')}
              key={stop.id}
            >
              <button
                type='button'
                className='stop-title'
                onClick={() => select(stop.id)}
                aria-pressed={active === stop.id}
              >
                <span className='stop-number'>{i + 1}</span>
                <span>
                  <small>
                    {stop.time} · {stop.duration} мин
                  </small>
                  <strong>{destination?.name}</strong>
                </span>
              </button>
              {stop.notes && <p>{stop.notes}</p>}
              <p className='meta'>Төлөвлөсөн · {money(stop.cost)}</p>
              <div className='record-actions'>
                {i > 0 && (
                  <ActionForm
                    compact
                    target={{ kind: 'move', trip, id: stop.id, direction: -1 }}
                    label='↑ Дээш'
                  />
                )}
                {i < stops.length - 1 && (
                  <ActionForm
                    compact
                    target={{ kind: 'move', trip, id: stop.id, direction: 1 }}
                    label='↓ Доош'
                  />
                )}
                <ActionForm
                  compact
                  target={{ kind: 'remove', trip, collection: 'stops', id: stop.id }}
                  label='Устгах'
                  confirm='Энэ зогсоолыг устгах уу?'
                />
              </div>
              <details className='inline-details'>
                <summary>Засах</summary>
                <StopForm trip={trip} days={days} day={day} stop={stop} />
              </details>
            </article>
          );
        })}
      </div>
      <aside>
        <Map stops={stops} selected={active} select={select} />
      </aside>
    </>
  );
}
