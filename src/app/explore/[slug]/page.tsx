import Link from 'next/link';
import { notFound } from 'next/navigation';
import { destinations } from '@/features/wanderly/catalog';
import { Cover } from '@/features/wanderly/visuals';
import { getTrips } from '@/features/wanderly/db';

export const dynamic = 'force-dynamic';

export default async function Destination({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const place = destinations.find((item) => item.id === slug);
  if (!place) notFound();
  const trips = getTrips();
  return (
    <section className='container section'>
      <Link href='/explore' className='text-link'>
        ← Бүх газар
      </Link>
      <div className='detail-grid'>
        <div className='detail-photo'>
          <Cover image={place.image} label={place.name} priority />
        </div>
        <div>
          <p className='eyebrow'>
            {place.region} · {place.category}
          </p>
          <h1>{place.name}</h1>
          <p className='intro'>{place.description}</p>
          <div className='actions'>
            {place.tags.map((tag) => (
              <span className='chip' key={tag}>
                {tag}
              </span>
            ))}
          </div>
          <p className='meta'>
            Өргөрөг {place.lat.toFixed(2)}° · Уртраг {place.lon.toFixed(2)}°
          </p>
          <Link href={'/trips/new?destination=' + place.id} className='button'>
            Шинэ аялалд нэмэх →
          </Link>
          {trips.length > 0 && (
            <details className='inline-details'>
              <summary>Одоо байгаа аялалд нэмэх</summary>
              {trips.map((trip) => (
                <Link
                  className='text-link block-link'
                  key={trip.id}
                  href={'/trips/' + trip.id + '?add=' + place.id}
                >
                  {trip.title} →
                </Link>
              ))}
            </details>
          )}
        </div>
      </div>
    </section>
  );
}
