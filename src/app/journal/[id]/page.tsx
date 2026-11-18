import Link from 'next/link';
import { notFound } from 'next/navigation';
import { listDays } from '@/features/wanderly/model';
import { getTrip } from '@/features/wanderly/db';
import { requireUser } from '@/lib/wanderly/auth';
import { destinations, dateLabel } from '@/features/wanderly/catalog';
import { ActionForm, EntryForm } from '@/features/wanderly/forms';
import { StoryLayout } from '@/features/wanderly/story-layout';
import { Cover } from '@/features/wanderly/visuals';
import { JournalPhoto, PrintStory } from '@/features/wanderly/journal-photo';

export const dynamic = 'force-dynamic';

export default async function Journal({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireUser();
  const trip = await getTrip(id);
  if (!trip) notFound();
  const entries = trip.entries.toSorted((a, b) => a.date.localeCompare(b.date));
  const cover = destinations.find((place) => place.id === trip.cover);
  const dates = [...new Set(entries.map((entry) => entry.date))];
  return (
    <section className='journal-page v3-journal-page'>
      <div className='container section'>
        <Link href='/journal' className='text-link'>
          ← Бүх дурсамж
        </Link>
        <div className='v3-journal-title-line'><span>TRAVEL MEMORIES / АЯЛЛЫН ДУРСАМЖ</span><span>Түүх бүхэн үнэ цэнтэй.</span></div>
        <div className='journal-header journal-cover'>
          <Cover image={cover?.image || 'hero'} label={trip.title} priority />
          <div className='journal-cover-inner'>
            <p className='eyebrow'>ДУРСАМЖИЙН ДЭВТЭР</p>
            <h1>{trip.title}</h1>
            <p className='intro'>
              {dateLabel(trip.start)} – {dateLabel(trip.end)} ·{' '}
              {listDays(trip.start, trip.end).length} өдөр · {entries.length} дурсамж
            </p>
            <Link className='text-link' href={'/trips/' + id}>
              Аяллын төлөвлөгөө →
            </Link>
          </div>
        </div>
        <div className='journal-bar'>
          <PrintStory />
          <details className='panel editor journal-editor'>
            <summary>＋ Дурсамж нэмэх</summary>
            <EntryForm trip={trip} />
          </details>
        </div>
        {entries.length ? (
          <StoryLayout>
            <nav className='journal-nav' aria-label='Дурсамжийн он дараалал'>
              {entries.map((entry) => (
                <a href={'#' + entry.id} className='chip' key={entry.id}>
                  {dateLabel(entry.date)} · {entry.title}
                </a>
              ))}
            </nav>
            <div className='journal-entries v3-scrapbook'>
              {dates.map((date) => (
                <section className='chapter v3-scrapbook-chapter' key={date}>
                  <header>
                    <span className='eyebrow'>АЯЛЛЫН ТЭМДЭГЛЭЛ</span>
                    <h2>{dateLabel(date)}</h2>
                  </header>
                  {entries
                    .filter((entry) => entry.date === date)
                    .map((entry) => (
                      <article id={entry.id} className='journal-record v3-memory-card' key={entry.id}>
                        <div className='photo-frame v3-polaroid'>
                          <JournalPhoto
                            source={entry.image}
                            title={entry.title}
                            photos={entry.photos}
                          />
                          <p>{entry.place || trip.title}</p>
                        </div>
                        <div className='journal-copy v3-story-note'>
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
                            target={{
                              kind: 'remove',
                              trip: id,
                              collection: 'entries',
                              id: entry.id
                            }}
                            label='Устгах'
                            confirm='Энэ дурсамжийг устгах уу?'
                          />
                        </div>
                      </article>
                    ))}
                </section>
              ))}
            </div>
          </StoryLayout>
        ) : (
          <p className='panel journal-editor'>Энэ аяллын анхны дурсамжийг бичээрэй.</p>
        )}
      </div>
    </section>
  );
}
