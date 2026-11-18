import {notFound} from 'next/navigation';
import {getTrip} from '@/features/wanderly/db';
import {requireUser} from '@/lib/wanderly/auth';
import {JournalLayout} from '@/features/wanderly/journal-layout';
export const dynamic='force-dynamic';
export default async function Journal({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 await requireUser();
 const trip=await getTrip(id);
 if(!trip)notFound();
 return <JournalLayout trip={trip}/>;
}
