import {NextResponse} from 'next/server';
import {optionalUser} from '@/lib/wanderly/auth';
import {serverSupabase} from '@/lib/wanderly/supabase';
import {freeAiConfigured,FREE_AI_PROVIDER} from '@/lib/wanderly/free-ai';
export const dynamic='force-dynamic';
export async function GET(){
 const user=await optionalUser();
 if(!user)return NextResponse.json({authenticated:false,configured:false,remaining:0},
  {headers:{'Cache-Control':'private,no-store'}});
 const configured=freeAiConfigured();
 const supabase=await serverSupabase();
 const {count,error}=await supabase.from('wanderly_ai_usage').select('id',{head:true,count:'exact'})
  .eq('owner_id',user.id).gte('requested_at',new Date(Date.now()-86400000).toISOString());
 if(error)return NextResponse.json({error:'AI ашиглалтын төлөвийг уншиж чадсангүй.'},
  {status:503,headers:{'Cache-Control':'private,no-store'}});
 return NextResponse.json({authenticated:true,configured,provider:FREE_AI_PROVIDER,remaining:Math.max(0,5-(count||0))},
  {headers:{'Cache-Control':'private,no-store'}});
}
