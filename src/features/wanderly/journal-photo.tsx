'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import type { Photo } from './model';

export function PrintStory() {
  return (
    <button className='small-button print-story' onClick={() => window.print()}>
      Дэвтэр хэвлэх / PDF
    </button>
  );
}

export function JournalPhoto({
  source,
  title,
  photos = []
}: {
  source: string;
  title: string;
  photos?: Photo[];
}) {
  const images = [
    ...photos.map((photo) => ({ src: '/api/media/' + photo.id, alt: photo.alt })),
    ...(source ? [{ src: source, alt: title }] : [])
  ];
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState<string[]>([]);
  const available = images.filter((image) => !failed.includes(image.src));
  const current = available[index % available.length];
  function move(step: number) {
    setIndex((index + step + available.length) % available.length);
  }
  if (!current)
    return (
      <div className='journal-placeholder'>
        {images.length ? 'Зураг ачаалсангүй' : 'Үгээр үлдээсэн дурсамж'}
      </div>
    );
  return (
    <>
      <div className='memory-gallery'>
        {available.map((item, i) => (
          <button
            key={item.src}
            className='journal-photo'
            type='button'
            aria-label={title + ' — зураг томруулах ' + (i + 1)}
            onClick={() => {
              setIndex(i);
              dialog.current?.showModal();
            }}
          >
            <Image
              unoptimized
              width={800}
              height={560}
              src={item.src}
              alt={item.alt}
              loading='lazy'
              referrerPolicy='no-referrer'
              onError={() => setFailed((prev) => [...prev, item.src])}
            />
          </button>
        ))}
      </div>
      <dialog
        className='lightbox'
        ref={dialog}
        aria-label={title}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') move(-1);
          if (e.key === 'ArrowRight') move(1);
        }}
      >
        <form method='dialog'>
          <button className='button light'>Хаах ×</button>
        </form>
        <Image
          unoptimized
          width={800}
          height={560}
          src={current.src}
          alt={current.alt}
          referrerPolicy='no-referrer'
        />
        {available.length > 1 && (
          <div className='lightbox-controls'>
            <button onClick={() => move(-1)}>← Өмнөх</button>
            <span aria-live='polite'>
              {(index % available.length) + 1} / {available.length}
            </span>
            <button onClick={() => move(1)}>Дараах →</button>
          </div>
        )}
      </dialog>
    </>
  );
}
