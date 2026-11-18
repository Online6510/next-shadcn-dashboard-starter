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


-- Wanderly V4: owner-scoped lookup/routing usage, applied already to Wanderly Supabase.
-- For a new project run alongside base schema (do not replay duplicate policies).
create table public.wanderly_geo_usage (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null references auth.users(id) on delete cascade,
 requested_at timestamptz not null default now()
);
create index wanderly_geo_usage_recent on public.wanderly_geo_usage(owner_id,requested_at desc);
alter table public.wanderly_geo_usage enable row level security;
revoke all on public.wanderly_geo_usage from anon;
grant select,insert on public.wanderly_geo_usage to authenticated;
create policy wanderly_geo_read_own on public.wanderly_geo_usage
 for select to authenticated using(owner_id=(select auth.uid()));
create policy wanderly_geo_insert_own on public.wanderly_geo_usage
 for insert to authenticated with check(owner_id=(select auth.uid()));

-- V4: Atomic per-user AI quota function. This is applied to the linked Supabase project.
-- Authenticated-only SECURITY INVOKER RPC prevents racing parallel requests.
create or replace function public.wanderly_reserve_ai_request()
returns boolean language plpgsql security invoker set search_path = '' as $$
declare actor uuid := (select auth.uid()); used_count integer;
begin
 if actor is null then return false; end if;
 perform pg_catalog.pg_advisory_xact_lock(713781,pg_catalog.hashtext(actor::text));
 select count(*) into used_count from public.wanderly_ai_usage
  where owner_id=actor and requested_at>=pg_catalog.now()-interval '24 hours';
 if used_count>=5 then return false; end if;
 insert into public.wanderly_ai_usage(owner_id) values(actor);
 return true;
end;$$;
revoke all on function public.wanderly_reserve_ai_request() from public,anon;
grant execute on function public.wanderly_reserve_ai_request() to authenticated;

-- Private, account-synced bookmarked destinations.
create table public.wanderly_favorites(
 owner_id uuid not null references auth.users(id) on delete cascade,
 destination_id text not null check(char_length(destination_id) between 1 and 128),
 created_at timestamptz not null default now(),
 primary key(owner_id,destination_id)
);
create index wanderly_favorites_recent on public.wanderly_favorites(owner_id,created_at desc);
alter table public.wanderly_favorites enable row level security;
revoke all on public.wanderly_favorites from anon;
grant select,insert,delete on public.wanderly_favorites to authenticated;
create policy wanderly_favorites_select on public.wanderly_favorites for select to authenticated using(owner_id=(select auth.uid()));
create policy wanderly_favorites_insert on public.wanderly_favorites for insert to authenticated with check(owner_id=(select auth.uid()));
create policy wanderly_favorites_delete on public.wanderly_favorites for delete to authenticated using(owner_id=(select auth.uid()));
