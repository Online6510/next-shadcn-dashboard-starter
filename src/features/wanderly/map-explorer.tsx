'use client';
import {useState} from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {destinations} from './catalog';
import {ActionForm} from './forms';
import {parseCoordinates} from './places';
import {listDays} from './model';
import type {Trip} from './model';
import type {MapLocation} from './explorer-tile-map';
const GeoMap=dynamic(()=>import('./explorer-tile-map'),{ssr:false,loading:()=>(
 <div className='v4-map-wait'>Дэлхийн газрын зураг ачаалж байна…</div>
)});
type SearchPlace=MapLocation&{id:string;source:string};
export function MapExplorer({trips}:{trips:Trip[]}){
 const [active,setActive]=useState<MapLocation|null>(null);
 const [dark,setDark]=useState(true);
 const [query,setQuery]=useState('');
 const [searching,setSearching]=useState(false);
 const [found,setFound]=useState<SearchPlace[]>([]);
 const [message,setMessage]=useState('');
 const [tripId,setTripId]=useState(trips[0]?.id||'');
 const [day,setDay]=useState('');
 const [time,setTime]=useState('10:00');
 const [duration,setDuration]=useState(60);
 const [cost,setCost]=useState(0);
 const [note,setNote]=useState('');
 const current=trips.find(t=>t.id===tripId);
 const days=current?listDays(current.start,current.end):[];
 const selectedDay=days.includes(day)?day:days[0]||'';
 async function search(){
  const coordinates=parseCoordinates(query);
  if(coordinates){
    setActive({...coordinates,name:'Миний сонгосон координат',address:'Гараар оруулсан газарзүйн координат'});
    setFound([]);setMessage('Координатыг газрын зураг дээр сонголоо. Байршлын нэрийг хүссэнээрээ өөрчилнө үү.');
    return;
  }
  if(query.trim().length<2){setMessage('Газрын нэр эсвэл “47.918, 106.917” форматтай координат бичнэ үү.');return;}
  setSearching(true);setFound([]);setMessage('');
  try{
   const res=await fetch('/api/geo/search?q='+encodeURIComponent(query.trim()));
   const json=await res.json() as {places?:SearchPlace[];notice?:string};
   setFound(json.places||[]);
   setMessage(json.notice||(!json.places?.length?'Илэрц олдсонгүй. Газрын зурагт дурын цэг тавина уу.':''));
  }catch{setMessage('Нэрээр хайх боломжгүй. Газрын зураг дээр цэг тавина уу.');}
  finally{setSearching(false);}
 }
 return <div className='v4-map-browser'>
  <section className={'v4-map-canvas'+(dark?' v4-map-dark':'')}>
   <GeoMap active={active} onPick={location=>{setActive(location);setFound([]);setMessage('Байршил сонгогдлоо. Газрын нэрийг хүссэнээрээ өөрчилж болно.');}}/>
   <button type='button' className='v4-map-mode' onClick={()=>setDark(!dark)} aria-pressed={dark} aria-label='Газрын зургийн өнгө солих'>{dark?'☀ Цайвар зураг':'☾ Шөнийн зураг'}</button>
   <div className='v4-map-floating-title'><span>✦ WANDERLY / LIVE MAP</span><strong>Монгол орноо нээгээрэй.</strong></div>
   <div className='v4-map-searchbar'>
    <input value={query} type='search' aria-label='Дурын байршлын нэрээр хайх'
      onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void search()}}}
      placeholder='Газрын нэр эсвэл 47.918, 106.917…'/>
    <button type='button' onClick={()=>void search()} disabled={searching}>{searching?'…':'⌕'}</button>
    {found.length>0&&<div className='v4-map-results'>
     {found.map(place=><button type='button' key={place.id+place.lat} onClick={()=>{setActive(place);setFound([]);}}>
      <strong>⌖ {place.name}</strong><small>{place.address}</small></button>)}
    </div>}
   </div>
   <div className='v4-map-count'>📍 {destinations.length} онцлох газар · + Дурын цэг</div>
  </section>
  <aside className='v4-map-inspector'>
   <p className='v4-overline'>DISCOVER / МАРШРУТ</p>
   <h1>Таны дараагийн<br/><span>зогсоол.</span></h1>
   <p className='v4-map-hint'>Карт дээр дурын цэг товших эсвэл газрын нэрээр хайгаад аялалдаа нэмээрэй.</p>
   {message&&<p className='v4-map-status' role='status'>{message}</p>}
   {active?<div className='v4-map-selected'>
    <span>✓ СОНГОСОН БАЙРШИЛ</span>
    <label>Газрын нэр
     <input value={active.name} maxLength={140} onChange={e=>setActive({...active,name:e.target.value})}/>
    </label>
    <p>{active.address}</p>
    <small>{active.lat.toFixed(6)}°, {active.lon.toFixed(6)}°</small>
   </div>:<div className='v4-map-empty'><strong>⌖</strong><p>Газрын зураг дээр нэг цэг сонгоно уу</p></div>}
   {trips.length&&active ? <div className='v4-map-save'>
    <h2>Аялалдаа нэмэх</h2>
    <div className='field'><label htmlFor='v4-trip'>Аялал сонгох</label>
     <select id='v4-trip' value={tripId} onChange={e=>{setTripId(e.target.value);setDay('')}}>
      {trips.map(trip=><option value={trip.id} key={trip.id}>{trip.title}</option>)}
     </select>
    </div>
    {current&&<ActionForm key={tripId} target={{kind:'stop',trip:tripId}} label='+ Аялалдаа хадгалах'>
     <input name='destination' type='hidden' value='custom'/>
     <input name='customName' type='hidden' value={active.name}/>
     <input name='customAddress' type='hidden' value={active.address}/>
     <input name='lat' type='hidden' value={active.lat}/>
     <input name='lon' type='hidden' value={active.lon}/>
     <div className='fields-row'>
      <div className='field'><label htmlFor='v4-day'>Өдөр</label><select id='v4-day' name='day' value={selectedDay} onChange={e=>setDay(e.target.value)}>
       {days.map((date,i)=><option key={date} value={date}>{i+1}-р өдөр · {date}</option>)}
      </select></div>
      <div className='field'><label htmlFor='v4-time'>Цаг</label>
       <input id='v4-time' name='time' type='time' value={time} onChange={e=>setTime(e.target.value)}/></div>
     </div>
     <div className='fields-row'>
      <div className='field'><label htmlFor='v4-duration'>Минут</label>
       <input id='v4-duration' type='number' name='duration' min='5' max='1440' value={duration}
        onChange={e=>setDuration(Number(e.target.value))}/></div>
      <div className='field'><label htmlFor='v4-cost'>Төлөвлөсөн зардал (₮)</label>
       <input id='v4-cost' type='number' name='cost' min='0' max='1000000000' value={cost}
        onChange={e=>setCost(Number(e.target.value))}/></div>
     </div>
     <div className='field'><label htmlFor='v4-note'>Тэмдэглэл</label>
      <textarea id='v4-note' name='notes' value={note} maxLength={2000} rows={2}
        placeholder='Замд анхаарах зүйл…' onChange={e=>setNote(e.target.value)}/></div>
    </ActionForm>}
   </div>:<Link className='v4-button v4-button-dark' href={trips.length?'/trips':'/login'}>
    {trips.length?'Аяллаа сонгох →':'Нэвтэрч аялал үүсгэх →'}
   </Link>}
   <p className='v4-map-disclaimer'>© OpenStreetMap contributors. Газрын зураг дээрх цэг нь байршил сонгоход зориулагдсан. Замын чиглэл болон хугацааг зөвхөн маршрут үйлчилгээ ашигласан үед тооцно.</p>
  </aside>
 </div>;
}
