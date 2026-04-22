'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Tag } from 'lucide-react';

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
    <div className="min-h-screen bg-harbor-50 pb-24">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-harbor-950/95 backdrop-blur border-b border-harbor-800/50 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <Link href="/articles" className="flex items-center gap-1 text-harbor-300 hover:text-white text-sm transition-colors">
            <ArrowLeft size={16} />
            記事一覧へ
          </Link>
        </div>
      </div>

      {loading && (
        <div className="text-center py-16 text-harbor-400">読み込み中...</div>
      )}

      {article && (
        <article className="max-w-2xl mx-auto px-4 py-6">
          {article.cover_image && (
            <img
              src={article.cover_image}
              alt={article.title}
              className="w-full h-52 object-cover rounded-2xl mb-6"
            />
          )}
          <h1 className="text-2xl font-bold text-harbor-900 leading-snug mb-2">
            {article.title}
          </h1>
          {article.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-3">
              {article.tags.map(t => (
                <span key={t} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                  <Tag size={10} />{t}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-harbor-400 mb-6">
            {new Date(article.created_at).toLocaleDateString('ja-JP')}
          </p>
          <div
            className="prose prose-sm max-w-none text-harbor-800"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </article>
      )}

      <BottomNav />
    </div>
  );
}
