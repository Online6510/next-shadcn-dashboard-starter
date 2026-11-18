import Link from 'next/link';
import { destinations, dateLabel, money, mongoliaToday } from '@/features/wanderly/catalog';
import { getTrips } from '@/features/wanderly/db';
import { Cover } from '@/features/wanderly/visuals';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Миний аялал' };

export default function Trips() {
  const trips = getTrips();
  const today = mongoliaToday();
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
      {trips.length ? (
        <div className='destination-grid'>
          {trips.map((trip) => {
            const cover = destinations.find((place) => place.id === trip.cover);
            const status =
              today < trip.start ? 'Төлөвлөсөн' : today > trip.end ? 'Дууссан' : 'Үргэлжилж буй';
            return (
              <Link className='destination-card' key={trip.id} href={'/trips/' + trip.id}>
                <div className='destination-photo'>
                  <Cover image={cover?.image || ''} label={trip.title} />
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
                    {trip.travelers} аялагч · {money(trip.budget)}
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
