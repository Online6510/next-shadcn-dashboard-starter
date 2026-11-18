import {requireUser} from '@/lib/wanderly/auth';
import {AIChat} from '@/features/wanderly/ai-chat';
import {AIGuide} from '@/features/wanderly/ai-guide';
export const dynamic='force-dynamic';
export const metadata={title:'AI аяллын туслах'};
export default async function ChatPage(){
 await requireUser();
 return <div className='v4-ai-page'><AIGuide/><AIChat/></div>;
}
