import assert from 'node:assert/strict';
import { test } from 'node:test';
import { stopFields } from './model';
import { resolveStop, haversineKm, parseCoordinates } from './places';

const original={
  destination:'custom',customName:'Миний дуртай буудал',customAddress:'Дархан',
  lat:49.48,lon:105.96,day:'2026-07-15',time:'10:00',duration:60,cost:0,notes:''
};

test('custom stop accepts any valid global coordinates and retains its user title',()=>{
  const parsed=stopFields.parse(original);
  assert.deepEqual(resolveStop({...parsed,id:'123'})?.name,'Миний дуртай буудал');
  assert.equal(stopFields.safeParse({...original,lat:-45.1,lon:169.6}).success,true);
});

test('custom locations require name and coordinates; reject out-of-range and NaN',()=>{
  for(const invalid of [
    {...original,customName:''},
    {...original,lat:''},
    {...original,lat:'bad'},
    {...original,lat:91},
    {...original,lon:181}
  ]) assert.equal(stopFields.safeParse(invalid).success,false);
});

test('existing curated destination stops are backwards compatible',()=>{
  const p=stopFields.parse({...original,destination:'khuvsgul',customName:undefined,lat:undefined,lon:undefined});
  assert.equal(resolveStop({...p,id:'curated'})?.name,'Хөвсгөл нуур');
});

test('straight line geodesic distance is approximate, never road navigation',()=>{
  assert.equal(Math.round(haversineKm({lat:47.92,lon:106.92},{lat:47.92,lon:106.92})),0);
  assert(haversineKm({lat:47.92,lon:106.92},{lat:50.44,lon:100.16})>500);
});

test('coordinate search supports signed global coordinates without API key',()=>{
 assert.deepEqual(parseCoordinates('47.918, 106.917'),{lat:47.918,lon:106.917});
 assert.deepEqual(parseCoordinates(' -22.5 ; -66.77 '),{lat:-22.5,lon:-66.77});
 assert.deepEqual(parseCoordinates('0 0'),{lat:0,lon:0});
 for(const input of ['92, 10','40, 192','NaN, 20','40.3','http://example.com','21, 22, 23']){
  assert.equal(parseCoordinates(input),null,input);
 }
});
