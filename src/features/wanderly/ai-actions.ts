'use server';
import { randomUUID } from 'node:crypto';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { aiPlanSchema, type AIPlan } from './ai-schema';
import { plannerFields, type PlannerInput } from './planner';
import { destinations } from './catalog';
import { createTrip } from './db';
import { requireUser } from '@/lib/wanderly/auth';
import { listDays, tripFields } from './model';

export async function saveAiTrip(input:PlannerInput, suggestion:AIPlan, _:string) {
  await requireUser();
  const parsed=plannerFields.safeParse(input);
  const plan=aiPlanSchema.safeParse(suggestion);
  if(!parsed.success||!plan.success) return 'AI төлөвлөгөөний мэдээлэл буруу байна.';
  const settings=parsed.data;
  const end=new Date(Date.parse(settings.start)+(settings.duration-1)*86400000)
    .toISOString().slice(0,10);
  const days=listDays(settings.start,end);
  const used=new Set<string>();
  const stops=plan.data.days.flatMap((group)=>{
    const day=days[group.dayIndex-1];
    if(!day) return [];
    return group.placeIds.flatMap((id)=>{
      if(used.has(id)) return [];
      const place=destinations.find(p=>p.id===id);
      if(!place||(settings.region && place.region!==settings.region)) return [];
      used.add(id);
      return [{
        id:randomUUID(), day, destination:id, time:'10:00', duration:90,
        cost:0, notes:group.note.slice(0,350)
      }];
    });
  });
  if(!stops.length) return 'Хадгалах зогсоол олдсонгүй.';
  const eachCost=Math.floor((settings.budget*0.35)/stops.length);
  stops.forEach((s)=>{s.cost=eachCost;});
  const trip=tripFields.parse({
    title:settings.title,
    start:settings.start,
    end,
    budget:settings.budget,
    travelers:1,
    cover:stops[0].destination
  });
  const id=randomUUID();
  await createTrip({...trip,id,stops,expenses:[],entries:[]});
  revalidatePath('/trips');
  redirect('/trips/'+id);
}
