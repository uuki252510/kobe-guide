-- ============================================================
-- 神戸立ち飲みマップ — Social Layer
-- Follow / Follower / Block / Favorites / Visits / Feed
-- Run this in Supabase SQL Editor AFTER restaurants.sql
-- ============================================================

-- ----------------------------------------------------------------
-- 1. user_profiles  (extends auth.users 1:1)
-- ----------------------------------------------------------------
create table if not exists user_profiles (
  id                 uuid        primary key references auth.users(id) on delete cascade,
  username           text        unique not null,
  display_name       text,
  avatar_url         text,
  bio                text,
  area_preference    text,                        -- よくいるエリア (sannomiya/motomachi/etc)
  favorites_public   boolean     not null default true,
  visits_public      boolean     not null default true,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- username: lowercase alphanumeric + underscore only
alter table user_profiles
  add constraint username_format check (username ~ '^[a-z0-9_]{3,30}$');

-- auto-update updated_at
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_updated_at();

-- ----------------------------------------------------------------
-- 2. follows
-- ----------------------------------------------------------------
create table if not exists follows (
  id           uuid        primary key default gen_random_uuid(),
  follower_id  uuid        not null references auth.users(id) on delete cascade,
  following_id uuid        not null references auth.users(id) on delete cascade,
  created_at   timestamptz not null default now(),

  unique(follower_id, following_id),
  constraint no_self_follow check (follower_id <> following_id)
);

create index if not exists idx_follows_follower   on follows(follower_id);
create index if not exists idx_follows_following  on follows(following_id);
create index if not exists idx_follows_created_at on follows(created_at desc);

-- ----------------------------------------------------------------
-- 3. blocks
-- ----------------------------------------------------------------
create table if not exists blocks (
  id         uuid        primary key default gen_random_uuid(),
  blocker_id uuid        not null references auth.users(id) on delete cascade,
  blocked_id uuid        not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),

  unique(blocker_id, blocked_id),
  constraint no_self_block check (blocker_id <> blocked_id)
);

create index if not exists idx_blocks_blocker on blocks(blocker_id);
create index if not exists idx_blocks_blocked on blocks(blocked_id);

-- When a user blocks another: auto-remove both follow relationships
create or replace function handle_block_cleanup()
returns trigger language plpgsql security definer as $$
begin
  delete from follows
  where (follower_id = new.blocker_id and following_id = new.blocked_id)
     or (follower_id = new.blocked_id and following_id = new.blocker_id);
  return new;
end;
$$;

create trigger trg_block_cleanup
  after insert on blocks
  for each row execute function handle_block_cleanup();

-- ----------------------------------------------------------------
-- 4. user_favorites  (per-user restaurant bookmarks)
-- ----------------------------------------------------------------
create table if not exists user_favorites (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  restaurant_id uuid        not null references restaurants(id) on delete cascade,
  created_at    timestamptz not null default now(),

  unique(user_id, restaurant_id)
);

create index if not exists idx_user_favorites_user       on user_favorites(user_id);
create index if not exists idx_user_favorites_restaurant on user_favorites(restaurant_id);

-- ----------------------------------------------------------------
-- 5. user_visits  (visit history)
-- ----------------------------------------------------------------
create table if not exists user_visits (
  id            uuid        primary key default gen_random_uuid(),
  user_id       uuid        not null references auth.users(id) on delete cascade,
  restaurant_id uuid        not null references restaurants(id) on delete cascade,
  visited_at    timestamptz not null default now(),
  note          text,
  created_at    timestamptz not null default now()
);

create index if not exists idx_user_visits_user       on user_visits(user_id);
create index if not exists idx_user_visits_restaurant on user_visits(restaurant_id);
create index if not exists idx_user_visits_visited_at on user_visits(visited_at desc);

-- ----------------------------------------------------------------
-- 6. feed_activities  (social timeline events)
-- ----------------------------------------------------------------
create table if not exists feed_activities (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users(id) on delete cascade,
  activity_type  text        not null,   -- 'visit' | 'favorite' | 'follow'
  restaurant_id  uuid        references restaurants(id) on delete set null,
  target_user_id uuid        references auth.users(id) on delete set null,
  created_at     timestamptz not null default now(),

  constraint activity_type_values check (
    activity_type in ('visit', 'favorite', 'follow')
  )
);

create index if not exists idx_feed_user        on feed_activities(user_id);
create index if not exists idx_feed_created_at  on feed_activities(created_at desc);
create index if not exists idx_feed_restaurant  on feed_activities(restaurant_id);

-- ----------------------------------------------------------------
-- 7. Views
-- ----------------------------------------------------------------

-- public user info (no sensitive fields)
create or replace view public_user_profiles as
select
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.area_preference,
  p.favorites_public,
  p.visits_public,
  p.created_at,
  (select count(*) from follows f where f.follower_id  = p.id) as following_count,
  (select count(*) from follows f where f.following_id = p.id) as follower_count
from user_profiles p;

-- feed with joined profile + restaurant name
create or replace view feed_activities_view as
select
  fa.id,
  fa.activity_type,
  fa.created_at,
  -- actor
  fa.user_id,
  p.username        as actor_username,
  p.display_name    as actor_display_name,
  p.avatar_url      as actor_avatar_url,
  -- restaurant (nullable)
  fa.restaurant_id,
  r.name            as restaurant_name,
  r.area            as restaurant_area,
  r.tachinomi_type  as restaurant_tachinomi_type,
  -- target user (follow activity)
  fa.target_user_id,
  tp.username       as target_username,
  tp.display_name   as target_display_name,
  tp.avatar_url     as target_avatar_url
from feed_activities fa
join user_profiles p  on p.id  = fa.user_id
left join restaurants  r  on r.id  = fa.restaurant_id
left join user_profiles tp on tp.id = fa.target_user_id;

-- ----------------------------------------------------------------
-- 8. RLS (Row Level Security)
-- ----------------------------------------------------------------
alter table user_profiles    enable row level security;
alter table follows           enable row level security;
alter table blocks            enable row level security;
alter table user_favorites    enable row level security;
alter table user_visits       enable row level security;
alter table feed_activities   enable row level security;

-- user_profiles: anyone can read; only owner can update
create policy "profiles_select_all"   on user_profiles for select using (true);
create policy "profiles_insert_own"   on user_profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own"   on user_profiles for update using (auth.uid() = id);
create policy "profiles_delete_own"   on user_profiles for delete using (auth.uid() = id);

-- follows: anyone can read; only follower can insert/delete
create policy "follows_select_all"    on follows for select using (true);
create policy "follows_insert_own"    on follows for insert with check (auth.uid() = follower_id);
create policy "follows_delete_own"    on follows for delete using (auth.uid() = follower_id);

-- blocks: only owner can read/write
create policy "blocks_select_own"     on blocks for select using (auth.uid() = blocker_id);
create policy "blocks_insert_own"     on blocks for insert with check (auth.uid() = blocker_id);
create policy "blocks_delete_own"     on blocks for delete using (auth.uid() = blocker_id);

-- user_favorites: owner can read/write; others can read if favorites_public=true
create policy "favorites_select_public" on user_favorites for select using (
  auth.uid() = user_id or
  exists (
    select 1 from user_profiles p
    where p.id = user_id and p.favorites_public = true
  )
);
create policy "favorites_insert_own" on user_favorites for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on user_favorites for delete using (auth.uid() = user_id);

-- user_visits: owner can read/write; others can read if visits_public=true
create policy "visits_select_public" on user_visits for select using (
  auth.uid() = user_id or
  exists (
    select 1 from user_profiles p
    where p.id = user_id and p.visits_public = true
  )
);
create policy "visits_insert_own" on user_visits for insert with check (auth.uid() = user_id);
create policy "visits_delete_own" on user_visits for delete using (auth.uid() = user_id);

-- feed_activities: anyone can read; owner can insert/delete
create policy "feed_select_all"  on feed_activities for select using (true);
create policy "feed_insert_own"  on feed_activities for insert with check (auth.uid() = user_id);
create policy "feed_delete_own"  on feed_activities for delete using (auth.uid() = user_id);
