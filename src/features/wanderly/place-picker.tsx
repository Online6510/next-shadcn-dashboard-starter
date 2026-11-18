'use client';

import { useId, useState } from 'react';
import dynamic from 'next/dynamic';
import { destinations } from './catalog';
import type { Stop } from './model';

const SelectMap = dynamic(()=>import('./place-select-map'),{
  ssr:false,loading:()=> <div className='v4-picker-loading'>Газрын зураг ачаалж байна…</div>
});

type FoundPlace={id:string;name:string;address:string;lat:number;lon:number;source:string};

export function PlacePicker({stop,selection}: {stop?:Stop;selection?:string}) {
  const [destination,setDestination]=useState(stop?.destination||selection||destinations[0].id);
  const [title,setTitle]=useState(stop?.customName||'');
  const [address,setAddress]=useState(stop?.customAddress||'');
  const [lat,setLat]=useState<number|undefined>(stop?.lat);
  const [lon,setLon]=useState<number|undefined>(stop?.lon);
  const [search,setSearch]=useState('');
  const [results,setResults]=useState<FoundPlace[]>([]);
  const [searching,setSearching]=useState(false);
  const [message,setMessage]=useState('');
  const id=useId();

  function choose(place:FoundPlace) {
    setDestination('custom');
    setTitle(place.name);setAddress(place.address);
    setLat(place.lat);setLon(place.lon);
    setResults([]);setMessage('');
  }
  async function lookup() {
    const q=search.trim();
    if(q.length<2) {setMessage('Хайх газрын нэрийг 2-оос дээш тэмдэгтээр бичнэ үү.');return;}
    setSearching(true);setMessage('');setResults([]);
    try {
      const res=await fetch('/api/geo/search?q='+encodeURIComponent(q));
      const data=await res.json() as {places?:FoundPlace[];notice?:string};
      setResults(data.places||[]);
      setMessage(data.notice||(!data.places?.length?'Нэрээр олдсонгүй. Газрын зураг дээр цэг сонгоорой.':''));
    }catch {setMessage('Хайлт холбогдсонгүй. Газрын зураг дээр цэг сонгох боломжтой.');}
    finally{setSearching(false);}
  }
  const choice=destinations.find(p=>p.id===destination);
  const selectedLat=destination==='custom'?lat:choice?.lat;
  const selectedLon=destination==='custom'?lon:choice?.lon;
  return <div className='v4-place-picker'>
    <label htmlFor={id}>Очих газар — хүссэн газраа оруулж болно</label>
    <select id={id} value={destination} name='destination' onChange={e=>{
      const value=e.target.value;
      setDestination(value);
      if(value!=='custom')setResults([]);
    }}>
      <option value='custom'>📍 Миний сонгосон газар / Координат</option>
      {destinations.map(place=><option value={place.id} key={place.id}>{place.name} · {place.region}</option>)}
    </select>
    <div className='v4-picker-search'>
      <input aria-label='Байршлын нэрээр хайх' value={search}
        placeholder='Улаанбаатар, Байкал, Дархан эсвэл дурын нэр…'
        onChange={e=>setSearch(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void lookup();}}}/>
      <button type='button' className='small-button' disabled={searching}
        onClick={()=>void lookup()}>{searching?'Хайж байна…':'Газар хайх'}</button>
    </div>
    {message && <p role='status' className='meta'>{message}</p>}
    {results.length>0 && <div className='v4-place-results' aria-label='Байршлын хайлтын үр дүн'>
      {results.map(place=><button type='button' key={place.id+place.lat} onClick={()=>choose(place)}>
        <strong>{place.name}</strong><small>{place.address}</small>
      </button>)}
    </div>}
    <div className='v4-place-map'>
      <SelectMap lat={selectedLat} lon={selectedLon}
        onPick={(nextLat,nextLon)=>{
          setDestination('custom');setLat(nextLat);setLon(nextLon);
          if(!title.trim())setTitle('Миний сонгосон цэг');
          setAddress('Газрын зураг дээр сонгосон цэг');
          setMessage('Цэг сонгогдлоо. Дээрх нэрийг өөрчилж болно.');
        }}/>
    </div>
    <p className='meta'>Газрын зураг дээр дурын газар товшиж цэг тавина уу. Байршлыг зөвхөн координатаар хадгална; замын бодит хугацааг автоматаар зохиохгүй.</p>
    {destination==='custom' && <div className='v4-custom-fields'>
      <div className='field'>
        <label htmlFor={id+'name'}>Газрын нэр</label>
        <input id={id+'name'} required name='customName' maxLength={140}
          placeholder='Жишээ: Миний амрах буудал' value={title} onChange={e=>setTitle(e.target.value)}/>
      </div>
      <div className='field'>
        <label htmlFor={id+'address'}>Хаяг эсвэл тайлбар</label>
        <input id={id+'address'} name='customAddress' maxLength={320}
          placeholder='Аймаг, сум, замын мэдээлэл' value={address} onChange={e=>setAddress(e.target.value)}/>
      </div>
      <div className='fields-row'>
        <div className='field'><label htmlFor={id+'lat'}>Өргөрөг (lat)</label>
          <input id={id+'lat'} type='number' name='lat' step='any' min='-90' max='90' required
            value={lat??''} onChange={e=>setLat(e.target.value===''?undefined:Number(e.target.value))}/></div>
        <div className='field'><label htmlFor={id+'lon'}>Уртраг (lon)</label>
          <input id={id+'lon'} type='number' name='lon' step='any' min='-180' max='180' required
            value={lon??''} onChange={e=>setLon(e.target.value===''?undefined:Number(e.target.value))}/></div>
      </div>
    </div>}
  </div>;
}
