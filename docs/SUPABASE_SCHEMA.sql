-- Reproducible schema reference. Already applied to Wanderly Supabase project.
-- Apply only to a clean project; existing named policies must not be duplicated.
create table public.wanderly_trips (
 owner_id uuid not null references auth.users(id) on delete cascade,
 id text not null check (char_length(id) between 1 and 128),
 document jsonb not null check (jsonb_typeof(document) = 'object'),
 revision bigint not null default 0 check (revision >= 0),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 primary key (owner_id,id)
);
create index wanderly_trips_recent_idx on public.wanderly_trips(owner_id,updated_at desc);
alter table public.wanderly_trips enable row level security;
revoke all on public.wanderly_trips from anon;
grant select,insert,update,delete on public.wanderly_trips to authenticated;
create policy wanderly_trips_read_own on public.wanderly_trips for select to authenticated
 using (owner_id=(select auth.uid()));
create policy wanderly_trips_insert_own on public.wanderly_trips for insert to authenticated
 with check (owner_id=(select auth.uid()));
create policy wanderly_trips_update_own on public.wanderly_trips for update to authenticated
 using (owner_id=(select auth.uid())) with check (owner_id=(select auth.uid()));
create policy wanderly_trips_delete_own on public.wanderly_trips for delete to authenticated
 using (owner_id=(select auth.uid()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('wanderly-journal','wanderly-journal',false,5242880,array['image/webp']);
create policy wanderly_storage_read_own on storage.objects for select to authenticated
 using (bucket_id='wanderly-journal' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy wanderly_storage_insert_own on storage.objects for insert to authenticated
 with check (bucket_id='wanderly-journal' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy wanderly_storage_delete_own on storage.objects for delete to authenticated
 using (bucket_id='wanderly-journal' and (storage.foldername(name))[1]=(select auth.uid())::text);

create table public.wanderly_ai_usage (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 requested_at timestamptz not null default now()
);
create index wanderly_ai_usage_recent on public.wanderly_ai_usage(owner_id,requested_at desc);
alter table public.wanderly_ai_usage enable row level security;
revoke all on public.wanderly_ai_usage from anon;
grant select,insert on public.wanderly_ai_usage to authenticated;
create policy wanderly_ai_select_own on public.wanderly_ai_usage for select to authenticated
 using (owner_id=(select auth.uid()));
create policy wanderly_ai_insert_own on public.wanderly_ai_usage for insert to authenticated
 with check (owner_id=(select auth.uid()));
