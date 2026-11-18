import Link from 'next/link';
import { requireUser } from '@/lib/wanderly/auth';
import { destinations } from '@/features/wanderly/catalog';
import { TripForm } from '@/features/wanderly/forms';
import { Cover } from '@/features/wanderly/visuals';

export const metadata = { title: 'Аялал үүсгэх' };

export default async function NewTrip({
  searchParams
}: {
  searchParams: Promise<{ destination?: string }>;
}) {
  await requireUser();
  const { destination } = await searchParams;
  const place = destinations.find((item) => item.id === destination);
  return (
    <section className='container section'>
      <Link href='/trips' className='text-link'>
        ← Миний аялал
      </Link>
      <div className='detail-grid new-trip'>
        <div>
          <p className='eyebrow'>ТӨЛӨВЛӨГӨӨ</p>
          <h1>Шинэ аялал</h1>
          <p className='intro'>Хаашаа, хэзээ, хэнтэй явахаа сонгоод аяллаа эхлүүлээрэй.</p>
          <div className='new-trip-photo'>
            <Cover image={place?.image || 'hero'} label={place?.name || 'Хөвсгөлийн байгаль'} />
          </div>
        </div>
        <div className='panel'>
          <TripForm selection={place?.id} />
        </div>
      </div>
    </section>
  );
}
