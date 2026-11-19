import { notFound } from 'next/navigation';
import { getTrip } from '@/features/wanderly/db';
import { requireUser } from '@/lib/wanderly/auth';
import { TripLayout } from '@/features/wanderly/trip-layout';

export const dynamic='force-dynamic';
export default async function TripPage({params,searchParams}:{
 params:Promise<{id:string}>;
 searchParams:Promise<{day?:string;add?:string;panel?:string}>;
}){
 const {id}=await params;
 await requireUser();
 const trip=await getTrip(id);
 if(!trip)notFound();
 return <TripLayout trip={trip} query={await searchParams}/>;
}
