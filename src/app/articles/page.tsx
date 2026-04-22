'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { BookOpen, Tag } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_image: string | null;
  tags: string[];
  created_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => { setArticles(data); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-harbor-50 pb-24">
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 bg-harbor-950/95 backdrop-blur border-b border-harbor-800/50 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          <BookOpen size={18} className="text-amber-400" />
          <h1 className="text-white font-bold text-lg">神戸立ち飲みガイド</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {loading && (
          <div className="text-center py-16 text-harbor-400">読み込み中...</div>
        )}

        {!loading && articles.length === 0 && (
          <div className="text-center py-16 text-harbor-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
            <p>記事はまだありません</p>
          </div>
        )}

        {articles.map(a => (
          <Link
            key={a.id}
            href={`/articles/${a.slug}`}
            className="block bg-white rounded-2xl overflow-hidden border border-harbor-200 hover:shadow-md transition-shadow"
          >
            {a.cover_image && (
              <img
                src={a.cover_image}
                alt={a.title}
                className="w-full h-44 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="font-bold text-harbor-900 text-base leading-snug mb-1">
                {a.title}
              </h2>
              {a.description && (
                <p className="text-harbor-500 text-sm line-clamp-2">{a.description}</p>
              )}
              {a.tags.length > 0 && (
                <div className="flex gap-1 mt-3 flex-wrap">
                  {a.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
                      <Tag size={10} />{t}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs text-harbor-400 mt-2">
                {new Date(a.created_at).toLocaleDateString('ja-JP')}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
