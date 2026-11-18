import { serverSupabase } from '@/lib/wanderly/supabase';
import { optionalUser } from '@/lib/wanderly/auth';
import { mediaObjectPath } from '@/features/wanderly/media';

export const dynamic='force-dynamic';

export async function GET(_:Request,{params}:{params:Promise<{id:string}>}) {
  const user=await optionalUser();
  if(!user) return new Response(null,{status:401,headers:{'Cache-Control':'no-store'}});
  try {
    const path=mediaObjectPath(user.id,(await params).id);
    const supabase=await serverSupabase();
    const {data,error}=await supabase.storage.from('wanderly-journal').download(path);
    if(error||!data) return new Response(null,{status:404});
    return new Response(await data.arrayBuffer(),{
      headers:{
        'Content-Type':'image/webp',
        'X-Content-Type-Options':'nosniff',
        'Cache-Control':'private,no-store'
      }
    });
  } catch {
    return new Response(null,{status:404});
  }
}
