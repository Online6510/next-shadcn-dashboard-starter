import {notFound} from 'next/navigation';
import {TripLayout} from '@/features/wanderly/trip-layout';
import {sample} from '@/features/wanderly/seed';

export const dynamic='force-dynamic';
export default function TripDesignPreview(){
 if(process.env.WANDERLY_VISUAL_PREVIEW!=='1')notFound();
 return <TripLayout trip={sample} query={{}}/>;
}
