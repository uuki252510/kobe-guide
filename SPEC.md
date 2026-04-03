# 神戸立ち飲みマップ — 仕様書

> バージョン: v0.3.0 | 更新日: 2026-03-23

---

## 1. アプリ概要

神戸（三宮・元町エリア）の立ち飲み・角打ちを AI が案内する PWA（Progressive Web App）。
日本語を主言語とし、英語・中国語・韓国語にも対応。

| 項目 | 内容 |
|------|------|
| ターゲット | 神戸で飲みたい人（地元・観光客）|
| 主要機能 | AI チャット案内 / 地図表示 / 店舗一覧 / コースビルダー |
| 掲載店舗数 | 90 店（三宮・元町・周辺）|
| 言語対応 | 日本語・英語・繁体字中国語・簡体字中国語・韓国語 |
| 広告・スポンサー | なし（中立案内）|

---

## 2. 技術スタック

### フロントエンド
| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15 (App Router) | フレームワーク |
| TypeScript | 5.x | 型安全 |
| Tailwind CSS | 3.x | スタイリング |
| react-leaflet | 4.x | 地図表示（OpenStreetMap / 無料）|
| lucide-react | 0.469+ | アイコン |

### バックエンド / インフラ
| 技術 | 用途 |
|------|------|
| Supabase (PostgreSQL) | DB・認証 |
| Anthropic Claude API | AI チャット |
| Google Places API (New) | 店舗データ補完（1回だけ実行）|
| Vercel | ホスティング（想定）|

---

## 3. 機能一覧

### 3.1 AI チャット (`/`)
- Claude によるシステムプロンプト + RAG（DB から候補店取得）
- 多言語自動判定（ユーザーの言語に合わせてレスポンス）
- Quick Start ボタン（8種類のプリセット質問）
- SpotCard による店舗カード表示（Maps リンク付き）
- 会話履歴の保持（同一セッション内）

### 3.2 地図 (`/map`)
- react-leaflet + OpenStreetMap（API コスト¥0）
- 全 90 店を絵文字ピンで表示
- カテゴリ別ピンカラー（コース追加済み = 赤、新規 = 緑、通常 = ネイビー）
- エリアフィルター（すべて / 三宮 / 元町 / 周辺）
- ポップアップ: 店名・エリア・ジャンル・予算・コース追加ボタン・Maps リンク
- コースパネル（選択店舗リスト + Google マップ経路案内 URL）

### 3.3 店舗一覧 (`/stores`)
- 全 90 店をエリア別グループ表示
- フィルター: エリア / ジャンル / 予算上限 / 新規 OPEN / 一人 OK
- 各店にコース追加ボタン・Maps リンク
- フィルター時はフラットリスト表示

### 3.4 コースビルダー（全画面共通）
- localStorage に保存（`kobe-tachinomi-course` キー）
- ヘッダーに選択店舗数バッジ
- Google マップ多地点経路 URL を自動生成
  - `https://www.google.com/maps/dir/?api=1&waypoints=...`
- ページをまたいで状態が保持される

---

## 4. データベース設計

### `restaurants` テーブル（メイン）

| カラム | 型 | 説明 |
|--------|----|------|
| `id` | uuid PK | 主キー |
| `place_id` | text UNIQUE | Google Places ID |
| `name` | text NOT NULL | 店名 |
| `area` | enum | sannomiya / motomachi / kitano / nankinmachi / surroundings |
| `tachinomi_type` | text | tachinomi / kakuuchi / yakitori / seafood / wine / italian / hormones / bar |
| `lat` / `lng` | decimal(10,7) | 座標 |
| `google_maps_url` | text | Google マップ URL（補完済み）|
| `rating` | decimal(2,1) | Google 評価（1.0〜5.0）|
| `user_ratings_total` | integer | 評価件数 |
| `opening_hours_json` | jsonb | 営業時間（Google 形式）|
| `phone_number` | text | 国内電話番号 |
| `formatted_address` | text | 住所 |
| `budget_min` / `budget_max` | integer | 予算（円/人）|
| `vibe_tags` | text[] | タグ（solo-friendly, kakuuchi, cheap...）|
| `is_new_open` | boolean | 新規 OPEN バッジ |
| `open_date` | date | OPEN 日 |
| `instagram_handle` | text | Instagram ハンドル |
| `is_published` | boolean | 公開フラグ（false は API 非表示）|
| `priority_score` | smallint | 表示優先度（0〜100）|
| `internal_notes` | text | AI 専用のプロフィールメモ（非公開）|
| `last_synced_at` | timestamptz | 最終 Google 同期日時 |

### 主要ビュー
- `restaurants_for_ai` — AI チャット用（is_published=true のみ、internal_notes 含む）
- `restaurants_review_queue` — 管理画面用（未公開・要確認）

---

## 5. API 仕様

### `GET /api/restaurants`

店舗一覧を返す。

**クエリパラメータ:**
| パラメータ | 型 | 説明 |
|-----------|-----|------|
| `area` | string | エリア絞り込み |
| `category` | string | tachinomi_type 絞り込み |
| `budget_max` | number | 予算上限 |
| `vibe_tags` | string | タグ絞り込み |
| `limit` | number | 上限（max 200）|

**レスポンス:**
```json
{
  "restaurants": [Restaurant],
  "pagination": { "total": 90, "limit": 200 }
}
```

### `GET /api/restaurants/[id]`

単一店舗の詳細を返す。

### `POST /api/chat`

AI チャットにメッセージを送信。

**リクエスト:**
```json
{
  "message": "三宮で一人で飲みたい",
  "conversationId": "optional-uuid",
  "history": [{ "role": "user", "content": "..." }],
  "language": "ja"
}
```

**レスポンス:**
```json
{
  "reply": "AI からの返答テキスト",
  "spots": [Spot],
  "conversationId": "uuid",
  "language": "ja"
}
```

---

## 6. コンポーネント構成

```
src/
├── app/
│   ├── page.tsx              # チャットホーム (/)
│   ├── map/page.tsx          # 地図ページ (/map) - SSR無効ラッパー
│   └── stores/page.tsx       # 店舗一覧 (/stores)
├── components/
│   ├── ChatInterface.tsx     # チャット UI（メッセージ・入力）
│   ├── MapView.tsx           # Leaflet 地図 + コースパネル
│   ├── SpotCard.tsx          # AI レスポンス内の店舗カード
│   └── QuickStartButtons.tsx # クイックスタートボタン（多言語）
├── hooks/
│   └── useCourse.ts          # コースビルダー状態管理（localStorage）
└── lib/
    ├── supabase.ts            # Supabase クライアント
    ├── prompts.ts             # Claude システムプロンプト
    ├── googlePlaces.ts        # Places API 呼び出し
    ├── restaurantNormalizer.ts # Places API → DB 変換
    └── restaurantUpsert.ts    # DB アップサート処理
```

---

## 7. 外部サービス・コスト

| サービス | 用途 | コスト |
|---------|------|--------|
| Supabase Free | DB | ¥0 |
| OpenStreetMap | 地図タイル | ¥0 |
| Anthropic Claude API | チャット | 使用量課金（約 $0.003/会話）|
| Google Places API | 店舗補完（1回限り）| $0.0015（実施済み）|

> **コスト設計方針:** Google Places API は `scripts/enrich-stores.ts` で1回だけ実行してDBに保存。以後の API コールは不要。

---

## 8. 環境変数

| 変数名 | 説明 |
|-------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase サービスロールキー（スクリプト用）|
| `ANTHROPIC_API_KEY` | Claude API キー |
| `GOOGLE_MAPS_API_KEY` | Google Places API キー（スクリプト専用）|
| `ADMIN_PASSWORD` | 管理画面パスワード |

---

## 9. 運用コマンド

```bash
# 開発サーバー起動
npm run dev

# 店舗データリセット（90店を正しい名前で再挿入）
npx tsx scripts/reset-stores.ts

# Google Places データ補完（未補完の店のみ）
npm run enrich

# Google Places データ補完（全店強制再取得）
npm run enrich:all

# ドライラン（DB に書かない）
npm run enrich:dry
```

---

## 10. 今後の展開（バックログ）

| 優先度 | 機能 |
|--------|------|
| 高 | 営業時間の表示（今日の営業時間を opening_hours_json から抽出）|
| 高 | 店舗の評価（★）をカードに表示 |
| 中 | Instagram 連携（最新投稿プレビュー）|
| 中 | 管理画面からの店舗編集・追加 |
| 低 | プッシュ通知（新規 OPEN アラート）|
| 低 | シェア機能（コースを LINE/X でシェア）|
| 低 | ダークモード切り替え |
