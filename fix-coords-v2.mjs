import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const env = readFileSync('.env.local', 'utf8');
const vars = {};
env.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) vars[k.trim()] = v.join('=').trim();
});

const supabase = createClient(vars.NEXT_PUBLIC_SUPABASE_URL, vars.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const API_KEY = vars.GOOGLE_MAPS_API_KEY;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getCoords(placeId) {
  const url = `https://places.googleapis.com/v1/places/${placeId}?fields=location,displayName&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.location) {
      return { lat: data.location.latitude, lng: data.location.longitude };
    }
    return null;
  } catch (e) { return null; }
}

const { data: stores } = await supabase
  .from('restaurants')
  .select('id, name, lat, lng, place_id')
  .not('place_id', 'is', null)
  .order('name');

console.log(`Processing ${stores.length} stores...`);

let updated = 0, skipped = 0, errors = 0;

for (const store of stores) {
  const geo = await getCoords(store.place_id);
  if (!geo) {
    console.log(`❌ NOT FOUND: ${store.name}`);
    errors++;
    continue;
  }

  const latDiff = Math.abs(store.lat - geo.lat);
  const lngDiff = Math.abs(store.lng - geo.lng);
  const moved = latDiff > 0.0005 || lngDiff > 0.0005;

  if (moved) {
    const { error } = await supabase
      .from('restaurants')
      .update({ lat: geo.lat, lng: geo.lng })
      .eq('id', store.id);

    if (error) {
      console.log(`❌ UPDATE ERROR: ${store.name}`);
      errors++;
    } else {
      console.log(`🔴 FIXED: ${store.name}: (${store.lat},${store.lng}) → (${geo.lat},${geo.lng})`);
      updated++;
    }
  } else {
    console.log(`✅ OK: ${store.name}`);
    skipped++;
  }

  await sleep(50);
}

console.log(`\n完了: ${updated}店修正, ${skipped}店OK, ${errors}件エラー`);
