'use client';

import { useRef, useState } from 'react';
import { destinations } from './catalog';
import { DestinationCard } from './visuals';

const featured = destinations.slice(0, 5);

function FeaturedPlaces() {
  const gallery = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  function scroll(direction: -1 | 1) {
    const element = gallery.current;
    if (!element) return;
    const distance =
      element.children[1].getBoundingClientRect().left -
      element.children[0].getBoundingClientRect().left;
    element.scrollBy({
      left: distance * direction,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
    });
  }
  return (
    <section className='featured-places' aria-label='Онцлох газрууд'>
      <div className='panel-heading'>
        <h2>Онцлох газрууд</h2>
        <div className='actions'>
          <button
            type='button'
            className='small-button'
            onClick={() => scroll(-1)}
            disabled={edges.start}
            aria-label='Өмнөх онцлох газар'
          >
            ←
          </button>
          <button
            type='button'
            className='small-button'
            onClick={() => scroll(1)}
            disabled={edges.end}
            aria-label='Дараагийн онцлох газар'
          >
            →
          </button>
        </div>
      </div>
      <div
        className='featured-slider'
        ref={gallery}
        onScroll={({ currentTarget: element }) => {
          setEdges({
            start: element.scrollLeft < 2,
            end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2
          });
        }}
      >
        {featured.map((place) => (
          <DestinationCard place={place} key={place.id} />
        ))}
      </div>
    </section>
  );
}

export function Discover() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const results = destinations.filter(
    (place) =>
      (place.name + ' ' + place.region).toLowerCase().includes(search.trim().toLowerCase()) &&
      (!category || category === place.category) &&
      (!region || region === place.region)
  );
  const browsing = !search.trim() && !category && !region;
  const grid = browsing ? results.slice(featured.length) : results;
  return (
    <>
      <div className='filter-bar'>
        <label>
          Хайх
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder='Газар, аймгийн нэр…'
            type='search'
          />
        </label>
        <label>
          Төрөл
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value=''>Бүх төрөл</option>
            {[...new Set(destinations.map((place) => place.category))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Аймаг
          <select value={region} onChange={(event) => setRegion(event.target.value)}>
            <option value=''>Бүх аймаг</option>
            {[...new Set(destinations.map((place) => place.region))].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <p className='results' aria-live='polite'>
        {results.length} газар
      </p>
      {browsing && <FeaturedPlaces />}
      {results.length ? (
        <div className='destination-grid'>
          {grid.map((place) => (
            <DestinationCard place={place} key={place.id} />
          ))}
        </div>
      ) : (
        <p className='panel'>Тохирох газар олдсонгүй. Хайлт эсвэл шүүлтээ өөрчилнө үү.</p>
      )}
    </>
  );
}
