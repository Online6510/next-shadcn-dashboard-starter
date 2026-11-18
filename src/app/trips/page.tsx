import Link from 'next/link';
import { destinations, dateLabel, money, mongoliaToday } from '@/features/wanderly/catalog';
import { getTrips } from '@/features/wanderly/db';
import { requireUser } from '@/lib/wanderly/auth';
import { Cover } from '@/features/wanderly/visuals';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Миний аялал' };

export default async function Trips({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: selected } = await searchParams;
  await requireUser();
  const trips = await getTrips();
  const today = mongoliaToday();
  const statusOf = (trip: (typeof trips)[number]) =>
    today < trip.start ? 'Төлөвлөсөн' : today > trip.end ? 'Дууссан' : 'Үргэлжилж буй';
  const visible = selected ? trips.filter((t) => statusOf(t) === selected) : trips;
  return (
    <section className='container section'>
      <div className='section-heading'>
        <div>
          <p className='eyebrow'>АЯЛЛЫН ТӨЛӨВЛӨГӨӨ</p>
          <h1>Миний аялал</h1>
          <p className='intro'>Явах өдрүүд, очих газрууд, замын дурсамж нэг дор.</p>
        </div>
        <div className='actions'>
          <Link href='/trips/suggest' className='text-link'>
            Ухаалаг санал →
          </Link>
          <Link href='/trips/new' className='button'>
            ＋ Аялал үүсгэх
          </Link>
        </div>
      </div>
      <nav className='trip-filters' aria-label='Аяллын төлөв'>
        {['', 'Төлөвлөсөн', 'Үргэлжилж буй', 'Дууссан'].map((s) => (
          <Link
            key={s}
            aria-current={(selected || '') === s ? 'page' : undefined}
            href={s ? '/trips?status=' + encodeURIComponent(s) : '/trips'}
          >
            {s || 'Бүгд'}
          </Link>
        ))}
      </nav>
      {visible.length ? (
        <div className='destination-grid'>
          {visible.map((trip) => {
            const cover = destinations.find((place) => place.id === trip.cover);
            const status =
              today < trip.start ? 'Төлөвлөсөн' : today > trip.end ? 'Дууссан' : 'Үргэлжилж буй';
            return (
              <Link className='destination-card' key={trip.id} href={'/trips/' + trip.id}>
                <div className='destination-photo'>
                  <Cover image={cover?.image || 'hero'} label={trip.title} />
                  <span className='photo-tag'>{status}</span>
                </div>
                <div className='destination-copy'>
                  <small>
                    {dateLabel(trip.start)} – {dateLabel(trip.end)}
                  </small>
                  <div>
                    <h3>{trip.title}</h3>
                    <span aria-hidden='true'>→</span>
                  </div>
                  <p>
                    {trip.id === 'khuvsgul-demo' ? 'Жишээ аялал · ' : ''}
                    {trip.cover === 'custom' ? (trip.coverLabel ? trip.coverLabel + ' · ' : '') : ''}{trip.stops.length} зогсоол · {trip.travelers} аялагч · {money(trip.budget)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className='panel'>Аялал хараахан алга. Эхний аяллаа үүсгээрэй.</p>
      )}
    </section>
  );
}
