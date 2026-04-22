'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, CheckCircle2, MessageSquare, Map, ChevronRight, BookOpen } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  created_at: string;
}

// ── デザイントークン ──────────────────────────────────────
const C = {
  bg:       '#FDF7EF',
  surface:  '#FFFFFF',
  border:   '#EDE5D8',
  ink:      '#2C1A0E',
  inkSub:   '#6B5744',
  inkMute:  '#9E8978',
  gold:     '#C9893A',
  goldSoft: '#FFF4E3',
  goldBorder:'#F0D4A8',
  amber:    '#E8A020',
  red:      '#C0392B',
  redSoft:  '#FFF0EE',
  green:    '#2E7D5B',
  greenSoft:'#E8F5EF',
};

// ── サマリーカード（記事のポイント3つ） ──────────────────
function SummaryCard({ description }: { description: string }) {
  // descriptionを句点で分割して最大3ポイント抽出
  const raw = description.replace(/。/g, '。|').split('|').map(s => s.trim()).filter(Boolean);
  const points = raw.length >= 2 ? raw.slice(0, 3) : [description];

  return (
    <div
      className="rounded-2xl p-4 mb-8"
      style={{ background: C.goldSoft, border: `1.5px solid ${C.goldBorder}` }}
    >
      <p className="text-xs font-bold tracking-widest mb-3" style={{ color: C.gold }}>
        この記事のポイント
      </p>
      <ul className="space-y-2.5">
        {points.map((p, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <CheckCircle2 size={17} className="flex-shrink-0 mt-0.5" style={{ color: C.gold }} />
            <span className="text-sm leading-relaxed" style={{ color: C.ink }}>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── 中間CTA ──────────────────────────────────────────────
function MidCTA() {
  return (
    <div
      className="rounded-2xl p-5 my-10"
      style={{ background: C.ink, color: '#fff' }}
    >
      <p className="text-xs font-bold tracking-widest mb-1" style={{ color: C.amber }}>
        AI案内を試す
      </p>
      <p className="text-base font-bold mb-1">今夜、どこ飲みに行く？</p>
      <p className="text-sm mb-4" style={{ color: '#C4B8AC' }}>
        気分・予算・エリアを入れるだけで、ぴったりの立ち飲み店を提案します。
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 font-bold text-sm px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
        style={{ background: C.amber, color: C.ink }}
      >
        <MessageSquare size={15} />
        AIに聞いてみる
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

// ── 末尾CTA ──────────────────────────────────────────────
function EndCTA() {
  return (
    <div
      className="rounded-2xl p-5 mt-10 mb-4"
      style={{ background: C.goldSoft, border: `1.5px solid ${C.goldBorder}` }}
    >
      <p className="text-base font-bold mb-1" style={{ color: C.ink }}>
        さあ、神戸の夜へ出かけよう
      </p>
      <p className="text-sm mb-4" style={{ color: C.inkSub }}>
        三宮・元町の立ち飲み90店舗から、今夜の一軒を見つけてください。
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-opacity hover:opacity-90 flex-1"
          style={{ background: C.ink, color: '#fff' }}
        >
          <MessageSquare size={15} />
          AIにおすすめを聞く
        </Link>
        <Link
          href="/stores"
          className="flex items-center justify-center gap-2 font-bold text-sm px-5 py-3 rounded-xl transition-opacity hover:opacity-90 flex-1"
          style={{ background: C.surface, color: C.ink, border: `1.5px solid ${C.border}` }}
        >
          <Map size={15} />
          店舗一覧を見る
        </Link>
      </div>
    </div>
  );
}

// ── 記事本文レンダラー ────────────────────────────────────
// HTMLをパースしてMidCTAを中間に挿入する
function ArticleContent({ html }: { html: string }) {
  // h2タグで分割してセクション化
  const parts = html.split(/(?=<h2)/);
  const midIdx = Math.floor(parts.length / 2);

  return (
    <div className="space-y-0">
      {parts.map((part, i) => (
        <div key={i}>
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: part }}
          />
          {i === midIdx && <MidCTA />}
        </div>
      ))}
    </div>
  );
}

// ── メインページ ─────────────────────────────────────────
export default function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundFlag, setNotFoundFlag] = useState(false);

  useEffect(() => {
    fetch(`/api/articles?slug=${slug}`)
      .then(r => {
        if (!r.ok) { setNotFoundFlag(true); return null; }
        return r.json();
      })
      .then(data => { if (data) setArticle(data); setLoading(false); });
  }, [slug]);

  if (notFoundFlag) return notFound();

  return (
    <div className="min-h-screen pb-24" style={{ background: C.bg }}>

      {/* ── ヘッダー ── */}
      <div
        className="sticky top-0 z-10 backdrop-blur-sm px-4 py-3"
        style={{ background: `${C.surface}EE`, borderBottom: `1px solid ${C.border}` }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link
            href="/articles"
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: C.inkSub }}
          >
            <ArrowLeft size={16} />
            記事一覧
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider" style={{ color: C.gold }}>
            <BookOpen size={13} />
            神戸立ち飲みガイド
          </div>
        </div>
      </div>

      {/* ── ローディング ── */}
      {loading && (
        <div className="text-center py-24" style={{ color: C.inkMute }}>読み込み中...</div>
      )}

      {/* ── 記事本体 ── */}
      {article && (
        <article className="max-w-2xl mx-auto px-4 pt-6">

          {/* カバー画像 */}
          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-52 object-cover rounded-2xl mb-6"
              style={{ border: `1px solid ${C.border}` }}
            />
          )}

          {/* タグ */}
          {article.tags.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-3">
              {article.tags.map(t => (
                <span
                  key={t}
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background: C.goldSoft, color: C.gold, border: `1px solid ${C.goldBorder}` }}
                >
                  # {t}
                </span>
              ))}
            </div>
          )}

          {/* タイトル */}
          <h1
            className="text-2xl font-black leading-snug mb-2"
            style={{ color: C.ink, letterSpacing: '-0.01em' }}
          >
            {article.title}
          </h1>

          {/* 日付 */}
          <p className="text-xs mb-6" style={{ color: C.inkMute }}>
            {new Date(article.created_at).toLocaleDateString('ja-JP')} 公開
          </p>

          {/* サマリーカード */}
          <SummaryCard description={article.description} />

          {/* 本文 */}
          <ArticleContent html={article.content} />

          {/* 末尾CTA */}
          <EndCTA />

          {/* 記事一覧へ戻る */}
          <div className="text-center py-4">
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 text-sm font-medium"
              style={{ color: C.inkMute }}
            >
              <ArrowLeft size={14} />
              記事一覧へ戻る
            </Link>
          </div>
        </article>
      )}

      {/* グローバルスタイル（記事本文用） */}
      <style>{`
        .article-body h2 {
          font-size: 1.125rem;
          font-weight: 800;
          color: ${C.ink};
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          padding-left: 0.875rem;
          border-left: 3.5px solid ${C.gold};
          line-height: 1.5;
          letter-spacing: -0.01em;
        }
        .article-body h3 {
          font-size: 1rem;
          font-weight: 700;
          color: ${C.ink};
          margin-top: 1.75rem;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .article-body h3::before {
          content: '';
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${C.amber};
          flex-shrink: 0;
        }
        .article-body p {
          font-size: 0.9375rem;
          line-height: 1.85;
          color: ${C.inkSub};
          margin-bottom: 1rem;
        }
        .article-body ul {
          margin: 1rem 0 1.25rem;
          padding: 0;
          list-style: none;
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 14px;
          overflow: hidden;
        }
        .article-body ul li {
          font-size: 0.9rem;
          color: ${C.inkSub};
          line-height: 1.65;
          padding: 0.875rem 1rem 0.875rem 1rem;
          border-bottom: 1px solid ${C.border};
          display: flex;
          gap: 0.625rem;
          align-items: flex-start;
        }
        .article-body ul li:last-child {
          border-bottom: none;
        }
        .article-body ul li::before {
          content: '🍺';
          font-size: 0.85rem;
          flex-shrink: 0;
          margin-top: 0.05rem;
        }
        .article-body ul li strong {
          color: ${C.ink};
          font-weight: 700;
        }
        .article-body strong {
          color: ${C.ink};
          font-weight: 700;
        }
        .article-body ol {
          margin: 1rem 0 1.25rem;
          padding: 0;
          list-style: none;
          counter-reset: step-counter;
        }
        .article-body ol li {
          counter-increment: step-counter;
          font-size: 0.9rem;
          color: ${C.inkSub};
          line-height: 1.65;
          padding: 0.75rem 1rem 0.75rem 3rem;
          margin-bottom: 0.5rem;
          background: ${C.surface};
          border: 1px solid ${C.border};
          border-radius: 12px;
          position: relative;
        }
        .article-body ol li::before {
          content: counter(step-counter);
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          width: 22px;
          height: 22px;
          background: ${C.ink};
          color: #fff;
          border-radius: 50%;
          font-size: 0.75rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 22px;
          text-align: center;
        }
      `}</style>

      <BottomNav />
    </div>
  );
}
