import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) vars[k.trim()] = v.join('=').trim();
});

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function geocode(address) {
  const cleaned = address
    .replace(/^日本、/, '')
    .replace(/〒\d{3}-\d{4}\s*/, '')
    .replace(/\s+[^\s]*[FＦ階][^\n]*$/, '')
    .trim();
  
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleaned)}&format=json&limit=1&countrycodes=jp`;
  
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'kobe-tachinomi-map/1.0' } });
    const data = await res.json();
    if (data && data[0]) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    return null;
  } catch (e) { return null; }
}

const { data: stores } = await supabase
  .from('restaurants')
  .select('id, name, formatted_address, lat, lng')
  .not('formatted_address', 'is', null)
  .order('name');

console.log(`Processing ${stores.length} stores...`);
const results = [];

for (const store of stores) {
  const geo = await geocode(store.formatted_address);
  if (geo) {
    const moved = Math.abs(store.lat - geo.lat) > 0.001 || Math.abs(store.lng - geo.lng) > 0.001;
    const inKobe = geo.lat > 34.60 && geo.lat < 34.80 && geo.lng > 135.10 && geo.lng < 135.35;
    results.push({ id: store.id, name: store.name, old_lat: store.lat, old_lng: store.lng, new_lat: geo.lat, new_lng: geo.lng, moved, inKobe });
    console.log(`${moved ? '🔴' : '✅'} ${store.name}: ${store.lat},${store.lng} → ${geo.lat},${geo.lng}${!inKobe ? ' ⚠️ NOT KOBE' : ''}`);
  } else {
    results.push({ id: store.id, name: store.name, error: 'not found' });
    console.log(`❌ NOT FOUND: ${store.name}`);
  }
  await sleep(1100);
}

writeFileSync('geocode-results.json', JSON.stringify(results, null, 2));
console.log('\nDone! Results saved to geocode-results.json');
