import { Discover } from '@/features/wanderly/discover';

export const metadata = { title: 'Газрууд' };

export default function Explore() {
  return (
    <section className='container section v3-explore'>
      <header className='v3-explore-heading'>
        <div><p className='eyebrow'>WANDERLY / ГАЗРУУД</p><h1>Аяллын <em>газрууд</em></h1>
        <p className='intro'>Монголын байгалийн гайхамшгийг нээ. Очих газраа олж, өөрийн аялалд нэмээрэй.</p></div>
        <div className='v3-explore-photo' role='img' aria-label='Монголын уулсын дүрслэл'><span>EXPLORE MONGOLIA</span></div>
      </header>
      <Discover />
    </section>
  );
}
