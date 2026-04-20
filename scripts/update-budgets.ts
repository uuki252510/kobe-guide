import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// restaurantNormalizer.ts と同じテーブルを price_level (数値) ベースで持つ
const BUDGET_BY_PRICE_LEVEL: Record<number, { min: number; max: number }> = {
  0: { min: 1000, max: 2000  }, // FREE → fallback
  1: { min: 1000, max: 2500  }, // INEXPENSIVE
  2: { min: 2500, max: 5000  }, // MODERATE
  3: { min: 5000, max: 10000 }, // EXPENSIVE
  4: { min: 10000, max: 25000 },
};

// price_level が null の店はこのデフォルト（立ち飲み前提）
const DEFAULT_BUDGET = { min: 1000, max: 2500 };

const DRY_RUN = process.argv.includes('--dry');

async function main() {
  const { data, error } = await sb
    .from('restaurants')
    .select('id,name,price_level,budget_min,budget_max,budget_estimated');

  if (error) { console.error(error); process.exit(1); }
  if (!data) return;

  let changed = 0;
  for (const r of data) {
    // 管理者が手動で budget_estimated=false にしてる行は尊重してスキップ
    if (r.budget_estimated === false) continue;

    const target = r.price_level != null
      ? BUDGET_BY_PRICE_LEVEL[r.price_level] ?? DEFAULT_BUDGET
      : DEFAULT_BUDGET;

    if (r.budget_min === target.min && r.budget_max === target.max) continue;

    console.log(
      `${r.name.padEnd(30)} pl=${r.price_level ?? '-'}  ` +
      `¥${r.budget_min}-¥${r.budget_max} → ¥${target.min}-¥${target.max}`,
    );
    changed++;

    if (!DRY_RUN) {
      const { error: upErr } = await sb
        .from('restaurants')
        .update({
          budget_min: target.min,
          budget_max: target.max,
          budget_estimated: true,
        })
        .eq('id', r.id);
      if (upErr) console.error('  ! update failed:', upErr.message);
    }
  }

  console.log('');
  console.log(`${DRY_RUN ? '[DRY]' : '[DONE]'} ${changed}/${data.length} 件更新`);
}

main().catch(console.error);
