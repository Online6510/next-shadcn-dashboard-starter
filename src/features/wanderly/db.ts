import 'server-only';
import type { Trip } from './model';
import { serverSupabase, supabaseConfigured } from '@/lib/wanderly/supabase';
import { optionalUser, requireUser } from '@/lib/wanderly/auth';

type TripRow = { id: string; document: Trip; revision: number };

// Every query uses the signed-in user's JWT; Postgres RLS is the final access boundary.
export async function getTrip(id: string): Promise<Trip | undefined> {
  if (!supabaseConfigured()) return undefined;
  const user = await optionalUser();
  if (!user) return undefined;
  const supabase = await serverSupabase();
  const { data, error } = await supabase.from('wanderly_trips')
    .select('document').eq('owner_id',user.id).eq('id',id).maybeSingle();
  if (error) throw new Error('Аяллын мэдээллийг уншиж чадсангүй.');
  return (data?.document as Trip | undefined) ?? undefined;
}

export async function getTrips(): Promise<Trip[]> {
  if (!supabaseConfigured()) return [];
  const user = await optionalUser();
  if (!user) return [];
  const supabase = await serverSupabase();
  const { data, error } = await supabase.from('wanderly_trips')
    .select('document').eq('owner_id',user.id).order('updated_at',{ascending:false});
  if (error) throw new Error('Аяллын жагсаалтыг уншиж чадсангүй.');
  return (data || []).map((row) => row.document as Trip);
}

export async function createTrip(trip: Trip) {
  const user = await requireUser();
  const supabase = await serverSupabase();
  const { error } = await supabase.from('wanderly_trips').insert({
    owner_id:user.id, id:trip.id, document:trip
  });
  if (error) throw new Error('Аялал хадгалагдсангүй. Дахин оролдоно уу.');
}

export async function deleteTrip(id: string) {
  const user = await requireUser();
  const supabase = await serverSupabase();
  const { data, error } = await supabase.from('wanderly_trips')
    .delete().eq('id',id).eq('owner_id',user.id).select('document').maybeSingle();
  if (error) throw new Error('Аяллыг устгаж чадсангүй.');
  const trip = data?.document as Trip | undefined;
  return trip ? trip.entries.flatMap((entry) => entry.photos || []) : [];
}

export async function updateTrip(id: string, change: (trip: Trip) => void) {
  const user = await requireUser();
  const supabase = await serverSupabase();
  const { data, error } = await supabase.from('wanderly_trips')
    .select('id,document,revision').eq('id',id).eq('owner_id',user.id).single();
  if (error || !data) throw new Error('Аялал олдсонгүй.');
  const row = data as TripRow;
  const trip = row.document;
  change(trip);
  // Compare-and-swap prevents silently overwriting another tab's changes.
  const { data: updated, error: updateError } = await supabase.from('wanderly_trips')
    .update({ document:trip, revision:row.revision+1, updated_at:new Date().toISOString() })
    .eq('id',id).eq('owner_id',user.id).eq('revision',row.revision)
    .select('id').maybeSingle();
  if (updateError) throw new Error('Өөрчлөлтийг хадгалж чадсангүй.');
  if (!updated) throw new Error('Аялал өөр таб дээр шинэчлэгдсэн байна. Хуудсаа сэргээгээд дахин оролдоно уу.');
}
