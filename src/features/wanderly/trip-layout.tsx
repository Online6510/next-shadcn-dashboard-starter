import Link from 'next/link';
import { destinations, dateLabel, money } from './catalog';
import { listDays, budgetTotals } from './model';
import type { Trip } from './model';
import { Cover } from './visuals';
import { ActionForm, TripForm } from './forms';
import { Itinerary } from './itinerary';
import { Budget } from './budget';

export function TripLayout({trip,query}:{
 trip:Trip;
 query:{day?:string;add?:string;panel?:string};
}) {
 const id=trip.id;
 const days=listDays(trip.start,trip.end);
 const day=query.day&&days.includes(query.day)?query.day:days[0];
 const cover=destinations.find(place=>place.id===trip.cover);
 const selection=destinations.find(place=>place.id===query.add)?.id;
 const totals=budgetTotals(trip);
  return (
    <section className='v3-trip-shell trip-section' data-panel={query.panel}>
      <aside className='v3-workspace-sidebar' aria-label='Аяллын ажлын хэсгийн цэс'>
        <Link href='/' className='v3-sidebar-brand'>✧ Wanderly<span>.</span></Link>
        <p className='v3-sidebar-label'>АЯЛЛЫН ОРОН ЗАЙ</p>
        <nav className='v3-sidebar-links'>
          <Link href='/trips'>▧ Миний аялал</Link>
          <Link href={'/trips/' + id + '?day=' + day + '#timeline'} aria-current='page'>◉ Өдрийн хөтөлбөр</Link>
          <Link href={'/trips/' + id + '?day=' + day + '&panel=trip-map#trip-map'}>⌖ Газрын зураг</Link>
          <Link href={'/trips/' + id + '?day=' + day + '&panel=budget#budget'}>◫ Төсөв ба зардал</Link>
          <Link href={'/journal/' + id}>▤ Аяллын түүх</Link>
        </nav>
        <div className='v3-sidebar-footer'><span>АЯЛЛЫН МЭДЭЭЛЭЛ</span>
          <strong>{days.length} өдөр</strong>
          <small>{trip.stops.length} зогсоол · {trip.entries.length} дурсамж</small>
        </div>
      </aside>
      <div className='v3-workspace-main'>
      <Link className='text-link v3-workspace-back' href='/trips'>
        ← Миний аялал
      </Link>
      <div className='trip-cover v3-trip-cover'>
        <Cover image={cover?.image || 'hero'} label={trip.title} />
        <div className='trip-cover-copy'>
          <p className='eyebrow'>
            {trip.cover === 'custom' ? (trip.coverLabel || 'МИНИЙ АЯЛАЛ') : cover?.region} · {days.length} ӨДӨР
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
      {trip.aiBrief && <details className='v4-trip-ai-brief' open>
        <summary>✧ AI аяллын зөвлөгөө · хянаж засварлах санал</summary>
        <p>{trip.aiBrief}</p>
        <small>AI-ийн санал нь баталгаатай зам, үнэ, цаг агаар эсвэл үйлчилгээний захиалга биш. Газрын зураг дээр газраа өөрөө нэмнэ үү.</small>
      </details>}
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
      <nav className='workspace-shortcuts' aria-label='Аяллын хэсгүүд'>
        <Link href={'?day=' + day + '&panel=timeline#timeline'}>Хөтөлбөр</Link>
        <Link href={'?day=' + day + '&panel=trip-map#trip-map'}>Газрын зураг</Link>
        <Link href={'?day=' + day + '&panel=budget#budget'}>Төсөв</Link>
      </nav>
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
      <Budget day={day} trip={trip} />
      </div>
    </section>
  );


}
