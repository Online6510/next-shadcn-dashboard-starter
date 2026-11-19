import 'server-only';
import {serverSupabase} from '@/lib/wanderly/supabase';

/**
 * Atomic, per-user rolling 24-hour quota. Postgres serializes concurrent
 * requests using an owner-scoped advisory transaction lock.
 * 5 calls total across chat and structured itinerary generation.
 */
export async function reserveAiRequest():Promise<'ok'|'limit'|'unavailable'> {
 const supabase=await serverSupabase();
 const {data,error}=await supabase.rpc('wanderly_reserve_ai_request');
 if(error){
  console.error('Wanderly AI quota unavailable',error.code);
  return 'unavailable';
 }
 return data===true?'ok':'limit';
}
