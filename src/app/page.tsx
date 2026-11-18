import Link from 'next/link';
import { getTrips, getTrip } from '@/features/wanderly/db';
import { destinations } from '@/features/wanderly/catalog';
import { Cover, DestinationCard } from '@/features/wanderly/visuals';

export const dynamic = 'force-dynamic';
export default function Home() {
  const demo = getTrip('khuvsgul-demo');
  const tripCount = getTrips().length;
  return (
    <>
      <section className='hero v3-hero'>
        <Cover image='hero' label='Хөвсгөлийн нуураас сэдэвлэсэн байгаль' priority />
        <div className='hero-shade' />
        <div className='container hero-content'>
          <p className='eyebrow hero-kicker'>
            <span /> МОНГОЛ ОРНООР АЯЛЪЯ
          </p>
          <h1>
            Монгол орноор
            <br /> <em>аялж, дурсамж бүтээ.</em>
          </h1>
          <p className='hero-text'>
            Тайгын цэнхэр нуур, говийн алтан манхан, уулсын чимээгүй оргил. Маршрутаа бүтээж,
            аяллынхаа түүхийг нэг дор хадгалаарай.
          </p>
          <div className='actions'>
            <Link className='button light' href='/trips/new'>
              Аяллаа төлөвлөх <span aria-hidden='true'>→</span>
            </Link>
            <Link className='button translucent' href='/explore'>
              Газруудыг судлах <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>
        <div className='container v3-hero-highlights' aria-label='Wanderly боломжууд'>
          <div><strong>{destinations.length}</strong><span>Аяллын газрын санаа</span></div>
          <div><strong>{tripCount}</strong><span>Хадгалсан аялал</span></div>
          <div><strong>01 — 30</strong><span>Өдрөөр аяллаа төлөвлө</span></div>
          <div><strong>06</strong><span>Зураг нэг дурсамжид</span></div>
        </div>
        <div className='container hero-caption'>
          <a href='#featured'>↓ &nbsp; ОНЦЛОХ ГАЗРУУД</a>
          <span>⌖ &nbsp; ХӨВСГӨЛИЙН НУУРААС СЭДЭВЛЭВ</span>
        </div>
      </section>
      <section className='container section v3-after-hero' data-v3-reveal id='featured'>
        <div className='v3-editorial-intro'><span>WANDERLY / DISCOVER</span><p>Газрын зургийн цэг бүрээс шинэ түүх эхэлнэ.</p></div>
        <div className='section-heading'>
          <div>
            <p className='eyebrow'>МОНГОЛ ОРНЫГ НЭЭ</p>
            <h2>Очих газраа сонго</h2>
          </div>
          <Link className='text-link' href='/explore'>
            Бүх газрыг үзэх →
          </Link>
        </div>
        <div className='destination-grid'>
          {destinations.slice(0, 3).map((place) => (
            <DestinationCard place={place} key={place.id} />
          ))}
        </div>
      </section>
      <section className='paper section' data-v3-reveal>
        <div className='container'>
          <p className='eyebrow'>АЯЛЛЫН ТЭМДЭГЛЭЛ</p>
          <h2>Замын турш, дурсамж бүр</h2>
          <div className='steps'>
            {[
              ['Газраа нээ', 'Нуур, говь, уул, түүхэн газруудаас өөрт таалагдсанаа олоорой.'],
              ['Өдрүүдээ төлөвлө', 'Очих газраа өдрөөр жагсааж, төсөв, зардлаа нэг дор хөтлөөрэй.'],
              ['Дурсамжаа хадгал', 'Замд авсан зураг, түүхээ өдрийн тэмдэглэлдээ үлдээгээрэй.']
            ].map(([title, copy], i) => (
              <div key={title}>
                <span aria-hidden='true'>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className='container section v3-story-section' data-v3-reveal>
        <div className='story-banner'>
          <div className='story-image'>
            <Cover image='lake' label='Нуурын эрэг' />
          </div>
          <div className='story-copy'>
            <p className='eyebrow'>ЖИШЭЭ АЯЛАЛ</p>
            <h2>{demo?.title || 'Дурсамжийн дэвтэр'}</h2>
            <p>
              {demo
                ? demo.stops.length + ' зогсоол · ' + demo.entries.length + ' дурсамж'
                : 'Аяллын түүх, гэрэл зургаа нэг дэвтэрт хадгалаарай.'}
            </p>
            <div className='actions'>
              <Link className='button' href={demo ? '/trips/' + demo.id : '/trips'}>
                {demo ? 'Жишээ аялал үзэх' : 'Аяллууд үзэх'} →
              </Link>
              <Link className='text-link' href={demo ? '/journal/' + demo.id : '/journal'}>
                Дурсамж унших →
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className='v3-end-cta'><div className='container'><p className='eyebrow'>ЧИНИЙ ДАРААГИЙН АЯЛАЛ</p><h2>Дараагийн дурсамж<br /><em>эндээс эхэлнэ.</em></h2><Link className='button light' href='/trips/new'>Аялал үүсгэх →</Link></div></section>
    </>
  );
}
