---

# プロジェクトメモ(グローバルmemoryから移設 2026-07-02: project_kobe_guide.md)

User is building "神戸立ち飲みマップ" (Kobe Tachinomi Map) — a standing bar discovery app for Kobe (Sannomiya/Motomachi area).

**Why:** Solo project targeting local residents + inbound tourists. Revenue via store listing fees + ads.

**Project location:** C:\Users\yuy04\kobe-guide\

**本番 URL:** https://kobe-guide.vercel.app（デプロイ済み・稼働中）

**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Supabase, Codex API (Codex-sonnet-4-6), Leaflet (地図)

**Status as of 2026-04-14:** 本番デプロイ済み・セキュリティ強化済み。全環境変数設定済み。

**Key assets:**
- `supabase/restaurants.sql` — schema with area_type enum (sannomiya/motomachi/surroundings)
- `supabase/tachinomi_seed.sql` — 90 stores INSERT ready
- `src/app/page.tsx` — AI chat page
- `src/app/stores/page.tsx` — store list with filters
- `src/app/map/page.tsx` — Leaflet map view
- `src/app/api/chat/route.ts` — Codex API integration (rate limited)
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


---

# プロジェクトメモ(グローバルmemoryから移設 2026-07-02: feedback_kobe_guide_design.md)

kobe-guide のトップページ（src/app/page.tsx）は、雑誌/ジン的なマストヘッド＋大きな縦積み明朝タイトル＋目次の構成にしない。チャットをヒーローから降ろして FAB にする案は NG。

**Why:** 2026-04-14 のセッションで frontend-design / web-design-guidelines スキルを参照して編集誌調に作り直したところ、ユーザーから「どう使っていいかわからない」「skill入れる前のほうがまし」と明確に却下された。チャットがこのサービスの主要動線で、最初の画面でそれが見えないと機能性が失われる。Shippori Mincho の大見出しを clamp で出すとCJK字形が重なって可読性も悪かった。

**How to apply:** トップの「AIぽさ」を解消したい要望が来たら、構造（チャット first）は維持したまま、ヘッダー内のタイポ・配色・罫線のディテールだけで差別化する。`backdrop-blur` の半透明ヘッダーや goldSoft ピル（#FFF8EC / #C9A44C）が AI ぽさの原因なら、そこをピンポイントで差し替える提案から始める。大改造の提案は出さない。
