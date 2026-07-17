-- ============================================================================
-- ICAR FIELD ACTIVITY TRACKER — DATABASE SCHEMA
-- Run this in Supabase SQL Editor (Project → SQL Editor → New Query)
-- ============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
create extension if not exists "uuid-ossp";
create extension if not exists pg_trgm;   -- fuzzy/partial text search


-- ---------------------------------------------------------------------------
-- TABLE: profiles
-- One row per authenticated user. Auto-created on signup (see trigger below).
-- ---------------------------------------------------------------------------
create table profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  full_name      text,
  designation    text,
  organization   text default 'ICAR, Gobichettipalayam',
  avatar_url     text,
  evening_reminder_enabled boolean default true,
  evening_reminder_time    time default '18:30',
  created_at     timestamptz default now()
);

alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);


-- ---------------------------------------------------------------------------
-- TABLE: categories
-- Predefined categories seeded per user + ability to add custom ones.
-- ---------------------------------------------------------------------------
create table categories (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  icon        text,               -- lucide icon name, e.g. 'sprout', 'users'
  color       text,               -- hex, e.g. '#34C759'
  is_default  boolean default false,
  created_at  timestamptz default now(),
  unique (user_id, name)
);

alter table categories enable row level security;
create policy "categories_all_own" on categories
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- TABLE: activities
-- The core "entry" — one field visit / meeting / inspection / etc.
-- ---------------------------------------------------------------------------
create table activities (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,

  title           text not null,
  description     text,
  category_id     uuid references categories(id) on delete set null,

  location        text,                 -- free-text place name
  latitude        double precision,     -- optional geotag (from camera/GPS)
  longitude       double precision,

  activity_date   date not null default current_date,
  tags            text[] not null default '{}',

  -- Full-text search column. Populated by trigger below (NOT a generated
  -- column) because to_tsvector('english', ...) is STABLE, not IMMUTABLE,
  -- and Postgres requires generated columns to use immutable expressions.
  search_vector   tsvector,

  -- client-set id lets the offline queue de-dupe entries created without
  -- network access (see architecture doc, "offline writes")
  client_id       uuid,

  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index idx_activities_search    on activities using gin (search_vector);
create index idx_activities_date      on activities (activity_date desc);
create index idx_activities_user      on activities (user_id);
create index idx_activities_tags      on activities using gin (tags);
create index idx_activities_category  on activities (category_id);
create index idx_activities_title_trgm on activities using gin (title gin_trgm_ops);
create unique index idx_activities_client_id on activities (user_id, client_id) where client_id is not null;

alter table activities enable row level security;
create policy "activities_all_own" on activities
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_activities_updated_at
before update on activities
for each row execute function set_updated_at();

-- Keeps search_vector in sync on every insert/update. Title weighted
-- highest, then description, then location/tags — this is what powers
-- the search bar.
create or replace function activities_search_vector_update() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.location, '')), 'C') ||
    setweight(to_tsvector('english', array_to_string(new.tags, ' ')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger trg_activities_search_vector
before insert or update on activities
for each row execute function activities_search_vector_update();


-- ---------------------------------------------------------------------------
-- TABLE: activity_images
-- Multiple images per activity. Stores both full-size and thumbnail paths
-- (thumbnail generated client-side before upload for fast gallery loads).
-- ---------------------------------------------------------------------------
create table activity_images (
  id             uuid primary key default uuid_generate_v4(),
  activity_id    uuid not null references activities(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,

  storage_path   text not null,     -- path inside Supabase Storage bucket
  url            text not null,     -- public/signed URL, full-size (compressed)
  thumbnail_url  text,              -- small version for gallery grids

  width          int,
  height         int,
  size_bytes     int,
  order_index    int default 0,     -- for swipe/carousel ordering

  created_at     timestamptz default now()
);

create index idx_images_activity on activity_images (activity_id);
create index idx_images_user     on activity_images (user_id);

alter table activity_images enable row level security;
create policy "images_all_own" on activity_images
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);


-- ---------------------------------------------------------------------------
-- FUNCTION + TRIGGER: auto-create profile & default categories on signup
-- ---------------------------------------------------------------------------
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');

  insert into public.categories (user_id, name, icon, color, is_default) values
    (new.id, 'Farm Visit',          'sprout',        '#34C759', true),
    (new.id, 'Field Inspection',    'search',        '#007AFF', true),
    (new.id, 'Meeting',             'users',         '#5856D6', true),
    (new.id, 'Research Activity',   'flask-conical', '#AF52DE', true),
    (new.id, 'Farmer Interaction',  'handshake',     '#FF9500', true),
    (new.id, 'Demonstration',       'presentation',  '#FF3B30', true),
    (new.id, 'Awareness Program',   'megaphone',     '#00C7BE', true),
    (new.id, 'Training Session',    'graduation-cap','#32ADE6', true),
    (new.id, 'Other',               'circle',        '#8E8E93', true);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();


-- ---------------------------------------------------------------------------
-- VIEW: quick stats (for Home Screen "Quick Statistics")
-- ---------------------------------------------------------------------------
create or replace view activity_stats as
select
  user_id,
  count(*) filter (where activity_date = current_date)                              as today_count,
  count(*) filter (where activity_date >= date_trunc('week', current_date))         as this_week_count,
  count(*) filter (where activity_date >= date_trunc('month', current_date))        as this_month_count,
  count(*) filter (where activity_date >= date_trunc('year', current_date))         as this_year_count,
  count(*)                                                                          as total_count
from activities
group by user_id;

-- Views don't support RLS directly; security_invoker makes it respect the
-- querying user's own RLS policies on the underlying table.
alter view activity_stats set (security_invoker = true);


-- ---------------------------------------------------------------------------
-- STORAGE BUCKET (run once — or create via Supabase Dashboard → Storage)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('activity-images', 'activity-images', true)
on conflict (id) do nothing;

create policy "images_storage_select_own"
  on storage.objects for select
  using (bucket_id = 'activity-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "images_storage_insert_own"
  on storage.objects for insert
  with check (bucket_id = 'activity-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "images_storage_delete_own"
  on storage.objects for delete
  using (bucket_id = 'activity-images' and auth.uid()::text = (storage.foldername(name))[1]);

-- Expected storage path convention: {user_id}/{activity_id}/{image_id}.jpg
-- This is what makes the (storage.foldername(name))[1] = auth.uid() check work.
