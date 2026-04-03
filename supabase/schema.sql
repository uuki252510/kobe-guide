-- ============================================================
-- Kobe Night Guide — Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- SPOTS — Core venue table
-- ============================================================
create table spots (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  area            text not null check (area in ('sannomiya', 'motomachi', 'kitano', 'nankinmachi')),
  category        text[] not null default '{}',
  latitude        decimal(10, 7),
  longitude       decimal(10, 7),
  budget_min      integer,           -- yen per person
  budget_max      integer,
  vibe_tags       text[] default '{}',
  solo_friendly   boolean default true,
  foreigner_friendly boolean default true,
  english_menu    boolean default false,
  cashless        boolean default false,
  opening_hours   jsonb default '{}', -- {"mon": "17:00-24:00", "fri": "17:00-02:00"}
  reservation_url text,
  google_maps_url text not null,
  priority_score  integer default 50 check (priority_score between 0 and 100),
  internal_notes  text,   -- Owner's private notes: busy times, staff tips, etc.
  caution_notes   text,   -- Notes to show users: cash only, no English, etc.
  is_published    boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ============================================================
-- SPOT_TRANSLATIONS — Multilingual content
-- ============================================================
create table spot_translations (
  id          uuid primary key default uuid_generate_v4(),
  spot_id     uuid not null references spots(id) on delete cascade,
  language    text not null check (language in ('en', 'ja', 'zh-TW', 'zh-CN', 'ko')),
  name        text,
  description text not null,
  highlight   text,         -- One-line "why go here"
  caution     text,
  unique (spot_id, language)
);

-- ============================================================
-- SPOT_CATEGORIES — Tag taxonomy
-- ============================================================
create table spot_categories (
  id    uuid primary key default uuid_generate_v4(),
  slug  text unique not null,
  label_en  text not null,
  label_ja  text not null,
  label_zh_tw text,
  label_zh_cn text,
  label_ko    text
);

insert into spot_categories (slug, label_en, label_ja) values
  ('kobe-beef', 'Kobe Beef', '神戸牛'),
  ('standing-bar', 'Standing Bar', '立ち飲み'),
  ('izakaya', 'Izakaya', '居酒屋'),
  ('sake-bar', 'Sake Bar', '日本酒バー'),
  ('late-night', 'Late Night Food', '深夜営業'),
  ('casual', 'Casual Dining', 'カジュアル'),
  ('ramen', 'Ramen', 'ラーメン'),
  ('sushi', 'Sushi', '寿司');

-- ============================================================
-- CONVERSATIONS — Chat session tracking
-- ============================================================
create table conversations (
  id          uuid primary key default uuid_generate_v4(),
  session_id  text not null unique,
  language    text default 'en',
  user_agent  text,
  ip_hash     text,   -- hashed for privacy
  created_at  timestamptz default now(),
  last_active timestamptz default now()
);

-- ============================================================
-- MESSAGES — Individual chat messages
-- ============================================================
create table messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  recommended_spot_ids uuid[] default '{}',
  created_at      timestamptz default now()
);

-- ============================================================
-- CLICKS — Track spot engagement
-- ============================================================
create table clicks (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid references conversations(id),
  spot_id         uuid not null references spots(id),
  click_type      text not null check (click_type in ('maps', 'reservation', 'card_view')),
  created_at      timestamptz default now()
);

-- ============================================================
-- Indexes for performance
-- ============================================================
create index idx_spots_area on spots(area);
create index idx_spots_published on spots(is_published);
create index idx_spots_priority on spots(priority_score desc);
create index idx_spot_translations_spot_id on spot_translations(spot_id);
create index idx_messages_conversation on messages(conversation_id);
create index idx_clicks_spot on clicks(spot_id);
create index idx_clicks_created on clicks(created_at desc);

-- ============================================================
-- Auto-update updated_at
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger spots_updated_at
  before update on spots
  for each row execute function update_updated_at();

-- ============================================================
-- Analytics view — popular spots
-- ============================================================
create view spot_analytics as
  select
    s.id,
    s.name,
    s.area,
    s.category,
    s.priority_score,
    count(distinct m.conversation_id) as recommendation_count,
    count(distinct c.id) filter (where c.click_type = 'maps') as maps_clicks,
    count(distinct c.id) filter (where c.click_type = 'reservation') as reservation_clicks,
    count(distinct c.id) as total_clicks
  from spots s
  left join messages m on s.id = any(m.recommended_spot_ids)
  left join clicks c on s.id = c.spot_id
  where s.is_published = true
  group by s.id, s.name, s.area, s.category, s.priority_score
  order by total_clicks desc;
