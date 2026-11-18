'use client';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang='mn'>
      <body>
        <main>
          <h1>Хуудас ачаалсангүй</h1>
          <button type='button' onClick={reset}>
            Дахин оролдох
          </button>
        </main>
      </body>
    </html>
  );
}
