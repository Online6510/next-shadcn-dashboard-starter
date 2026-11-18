import Link from 'next/link';
import { getTrips } from '@/features/wanderly/db';
import { requireUser } from '@/lib/wanderly/auth';
import { destinations } from '@/features/wanderly/catalog';
import { Cover } from '@/features/wanderly/visuals';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Дурсамж' };

export default async function Journals() {
  await requireUser();
  const trips = await getTrips();
  return (
    <section className='container section'>
      <p className='eyebrow'>ДУРСАМЖИЙН ДЭВТЭР</p>
      <h1>Замын дурсамжууд</h1>
      <p className='intro'>Аялал бүрийн зураг, мэдрэмж, мартагдашгүй мөчүүд.</p>
      {trips.length ? (
        <div className='destination-grid journal-index'>
          {trips.map((trip) => {
            const place = destinations.find((item) => item.id === trip.cover);
            return (
              <Link key={trip.id} href={'/journal/' + trip.id} className='destination-card'>
                <div className='destination-photo'>
                  <Cover image={place?.image || ''} label={trip.title} />
                </div>
                <div className='destination-copy'>
                  <small>{trip.entries.length} тэмдэглэл</small>
                  <div>
                    <h3>{trip.title}</h3>
                    <span aria-hidden='true'>→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className='panel'>
          Аялал үүсгээд дурсамжаа бичиж эхлээрэй.{' '}
          <Link className='text-link' href='/trips/new'>
            Аялал үүсгэх →
          </Link>
        </p>
      )}
    </section>
  );
}
