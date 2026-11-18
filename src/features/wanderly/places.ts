import { destinations } from './catalog';
import type { Stop } from './model';

export type GeoPlace = {
  id:string;
  name:string;
  lat:number;
  lon:number;
  region:string;
  source:'curated'|'custom';
};

export function resolveStop(stop:Stop):GeoPlace | undefined {
  if (stop.destination==='custom') {
    if(!stop.customName || stop.lat===undefined || stop.lon===undefined) return undefined;
    return {
      id:stop.id,
      name:stop.customName,
      lat:stop.lat,lon:stop.lon,
      region:stop.customAddress||'Газрын зураг дээр сонгосон байршил',
      source:'custom'
    };
  }
  const p=destinations.find(x=>x.id===stop.destination);
  return p ? {id:stop.id,name:p.name,lat:p.lat,lon:p.lon,region:p.region,source:'curated'} : undefined;
}

export function haversineKm(a:Pick<GeoPlace,'lat'|'lon'>,b:Pick<GeoPlace,'lat'|'lon'>) {
  const rad=(n:number)=>n*Math.PI/180;
  const dLat=rad(b.lat-a.lat),dLon=rad(b.lon-a.lon);
  const x=Math.sin(dLat/2)**2 + Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;
  return 6371*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x));
}
