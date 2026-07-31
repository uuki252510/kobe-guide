'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, MapTrifold, NavigationArrow } from '@phosphor-icons/react';
import type { Restaurant } from '@/types/restaurant';
import { useCourse } from '@/hooks/useCourse';
import StoreImage from '@/components/StoreImage';

const AREA_LABEL: Record<string, string> = { sannomiya: '三宮', motomachi: '元町', surroundings: '周辺', kitano: '北野', nankinmachi: '南京町' };

function routeUrl(stores: Restaurant[]) {
  const withCoords = stores.filter(store => store.lat && store.lng);
  if (withCoords.length < 2) return null;
  const first = withCoords[0];
  const last = withCoords[withCoords.length - 1];
  const params = new URLSearchParams({
    api: '1',
    origin: `${first.lat},${first.lng}`,
    destination: `${last.lat},${last.lng}`,
    travelmode: 'walking',
  });
  const waypoints = withCoords.slice(1, -1).map(store => `${store.lat},${store.lng}`).join('|');
  if (waypoints) params.set('waypoints', waypoints);
  return `https://www.google.com/maps/dir/?${params}`;
}

export default function SharedCourse({ stores }: { stores: Restaurant[] }) {
  const { addCourseStore } = useCourse();
  const [adopted, setAdopted] = useState(false);

  const adopt = () => {
    stores.forEach(store => addCourseStore({
      id: store.id,
      name: store.name,
      tachinomi_type: store.tachinomi_type,
      lat: store.lat,
      lng: store.lng,
      budget_max: store.budget_max,
    }));
    setAdopted(true);
  };

  const directions = routeUrl(stores);

  return (
    <div className="shared-course">
      <ol className="shared-course__list">
        {stores.map((store, index) => (
          <li key={store.id}>
            <span className="shared-course__step">{String(index + 1).padStart(2, '0')}</span>
            <StoreImage name={store.name} photoReference={store.photo_reference} className="shared-course__image" />
            <div>
              <Link href={`/stores/${store.id}`}>{store.name}</Link>
              <small>{AREA_LABEL[store.area] ?? store.area}{store.must_try_menu ? ` ・ 名物は「${store.must_try_menu}」` : ''}</small>
            </div>
          </li>
        ))}
      </ol>

      <div className="shared-course__actions">
        <button className={`primary-button ${adopted ? 'is-success' : ''}`} type="button" onClick={adopt} disabled={adopted}>
          {adopted ? <><Check size={18} aria-hidden="true" />自分のコースに入れました</> : <>このコースを自分のコースに<ArrowRight size={17} aria-hidden="true" /></>}
        </button>
        {adopted ? <Link className="secondary-button" href="/map"><MapTrifold size={18} aria-hidden="true" />地図で見る</Link> : null}
        {directions ? <a className="secondary-button" href={directions} target="_blank" rel="noopener noreferrer"><NavigationArrow size={18} aria-hidden="true" />Googleマップで歩く</a> : null}
      </div>

      <p className="shared-course__note">気分や予算を伝えると、自分に合う3軒から新しいコースを作れます。<Link href="/">相談してみる</Link></p>
    </div>
  );
}
