import { NextResponse } from 'next/server';
import { generateText, Output } from 'ai';
import { optionalUser } from '@/lib/wanderly/auth';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { plannerFields } from '@/features/wanderly/planner';
import { aiPlanSchema } from '@/features/wanderly/ai-schema';
import { destinations } from '@/features/wanderly/catalog';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const model = process.env.AI_GATEWAY_MODEL || 'google/gemini-2.5-flash-lite';

export async function POST(request: Request) {
  const user=await optionalUser();
  if(!user) return NextResponse.json({error:'Нэвтрээд AI төлөвлөгч ашиглана уу.'},{status:401});
  if(!process.env.VERCEL_OIDC_TOKEN && !process.env.AI_GATEWAY_API_KEY)
    return NextResponse.json({error:'AI үйлчилгээ одоогоор холбогдоогүй байна. Дүрэмт төлөвлөгчийг ашиглаж болно.'},{status:503});
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
  const supabase=await serverSupabase();
  const cutoff=new Date(Date.now()-24*60*60*1000).toISOString();
  const {count,error:quotaError}=await supabase.from('wanderly_ai_usage')
    .select('id',{head:true,count:'exact'})
    .eq('owner_id',user.id).gte('requested_at',cutoff);
  if(quotaError) return NextResponse.json({error:'AI ашиглалтын хязгаарыг шалгаж чадсангүй.'},{status:503});
  if((count||0)>=5) return NextResponse.json({error:'24 цагийн AI саналын 5 удаагийн хязгаарт хүрсэн байна.'},{status:429});
  const {error:usageError}=await supabase.from('wanderly_ai_usage').insert({owner_id:user.id});
  if(usageError) return NextResponse.json({error:'AI ашиглалтыг бүртгэж чадсангүй.'},{status:503});

  const input=parsed.data;
  const catalog=destinations.filter((p)=>!input.region || input.region===p.region)
    .map(({id,name,region,category,description})=>({id,name,region,category,description}));
  try {
    const response=await generateText({
      model,
      output:Output.object({schema:aiPlanSchema}),
      instructions:`Та Wanderly Монголын аяллын төлөвлөгчийн туслах. Хэрэглэгчид зөвхөн өгөгдсөн газруудын ID-гаар 1–7 хоногийн аяллын санал өг. Зөвхөн Монгол хэлээр бич. Төсвийн бодит баталгаатай үнэ, замын үргэлжлэх хугацаа, аюулгүй байдлын баталгааг зохиож болохгүй. Худал үнэлгээ, захиалга, зочид буудлын үнэ бүү зохио. Хэрэглэгчийн тохируулсан хоногоос хэтрүүлж болохгүй. Өдөр бүр 1–3 газар, газар бүрийг нэг удаа санал болго. Нэг өдөр газарзүйн ойр аймгийн газрууд байвал давуу. Маршрутын бодит зам/цаг тооцоогүй гэдгийг зөвлөмждөө тодорхойл.`,
      prompt:JSON.stringify({request:input,knownDestinations:catalog}),
      maxOutputTokens:1400
    });
    const ai=aiPlanSchema.parse(response.output);
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
      source:'ai', model,
      plan:{overview:ai.overview,days:validDays,tips:ai.tips},
      disclaimer:'AI-ийн санал нь бодит маршрут, үнэ, цаг агаарын баталгаа биш. Явахаасаа өмнө шалгаарай.'
    },{headers:{'Cache-Control':'private,no-store'}});
  } catch(error) {
    console.error('Wanderly AI Gateway request failed',error instanceof Error?error.name:'unknown');
    return NextResponse.json({error:'AI үйлчилгээ хариу өгөхгүй байна. Дүрэмт санал хэвийн ажиллана.'},{status:502});
  }
}
