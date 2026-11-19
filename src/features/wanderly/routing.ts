import {z} from 'zod';

const pair=z.tuple([
  z.number().min(-180).max(180),
  z.number().min(-90).max(90)
]);
const geometrySchema=z.discriminatedUnion('type',[
  z.object({type:z.literal('LineString'),coordinates:z.array(pair).min(2).max(25000)}),
  z.object({type:z.literal('MultiLineString'),coordinates:z.array(
    z.array(pair).min(2).max(25000)).min(1).max(30)})
]);
const responseSchema=z.object({features:z.array(z.object({
  geometry:geometrySchema,
  properties:z.object({distance:z.number().nonnegative(),time:z.number().nonnegative()})
})).min(1)});
export type RealRouteGeometry=z.infer<typeof geometrySchema>;

export function parseGeoapifyRoute(raw:unknown){
  const parsed=responseSchema.safeParse(raw);
  if(!parsed.success)return null;
  const feature=parsed.data.features[0];
  const vertexCount=feature.geometry.type==='LineString'
    ? feature.geometry.coordinates.length
    : feature.geometry.coordinates.reduce((sum,segment)=>sum+segment.length,0);
  if(vertexCount>25000)return null;
  return {
    geometry:feature.geometry,
    distance:feature.properties.distance,
    time:feature.properties.time
  };
}
