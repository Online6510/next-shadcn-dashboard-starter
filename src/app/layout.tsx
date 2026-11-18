import { Suspense } from 'react';
import { SaveNotice } from '@/features/wanderly/save-notice';
import { RevealObserver } from '@/features/wanderly/reveal-observer';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Brand } from '@/features/wanderly/visuals';
import { Navigation } from '@/features/wanderly/navigation';
import { AuthNav } from '@/features/wanderly/auth-nav';
import '@fontsource-variable/lora';
import '@fontsource-variable/manrope';
import './wanderly.css';
import './wanderly-v3.css';
import './wanderly-v4.css';

export const metadata: Metadata = {
  title: { default: 'Wanderly — Монгол орноор аялъя', template: '%s | Wanderly' },
  description: 'Монгол орныг нээж, аяллаа төлөвлөн, дурсамжаа хадгалаарай.',
  icons: { icon: '/wanderly-icon.svg' }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='mn' suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var t=localStorage.getItem('wanderly-theme');if(['nature','midnight','desert'].includes(t||'')){document.documentElement.setAttribute('data-theme',t)}}catch(e){}"
          }}
        />
      </head>
      <body>
        <a href='#main' className='skip'>
          Үндсэн хэсэг рүү
        </a>
        <header className='site-header'>
          <div className='header-inner'>
            <Brand />
            <Navigation />
            <AuthNav />
            <Link href='/trips/new' className='button header-action'>
              Аялал эхлэх <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </header>
        <Suspense fallback={null}>
          <SaveNotice />
        </Suspense>
        <RevealObserver />
        <main id='main'>{children}</main>
        <footer className='site-footer'>
          <div className='container footer-inner'>
            <Brand />
            <p>Монгол орноо нээж, дурсамжаа цуглуул.</p>
            <Link href='/explore'>Газруудыг судлах →</Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
