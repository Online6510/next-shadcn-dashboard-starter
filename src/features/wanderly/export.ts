import type {Trip} from './model';
import {resolveStop} from './places';

function xml(value:string){return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');}
function csv(value:string|number){
 const source=String(value);
 const safe=/^[\s]*[=+\-@\t\r]/.test(source)?"'"+source:source;
 return '"'+safe.replace(/"/g,'""')+'"';
}
function ics(value:string){return value.replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function icsDate(date:string,time:string){return date.replace(/-/g,'')+'T'+time.replace(':','')+'00';}
function addMinutes(date:string,time:string,minutes:number){
 const origin=new Date(date+'T'+time+':00Z');
 if(!Number.isFinite(origin.getTime()))return icsDate(date,time);
 return new Date(origin.getTime()+minutes*60000).toISOString().replace(/[-:]/g,'').slice(0,15);
}
export function exportTripWaypointsGPX(trip:Trip){
 const wpts=trip.stops.flatMap(stop=>{
  const location=resolveStop(stop);
  if(!location)return [];
  return ['  <wpt lat="'+location.lat+'" lon="'+location.lon+'"><name>'+xml(location.name)+'</name><desc>'+
   xml(stop.day+' '+stop.time+(stop.notes?' · '+stop.notes:''))+'</desc></wpt>'];
 });
 return ['<?xml version="1.0" encoding="UTF-8"?>',
  '<gpx version="1.1" creator="Wanderly" xmlns="http://www.topografix.com/GPX/1/1">',
  '  <metadata><name>'+xml(trip.title)+'</name><desc>Waypoint coordinates only; no road route geometry</desc></metadata>',
  ...wpts,'</gpx>',''].join('\n');
}
export function exportTripCSV(trip:Trip){
 const lines=[['Өдөр','Цаг','Газар','Хаяг/Аймаг','Минут','Төлөвлөсөн зардал (₮)','Тэмдэглэл']];
 for(const stop of trip.stops){
  const location=resolveStop(stop);
  lines.push([stop.day,stop.time,location?.name||'Тодорхойгүй байршил',location?.region||'',
   String(stop.duration),String(stop.cost),stop.notes]);
 }
 return '\uFEFF'+lines.map(line=>line.map(csv).join(',')).join('\r\n')+'\r\n';
}
export function exportTripCalendarICS(trip:Trip){
 const events=trip.stops.map(stop=>{
  const location=resolveStop(stop);
  return [
   'BEGIN:VEVENT','UID:'+ics(stop.id+'@wanderly.app'),
   'DTSTART;TZID=Asia/Ulaanbaatar:'+icsDate(stop.day,stop.time),
   'DTEND;TZID=Asia/Ulaanbaatar:'+addMinutes(stop.day,stop.time,stop.duration),
   'SUMMARY:'+ics(location?.name||'Аяллын зогсоол'),
   'DESCRIPTION:'+ics(stop.notes+'\nТөлөвлөсөн зардал: '+stop.cost+' MNT'),
   'LOCATION:'+ics((location?.name||'')+(location?.region?' · '+location.region:'')),
   'END:VEVENT'
  ].join('\r\n');
 });
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Wanderly//Travel Planner//MN',
  'CALSCALE:GREGORIAN','X-WR-CALNAME:'+ics(trip.title),...events,'END:VCALENDAR',''].join('\r\n');
}
