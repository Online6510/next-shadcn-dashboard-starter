import {createHash,timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {freeAICompletion,freeAiConfigured,friendlyFreeAIError} from '@/lib/wanderly/free-ai';
import {freeTripJsonSchema} from '@/features/wanderly/free-ai-json-schema';
import {aiPlanSchema} from '@/features/wanderly/ai-schema';

export const runtime='nodejs';
export const dynamic='force-dynamic';

// Temporary PREVIEW-only authenticated model verification endpoint. Remove after diagnosis.
const expected=Buffer.from('e0e4e50448965420b8a299ce0114d4d97b77c0cb2f08f3b3942a7446276b96aa','hex');
export async function GET(request:NextRequest) {
 if(process.env.VERCEL_ENV!=='preview')return new Response(null,{status:404});
 const supplied=request.nextUrl.searchParams.get('k')||'';
 const digest=createHash('sha256').update(supplied).digest();
 if(!timingSafeEqual(digest,expected))return new Response(null,{status:404});
 const configured=freeAiConfigured();
 if(!configured)return NextResponse.json({ok:false,configured:false,reason:'missing_preview_key'},
  {headers:{'Cache-Control':'no-store'}});
 const mode=request.nextUrl.searchParams.get('mode')==='plan'?'plan':'chat';
 try{
  if(mode==='plan'){
   const answer=await freeAICompletion({messages:[
    {role:'system',content:'Монгол хэлээр аяллын богино төлөвлөгөөг зөвхөн JSON schema-д нийцүүлж гарга. catalog дахь id-ийг л ашигла.'},
    {role:'user',content:'2 өдөр Монголд аялах санаа: dayIndex=1, 2. Хотын онцлох газрууд. Сонголтууд: khuvsgul, terelj. Өдөр бүр 1 газар.'}
   ],responseSchema:freeTripJsonSchema,maxTokens:1000});
   const parsed=aiPlanSchema.safeParse(JSON.parse(answer));
   return NextResponse.json({ok:parsed.success,configured,mode,dayCount:parsed.success?parsed.data.days.length:0,
      reason:parsed.success?null:'schema_invalid'},
      {headers:{'Cache-Control':'no-store'}});
  }
  const answer=await freeAICompletion({messages:[
   {role:'system',content:'Зөвхөн Монгол хэлээр товч хариул.'},
   {role:'user',content:'Хөвсгөл нуурын тухай нэг богино өгүүлбэр хэл.'}
  ],maxTokens:220});
  return NextResponse.json({ok:answer.length>10,configured,mode,answer:answer.slice(0,330)},
   {headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const failure=friendlyFreeAIError(error);
  return NextResponse.json({ok:false,configured,mode,status:failure.status,error:failure.error},
   {headers:{'Cache-Control':'no-store'}});
 }
}
