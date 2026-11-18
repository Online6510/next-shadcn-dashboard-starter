import { NextRequest, NextResponse } from 'next/server';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { sample } from '@/features/wanderly/seed';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const origin = request.nextUrl.origin;
  if (!code) return NextResponse.redirect(new URL('/login?error=callback', origin));
  const supabase = await serverSupabase();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user)
    return NextResponse.redirect(new URL('/login?error=callback', origin));
  await supabase.from('wanderly_trips').upsert(
    { owner_id: data.user.id, id: sample.id, document: sample },
    { onConflict: 'owner_id,id', ignoreDuplicates: true }
  );
  return NextResponse.redirect(new URL('/trips', origin));
}
