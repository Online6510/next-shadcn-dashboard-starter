'use client';

import dynamic from 'next/dynamic';
import { useTransition, useCallback, useMemo, useState } from 'react';
import { dateLabel, money } from './catalog';
import { resolveStop, haversineKm } from './places';
import { save } from './actions';
import { ActionForm, StopForm } from './forms';
import type { Stop } from './model';
import boundary from './boundary.json';
import lakeBoundary from './lake-boundary.json';

const TileMap = dynamic(() => import('./tile-map'), { ssr: false });
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
  const [tiles, setTiles] = useState(true);
  const [routing,setRouting]=useState(false);
  const [routeResult,setRouteResult]=useState<{
    geometry:{type:string;coordinates:number[][]|number[][][]};
    distance:number;time:number;
  } | null>(null);
  const [routeError,setRouteError]=useState('');
  const [failed, setFailed] = useState(false);
  const offline = useCallback(() => {
    setTiles(false);
    setFailed(true);
  }, []);
  const places = useMemo(
    () =>
      stops.flatMap((stop) => {
        const place=resolveStop(stop);
        return place ? [{...place,stop}] : [];
      }),
    [stops]
  );
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
          onClick={() => {
            setCountry(!country);
            setTiles(false);
          }}
          aria-pressed={country}
        >
          {country ? 'Ойртуулах' : 'Монгол орон'}
        </button>
      </div>
      <button
        className='small-button'
        onClick={() => {
          setTiles(!tiles);
          setFailed(false);
        }}
      >
        {tiles ? 'Бүдүүвч харах' : 'Суурь зураг нээх'}
      </button>
      {places.length > 1 && <div className='v4-route-controls'>
        <button type='button' className='small-button' disabled={routing} onClick={async()=>{
          setRouting(true);setRouteError('');setRouteResult(null);
          try {
            const response=await fetch('/api/geo/route',{
              method:'POST',headers:{'Content-Type':'application/json'},
              body:JSON.stringify({waypoints:places.map(p=>({lat:p.lat,lon:p.lon})),mode:'drive'})
            });
            const result=await response.json();
            if(!response.ok) throw new Error(result.error||'Маршрут тооцоолж чадсангүй.');
            setRouteResult({geometry:result.feature.geometry,
              distance:result.feature.properties.distance,
              time:result.feature.properties.time});
            setTiles(true);
          }catch(e){setRouteError(e instanceof Error?e.message:'Маршрут тооцоолж чадсангүй.');}
          finally{setRouting(false);}
        }}>{routing?'Маршрут тооцоолж байна…':'🚗 Зам дагах маршрут тооцох'}</button>
        <button type='button' className='small-button' onClick={()=>{setRouteResult(null);setRouteError('')}}>Цэвэрлэх</button>
      </div>}
      {routeError && <p className='meta' role='status'>{routeError}</p>}
      {routeResult && <p className='v4-route-summary' role='status'>
        Авто замын тооцоолол: {(routeResult.distance/1000).toFixed(1)} км ·
        ойролцоогоор {(routeResult.time/3600).toFixed(1)} цаг · Geoapify
      </p>}
      {failed && <p role='status'>Интернэтгүй горим — байршлын бүдүүвч</p>}
      {tiles ? (
        <TileMap places={places} active={selected} select={select} offline={offline} route={routeResult?.geometry} />
      ) : (
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
      )}
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
      <p className='meta'>© OpenStreetMap contributors. Авто замын маршрут зөвхөн API-аар тооцоолсон үед харагдана. Геометрийн шууд шугам нь замын мэдээлэл биш.</p>
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
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  const active = stops.some((stop) => stop.id === selected) ? selected : stops[0]?.id;
  return (
    <>
      <div className='timeline' id='timeline' aria-busy={pending}>
        {error && <p role='alert'>{error}</p>}
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
          const destination=resolveStop(stop);
          return (
            <article
              className={'panel stop' + (active === stop.id ? ' selected-stop' : '')}
              key={stop.id}
            >
              <button
                type='button'
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData('application/wanderly-stop');
                  if (!stops.some((item) => item.id === id) || id === stop.id) return;
                  startTransition(async () => {
                    const message = await save(
                      { kind: 'order', trip, id, before: stop.id },
                      '',
                      new FormData()
                    );
                    if (message) setError(message);
                  });
                }}
                draggable={!pending}
                onDragStart={(e) => e.dataTransfer.setData('application/wanderly-stop', stop.id)}
                className='stop-title'
                onClick={() => select(stop.id)}
                aria-pressed={active === stop.id}
              >
                <span className='stop-number'>{i + 1}</span>
                <span>
                  <small>
                    {stop.time} · {stop.duration} мин
                  </small>
                  <strong>{destination?.name || 'Тодорхойгүй байршил'}</strong>
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
      <aside id='trip-map'>
        <Map stops={stops} selected={active} select={select} />
      </aside>
    </>
  );
}
