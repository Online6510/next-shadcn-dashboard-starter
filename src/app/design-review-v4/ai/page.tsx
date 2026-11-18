import {notFound} from 'next/navigation';
import {AIChat} from '@/features/wanderly/ai-chat';
import {AIGuide} from '@/features/wanderly/ai-guide';
export const dynamic='force-dynamic';
export default function AIVisualReview(){
 if(process.env.WANDERLY_VISUAL_PREVIEW!=='1')notFound();
 return <div className='v4-ai-page'><AIGuide/><AIChat demo/></div>;
}
