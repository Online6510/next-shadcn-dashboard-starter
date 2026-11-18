'use client';
import { useState, type ReactNode } from 'react';

export function StoryLayout({ children }: { children: ReactNode }) {
  const [timeline, setTimeline] = useState(false);
  return (
    <div className={timeline ? 'story-timeline' : 'story-album'}>
      <div className='story-switch' aria-label='Дэвтрийн харагдац'>
        <button type='button' aria-pressed={!timeline} onClick={() => setTimeline(false)}>
          Зургийн цомог
        </button>
        <button type='button' aria-pressed={timeline} onClick={() => setTimeline(true)}>
          Он дараалал
        </button>
      </div>
      {children}
    </div>
  );
}
