'use server';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { serverSupabase } from '@/lib/wanderly/supabase';
import { sample } from './seed';

const credentials = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(128)
});

export async function signIn(_: string, data: FormData): Promise<string> {
  const input = credentials.safeParse(Object.fromEntries(data));
  if (!input.success) return 'Имэйл болон 8-аас дээш тэмдэгттэй нууц үгээ шалгана уу.';
  const supabase = await serverSupabase();
  const { data: session, error } = await supabase.auth.signInWithPassword(input.data);
  if (error || !session.user) return 'Нэвтрэх боломжгүй байна. Имэйлээ баталгаажуулж, нууц үгээ шалгаарай.';
  // Each member gets their own safely isolated, editable example journey.
  const { error: seedError } = await supabase.from('wanderly_trips').upsert(
    { owner_id: session.user.id, id: sample.id, document: sample },
    { onConflict: 'owner_id,id', ignoreDuplicates: true }
  );
  if (seedError) console.error('Wanderly sample initialization error:', seedError.code);
  redirect('/trips');
}

export async function signUp(_: string, data: FormData): Promise<string> {
  const input = credentials.safeParse(Object.fromEntries(data));
  if (!input.success) return 'Зөв имэйл, 8-аас дээш тэмдэгттэй нууц үг оруулна уу.';
  const supabase = await serverSupabase();
  const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const { data: response, error } = await supabase.auth.signUp({
    ...input.data,
    options: { emailRedirectTo: origin + '/auth/callback' }
  });
  if (error) return 'Бүртгэл үүсгэхэд алдаа гарлаа. Дараа дахин оролдоно уу.';
  if (response.session) {
    await supabase.from('wanderly_trips').upsert(
      { owner_id: response.user!.id, id: sample.id, document: sample },
      { onConflict: 'owner_id,id', ignoreDuplicates: true }
    );
    redirect('/trips');
  }
  return 'Бүртгэлийн баталгаажуулах холбоосыг имэйлээр илгээлээ. Имэйлээ баталгаажуулаад нэвтэрнэ үү.';
}

export async function signOut() {
  const supabase = await serverSupabase();
  await supabase.auth.signOut();
  redirect('/');
}
