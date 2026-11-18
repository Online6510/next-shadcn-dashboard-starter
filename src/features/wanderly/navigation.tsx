'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { usePathname } from 'next/navigation';

const pages = [
  { href: '/', label: 'Нүүр' },
  { href: '/explore', label: 'Судлах' },
  { href: '/map', label: 'Газрын зураг' },
  { href: '/trips', label: 'Аялал төлөвлөх' },
  { href: '/journal', label: 'Дурсамж' },
  { href: '/ai', label: 'AI Туслах' },
  { href: '/settings/appearance', label: 'Тохиргоо' }
];

export function Navigation() {
  const current = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const links = pages.map(({ href, label }) => (
    <Link
      key={href}
      href={href}
      aria-current={href === current ? 'page' : undefined}
      onClick={() => dialog.current?.close()}
    >
      {label}
    </Link>
  ));
  return (
    <>
      <nav className='desktop-links' aria-label='Үндсэн цэс'>
        {links}
      </nav>
      <button
        className='menu-toggle small-button'
        onClick={() => dialog.current?.showModal()}
        aria-haspopup='dialog'
      >
        ☰ Цэс
      </button>
      <dialog ref={dialog} className='menu-dialog' aria-label='Үндсэн цэс'>
        <form method='dialog'>
          <button className='small-button'>Хаах ×</button>
        </form>
        <nav>{links}</nav>
      </dialog>
    </>
  );
}
