'use server';
import {randomUUID} from 'node:crypto';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {z} from 'zod';
import {requireUser} from '@/lib/wanderly/auth';
import {createTrip} from './db';
import {tripFields} from './model';

const draft=z.object({
 title:z.string().trim().min(1).max(140),
 start:z.iso.date(),
 duration:z.coerce.number().int().min(1).max(30),
 travelers:z.coerce.number().int().min(1).max(100),
 budget:z.coerce.number().int().min(0).max(1000000000),
 brief:z.string().trim().min(1).max(5000)
});

export async function saveChatTrip(brief:string,_:string,form:FormData):Promise<string>{
 await requireUser();
 const parsed=draft.safeParse({...Object.fromEntries(form),brief});
 if(!parsed.success)return 'Аяллын нэр, эхлэх өдөр, хоног, төсвөө шалгана уу.';
 const input=parsed.data;
 const end=new Date(Date.parse(input.start)+(input.duration-1)*86400000);
 if(!Number.isFinite(end.getTime())||end.getUTCFullYear()>9999)
  return 'Аяллын хугацаа буруу.';
 const fields=tripFields.safeParse({
  title:input.title,start:input.start,end:end.toISOString().slice(0,10),
  travelers:input.travelers,budget:input.budget,
  cover:'custom',coverLabel:'AI туслахын санал',aiBrief:input.brief
 });
 if(!fields.success)return 'Аяллын огноог шалгана уу.';
 const id=randomUUID();
 try {
  await createTrip({...fields.data,id,stops:[],expenses:[],entries:[]});
 }catch{return 'Аяллыг хадгалж чадсангүй. Дараа дахин оролдоно уу.';}
 revalidatePath('/trips');
 redirect('/trips/'+id);
}
