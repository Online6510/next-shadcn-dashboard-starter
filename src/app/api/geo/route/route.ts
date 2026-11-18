import { NextResponse } from 'next/server';
import { optionalUser } from '@/lib/wanderly/auth';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { z } from 'zod';

export const runtime='nodejs';
const point=z.object({lat:z.number().finite().min(-90).max(90),lon:z.number().finite().min(-180).max(180)});
const requestSchema=z.object({
  waypoints:z.array(point).min(2).max(20),
  mode:z.enum(['drive','walk','bicycle','hike']).default('drive')
});
export async function POST(request:Request) {
  const user=await optionalUser();
  if(!user)return NextResponse.json({error:'Аяллаа үзэхийн тулд нэвтрэх шаардлагатай.'},{status:401});
  if(!process.env.GEOAPIFY_API_KEY)
    return NextResponse.json({error:'Зам дагах маршрут тооцох үйлчилгээний API түлхүүр тохируулагдаагүй. Цэгүүдийг газрын зураг дээр харуулах боломжтой.'},{status:503});
  let raw:unknown;
  try{
    const text=await request.text();
    if(text.length>4000)return NextResponse.json({error:'Хэт олон координат'},{status:413});
    raw=JSON.parse(text);
  }catch {return NextResponse.json({error:'Хүсэлтийг уншиж чадсангүй.'},{status:400});}
  const parsed=requestSchema.safeParse(raw);
  if(!parsed.success)return NextResponse.json({error:'Цэгийн координат буруу.'},{status:400});
  const supabase=await serverSupabase();
  const {count,error}=await supabase.from('wanderly_geo_usage')
    .select('id',{count:'exact',head:true}).eq('owner_id',user.id)
    .gte('requested_at',new Date(Date.now()-24*3600*1000).toISOString());
  if(error)return NextResponse.json({error:'Хүсэлтийн хязгаарыг шалгаж чадсангүй.'},{status:503});
  if((count||0)>=80)return NextResponse.json({error:'24 цагийн газрын үйлчилгээний хязгаарт хүрсэн.'},{status:429});
  const {error:usageError}=await supabase.from('wanderly_geo_usage').insert({owner_id:user.id});
  if(usageError)return NextResponse.json({error:'Хүсэлтийг бүртгэж чадсангүй.'},{status:503});
  const endpoint=new URL('https://api.geoapify.com/v1/routing');
  endpoint.searchParams.set('waypoints',parsed.data.waypoints.map(p=>p.lat+','+p.lon).join('|'));
  endpoint.searchParams.set('mode',parsed.data.mode);
  endpoint.searchParams.set('format','geojson');
  endpoint.searchParams.set('apiKey',process.env.GEOAPIFY_API_KEY);
  try {
    const response=await fetch(endpoint,{signal:AbortSignal.timeout(12000),cache:'no-store'});
    if(!response.ok)throw new Error('Unable to calculate route');
    const result=await response.json() as {features?:Array<{
      geometry?:{type?:string;coordinates?:number[][]|number[][][]};
      properties?:{distance?:number;time?:number};
    }>};
    const feature=result.features?.[0];
    if(!feature?.geometry||!Array.isArray(feature.geometry.coordinates))
      throw new Error('No route geometry');
    return NextResponse.json({
      feature:{
        type:'Feature',geometry:feature.geometry,
        properties:{distance:feature.properties?.distance,time:feature.properties?.time}
      },
      provider:'Geoapify',disclaimer:'Маршрут ба хугацаа нь үйлчилгээний тооцоолол; бодит замын нөхцөл, хөдөлгөөн өөр байж болно.'
    },{headers:{'Cache-Control':'private,no-store'}});
  } catch {
    return NextResponse.json({error:'Маршрут тооцох боломжгүй байна. Зарим зам, шороон замд provider-ийн өгөгдөл байхгүй байж болно.'},{status:502});
  }
}
