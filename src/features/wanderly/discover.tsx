'use client';

import { useEffect,useRef,useState } from 'react';
import Link from 'next/link';
import { destinations } from './catalog';
import { DestinationCard } from './visuals';

const featured = destinations.slice(0, 5);

function FeaturedPlaces({favoriteCard}:{favoriteCard:(id:string)=>React.ReactNode}) {
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
          <div className='v4-discover-card' key={place.id}><DestinationCard place={place}/>{favoriteCard(place.id)}</div>
        ))}
      </div>
    </section>
  );
}

export function Discover({initialQuery=''}:{initialQuery?:string}) {
  const [search, setSearch] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [region, setRegion] = useState('');
  const [favoritesOnly,setFavoritesOnly]=useState(false);
  const [favoriteIds,setFavoriteIds]=useState<string[]>([]);
  const [authenticated,setAuthenticated]=useState(false);
  const [pendingId,setPendingId]=useState<string|null>(null);
  const [notice,setNotice]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    fetch('/api/favorites',{signal:controller.signal})
      .then(async res=>res.ok?res.json():null)
      .then(data=>{
        if(data){setFavoriteIds(data.ids||[]);setAuthenticated(Boolean(data.authenticated));}
      }).catch(()=>{});
    return ()=>controller.abort();
  },[]);
  async function toggle(id:string){
    if(!authenticated){setNotice('Дуртай газраа хадгалахын тулд эхлээд нэвтрэнэ үү.');return;}
    if(pendingId)return;
    const favorite=!favoriteIds.includes(id);
    setPendingId(id);
    setNotice('');
    try{
      const response=await fetch('/api/favorites',{method:'POST',
        headers:{'Content-Type':'application/json'},body:JSON.stringify({id,favorite})});
      const result=await response.json();
      if(!response.ok)throw new Error(result.error||'Хадгалж чадсангүй.');
      setFavoriteIds(prev=>favorite?[...prev.filter(x=>x!==id),id]:prev.filter(x=>x!==id));
    }catch(error){
      setNotice(error instanceof Error?error.message:'Дуртай газрыг хадгалж чадсангүй.');
    }finally{setPendingId(null)}
  }
  function favoriteCard(id:string){
    const favorite=favoriteIds.includes(id);
    return <button type='button' className={'v4-favorite'+(favorite?' is-favorite':'')}
      aria-pressed={favorite} aria-label={favorite?'Дуртай газраас хасах':'Дуртай газар хадгалах'}
      disabled={pendingId!==null} onClick={()=>void toggle(id)}>{favorite?'♥':'♡'}</button>;
  }
  const results = destinations.filter(
    (place) =>
      [place.name, place.region, ...place.tags]
        .join(' ')
        .toLowerCase()
        .includes(search.trim().toLowerCase()) &&
      (!category || category === place.category) &&
      (!region || region === place.region) &&
      (!favoritesOnly || favoriteIds.includes(place.id))
  );
  const browsing = !search.trim() && !category && !region && !favoritesOnly;
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
      <div className='v4-category-chips' role='group' aria-label='Газрын төрлөөр шүүх'>
        {['',...new Set(destinations.map(place=>place.category))].map(value=>(
          <button type='button' key={value} aria-pressed={category===value}
            onClick={()=>setCategory(value)}>{value||'Бүгд'}</button>
        ))}
        <button type='button' aria-pressed={favoritesOnly} className='v4-favorite-filter'
          onClick={()=>{setFavoritesOnly(!favoritesOnly);setCategory('')}}>♥ Дуртай газрууд ({favoriteIds.length})</button>
      </div>
      {notice && <div role='status' className='v4-favorites-notice'>{notice}
        {!authenticated && <Link href='/login'>Нэвтрэх →</Link>}</div>}
      <p className='results' aria-live='polite'>
        {results.length} газар
      </p>
      {!browsing && (
        <button
          className='small-button'
          onClick={() => {
            setCategory('');
            setRegion('');
            setSearch('');
            setFavoritesOnly(false);
          }}
        >
          Шүүлт арилгах
        </button>
      )}
      {browsing && <FeaturedPlaces favoriteCard={favoriteCard}/>}
      {results.length ? (
        <div className='destination-grid'>
          {grid.map((place) => (
            <div className='v4-discover-card' key={place.id}><DestinationCard place={place}/>{favoriteCard(place.id)}</div>
          ))}
        </div>
      ) : (
        <p className='panel'>Тохирох газар олдсонгүй. Хайлт эсвэл шүүлтээ өөрчилнө үү. <Link href='/map'>Газрын зураг дээр дурын газар сонгох →</Link></p>
      )}
    </>
  );
}
