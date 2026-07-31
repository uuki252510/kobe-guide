'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowsLeftRight, Trophy } from '@phosphor-icons/react';
import type { Restaurant } from '@/types/restaurant';
import { useVisited } from '@/hooks/useVisited';
import { useRanking } from '@/hooks/useRanking';
import StoreImage from '@/components/StoreImage';

interface Duel {
  id: string;
  lo: number;
  hi: number;
}

export default function VisitedRanking({ stores }: { stores: Restaurant[] }) {
  const { ids: visitedIds } = useVisited();
  const { ranked, setRanked } = useRanking();
  const [duel, setDuel] = useState<Duel | null>(null);

  const byId = useMemo(() => new Map(stores.map(store => [store.id, store])), [stores]);
  // 「行った」を取り消した店は順位からも落とす
  const order = useMemo(() => ranked.filter(id => visitedIds.includes(id) && byId.has(id)), [byId, ranked, visitedIds]);
  const pending = useMemo(() => visitedIds.filter(id => byId.has(id) && !order.includes(id)), [byId, order, visitedIds]);

  const commit = (id: string, position: number, base: string[]) => {
    const next = [...base];
    next.splice(position, 0, id);
    setRanked(next);
    const remaining = pending.filter(candidate => candidate !== id);
    setDuel(remaining.length ? { id: remaining[0], lo: 0, hi: next.length } : null);
  };

  const start = () => {
    const id = pending[0];
    if (!id) return;
    if (order.length === 0) { commit(id, 0, order); return; }
    setDuel({ id, lo: 0, hi: order.length });
  };

  const answer = (prefersNew: boolean) => {
    if (!duel) return;
    const mid = (duel.lo + duel.hi) >> 1;
    const lo = prefersNew ? duel.lo : mid + 1;
    const hi = prefersNew ? mid : duel.hi;
    if (lo >= hi) { commit(duel.id, lo, order); return; }
    setDuel({ ...duel, lo, hi });
  };

  if (visitedIds.length === 0) return null;

  const challenger = duel ? byId.get(duel.id) : null;
  const opponent = duel ? byId.get(order[(duel.lo + duel.hi) >> 1]) : null;

  return (
    <section className="ranking" aria-labelledby="ranking-title">
      <div className="ranking__head">
        <div>
          <p className="ui-kicker">YOUR BEST</p>
          <h2 id="ranking-title">行った店のマイランキング</h2>
          <p className="ranking__note">
            {pending.length
              ? `${pending.length}軒がまだ未評価です。2軒を見比べるだけで順位が決まります。`
              : '好きな順に並んでいます。行った店が増えると、また比較できます。'}
          </p>
        </div>
        {pending.length && !duel ? (
          <button className="primary-button" type="button" onClick={start}><ArrowsLeftRight size={18} aria-hidden="true" />順位をつける</button>
        ) : null}
      </div>

      {duel && challenger && opponent ? (
        <div className="duel">
          <p className="duel__question">また行きたいのは、どっち？</p>
          <div className="duel__pair">
            <button className="duel__pick" type="button" onClick={() => answer(true)}>
              <StoreImage name={challenger.name} photoReference={challenger.photo_reference} className="duel__image" />
              <strong>{challenger.name}</strong>
              <small>まだ順位なし</small>
            </button>
            <span className="duel__vs" aria-hidden="true">VS</span>
            <button className="duel__pick" type="button" onClick={() => answer(false)}>
              <StoreImage name={opponent.name} photoReference={opponent.photo_reference} className="duel__image" />
              <strong>{opponent.name}</strong>
              <small>現在 {order.indexOf(opponent.id) + 1} 位</small>
            </button>
          </div>
          <button className="text-button" type="button" onClick={() => setDuel(null)}>あとで決める</button>
        </div>
      ) : null}

      {order.length ? (
        <ol className="ranking__list">
          {order.map((id, index) => {
            const store = byId.get(id)!;
            return (
              <li key={id} className={index === 0 ? 'is-first' : ''}>
                <span className="ranking__rank">{index === 0 ? <Trophy size={18} weight="fill" aria-hidden="true" /> : String(index + 1).padStart(2, '0')}</span>
                <StoreImage name={store.name} photoReference={store.photo_reference} className="ranking__image" />
                <Link href={`/stores/${store.id}`}>{store.name}</Link>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
