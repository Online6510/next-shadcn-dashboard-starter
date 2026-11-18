import Link from 'next/link';

export default function NotFound() {
  return (
    <section className='container section'>
      <p className='eyebrow'>404</p>
      <h1>Хуудас олдсонгүй</h1>
      <p className='intro'>Энэ газар эсвэл аялал байхгүй байна.</p>
      <Link className='button' href='/'>
        Нүүр хуудас руу →
      </Link>
    </section>
  );
}
