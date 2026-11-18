'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function RevealObserver() {
  const pathname = usePathname();
  useEffect(() => {
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-v3-reveal]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('v3-in-view');
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -24px 0px' }
    );

    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight * 0.9) continue;
      section.classList.add('v3-reveal-pending');
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
