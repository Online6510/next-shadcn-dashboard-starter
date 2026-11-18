import 'server-only';
import { redirect } from 'next/navigation';
import { serverSupabase, supabaseConfigured } from './supabase';

export async function optionalUser() {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await serverSupabase();
    const { data: { user }, error } = await supabase.auth.getUser();
    return error ? null : user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await optionalUser();
  if (!user) redirect('/login');
  return user;
}
