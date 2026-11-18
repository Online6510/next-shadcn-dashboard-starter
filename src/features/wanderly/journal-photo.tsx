'use client';

import { useRef, useState } from 'react';

export function JournalPhoto({ source, title }: { source: string; title: string }) {
  const lightbox = useRef<HTMLDialogElement>(null);
  const [broken, setBroken] = useState(false);
  if (!source || broken)
    return (
      <div className='journal-placeholder'>
        {broken ? 'Зураг ачаалсангүй' : 'Зураггүй тэмдэглэл'}
      </div>
    );
  return (
    <>
      <button
        className='journal-photo'
        type='button'
        onClick={() => lightbox.current?.showModal()}
        aria-label={title + ' — зураг томруулах'}
      >
        {/* External journal images are fetched directly by the browser. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={source}
          alt={title}
          loading='lazy'
          referrerPolicy='no-referrer'
          onError={() => setBroken(true)}
        />
      </button>
      <dialog ref={lightbox} className='lightbox' aria-label={title}>
        <form method='dialog'>
          <button className='button light'>Хаах ×</button>
        </form>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={source} alt={title} referrerPolicy='no-referrer' />
      </dialog>
    </>
  );
}
