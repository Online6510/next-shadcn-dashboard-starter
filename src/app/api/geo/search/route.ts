import { NextRequest, NextResponse } from 'next/server';
import { optionalUser } from '@/lib/wanderly/auth';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { destinations } from '@/features/wanderly/catalog';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request:NextRequest) {
  const q=(request.nextUrl.searchParams.get('q') || '').trim().slice(0,120);
  if(q.length<2) return NextResponse.json({places:[],source:'none'});
  const local=destinations.filter(place=>
    (place.name+' '+place.region+' '+place.tags.join(' ')).toLowerCase().includes(q.toLowerCase())
  ).slice(0,6).map(place=>({
    id:place.id,name:place.name,address:place.region,lat:place.lat,lon:place.lon,
    source:'curated'
  }));
  const key=process.env.GEOAPIFY_API_KEY;
  // The no-key mode still supports curated places and unrestricted manual map pins.
  if(!key) return NextResponse.json({places:local,source:'curated',notice:
    'Нэрээр дэлхий даяар хайхад Geoapify API түлхүүр хэрэгтэй. Газрын зураг дээр дурын цэг нэмж болно.'});

  const user=await optionalUser();
  if(!user) return NextResponse.json({places:local,source:'curated',notice:'Газрын дэлгэрэнгүй хайлт хийхийн тулд нэвтэрнэ үү.'});
  const supabase=await serverSupabase();
  const {count,error}=await supabase.from('wanderly_geo_usage')
    .select('id',{count:'exact',head:true}).eq('owner_id',user.id)
    .gte('requested_at',new Date(Date.now()-24*3600*1000).toISOString());
  if(error) return NextResponse.json({places:local,source:'curated',notice:'Хайлтын лимит шалгах боломжгүй.'});
  if((count||0)>=80) return NextResponse.json({places:local,source:'curated',notice:'24 цагт 80 хайлт хийх хязгаарт хүрсэн байна.'},{status:429});
  const {error:usageError}=await supabase.from('wanderly_geo_usage').insert({owner_id:user.id});
  if(usageError) return NextResponse.json({places:local,source:'curated',notice:'Хайлт бүртгэж чадсангүй.'},{status:503});

  const endpoint=new URL('https://api.geoapify.com/v1/geocode/search');
  endpoint.searchParams.set('text',q);
  endpoint.searchParams.set('format','json');
  endpoint.searchParams.set('limit','8');
  endpoint.searchParams.set('apiKey',key);
  try {
    const response=await fetch(endpoint,{signal:AbortSignal.timeout(6500),next:{revalidate:3600}});
    if(!response.ok) throw new Error('Provider unavailable');
    const result=await response.json() as {results?:Array<{
      place_id?:string;formatted?:string;name?:string;city?:string;country?:string;
      lat?:number;lon?:number;
    }>};
    const remote=(result.results||[]).flatMap((place,index)=>{
      if(typeof place.lat!=='number'||typeof place.lon!=='number')return [];
      return [{id:place.place_id||'geo-'+index,name:place.name||place.city||place.formatted||'Байршил',
        address:place.formatted||place.country||'',lat:place.lat,lon:place.lon,source:'geocoding'}];
    });
    const deduped=[...local,...remote.filter(p=>!local.some(x=>
      Math.abs(x.lat-p.lat)<.0001 && Math.abs(x.lon-p.lon)<.0001))];
    return NextResponse.json({places:deduped.slice(0,12),source:'geoapify'},
      {headers:{'Cache-Control':'private,max-age=30'}});
  } catch {
    return NextResponse.json({places:local,source:'curated',
      notice:'Газрын хайлтын үйлчилгээ түр ажиллахгүй. Газрын зураг дээр цэг тавьж болно.'});
  }
}
