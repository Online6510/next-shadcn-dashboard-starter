'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pages = [
  { href: '/explore', label: 'Газрууд' },
  { href: '/trips', label: 'Миний аялал' },
  { href: '/journal', label: 'Дурсамж' }
];

export function Navigation() {
  const current = usePathname();
  return (
    <nav aria-label='Үндсэн цэс'>
      {pages.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={
            current === href ? 'page' : current.startsWith(href + '/') ? 'location' : undefined
          }
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
