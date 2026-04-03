-- ============================================================
-- Kobe Night Guide — restaurants テーブル
-- Google Places API連携 + 管理者編集対応
-- ============================================================

create extension if not exists "uuid-ossp";

-- エリアのチェック制約用
create type area_type as enum ('sannomiya', 'motomachi', 'kitano', 'nankinmachi', 'surroundings');
create type business_status_type as enum ('OPERATIONAL', 'CLOSED_TEMPORARILY', 'CLOSED_PERMANENTLY');

create table restaurants (
  -- 識別子
  id                        uuid primary key default uuid_generate_v4(),
  place_id                  text unique,                  -- Google Places ID（重複排除キー）

  -- 基本情報（Google Places から取得）
  name                      text not null,
  area                      area_type not null,
  category                  text[] not null default '{}', -- ['standing-bar', 'izakaya'] 等
  formatted_address         text,
  lat                       decimal(10, 7),
  lng                       decimal(10, 7),
  google_maps_url           text,
  website                   text,
  phone_number              text,
  international_phone_number text,
  rating                    decimal(2, 1),                -- 1.0〜5.0
  user_ratings_total        integer,
  business_status           business_status_type default 'OPERATIONAL',
  price_level               smallint,                     -- 0〜4 (Google定義)
  opening_hours_json        jsonb,                        -- 営業時間（Google形式）

  -- 予算（price_levelから推定 or 手動設定）
  budget_min                integer,                      -- 円/人
  budget_max                integer,
  budget_estimated          boolean default false,        -- trueなら推定値

  -- インバウンド対応フラグ（手動設定）
  english_support           boolean,                      -- 英語メニュー・スタッフ
  reservation_required      boolean,                      -- 予約必須か
  must_try_menu             text,                         -- 絶対頼むべきメニュー

  -- スコアリング（手動設定・初期null）
  foreigner_friendly_score  smallint check (foreigner_friendly_score between 1 and 5),
  solo_friendly_score       smallint check (solo_friendly_score between 1 and 5),
  local_experience_score    smallint check (local_experience_score between 1 and 5),

  -- タグ
  vibe_tags                 text[] default '{}',          -- ['local', 'casual', 'standing'] 等

  -- 管理者メモ（最重要・差別化ポイント）
  internal_notes            text,                         -- AIがペルソナ構築に使用・非公開

  -- 公開制御
  priority_score            smallint default 50 check (priority_score between 0 and 100),
  is_published              boolean default false,         -- falseの間はAPIから除外
  review_needed             boolean default false,         -- 要確認フラグ（重複候補等）

  -- 立ち飲みマップ専用フィールド
  instagram_handle          text,                         -- @なしのInstagramハンドル
  is_new_open               boolean default false,        -- 新規OPENバッジ表示
  open_date                 date,                         -- OPEN日（新規店舗用）
  tachinomi_type            text,                         -- 'tachinomi'|'kakuuchi'|'yakitori'|'seafood'|'wine'|'italian'|'hormones'

  -- メタ情報
  source                    text default 'google_places', -- データソース
  created_at                timestamptz default now(),
  updated_at                timestamptz default now(),
  last_synced_at            timestamptz                   -- 最終Google同期日時
);

-- ============================================================
-- インデックス
-- ============================================================
create index idx_restaurants_area         on restaurants(area);
create index idx_restaurants_published    on restaurants(is_published);
create index idx_restaurants_priority     on restaurants(priority_score desc);
create index idx_restaurants_category     on restaurants using gin(category);
create index idx_restaurants_vibe_tags    on restaurants using gin(vibe_tags);
create index idx_restaurants_place_id     on restaurants(place_id);
create index idx_restaurants_rating       on restaurants(rating desc nulls last);
create index idx_restaurants_review       on restaurants(review_needed) where review_needed = true;
create index idx_restaurants_new_open     on restaurants(is_new_open) where is_new_open = true;
create index idx_restaurants_type         on restaurants(tachinomi_type);

-- ============================================================
-- updated_at 自動更新
-- ============================================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger restaurants_updated_at
  before update on restaurants
  for each row execute function update_updated_at();

-- ============================================================
-- AI推薦用ビュー（チャットAPIから参照）
-- internal_notesを含む完全データを返す
-- ============================================================
create view restaurants_for_ai as
  select
    id,
    name,
    area,
    category,
    budget_min,
    budget_max,
    budget_estimated,
    vibe_tags,
    google_maps_url,
    rating,
    user_ratings_total,
    opening_hours_json,
    english_support,
    reservation_required,
    must_try_menu,
    foreigner_friendly_score,
    solo_friendly_score,
    local_experience_score,
    internal_notes,    -- AIのみ参照
    priority_score
  from restaurants
  where is_published = true
    and business_status = 'OPERATIONAL'
  order by priority_score desc, rating desc nulls last;

-- ============================================================
-- レビュー待ちビュー（管理画面用）
-- ============================================================
create view restaurants_review_queue as
  select
    id, name, area, category, formatted_address,
    rating, source, created_at, review_needed
  from restaurants
  where review_needed = true or is_published = false
  order by created_at desc;

-- ============================================================
-- アナリティクスビュー（将来用）
-- ============================================================
create view restaurant_analytics as
  select
    r.id,
    r.name,
    r.area,
    r.priority_score,
    r.rating,
    r.foreigner_friendly_score,
    r.solo_friendly_score,
    r.local_experience_score,
    r.english_support,
    r.is_published,
    r.review_needed,
    r.last_synced_at
  from restaurants r
  order by r.priority_score desc;
