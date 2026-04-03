import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const BASE = 'https://kobe-tachinomi.taip-ai.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data: stores } = await supabase
    .from('restaurants')
    .select('id, updated_at')
    .order('priority_score', { ascending: false });

  const storeUrls: MetadataRoute.Sitemap = (stores ?? []).map(s => ({
    url: `${BASE}/stores/${s.id}`,
    lastModified: s.updated_at ? new Date(s.updated_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE}/map`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/stores`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/feed`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.6 },
    ...storeUrls,
  ];
}
