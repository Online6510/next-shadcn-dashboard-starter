import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export function supabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

export async function serverSupabase() {
  if (!supabaseConfigured()) {
    throw new Error('Supabase тохиргоо дутуу байна.');
  }
  const store = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(items) {
          try {
            items.forEach(({ name, value, options }) => store.set(name, value, options));
          } catch {
            // Server Components may read cookies but cannot write them.
            // src/proxy.ts refreshes and persists session cookies on each request.
          }
        }
      }
    }
  );
}
