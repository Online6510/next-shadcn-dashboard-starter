import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import type { Destination } from './catalog';

export function Cover({
  image,
  label,
  priority = false
}: {
  image: string;
  label: string;
  priority?: boolean;
}) {
  return image ? (
    <Image
      className='cover-image'
      src={'/images/' + image + '.webp'}
      alt={label + ' — дүрслэл'}
      fill
      preload={priority}
      sizes={priority ? '100vw' : '(max-width: 640px) 100vw, (max-width: 1000px) 50vw, 33vw'}
    />
  ) : (
    <div className='cover-placeholder' aria-label={label + ' — зураггүй'} role='img'>
      <Icons.dashboard size={30} />
    </div>
  );
}

export function DestinationCard({ place }: { place: Destination }) {
  return (
    <Link className='destination-card' data-v3-reveal href={'/explore/' + place.id}>
      <div className='destination-photo'>
        <Cover image={place.image} label={place.name} />
        <span className='photo-tag'>{place.category}</span>
      </div>
      <div className='destination-copy'>
        <small>{place.region}</small>
        <div>
          <h3>{place.name}</h3>
          <span aria-hidden='true'>→</span>
        </div>
        <p>{place.description}</p>
      </div>
    </Link>
  );
}

export function Brand() {
  return (
    <Link href='/' className='brand' aria-label='Wanderly — нүүр'>
      <span className='brand-mark' aria-hidden='true'>
        <svg width='28' height='25' viewBox='0 0 32 28' fill='none' xmlns='http://www.w3.org/2000/svg'>
          <path d='M2 23.5 12.1 4.5a2 2 0 0 1 3.4 0l4.5 8.5-3.8 6.2-3.2-6.1-5.6 10.4H2Z' fill='currentColor'/>
          <path d='M14.7 23.5 22.4 9a2 2 0 0 1 3.4 0L32 23.5h-6.3l-2-5-2.6 5h-6.4Z' fill='currentColor'/>
        </svg>
      </span>
      Wanderly
    </Link>
  );
}
