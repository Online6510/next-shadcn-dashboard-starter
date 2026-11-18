import Link from 'next/link';
import { PlannerForm } from '@/features/wanderly/planner-form';

export const metadata = { title: 'Ухаалаг санал' };

export default function TravelSuggestion() {
  return (
    <section className='container section'>
      <Link className='text-link' href='/trips'>
        ← Миний аялал
      </Link>
      <p className='eyebrow suggestion-kicker'>АЯЛЛЫН ТӨЛӨВЛӨГӨӨ</p>
      <h1>Ухаалаг санал</h1>
      <p className='intro'>
        Сонирхолд нийцсэн газрыг эхэнд эрэмбэлж, аймаг болон аяллын хэмнэлээр өдрүүдэд хуваарилна.
        Саналыг хадгалаад өөрийнхөөрөө засаж болно.
      </p>
      <details className='inline-details'>
        <summary>Санал хэрхэн тооцогдсон бэ?</summary>
        <p>
          Дүрэмт төлөвлөгч нь сонирхолд нийцсэн газруудыг эрэмбэлж, нэг өдрийн зогсоолыг нэг аймагт
          бүлэглэнэ. Зогсоолуудад таны төсвийн 35%-ийг хуваарилна. Эдгээр дүн нь төсвийн тооцоо юм.
        </p>
      </details>
      <PlannerForm />
    </section>
  );
}
