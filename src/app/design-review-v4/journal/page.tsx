import {notFound} from 'next/navigation';
import {JournalLayout} from '@/features/wanderly/journal-layout';
import {sample} from '@/features/wanderly/seed';
export const dynamic='force-dynamic';
export default function JournalVisual(){
 if(process.env.WANDERLY_VISUAL_PREVIEW!=='1')notFound();
 return <JournalLayout trip={sample}/>;
}
