import { NextResponse } from 'next/server';
import { optionalUser } from '@/lib/wanderly/auth';
import { reserveAiRequest } from '@/lib/wanderly/ai-quota';
import { plannerFields } from '@/features/wanderly/planner';
import { aiPlanSchema } from '@/features/wanderly/ai-schema';
import { destinations } from '@/features/wanderly/catalog';
import {freeAiConfigured,freeAICompletion,friendlyFreeAIError,FREE_AI_MODEL} from '@/lib/wanderly/free-ai';
import {freeTripJsonSchema} from '@/features/wanderly/free-ai-json-schema';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function POST(request: Request) {
  const user=await optionalUser();
  if(!user) return NextResponse.json({error:'Нэвтрээд AI төлөвлөгч ашиглана уу.'},{status:401});
  if(!freeAiConfigured())
    return NextResponse.json({error:'Үнэгүй AI-ийн GroqCloud API түлхүүр хараахан холбогдоогүй байна.'},{status:503});
  const length=Number(request.headers.get('content-length') || 0);
  if(length > 12000) return NextResponse.json({error:'Хүсэлтийн хэмжээ хэтэрсэн.'},{status:413});
  let raw:unknown;
  try {
    const text = await request.text();
    if (new TextEncoder().encode(text).length > 12000)
      return NextResponse.json({error:'Хүсэлтийн хэмжээ хэтэрсэн.'},{status:413});
    raw=JSON.parse(text);
  } catch {
    return NextResponse.json({error:'Мэдээллийг уншиж чадсангүй.'},{status:400});
  }
  const parsed=plannerFields.safeParse(raw);
  if(!parsed.success)
    return NextResponse.json({error:'Аяллын хугацаа, сонирхол, төсвөө шалгана уу.'},{status:400});
  const quota=await reserveAiRequest();
  if(quota==='limit')return NextResponse.json({error:'24 цагийн AI хүсэлтийн 5 удаагийн хязгаарт хүрсэн байна.'},{status:429});
  if(quota!=='ok')return NextResponse.json({error:'AI ашиглалтын хязгаарыг шалгаж чадсангүй.'},{status:503});

  const input=parsed.data;
  const catalog=destinations.filter((p)=>!input.region || input.region===p.region)
    .map(({id,name,region,category,description})=>({id,name,region,category,description}));
  try {
    const response=await freeAICompletion({
      messages:[
       {role:'system',content:[
        'Та Wanderly Монголын аяллын туслах. Хэрэглэгчид зөвхөн өгөгдсөн газруудын ID-гаар 1–7 хоногийн санал өг.',
        'Бүх текстийг Монгол хэлээр бич. Заасан хоногийн хязгаарыг давуулж болохгүй.',
        'Өдөрт 1–3 газар, газар бүр нэг удаа. Бодит замын цаг, үнэ, захиалга, рейтинг бүү зохио.',
        'Зөвхөн хүссэн JSON бүтэц дотор хариул. overview, days, tips талбаруудыг бөглө.'
       ].join('\n')},
       {role:'user',content:JSON.stringify({request:input,knownDestinations:catalog})}
      ],
      responseSchema:freeTripJsonSchema,
      maxTokens:2700
    });
    const ai=aiPlanSchema.parse(JSON.parse(response));
    const seen=new Set<string>();
    const validDays=ai.days.filter((day)=>day.dayIndex<=input.duration)
      .map((day)=>({
        dayIndex:day.dayIndex,
        placeIds:day.placeIds.filter((id)=>{
          if(seen.has(id)) return false;
          const allowed=catalog.some((p)=>p.id===id);
          if(allowed) seen.add(id);
          return allowed;
        }),
        note:day.note
      })).filter((day)=>day.placeIds.length);
    if(!validDays.length) throw new Error('No valid destination selection');
    return NextResponse.json({
      source:'ai', model:FREE_AI_MODEL,
      plan:{overview:ai.overview,days:validDays,tips:ai.tips},
      disclaimer:'AI-ийн санал нь бодит маршрут, үнэ, цаг агаарын баталгаа биш. Явахаасаа өмнө шалгаарай.'
    },{headers:{'Cache-Control':'private,no-store'}});
  } catch(error) {
    const failure=friendlyFreeAIError(error);
    console.error('Wanderly Free AI itinerary failed',error instanceof Error?error.name:'unknown',failure.status);
    return NextResponse.json(failure,{status:failure.status,headers:{'Cache-Control':'no-store'}});
  }
}
