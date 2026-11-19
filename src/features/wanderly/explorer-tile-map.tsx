'use client';
import { useEffect,useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { destinations } from './catalog';

export type MapLocation={name:string;address:string;lat:number;lon:number};
export default function ExplorerTileMap({active,onPick}:{
 active:MapLocation|null;onPick:(location:MapLocation)=>void;
}){
 const el=useRef<HTMLDivElement>(null);
 const map=useRef<L.Map|null>(null);
 const pin=useRef<L.CircleMarker|null>(null);
 const cb=useRef(onPick);
 useEffect(()=>{cb.current=onPick},[onPick]);
 useEffect(()=>{
   if(!el.current)return;
   const instance=L.map(el.current,{scrollWheelZoom:true,zoomControl:false}).setView([47.92,105.7],6);
   map.current=instance;
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      maxZoom:19
   }).addTo(instance);
   L.control.zoom({position:'bottomright'}).addTo(instance);
   for(const p of destinations){
     L.circleMarker([p.lat,p.lon],{radius:6,color:'#fff',weight:2,fillColor:'#2563eb',fillOpacity:1})
       .addTo(instance).bindTooltip(p.name)
       .on('click',(event)=>{
         L.DomEvent.stopPropagation(event);
         cb.current({name:p.name,address:p.region,lat:p.lat,lon:p.lon});
       });
   }
   instance.on('click',event=>{
     cb.current({name:'Миний сонгосон цэг',address:'Газрын зураг дээр сонгосон байршил',
       lat:Number(event.latlng.lat.toFixed(6)),lon:Number(event.latlng.lng.toFixed(6))});
   });
   return ()=>{instance.remove();map.current=null;pin.current=null};
 },[]);
 useEffect(()=>{
   if(!active||!map.current)return;
   const latLng:L.LatLngExpression=[active.lat,active.lon];
   if(pin.current)pin.current.setLatLng(latLng);
   else pin.current=L.circleMarker(latLng,{
     color:'#173b31',fillColor:'#d4fa59',fillOpacity:1,radius:12,weight:4
   }).addTo(map.current);
   map.current.flyTo(latLng,Math.max(map.current.getZoom(),9),{duration:.6});
 },[active]);
 return <div className='v4-explorer-map' ref={el} aria-label='Дурын байршил сонгох интерактив газрын зураг'/>;
}
