import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseGeoapifyRoute} from './routing';

test('Geoapify LineString geometry uses lon lat, meters and seconds',()=>{
  const result=parseGeoapifyRoute({features:[{
    geometry:{type:'LineString',coordinates:[[106.9,47.9],[100.16,50.44]]},
    properties:{distance:600000,time:40000}
  }]});
  assert.equal(result?.distance,600000);
  assert.equal(result?.time,40000);
  assert.deepEqual(result?.geometry.coordinates,[[106.9,47.9],[100.16,50.44]]);
});

test('Geoapify multi-segment line geometry is accepted',()=>{
  const result=parseGeoapifyRoute({features:[{
    geometry:{type:'MultiLineString',coordinates:[
      [[105,48],[105.5,48.2]],[[105.5,48.2],[106,48.5]]
    ]},
    properties:{distance:120000,time:12000}
  }]});
  assert.equal(result?.geometry.type,'MultiLineString');
});

test('malformed routes never render an invented line or missing travel time',()=>{
  const ok={features:[{geometry:{type:'LineString',coordinates:[[106,48],[105,48]]},
    properties:{distance:100,time:1000}}]};
  for(const invalid of [
    {features:[]},
    {features:[{...ok.features[0],properties:{distance:123}}]},
    {features:[{...ok.features[0],properties:{distance:-1,time:10}}]},
    {features:[{...ok.features[0],geometry:{type:'Polygon',coordinates:[]}}]},
    {features:[{...ok.features[0],geometry:{type:'LineString',coordinates:[[181,48],[105,48]]}}]}
  ])assert.equal(parseGeoapifyRoute(invalid),null);
});
