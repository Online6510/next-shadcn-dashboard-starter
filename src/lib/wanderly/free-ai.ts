/**
 * GroqCloud Free tier adapter for Wanderly.
 * A server-only key is required. Never fall back to the paid Vercel AI Gateway.
 * GPT-OSS 20B supports strict JSON-schema responses.
 */
import 'server-only';

export const FREE_AI_MODEL = 'openai/gpt-oss-20b';
export const FREE_AI_PROVIDER = 'GroqCloud Free';

export function freeAiConfigured():boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export class FreeAIError extends Error {
  constructor(public readonly status:number, message:string) {
    super(message);
    this.name='FreeAIError';
  }
}

type Message={role:'system'|'user'|'assistant';content:string};

type Completion={
 choices?:Array<{message?:{content?:string|null}}>;
};

export function friendlyFreeAIError(error:unknown):{status:number;error:string}{
 if(error instanceof FreeAIError)return {status:error.status,error:error.message};
 const e=error as {name?:string}|null;
 if(e?.name==='TimeoutError'||e?.name==='AbortError')
  return {status:504,error:'Үнэгүй AI хариулах хугацаа хэтэрлээ. Дараа дахин оролдоно уу.'};
 return {status:503,error:'Үнэгүй AI үйлчилгээ түр холбогдохгүй байна. Дараа дахин оролдоно уу.'};
}

export async function freeAICompletion(options:{
 messages:Message[];
 maxTokens?:number;
 responseSchema?:Record<string,unknown>;
}):Promise<string>{
 const key=process.env.GROQ_API_KEY?.trim();
 if(!key)throw new FreeAIError(503,
  'Үнэгүй AI түлхүүр тохируулагдаагүй байна. GroqCloud Free API key-г серверийн орчинд нэмнэ үү.');
 const input={
  model:FREE_AI_MODEL,
  messages:options.messages,
  temperature:0.5,
  reasoning_effort:'low',
  include_reasoning:false,
  max_completion_tokens:options.maxTokens??1800,
  stream:false,
  ...(options.responseSchema?{
   response_format:{type:'json_schema',
    json_schema:{name:'wanderly_travel_plan',strict:true,schema:options.responseSchema}}
  }:{})
 };
 let response:Response;
 try{
  response=await fetch('https://api.groq.com/openai/v1/chat/completions',{
   method:'POST',
   headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},
   body:JSON.stringify(input),
   signal:AbortSignal.timeout(27000),
   cache:'no-store'
  });
 }catch(error){throw error;}
 if(!response.ok){
  // Do not read, log or echo raw error response; it may contain user data.
  if(response.status===401||response.status===403)throw new FreeAIError(503,
   'Үнэгүй AI-ийн API түлхүүр хүчингүй эсвэл эрхгүй байна. GroqCloud тохиргоог шалгана уу.');
  if(response.status===429)throw new FreeAIError(429,
   'GroqCloud-ийн үнэгүй хэрэглээний хязгаарт хүрсэн байна. Дараа дахин оролдоно уу.');
  if(response.status===400)throw new FreeAIError(502,
   'Үнэгүй AI модель хүсэлтийг хүлээж авсангүй. Администратор тохиргоог шалгана уу.');
  throw new FreeAIError(503,
   'Үнэгүй AI үйлчилгээ түр боломжгүй байна. Дараа дахин оролдоно уу.');
 }
 let completion:Completion;
 try{completion=await response.json() as Completion}
 catch{throw new FreeAIError(502,'AI хариу буруу форматтай ирлээ.');}
 const answer=completion.choices?.[0]?.message?.content;
 if(typeof answer!=='string'||!answer.trim())
  throw new FreeAIError(502,'AI-аас хоосон хариу ирлээ.');
 return answer.trim();
}
