# プロダクト概要

## サービス名
Kobe Night Guide（神戸立ち飲みマップ）

## コンセプト
「神戸の夜を、もっと深く。外国人にも、地元民にも。」

## 主要機能
- **インタラクティブマップ**: Leaflet + 円形ゴールドピン、ボトムシートUI
- **AIチャット推薦**: Claude API（claude-sonnet-4-6）で気分・条件に合う店を提案
- **コース機能**: 複数店舗をまとめて立ち飲みコースを作成
- **店舗詳細ページ**: 写真・営業時間・予算・vibe_tags
- **近隣店舗表示**: 選択店舗から半径内の近隣店を自動表示

## データ構造
- **エリア**: sannomiya / motomachi / kitano / nankinmachi / surroundings
- **タイプ**: tachinomi / kakuuchi / yakitori / seafood / wine / italian / hormones / bar
- **スコア**: foreigner_friendly / solo_friendly / local_experience（各1-5）
- **フラグ**: is_new_open / english_support / reservation_required

## 技術スタック
- Next.js 15 (App Router) / TypeScript
- Supabase (PostgreSQL + Auth)
- Leaflet + react-leaflet v5
- Claude API (Anthropic)
- Vercel（本番）
