import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTrip } from '@/features/wanderly/db';
import { destinations, dateLabel, money } from '@/features/wanderly/catalog';
import { listDays, budgetTotals } from '@/features/wanderly/model';
import { Cover } from '@/features/wanderly/visuals';
import { ActionForm, TripForm } from '@/features/wanderly/forms';
import { Itinerary } from '@/features/wanderly/itinerary';
import { Budget } from '@/features/wanderly/budget';

export const dynamic = 'force-dynamic';

export default async function TripPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ day?: string; add?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const trip = getTrip(id);
  if (!trip) notFound();
  const days = listDays(trip.start, trip.end);
  const day = query.day && days.includes(query.day) ? query.day : days[0];
  const cover = destinations.find((place) => place.id === trip.cover);
  const selection = destinations.find((place) => place.id === query.add)?.id;
  const totals = budgetTotals(trip);
  return (
    <section className='container section trip-section'>
      <Link className='text-link' href='/trips'>
        ← Миний аялал
      </Link>
      <div className='trip-cover'>
        <Cover image={cover?.image || ''} label={trip.title} />
        <div className='trip-cover-copy'>
          <p className='eyebrow'>
            {cover?.region} · {days.length} ӨДӨР
          </p>
          <h1>{trip.title}</h1>
          <p>
            {dateLabel(trip.start)} – {dateLabel(trip.end)} · {trip.travelers} аялагч
          </p>
          <div className='actions'>
            <Link className='button light' href={'/journal/' + id}>
              Дурсамжийн дэвтэр →
            </Link>
            <a className='button translucent' href='#budget'>
              Төсөв · {money(totals.spent)}
            </a>
          </div>
        </div>
      </div>
      <details className='panel editor trip-settings'>
        <summary>Аяллын мэдээлэл засах</summary>
        <TripForm trip={trip} />
        <ActionForm
          compact
          target={{ kind: 'delete-trip', trip: id }}
          label='Аялал устгах'
          confirm='Аяллыг бүх зогсоол, зардал, тэмдэглэлтэй нь устгах уу?'
        />
      </details>
      <div className='workspace-grid'>
        <nav className='day-list' aria-label='Аяллын өдрүүд'>
          <p className='eyebrow'>ӨДРҮҮД</p>
          {days.map((value, i) => (
            <Link
              key={value}
              href={`/trips/${id}?day=${value}${selection ? '&add=' + selection : ''}`}
              aria-current={day === value ? 'page' : undefined}
            >
              <strong>{i + 1}-р өдөр</strong>
              <small>{dateLabel(value)}</small>
            </Link>
          ))}
        </nav>
        <Itinerary
          key={day + (selection || '')}
          trip={id}
          days={days}
          day={day}
          stops={trip.stops.filter((stop) => stop.day === day)}
          selection={selection}
        />
      </div>
      <Budget trip={trip} />
    </section>
  );
}
