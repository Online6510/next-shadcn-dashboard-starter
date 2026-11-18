'use client';

import { useEffect, useState } from 'react';

type ThemeId = 'nature' | 'midnight' | 'desert';
const themeNames: Record<ThemeId, string> = {
  nature: 'Nature Luxury',
  midnight: 'Midnight Explorer',
  desert: 'Desert Editorial'
};
const themes: {
  id: ThemeId;
  subheading: string;
  detail: string;
  colors: string[];
}[] = [
  {
    id: 'nature',
    subheading: 'Байгалийн нам гүм, тансаг өнгө',
    detail: 'Ой модны ногоон, зөөлөн цайвар, элс, дулаан терракотта.',
    colors: ['#173d35', '#f5f0e7', '#d6b58c', '#a66446']
  },
  {
    id: 'midnight',
    subheading: 'Одтой шөнийн аяллын мэдрэмж',
    detail: 'Хөх хар, зөөлөн алтлаг, гүн ногоон-саарал, цайвар бичвэр.',
    colors: ['#101d25', '#1b2b33', '#c6a576', '#f5eee4']
  },
  {
    id: 'desert',
    subheading: 'Монголын говийн дулаан өнгө',
    detail: 'Элсэн шаргал, кофе бор, номын хуудсын дулаан цайвар.',
    colors: ['#733e2c', '#f6ebdd', '#c9a77c', '#3b342f']
  }
];

function isTheme(value: unknown): value is ThemeId {
  return value === 'nature' || value === 'midnight' || value === 'desert';
}

export function ThemePicker() {
  const [selected, setSelected] = useState<ThemeId>('nature');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-theme');
    if (isTheme(current)) setSelected(current);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'wanderly-theme') return;
      const next = isTheme(event.newValue) ? event.newValue : 'nature';
      document.documentElement.setAttribute('data-theme', next);
      setSelected(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function choose(id: ThemeId) {
    document.documentElement.setAttribute('data-theme', id);
    try {
      window.localStorage.setItem('wanderly-theme', id);
    } catch {
      // The visual change still works when browser storage is unavailable.
    }
    setSelected(id);
  }

  return (
    <div className='v3-theme-options' role='group' aria-label='Аппын өнгөний загвар'>
      {themes.map((theme) => (
        <button
          type='button'
          key={theme.id}
          className='v3-theme-card'
          aria-pressed={selected === theme.id}
          onClick={() => choose(theme.id)}
        >
          <span className='v3-theme-swatches' aria-hidden='true'>
            {theme.colors.map((color) => (
              <span key={color} style={{ backgroundColor: color }} />
            ))}
          </span>
          <span className='v3-theme-card-body'>
            <strong>{themeNames[theme.id]}</strong>
            <span>{theme.subheading}</span>
            <small>{theme.detail}</small>
          </span>
          <span className='v3-theme-selected'>{selected === theme.id ? '✓ Сонгосон' : 'Сонгох →'}</span>
        </button>
      ))}
    </div>
  );
}
