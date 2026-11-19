import { NextResponse } from 'next/server';
import { z } from 'zod';
import { optionalUser } from '@/lib/wanderly/auth';
import { reserveAiRequest } from '@/lib/wanderly/ai-quota';
import { destinations } from '@/features/wanderly/catalog';
import {freeAiConfigured,freeAICompletion,friendlyFreeAIError,FREE_AI_PROVIDER} from '@/lib/wanderly/free-ai';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const schema=z.object({
 message:z.string().trim().min(3).max(1200),
 history:z.array(z.object({
  role:z.enum(['user','assistant']),
  content:z.string().trim().min(1).max(1800)
 })).max(8).default([])
});

export async function POST(request:Request){
 const user=await optionalUser();
 if(!user)return NextResponse.json({error:'AI туслах ашиглахын тулд нэвтэрнэ үү.'},{status:401});
 if(!freeAiConfigured())
  return NextResponse.json({error:'Үнэгүй AI-ийн GroqCloud API түлхүүр хараахан холбогдоогүй байна.'},{status:503});
 let requestBody:unknown;
 try{
  const raw=await request.text();
  if(new TextEncoder().encode(raw).length>16000)
   return NextResponse.json({error:'Хүсэлт хэт том байна.'},{status:413});
  requestBody=JSON.parse(raw);
 }catch{return NextResponse.json({error:'Хүсэлт буруу форматтай.'},{status:400});}
 const parsed=schema.safeParse(requestBody);
 if(!parsed.success)return NextResponse.json({error:'Асуултаа 3–1200 тэмдэгтэд багтаана уу.'},{status:400});
 const quota=await reserveAiRequest();
 if(quota==='limit')return NextResponse.json({error:'AI туслахын 24 цагийн 5 удаагийн хязгаарт хүрсэн байна.'},{status:429});
 if(quota!=='ok')return NextResponse.json({error:'AI ашиглалтын хязгаарыг шалгаж чадсангүй.'},{status:503});
 const catalogue=destinations.map(place=>place.name+' ('+place.region+')').join(', ');
 try{
  const answer=await freeAICompletion({
   messages:[
    {role:'system',content:[
     'Та Wanderly-ийн аяллын туслах. Зөвхөн Монгол хэлээр, товч ойлгомжтой, дулаан хариул.',
     'Хэрэглэгч дэлхийн аль ч газар, аймаг, хотын талаар асууж болно.',
     'Жишээ каталоги: '+catalogue+'. Энэ нь сонголтын хязгаар биш.',
     'Баталгаагүй замын цаг, координат, бодит үнэ, цаг агаар, захиалга бүү зохио.',
     'Баталгаатай маршрут зөвхөн гео-routing API-аас авна. Газар сонгохдоо газрын зураг ашиглаж болно.',
     'Эхлээд хэрэгцээнд тохирох товч зөвлөгөө өг. Нууц мэдээлэл бүү оруул.'
    ].join('\n')},
    ...parsed.data.history.map(h=>({role:h.role,content:h.content})),
    {role:'user',content:parsed.data.message}
   ],
   maxTokens:1700
  });
  return NextResponse.json({answer:answer.slice(0,6000),source:'ai',provider:FREE_AI_PROVIDER,
   note:'AI-ийн зөвлөмж нь баталгаатай үнэ, маршрут, цаг агаарын мэдээлэл биш.'},
   {headers:{'Cache-Control':'private,no-store'}});
 }catch(error){
  const failure=friendlyFreeAIError(error);
  console.error('Wanderly Free AI chat failed',error instanceof Error?error.name:'unknown',failure.status);
  return NextResponse.json(failure,{status:failure.status,headers:{'Cache-Control':'no-store'}});
 }
}
