import Link from 'next/link';
import { Discover } from '@/features/wanderly/discover';
export const metadata={title:'Газрууд'};
export default async function Explore({searchParams}:{searchParams:Promise<{q?:string}>}) {
 const query=await searchParams;
 return <div className='v4-explore'>
  <section className='v4-content v4-explore-heading'>
   <div><p className='v4-overline'>EXPLORE / МОНГОЛ ОРОН</p>
    <h1>Аяллын газруудыг<br/><span>судлах.</span></h1>
    <p>Сонирхсон газраа хайж, сонгож, өөрийн аялалдаа нэмээрэй. Зөвхөн жагсаалтын газруудаар хязгаарлагдахгүй.</p>
   </div>
   <div className='v4-explore-actions'><Link href='/map' className='v4-button v4-button-lime'>⌖ Газрын зураг нээх →</Link><Link href='/trips/new' className='v4-button v4-button-dark'>＋ Аялал үүсгэх</Link></div>
  </section>
  <section className='v4-content v4-explore-body'><Discover initialQuery={query.q?.slice(0,120)||''}/></section>
  <div className='v4-content v4-explore-note'>
   <p>⌖ Хүссэн газар тань жагсаалтад байхгүй юу?</p>
   <span>Аялал үүсгээд “Зогсоол нэмэх” хэсэгт газрын зураг дээр цэг сонгох боломжтой.</span>
   <Link href='/trips' className='v4-link'>Аяллаа нээх →</Link>
  </div>
 </div>;
}
