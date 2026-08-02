---

# プロジェクトメモ(グローバルmemoryから移設 2026-07-02: project_kobe_guide.md)

User is building "神戸立ち飲みマップ" (Kobe Tachinomi Map) — a standing bar discovery app for Kobe (Sannomiya/Motomachi area).

**Why:** Solo project targeting local residents + inbound tourists. Revenue via store listing fees + ads.

**Project location:** C:\Users\yuy04\dev\archive\kobe-guide\

**本番 URL:** https://kobe-tachinomi.taip-ai.com（カスタムドメイン。kobe-guide.vercel.app は旧URL）
**デプロイ:** GitHub (uuki252510/kobe-guide) の master へ push すると Vercel が自動で本番デプロイ

**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS, Supabase, Claude API, Leaflet (地図)

**Status as of 2026-04-14:** 本番デプロイ済み・セキュリティ強化済み。全環境変数設定済み。

**Key assets:**
- `supabase/restaurants.sql` — schema with area_type enum (sannomiya/motomachi/surroundings)
- `supabase/tachinomi_seed.sql` — 90 stores INSERT ready
- `src/app/page.tsx` — AI chat page
- `src/app/stores/page.tsx` — store list with filters
- `src/app/map/page.tsx` — Leaflet map view
- `src/app/api/chat/route.ts` — Claude API integration (rate limited)
- `src/app/api/restaurants/route.ts` — public store API (internal_notes excluded)
- `src/app/admin/page.tsx` — admin panel (password auth)
- `SPEC.html` — 仕様書（PDF出力可能）

**Security (implemented 2026-04-14):**
- `src/lib/supabase.ts` — anon key only (client-safe)
- `src/lib/supabase-server.ts` — SERVICE_ROLE_KEY only (server-only)
- `src/lib/rate-limit.ts` — IP-based rate limiter (10 req/min)
- `src/lib/admin-auth.ts` — Bearer token auth for admin routes
- `internal_notes` excluded from all public API responses
- `/api/admin/*` requires `Authorization: Bearer <ADMIN_PASSWORD>`
- Google Maps API proxied via `/api/photo` (key never sent to browser)

**Environment variables (all configured):**
- NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (browser-safe)
- SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, GOOGLE_MAPS_API_KEY, ADMIN_PASSWORD (server-only)
- CRON_SECRET は**未設定**。`/api/cron/sync-status` は12時間ガードで守られているので未設定でも実害は無いが、設定すると Vercel 以外からの呼び出しを401で弾ける

## データ品質(2026-08-02 に棚卸し)

元リスト `tachinomi-complete.md` は Google で裏を取らずに作られた行を含んでいた。地図URLが `maps/search/?api=1&query=...&query_place=<lat,lng>` 形式(`query_place` は Google に存在しないパラメータ)なら、その行は生成物を疑う。

- 掲載85軒 → **71軒**。誤紐付け5軒・実在未確認7軒・実在店の重複1軒を非公開にし、閉店1軒を除外
- 非公開にした行は消していない。`is_published=false` + `review_needed=true` + `internal_notes` に理由と日付。現地確認が取れたら戻せる
- **`review_needed` が立っている14軒を管理画面から絞り込めない**(未対応)。DBを直接見るしかない
- `scripts/enrich-stores.ts` は Places の displayName を名前照合するようになった。表記ゆれは許容し別店は弾いて `review_needed` を立てる
- `scripts/sync-status.ts` / `/api/cron/sync-status`(毎日04:00 JST)が営業状態を更新する。以前は3月に書いたきり4か月放置され、閉店した店がトップに出ていた

## 競合分析(2026-08-01)から未着手の施策

食べログ / Retty / ホットペッパー / 一休 / TableCheck / Beli / Resy / The Infatuation を調べて出した案のうち、まだ実装していないもの。実装済みは営業状況バッジ・今行ける店/23時以降フィルタ・訪問記録・制覇率・マイランキング(Beli式二分挿入)・コース共有。

- **vibe_tags のチップ化**(小) — 既存タグが reason 文に埋もれている。検索条件に昇格させると複合検索ができる
- **徒歩◯分バッジ**(小) — 距離データはあるがテキストのみ。「徒歩5分以内」バッジで即時性が出る
- **NEWバッジの減衰**(小) — `open_date` からの経過で3ヶ月/半年と段階を付ける。今は付きっぱなし
- **マイランキング上位を地図に反映**(小) — 自分の1位に王冠など
- **エリア×タイプのキュレーテッドリスト**(中) — 「常連が多い」「ワイン推し」等の編集視点
- **訪問記録から人気ランキング生成**(中) — 口コミより低摩擦
- **コースOGPの動的生成**(中) — 現状はヒーロー写真の使い回し。`ImageResponse` は和文フォントを別途読ませないと豆腐になる

**真似しない**と決めたもの: 予約機能 / 口コミ投稿 / ユーザー間フォロー / リアルタイム混雑度 / 決済。いずれも71軒の規模では投稿も更新も集まらず、機能として死ぬ。

---

# プロジェクトメモ(グローバルmemoryから移設 2026-07-02: feedback_kobe_guide_design.md)

kobe-guide のトップページ（src/app/page.tsx）は、雑誌/ジン的なマストヘッド＋大きな縦積み明朝タイトル＋目次の構成にしない。チャットをヒーローから降ろして FAB にする案は NG。

**Why:** 2026-04-14 のセッションで frontend-design / web-design-guidelines スキルを参照して編集誌調に作り直したところ、ユーザーから「どう使っていいかわからない」「skill入れる前のほうがまし」と明確に却下された。チャットがこのサービスの主要動線で、最初の画面でそれが見えないと機能性が失われる。Shippori Mincho の大見出しを clamp で出すとCJK字形が重なって可読性も悪かった。

**How to apply:** トップの「AIぽさ」を解消したい要望が来たら、構造（チャット first）は維持したまま、ヘッダー内のタイポ・配色・罫線のディテールだけで差別化する。`backdrop-blur` の半透明ヘッダーや goldSoft ピル（#FFF8EC / #C9A44C）が AI ぽさの原因なら、そこをピンポイントで差し替える提案から始める。大改造の提案は出さない。

## 既知の罠(2026-07-31)
- `next dev`(Turbopack)起動後の初回コンパイルで `node .next/dev/build/postcss.js <id>` が無限増殖しメモリを食い尽くすことがある(実測: 秒70本ペース、48GB枯渇×3回)。原因は壊れた `.next` キャッシュ。**対処: `.next` を削除して起動し直す**。devサーバーが重い/PCが固まる報告が出たら真っ先にこれを疑う
