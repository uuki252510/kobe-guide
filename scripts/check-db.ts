import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await sb
    .from('restaurants')
    .select('name,area,tachinomi_type,budget_min,budget_max,is_new_open,is_published,vibe_tags,internal_notes,instagram_handle,google_maps_url,lat,lng')
    .order('area').order('name');

  if (error) { console.error('Error:', error.message); process.exit(1); }

  console.log('件数:', data!.length);
  console.log('');
  for (const r of data!) {
    const notes = (r.internal_notes || '').slice(0, 60);
    const ig    = r.instagram_handle ? `@${r.instagram_handle}` : 'IG-';
    const map   = r.google_maps_url ? '🗺' : '❌Maps';
    const pos   = (r.lat && r.lng) ? '📍' : '❌GPS';
    console.log(`${(r.area||'').padEnd(14)} | ${r.name.padEnd(30)} | ${(r.tachinomi_type||'-').padEnd(10)} | ¥${r.budget_min}-¥${r.budget_max} | new:${r.is_new_open} pub:${r.is_published} | ${pos} ${map} ${ig}`);
    if (notes) console.log(`  → ${notes}`);
  }
}
main().catch(console.error);
