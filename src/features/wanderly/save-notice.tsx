'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function SaveNotice() {
  const saved = useSearchParams().get('saved') === '1';
  useEffect(() => {
    if (!saved) return;
    const timer = setTimeout(() => {
      const url = new URL(location.href);
      url.searchParams.delete('saved');
      window.history.replaceState(null, '', url);
    }, 3500);
    return () => clearTimeout(timer);
  }, [saved]);
  return saved ? (
    <p className='save-notice' role='status'>
      Өөрчлөлт хадгалагдлаа
    </p>
  ) : null;
}
