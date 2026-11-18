import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { z } from 'zod';
import { optionalUser } from '@/lib/wanderly/auth';
import { reserveAiRequest } from '@/lib/wanderly/ai-quota';
import { destinations } from '@/features/wanderly/catalog';

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
 if(!process.env.VERCEL_OIDC_TOKEN&&!process.env.AI_GATEWAY_API_KEY)
  return NextResponse.json({error:'AI Gateway одоогоор идэвхгүй байна. Газрын зураг болон дүрэмт төлөвлөгчийг ашиглаж болно.'},{status:503});
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
  const response=await generateText({
   model:process.env.AI_GATEWAY_MODEL||'google/gemini-2.5-flash-lite',
   instructions:[
    'Та Wanderly-ийн аяллын туслах. Зөвхөн Монгол хэлээр, товч ойлгомжтой, дулаан хариул.',
    'Хэрэглэгч хүссэн газар, аймаг, хот, дэлхийн аль ч байршлын талаар асууж болно.',
    'Мэдэгдэж байгаа жишээ каталоги: '+catalogue+'. Энэ жагсаалт хязгаар биш.',
    'Аяллын маршрут, байршлын яг зөв координат, зай, замын хугацаа, бодит үнэ, цаг агаарын төлөвийг эх сурвалжгүйгээр баталгаатай мэт бүү хэл.',
    'Баталгаагүй үнэ өгвөл зөвхөн хэрэглэгчийн өөрийн төсвийг ангилан төлөвлөх жишээ гэж тодорхойл.',
    'Газрын зураг дээр дурын цэг сонгож болох, маршрут API түлхүүртэй үед бодит чиглэл тооцдог гэж зөвлө.',
    'Санал 3-6 товч мөр, шаардлагатай үед өдрийн хөтөлбөрийг цэгцтэй өг.',
    'Нууц мэдээлэл, баталгаагүй захиалга, худал замын цаг бүү зохио.'
   ].join('\n'),
   prompt:JSON.stringify({
    history:parsed.data.history.map(h=>({role:h.role,text:h.content})),
    question:parsed.data.message
   }),
   maxOutputTokens:1100,
   abortSignal:AbortSignal.timeout(22000)
  });
  if(!response.text.trim())throw new Error('Empty model response');
  return NextResponse.json({answer:response.text.slice(0,6000),source:'ai',
   note:'AI-ийн зөвлөмж нь баталгаатай үнэ, маршрут, цаг агаарын мэдээлэл биш.'},
   {headers:{'Cache-Control':'private,no-store'}});
 }catch(error){
  console.error('Wanderly chat request failed',error instanceof Error?error.name:'unknown');
  return NextResponse.json({error:'AI одоогоор хариулах боломжгүй байна. Газрын зураг болон дүрэмт төлөвлөгч ажиллах боломжтой.'},{status:502});
 }
}
