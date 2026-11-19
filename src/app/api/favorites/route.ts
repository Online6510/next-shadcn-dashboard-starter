import {NextRequest,NextResponse} from 'next/server';
import {optionalUser} from '@/lib/wanderly/auth';
import {serverSupabase} from '@/lib/wanderly/supabase';
import {destinations} from '@/features/wanderly/catalog';
import {z} from 'zod';

export const dynamic='force-dynamic';
const requestSchema=z.object({id:z.string().min(1).max(128),favorite:z.boolean()});

export async function GET(){
 const user=await optionalUser();
 if(!user)return NextResponse.json({authenticated:false,ids:[]},{headers:{'Cache-Control':'private,no-store'}});
 const supabase=await serverSupabase();
 const {data,error}=await supabase.from('wanderly_favorites').select('destination_id')
  .eq('owner_id',user.id).order('created_at',{ascending:false});
 if(error)return NextResponse.json({error:'Дуртай газрын жагсаалт уншигдсангүй.'},{status:503});
 return NextResponse.json({authenticated:true,ids:(data||[]).map(row=>row.destination_id)},
  {headers:{'Cache-Control':'private,no-store'}});
}

export async function POST(request:NextRequest){
 const user=await optionalUser();
 if(!user)return NextResponse.json({error:'Дуртай газраа хадгалахын тулд нэвтэрнэ үү.'},{status:401});
 let input:unknown;
 try{
  const raw=await request.text();
  if(raw.length>800)return NextResponse.json({error:'Хүсэлт хэтэрсэн.'},{status:413});
  input=JSON.parse(raw);
 }catch{return NextResponse.json({error:'Хүсэлт буруу.'},{status:400});}
 const parsed=requestSchema.safeParse(input);
 if(!parsed.success||!destinations.some(p=>p.id===parsed.data.id))
  return NextResponse.json({error:'Газрын сонголт буруу байна.'},{status:400});
 const supabase=await serverSupabase();
 const op=parsed.data.favorite
  ?supabase.from('wanderly_favorites').upsert({owner_id:user.id,destination_id:parsed.data.id},{onConflict:'owner_id,destination_id'})
  :supabase.from('wanderly_favorites').delete().eq('owner_id',user.id).eq('destination_id',parsed.data.id);
 const {error}=await op;
 if(error)return NextResponse.json({error:'Сонголтыг хадгалж чадсангүй.'},{status:503});
 return NextResponse.json({id:parsed.data.id,favorite:parsed.data.favorite},
  {headers:{'Cache-Control':'private,no-store'}});
}
