import { Discover } from '@/features/wanderly/discover';

export const metadata = { title: 'Газрууд' };

export default function Explore() {
  return (
    <section className='container section'>
      <p className='eyebrow'>ГАЗРУУД</p>
      <h1>Монгол орноо нээ</h1>
      <p className='intro'>
        Дараагийн аяллаа нуурын эрэг, тал нутгийн хөндий, эсвэл элсэн манхнаас эхлүүлээрэй.
      </p>
      <Discover />
    </section>
  );
}
