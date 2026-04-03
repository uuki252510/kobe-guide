import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://kobe-tachinomi.taip-ai.com/sitemap.xml',
  };
}
