'use client';
import { useEffect,useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function PlaceSelectMap({lat,lon,onPick}:{
  lat?:number;lon?:number;onPick:(lat:number,lon:number)=>void;
}) {
  const el=useRef<HTMLDivElement>(null);
  const map=useRef<L.Map|null>(null);
  const pin=useRef<L.CircleMarker|null>(null);
  const callback=useRef(onPick);
  useEffect(()=>{callback.current=onPick},[onPick]);
  useEffect(()=>{
    if(!el.current)return;
    const instance=L.map(el.current,{scrollWheelZoom:false}).setView([47.918,106.92],5);
    map.current=instance;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',maxZoom:19
    }).addTo(instance);
    instance.on('click',event=>callback.current(
      Number(event.latlng.lat.toFixed(6)),Number(event.latlng.lng.toFixed(6))
    ));
    return ()=>{instance.remove();map.current=null;pin.current=null};
  },[]);
  useEffect(()=>{
    if(!map.current||lat===undefined||lon===undefined)return;
    const coords:L.LatLngExpression=[lat,lon];
    if(pin.current)pin.current.setLatLng(coords);
    else pin.current=L.circleMarker(coords,{radius:10,color:'#123f30',fillColor:'#c8f64e',fillOpacity:1,weight:3}).addTo(map.current);
    map.current.setView(coords,Math.max(map.current.getZoom(),8),{animate:false});
  },[lat,lon]);
  return <div ref={el} className='v4-place-select-map' aria-label='Товшиж дурын газар сонгох газрын зураг'/>;
}
