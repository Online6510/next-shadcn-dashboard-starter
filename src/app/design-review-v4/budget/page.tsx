import {notFound} from 'next/navigation';
import {Budget} from '@/features/wanderly/budget';
import {sample} from '@/features/wanderly/seed';
export const dynamic='force-dynamic';
export default function BudgetVisual(){
 if(process.env.WANDERLY_VISUAL_PREVIEW!=='1')notFound();
 return <section className='v4-budget-review'><header><p className='v4-overline'>ATLAS / FINANCE</p><h1>Миний аяллын төсөв</h1><p>Жишээ мэдээлэл — бодит зардлын график ба дүн</p></header><Budget trip={sample} day={sample.start}/></section>;
}
