import Link from 'next/link';
import {IconMap2,IconRoute,IconPigMoney,IconPhoto} from '@tabler/icons-react';
export function AIGuide(){
 return <aside className='v4-ai-guide'>
  <div className='v4-ai-guide-brand'><span>✧</span><strong>Wanderly AI</strong></div>
  <p className='v4-overline'>PLAN YOUR STORY</p>
  <h1>Аяллын санааг<br/><span>хамт бүтээе.</span></h1>
  <p>Төсөв, хугацаа, сонирхолд тань тохирсон аяллын хувилбарын талаар AI-тай ярилцаж, газрын зураг дээр дурын газраа сонгоод бодит төлөвлөгөөндөө хадгалаарай.</p>
  <div className='v4-ai-guide-cards'>
   <Link href='/map'><IconMap2 size={22}/><span><strong>Дурын газар сонго</strong><small>Дэлхийн газрын зураг</small></span>↗</Link>
   <Link href='/trips/suggest'><IconRoute size={22}/><span><strong>Дүрэмт төлөвлөгч</strong><small>AI шаардлагагүй хувилбар</small></span>↗</Link>
   <Link href='/trips'><IconPigMoney size={22}/><span><strong>Төсвөө хяна</strong><small>Зардлаа өдөр бүр тэмдэглэ</small></span>↗</Link>
   <Link href='/journal'><IconPhoto size={22}/><span><strong>Дурсамж хадгал</strong><small>Зураг, түүх, тэмдэглэл</small></span>↗</Link>
  </div>
  <p className='v4-ai-guide-note'>* AI-ийн саналын дараа очих газраа өөрөө хянаж баталгаажуулна уу.</p>
 </aside>;
}
