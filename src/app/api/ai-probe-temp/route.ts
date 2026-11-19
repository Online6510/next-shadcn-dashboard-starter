import {createHash,timingSafeEqual} from 'node:crypto';
import {generateText} from 'ai';
import {NextRequest,NextResponse} from 'next/server';

export const runtime='nodejs';
export const dynamic='force-dynamic';

// TEMPORARY PREVIEW-ONLY verification route. Delete immediately after test.
const expected=Buffer.from('bb879b25329c121ebf05049c90c6f223378bec3bbe250b6c6dbb5b2f3f1c958f','hex');
export async function GET(request:NextRequest){
 if(process.env.VERCEL_ENV!=='preview')return new Response(null,{status:404});
 const token=request.nextUrl.searchParams.get('k')||'';
 const received=createHash('sha256').update(token).digest();
 if(!timingSafeEqual(received,expected))return new Response(null,{status:404});
 const hasOidc=Boolean(process.env.VERCEL_OIDC_TOKEN);
 const hasKey=Boolean(process.env.AI_GATEWAY_API_KEY);
 const hasHeader=Boolean(request.headers.get('x-vercel-oidc-token'));
 const model=process.env.AI_GATEWAY_MODEL||'google/gemini-2.5-flash-lite';
 if(!hasOidc&&!hasKey&&!hasHeader)return NextResponse.json({ok:false,problem:'no_gateway_auth',hasOidc,hasKey,hasHeader},
  {headers:{'Cache-Control':'no-store'}});
 try{
  const result=await generateText({model,
   prompt:'Зөвхөн Монгол хэлээр Хөвсгөл нуурын тухай нэг товч өгүүлбэр хэл.',
   maxOutputTokens:90,abortSignal:AbortSignal.timeout(20000)});
  return NextResponse.json({ok:result.text.trim().length>0,answer:result.text.slice(0,350),
   model,hasOidc,hasKey,hasHeader,outputTokens:result.usage?.outputTokens||0},
   {headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const cause=error as {name?:string;statusCode?:number;message?:string;responseBody?:string};
  let gatewayCode='';
  try{const response=JSON.parse(cause.responseBody||'{}');
   gatewayCode=String(response?.error?.code||response?.error?.type||'').slice(0,70);}catch{}
  return NextResponse.json({ok:false,problem:'gateway_request_failed',name:cause.name||'unknown',
   code:gatewayCode,status:typeof cause.statusCode==='number'?cause.statusCode:null,
   hint:String(cause.message||'').slice(0,230).replace(/(Bearer|sk[-_])[A-Za-z0-9._-]+/g,'[redacted]'),
   model,hasOidc,hasKey,hasHeader},{status:200,headers:{'Cache-Control':'no-store'}});
 }
}
