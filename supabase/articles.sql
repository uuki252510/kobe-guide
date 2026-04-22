-- ============================================================
-- 神戸立ち飲みマップ — articles テーブル（ブログ/記事CMS）
-- ============================================================

create table articles (
  id          uuid primary key default uuid_generate_v4(),
  slug        text unique not null,          -- URL用 例: kobe-tachinomi-guide
  title       text not null,
  description text,                          -- 記事の概要（SEO用）
  content     text not null default '',      -- 本文（Markdown or HTML）
  cover_image text,                          -- カバー画像URL
  tags        text[] not null default '{}',  -- タグ例: ['観光','三宮','初心者向け']
  published   boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- updated_at 自動更新
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();

-- 公開記事のみ取得するインデックス
create index articles_published_idx on articles (published, created_at desc);

-- RLS: 公開記事は誰でも読める、書き込みはservice roleのみ
alter table articles enable row level security;

create policy "public read published articles"
  on articles for select
  using (published = true);
