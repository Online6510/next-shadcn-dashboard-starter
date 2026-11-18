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
    <Link className='destination-card' href={'/explore/' + place.id}>
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
        ✧
      </span>
      Wanderly<span className='brand-dot'>.</span>
    </Link>
  );
}
