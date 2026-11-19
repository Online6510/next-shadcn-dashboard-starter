import Link from 'next/link';
import { destinations } from '@/features/wanderly/catalog';
import { Cover, DestinationCard } from '@/features/wanderly/visuals';
import { getTrip, getTrips } from '@/features/wanderly/db';
export const dynamic='force-dynamic';
export default async function Home() {
 const [trips,demo]=await Promise.all([getTrips(),getTrip('khuvsgul-demo')]);
 const deck=[
  {id:'khuvsgul',name:'Хөвсгөл нуур',image:'lake',region:'Хөвсгөл аймаг'},
  {id:'khongor',name:'Хонгорын элс',image:'gobi',region:'Өмнөговь аймаг'},
  {id:'terelj',name:'Горхи-Тэрэлж',image:'terelj',region:'Төв аймаг'}
 ];
 return <div className='v4-home'>
  <section className='v4-hero'>
   <Cover image='hero' label='Монголын уудам байгаль, нуур, уулс' priority/>
   <div className='v4-hero-shade'/>
   <div className='v4-hero-inner'>
    <div className='v4-hero-copy'>
     <p className='v4-pill'>🇲🇳 MONGOLIA · АЯЛЛЫН ТӨЛӨВЛӨГЧ</p>
     <h1>Аялал бол<br/><span>шинэ түүх.</span></h1>
     <p className='v4-hero-description'>Монголын байгалийн гайхамшигт газруудыг судалж, хүссэн газраа нэмж, өөрийн аяллын түүхийг бүтээ.</p>
     <form action='/explore' className='v4-hero-search' role='search'>
      <span aria-hidden='true'>⌕</span>
      <input type='search' name='q' placeholder='Хаашаа аялах вэ? Хөвсгөл, Говь, Хархорин…' aria-label='Аяллын газар хайх'/>
      <button type='submit' aria-label='Газар хайх'>→</button>
     </form>
     <div className='v4-hero-actions'>
      <Link href='/trips/new' className='v4-button v4-button-lime'>⌖ &nbsp; Аяллаа төлөвлөх <span>→</span></Link>
      <Link href='/map' className='v4-button v4-button-outline'>Газрын зураг нээх <span>↗</span></Link>
     </div>
    </div>
    <div className='v4-hero-deck' aria-label='Онцлох аяллын гурван газар'>
     {deck.map((place,index)=><Link href={'/explore/'+place.id} key={place.id}
      className={'v4-deck-card v4-deck-card-'+index}>
      <Cover image={place.image} label={place.name}/>
      <span className='v4-deck-heart' aria-hidden='true'>♡</span>
      <div><strong>{place.name}</strong><small>⌖ {place.region}</small></div>
     </Link>)}
    </div>
   </div>
   <div className='v4-hero-foot'>
    <div><span>◉</span><p><strong>{destinations.length} онцлох газар</strong><small>Монгол орны олон өнгө</small></p></div>
    <div><span>⌖</span><p><strong>Уян хатан маршрут</strong><small>Дурын цэг, дурын өдөр</small></p></div>
    <div><span>▧</span><p><strong>Дурсамжийн журнал</strong><small>Зураг, тэмдэглэл</small></p></div>
    <div><span>✧</span><p><strong>AI туслах</strong><small>Аяллын нэмэлт санаа</small></p></div>
   </div>
  </section>
  <section className='v4-featured v4-section'>
   <div className='v4-content'>
    <div className='v4-section-heading'>
     <div><p className='v4-overline'>DISCOVER MONGOLIA / ГАЗРУУД</p><h2>Очиход үнэ цэнтэй <span>газрууд</span></h2>
      <p>Сонирхолтой газраа олоод аяллынхаа маршрутад нэмээрэй.</p></div>
     <Link href='/explore' className='v4-link'>Бүх газрыг үзэх <span>↗</span></Link>
    </div>
    <div className='v4-destination-grid'>{destinations.slice(0,6).map(place=><DestinationCard key={place.id} place={place}/>)}</div>
   </div>
  </section>
  <section className='v4-feature-work v4-section'>
   <div className='v4-content v4-feature-layout'>
    <div className='v4-feature-intro'>
     <p className='v4-overline'>PLAN WITHOUT LIMITS</p>
     <h2>Газрын зураг дээр<br/><span>аяллаа зур.</span></h2>
     <p>Урьдчилан сонгосон газраар хязгаарлагдахгүй. Өөрийн хүссэн газар, буудал, уул, нуур эсвэл замын цэгийг хайж, газрын зураг дээр товшоод аялалдаа нэм.</p>
     <Link href='/trips' className='v4-button v4-button-dark'>Миний аяллууд <span>↗</span></Link>
    </div>
    <div className='v4-feature-preview'>
     <div className='v4-feature-preview-map'>
      <Cover image='terelj' label='Уулсын хөндий'/>
      <div className='v4-feature-map-label'>📍 Хүссэн цэгээ газрын зурагт нэм</div>
     </div>
     <div className='v4-feature-preview-side'>
      <div className='v4-mini-metric'><span>01</span><strong>Очих газраа ол</strong><small>Хайлт эсвэл газрын зураг</small></div>
      <div className='v4-mini-metric'><span>02</span><strong>Өдөртөө хуваарил</strong><small>Маршрут, зогсоол, цаг</small></div>
      <div className='v4-mini-metric'><span>03</span><strong>Дурсамжаа бүтээ</strong><small>Төсөв, зураг, тэмдэглэл</small></div>
     </div>
    </div>
   </div>
  </section>
  <section className='v4-final-band'>
   <div className='v4-content'>
    <div><p className='v4-overline'>YOUR JOURNEY / ЧИНИЙ ТҮҮХ</p><h2>Дараагийн дурсамж<br/>эндээс эхэлнэ.</h2>
     <p>{trips.length?'Таны хадгалсан '+trips.length+' аялал байна.':'Шинэ аяллаа үүсгэж, замдаа үлдэх агшин бүрийг хадгал.'}</p></div>
    <div className='v4-band-actions'><Link href='/trips/new' className='v4-button v4-button-lime'>Шинэ аялал үүсгэх →</Link>
     <Link href={demo?'/journal/'+demo.id:'/journal'} className='v4-button v4-button-outline'>Дурсамжийн журнал ↗</Link></div>
   </div>
  </section>
 </div>;
}
