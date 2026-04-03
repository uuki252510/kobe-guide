# 🏮 Kobe Night Guide — 店舗データ管理システム

## 全体構成

```
ユーザー質問
    ↓
AIが意図理解（Claude）
    ↓
Supabaseの restaurants テーブルを検索
    ↓
AIが候補を並び替え・説明・提案
```

**なぜ AI直叩きでなく DB中心なのか？**

| 課題 | AI直叩き | DB中心（本システム） |
|---|---|---|
| 存在しない店を紹介する | 頻発（幻覚） | 発生しない |
| 最新の営業時間 | 不明 | Google Places同期で管理 |
| 予算の正確さ | 推測のみ | 実データ + 手動補完 |
| 一人向き・外国人向きの情報 | 不明 | `internal_notes` で管理 |
| APIコスト | 毎回Claude呼び出し | DBキャッシュで最小化 |

---

## ディレクトリ構成

```
kobe-guide/
├── scripts/
│   └── import-places.ts        # Places API取込スクリプト
├── src/
│   ├── types/
│   │   └── restaurant.ts       # 型定義
│   ├── lib/
│   │   ├── googlePlaces.ts     # Places APIクライアント
│   │   ├── restaurantNormalizer.ts  # データ正規化
│   │   └── restaurantUpsert.ts # Supabase upsert + 重複排除
│   └── app/api/restaurants/
│       ├── route.ts            # GET 一覧・検索
│       └── [id]/route.ts       # GET 詳細
├── supabase/
│   └── restaurants.sql         # テーブルスキーマ
└── .env.local.example
```

---

## 初回セットアップ

### 1. 環境変数設定

```bash
cp .env.local.example .env.local
# .env.local を編集して以下を設定:
# - GOOGLE_MAPS_API_KEY
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 2. Google Cloud Console の設定

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクト作成 or 選択
3. **「Places API (New)」** を有効化（旧Places APIではなく新しい方）
4. APIキーを作成 → `.env.local` の `GOOGLE_MAPS_API_KEY` に設定
5. APIキーの制限: `Places API (New)` のみ許可を推奨

### 3. Supabase テーブル作成

```bash
# Supabase ダッシュボード → SQL Editor で実行
# supabase/restaurants.sql の内容をコピーして実行
```

または Supabase CLI を使う場合:

```bash
supabase db push
```

### 4. 依存パッケージ追加

```bash
npm install dotenv
npm install -D tsx
```

---

## データ取込スクリプト

### コスト確認（まずここから）

```bash
npx tsx scripts/import-places.ts --cost-check
```

出力例:
```
💰 コスト試算
推定コスト: $0.0003 (16クエリ × 最大20件)
```

### ドライラン（DB書き込みなし）

```bash
npx tsx scripts/import-places.ts --dry-run
```

動作確認後、本番実行:

```bash
npx tsx scripts/import-places.ts
```

### エリア絞り込み

```bash
npx tsx scripts/import-places.ts --area=sannomiya
npx tsx scripts/import-places.ts --area=motomachi
```

### 実行ログの見方

```
📍 三宮 立ち飲み
   取得件数: 18
   ✅ 新規: 立ち飲みバー山田
   🔄 更新: 三宮横丁 たつみ
   ✅ 新規: 角打ち 北村 ⚠️ 要確認
   ...

📊 インポート結果
  処理件数     : 54
  新規挿入     : 41
  更新         : 8
  スキップ     : 2
  要確認       : 3     ← 管理画面で確認
  エラー       : 0
```

---

## 重複排除ロジック

| 優先度 | 判定方法 | 動作 |
|---|---|---|
| 1 | `place_id` 完全一致 | 上書き更新（手動フィールドは保護） |
| 2 | 同住所ブロック内の名前近似 | `review_needed = true` で登録 |
| 3 | それ以外 | 新規挿入 |

**手動フィールドの保護：**
`internal_notes` が入力済みの店舗は、再同期時に `budget_min/max` を上書きしません。
管理者が手動で設定した情報が失われません。

---

## 取込後の作業（重要）

Google Places APIだけでは不足する情報を管理画面で補完してください。

### 優先度HIGH（外国人対応に直結）

| フィールド | 内容 | 例 |
|---|---|---|
| `english_support` | 英語メニュー・スタッフ有無 | true/false |
| `internal_notes` | AIが推薦時に使うプライベートメモ | 「一人客歓迎、マスターが英語少し話せる、金曜激混み」|
| `must_try_menu` | 絶対頼むべきメニュー | 「神戸牛ランチ1,980円」|

### 優先度MEDIUM

| フィールド | 内容 |
|---|---|
| `foreigner_friendly_score` | 外国人が入りやすいか 1-5 |
| `solo_friendly_score` | 一人飲みしやすいか 1-5 |
| `local_experience_score` | ローカル感の高さ 1-5 |
| `vibe_tags` | ['local', 'standing', 'late-night'] 等 |

### 公開フロー

```
取込直後: is_published = false（非公開）
    ↓
管理画面でレビュー
    ↓
internal_notes 等を入力
    ↓
is_published = true（公開・AI推薦対象）
```

---

## API仕様

### 一覧・検索

```
GET /api/restaurants
```

| パラメータ | 型 | 説明 |
|---|---|---|
| `area` | string | sannomiya / motomachi / kitano / nankinmachi |
| `category` | string | standing-bar / izakaya / kobe-beef / bar |
| `budget_min` | number | 最小予算（円） |
| `budget_max` | number | 最大予算（円） |
| `english_support` | boolean | 英語対応のみ |
| `keyword` | string | 店名・メモの部分一致 |
| `vibe_tags` | string | カンマ区切り例: `local,standing` |
| `page` | number | ページ番号（デフォルト1） |
| `limit` | number | 件数（デフォルト20、最大50） |

```bash
# 例: 三宮の立ち飲み・予算3,000円以下
curl "/api/restaurants?area=sannomiya&category=standing-bar&budget_max=3000"

# 英語対応の店のみ
curl "/api/restaurants?english_support=true"
```

### 詳細

```
GET /api/restaurants/[id]
```

---

## Google Places APIコスト最適化

| 方針 | 実装 |
|---|---|
| 毎リクエスト時にAPI叩かない | バッチ取込 → DB保存 → アプリはDBのみ参照 |
| フィールドを最小化 | `X-Goog-FieldMask` で必要フィールドのみ指定 |
| 写真はMVPで取得しない | コスト削減（写真は$7/1000） |
| 定期同期は週1回 | 営業時間・評価の更新に十分 |

**推定コスト:**
- 初回取込: 16クエリ × $0.017/1000 = **約$0.0003**（ほぼ無料）
- 週次同期: 同上

---

## 今後の拡張

### 短期（〜1ヶ月）
- [ ] 管理画面から `internal_notes` 編集
- [ ] `review_needed` レビュー画面
- [ ] `is_published` 一括切り替え

### 中期（〜3ヶ月）
- [ ] AIチャットが `restaurants` テーブルを参照するよう統合
- [ ] 週次の自動同期 Cron ジョブ（Vercel Cron）
- [ ] 営業時間フィルタ（現在営業中のみ）

### 長期
- [ ] 多言語 `internal_notes`（JA/EN/ZH/KO）
- [ ] ユーザーお気に入り
- [ ] Google Places 以外のソース（食べログ公式API等）統合
- [ ] 「一人飲み向き」「デート向き」独自スコアの自動推定

---

## 注意事項

- **Google Placesデータだけでは不足** — `internal_notes` による人間の知識追加が差別化の核心
- `SUPABASE_SERVICE_ROLE_KEY` は絶対にクライアントサイドに露出させない
- `is_published = false` の間はAPIレスポンスに含まれない（安心して取込可能）
- Google Places の利用規約: 取得データをキャッシュできる期間は30日（利用規約4.2.1）
  → 週次同期で対応
