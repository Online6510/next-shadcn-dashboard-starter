import {test} from 'node:test';
import assert from 'node:assert/strict';
import {sample} from './seed';
import {exportTripWaypointsGPX,exportTripCSV,exportTripCalendarICS} from './export';
test('GPX contains owner waypoints but no invented track',()=>{
 const data=exportTripWaypointsGPX(sample);
 assert.match(data,/<wpt lat=/);
 assert.match(data,/Waypoint coordinates only/);
 assert.equal(data.includes('<trkseg>'),false);
});
test('CSV neutralizes dangerous spreadsheet formula strings',()=>{
 const csv=exportTripCSV({...sample,stops:sample.stops.map((s,i)=>i===0?({
  ...s,notes:'=HYPERLINK("https://example.org")'
 }):s)});
 assert(csv.startsWith('\uFEFF'));
 assert(csv.includes("'=HYPERLINK"));
 assert(csv.includes('""https://example.org""'));
});
test('calendar has accurate timestamp and event bounds',()=>{
 const cal=exportTripCalendarICS(sample);
 assert(cal.includes('DTSTART;TZID=Asia/Ulaanbaatar:20260715T100000'));
 assert(cal.includes('DTEND;TZID=Asia/Ulaanbaatar:20260715T120000'));
 assert(cal.includes('BEGIN:VEVENT'));
 assert(cal.includes('END:VCALENDAR'));
});
