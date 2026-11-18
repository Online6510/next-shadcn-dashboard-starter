import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTrip } from '@/features/wanderly/db';
import { dateLabel } from '@/features/wanderly/catalog';
import { ActionForm, EntryForm } from '@/features/wanderly/forms';
import { JournalPhoto } from '@/features/wanderly/journal-photo';

export const dynamic = 'force-dynamic';

export default async function Journal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = getTrip(id);
  if (!trip) notFound();
  const entries = trip.entries.toSorted((a, b) => a.date.localeCompare(b.date));
  return (
    <section className='journal-page'>
      <div className='container section'>
        <Link href='/journal' className='text-link'>
          ← Бүх дурсамж
        </Link>
        <div className='journal-header'>
          <p className='eyebrow'>ДУРСАМЖИЙН ДЭВТЭР</p>
          <h1>{trip.title}</h1>
          <p className='intro'>
            {dateLabel(trip.start)} – {dateLabel(trip.end)}
          </p>
          <Link className='text-link' href={'/trips/' + id}>
            Аяллын төлөвлөгөө →
          </Link>
        </div>
        <details className='panel editor journal-editor'>
          <summary>＋ Дурсамж нэмэх</summary>
          <EntryForm trip={trip} />
        </details>
        {entries.length ? (
          <>
            <nav className='journal-nav' aria-label='Дурсамжийн он дараалал'>
              {entries.map((entry) => (
                <a href={'#' + entry.id} className='chip' key={entry.id}>
                  {dateLabel(entry.date)} · {entry.title}
                </a>
              ))}
            </nav>
            <div className='journal-entries'>
              {entries.map((entry) => (
                <article id={entry.id} className='journal-record' key={entry.id}>
                  <div className='photo-frame'>
                    <JournalPhoto source={entry.image} title={entry.title} />
                    <p>{entry.place || trip.title}</p>
                  </div>
                  <div className='journal-copy'>
                    <p className='eyebrow'>
                      {dateLabel(entry.date)}
                      {entry.mood ? ' · ' + entry.mood : ''}
                    </p>
                    <h2>{entry.title}</h2>
                    <p>{entry.story}</p>
                    <details className='inline-details'>
                      <summary>Засах</summary>
                      <EntryForm trip={trip} entry={entry} />
                    </details>
                    <ActionForm
                      compact
                      target={{ kind: 'remove', trip: id, collection: 'entries', id: entry.id }}
                      label='Устгах'
                      confirm='Энэ дурсамжийг устгах уу?'
                    />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <p className='panel journal-editor'>Энэ аяллын анхны дурсамжийг бичээрэй.</p>
        )}
      </div>
    </section>
  );
}
