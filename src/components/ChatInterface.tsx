'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  ArrowRight,
  ChatCircleDots,
  Check,
  MapPin,
  MapTrifold,
  PaperPlaneRight,
  SpinnerGap,
  Sparkle,
  User,
} from '@phosphor-icons/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Language, Message, Spot } from '@/types';
import type { OpeningHoursJson } from '@/types/restaurant';
import { getOpenState } from '@/lib/opening-hours';
import type { CourseStore } from '@/hooks/useCourse';
import { useCourse } from '@/hooks/useCourse';
import { useUILang } from '@/hooks/useUILang';
import { useT } from '@/lib/i18n';
import StoreImage from '@/components/StoreImage';
import type { HomeMapCandidate } from './HomeRecommendationMap';

const HomeRecommendationMap = dynamic(() => import('./HomeRecommendationMap'), {
  ssr: false,
  loading: () => <div className="kg-map-loading">地図を読み込んでいます…</div>,
});

interface RestaurantPreview {
  id: string;
  name: string;
  area: string;
  budget_min: number | null;
  budget_max: number | null;
  lat: number | null;
  lng: number | null;
  google_maps_url: string | null;
  photo_reference: string | null;
  must_try_menu: string | null;
  tachinomi_type: string | null;
  rating: number | null;
  priority_score: number | null;
  vibe_tags: string[] | null;
  solo_friendly_score: number | null;
  foreigner_friendly_score: number | null;
  opening_hours_json: OpeningHoursJson | null;
  business_status: string | null;
}

interface Candidate {
  id: string;
  name: string;
  area: string;
  areaLabel: string;
  budgetMin?: number;
  budgetMax?: number;
  lat: number;
  lng: number;
  googleMapsUrl: string;
  photoReference?: string;
  summary: string;
  type?: string;
  rating?: number;
  vibeTags?: string[];
  soloFriendly?: boolean;
  foreignerFriendly?: boolean;
  highlight?: string;
  openNow?: boolean | null;
}

const AREA_LABEL: Record<string, string> = {
  sannomiya: '三宮', motomachi: '元町', kitano: '北野', nankinmachi: '南京町', surroundings: '神戸',
};

const TYPE_LABEL: Record<string, string> = {
  tachinomi: '立ち飲み',
  kakuuchi: '角打ち',
  yakitori: '焼鳥',
  seafood: '海鮮',
  wine: 'ワイン',
  italian: 'イタリアン',
  bar: 'バー',
};

const STATIONS = [
  { name: '三宮駅', lat: 34.6947, lng: 135.1955 },
  { name: '元町駅', lat: 34.6896, lng: 135.1878 },
];

function walkingEstimate(lat: number, lng: number) {
  const nearest = STATIONS
    .map(station => {
      const distanceMeters = Math.sqrt(((lat - station.lat) * 111) ** 2 + ((lng - station.lng) * 91) ** 2) * 1000;
      return { station: station.name, minutes: Math.max(2, Math.round(distanceMeters / 74)), distanceMeters };
    })
    .sort((a, b) => a.distanceMeters - b.distanceMeters)[0];
  return nearest;
}

function budgetLabel(candidate: Candidate) {
  if (candidate.budgetMin && candidate.budgetMax) return `¥${candidate.budgetMin.toLocaleString()}–${candidate.budgetMax.toLocaleString()}`;
  if (candidate.budgetMax) return `〜¥${candidate.budgetMax.toLocaleString()}`;
  if (candidate.budgetMin) return `¥${candidate.budgetMin.toLocaleString()}〜`;
  return '予算は要確認';
}

function selectDiverseFeatured(candidates: Candidate[]) {
  if (candidates.length <= 3) return candidates;
  const selected: Candidate[] = [candidates[0]];

  for (const candidate of candidates.slice(1)) {
    const sameType = selected.some(item => (item.type ?? '') === (candidate.type ?? ''));
    const sameArea = selected.some(item => item.area === candidate.area);
    if (!sameType || !sameArea) selected.push(candidate);
    if (selected.length === 3) break;
  }

  for (const candidate of candidates) {
    if (!selected.some(item => item.id === candidate.id)) selected.push(candidate);
    if (selected.length === 3) break;
  }

  return selected;
}

function cleanAssistantText(text: string) {
  return text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/^#{1,6}\s+/gm, '').trim();
}

function parseBudgetCeiling(text: string) {
  const normalized = text
    .replace(/[０-９]/g, value => String.fromCharCode(value.charCodeAt(0) - 0xfee0))
    .replace(/,/g, '');
  const explicit = normalized.match(/(\d{3,5})\s*円?\s*(?:以内|以下|まで)/);
  const budget = normalized.match(/予算\s*(\d{3,5})\s*円?/);
  const amount = explicit?.[1] ?? budget?.[1];
  return amount ? Number(amount) : undefined;
}

const TOPIC_RULES: Array<{ query: RegExp; candidate: RegExp; label: string }> = [
  { query: /日本酒|地酒|酒蔵/, candidate: /日本酒|地酒|酒蔵|sake/i, label: '日本酒' },
  { query: /海鮮|刺身|魚/, candidate: /海鮮|刺身|魚|鮮魚/, label: '海鮮' },
  { query: /焼鳥|焼き鳥|鶏/, candidate: /焼鳥|焼き鳥|鶏/, label: '焼鳥' },
  { query: /ワイン/, candidate: /ワイン|wine/i, label: 'ワイン' },
  { query: /角打ち/, candidate: /角打ち|kakuuchi/i, label: '角打ち' },
];

function getRecommendationReasons(candidate: Candidate, query: string, personalized: boolean) {
  const reasons: string[] = [];
  const add = (label: string) => { if (label && !reasons.includes(label)) reasons.push(label); };

  if (!personalized) {
    if (candidate.rating) add(`★${candidate.rating.toFixed(1)}`);
    if (candidate.type && TYPE_LABEL[candidate.type]) add(TYPE_LABEL[candidate.type]);
    if (candidate.soloFriendly) add('ひとり向き');
    return reasons.slice(0, 3);
  }

  const walking = walkingEstimate(candidate.lat, candidate.lng);
  const candidateText = [candidate.type, candidate.highlight, candidate.summary, ...(candidate.vibeTags ?? [])].filter(Boolean).join(' ');
  const budgetCeiling = parseBudgetCeiling(query);

  if (query.includes(candidate.areaLabel)) add(candidate.areaLabel);
  if (/ひとり|一人|ソロ/.test(query) && candidate.soloFriendly) add('ひとり向き');
  if (/英語|外国人|inbound/i.test(query) && candidate.foreignerFriendly) add('英語対応');
  if (budgetCeiling && candidate.budgetMax && candidate.budgetMax <= budgetCeiling) add('予算内');
  if (/駅近|駅から|徒歩/.test(query) && walking.minutes <= 7) add(`${walking.station}近く`);

  for (const rule of TOPIC_RULES) {
    if (rule.query.test(query) && rule.candidate.test(candidateText)) add(rule.label);
  }

  if (reasons.length === 0 && candidate.soloFriendly) add('ひとり向き');
  if (reasons.length === 0 && candidate.highlight) add('名物あり');
  if (reasons.length === 0) add(`${candidate.areaLabel}の候補`);
  return reasons.slice(0, 3);
}

/** 数字を目の前で積み上げる。減速カーブで最後の一桁が落ち着く。 */
function useCountUp(target: number) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setValue(target); return; }
    let frame = 0;
    const started = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - started) / 1100);
      setValue(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  return value;
}

function restaurantToCandidate(restaurant: RestaurantPreview): Candidate {
  return {
    id: restaurant.id,
    name: restaurant.name,
    area: restaurant.area,
    areaLabel: AREA_LABEL[restaurant.area] ?? '神戸',
    budgetMin: restaurant.budget_min ?? undefined,
    budgetMax: restaurant.budget_max ?? undefined,
    lat: restaurant.lat ?? 34.6938,
    lng: restaurant.lng ?? 135.1956,
    googleMapsUrl: restaurant.google_maps_url ?? `/stores/${restaurant.id}`,
    photoReference: restaurant.photo_reference ?? undefined,
    summary: restaurant.must_try_menu ? `名物は「${restaurant.must_try_menu}」。今夜の一軒にちょうどいい店です。` : '気軽に立ち寄れて、神戸らしい夜を楽しめる一軒です。',
    type: restaurant.tachinomi_type ?? undefined,
    rating: restaurant.rating ?? undefined,
    vibeTags: restaurant.vibe_tags ?? [],
    soloFriendly: (restaurant.solo_friendly_score ?? 0) >= 3,
    foreignerFriendly: (restaurant.foreigner_friendly_score ?? 0) >= 3,
    highlight: restaurant.must_try_menu ?? undefined,
    openNow: restaurant.business_status === 'CLOSED_TEMPORARILY' ? false : getOpenState(restaurant.opening_hours_json).open,
  };
}

function spotToCandidate(spot: Spot): Candidate {
  return {
    id: spot.id,
    name: spot.name,
    area: spot.area,
    areaLabel: AREA_LABEL[spot.area] ?? '神戸',
    budgetMin: spot.budget_min,
    budgetMax: spot.budget_max,
    lat: spot.latitude ?? 34.6938,
    lng: spot.longitude ?? 135.1956,
    googleMapsUrl: spot.google_maps_url || `/stores/${spot.id}`,
    photoReference: spot.photo_reference,
    summary: spot.highlight ? `名物は「${spot.highlight}」。条件に合う今夜の一軒です。` : spot.description || 'あなたの条件に近い、立ち寄りやすい一軒です。',
    type: spot.tachinomi_type,
    rating: spot.rating,
    vibeTags: spot.vibe_tags,
    soloFriendly: spot.solo_friendly,
    foreignerFriendly: spot.foreigner_friendly,
    highlight: spot.highlight,
  };
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string>();
  const [language, setLanguage] = useState<Language>('ja');
  const [recommendationQuery, setRecommendationQuery] = useState('');
  const [featured, setFeatured] = useState<Candidate[]>([]);
  const [featuredStatus, setFeaturedStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [featuredAttempt, setFeaturedAttempt] = useState(0);
  const [storeTotal, setStoreTotal] = useState(0);
  const [selectedId, setSelectedId] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const uiLang = useUILang();
  const tr = useT(uiLang);
  const { addCourseStore, isInCourse } = useCourse();

  useEffect(() => {
    const controller = new AbortController();
    setFeaturedStatus('loading');
    fetch('/api/restaurants?limit=40', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('店舗情報を取得できませんでした');
        return response.json();
      })
      .then(data => {
        const all = (data.restaurants ?? []).map(restaurantToCandidate).filter((candidate: Candidate) => candidate.id);
        // 実写真があり、いま開いている店を優先する。足りなければ順に条件を緩める
        // (営業時間が不明な店は openNow が null なので、閉まっている扱いにはしない)
        const withPhoto = all.filter((candidate: Candidate) => candidate.photoReference);
        const openWithPhoto = withPhoto.filter((candidate: Candidate) => candidate.openNow !== false);
        const pool = openWithPhoto.length >= 3 ? openWithPhoto : withPhoto.length >= 3 ? withPhoto : all;
        const next = selectDiverseFeatured(pool);
        setFeatured(next);
        setStoreTotal(data.pagination?.total ?? all.length);
        setFeaturedStatus('ready');
        if (next.length) setSelectedId(current => (current ? current : next[0].id));
      })
      .catch(error => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setFeaturedStatus('error');
      });
    return () => controller.abort();
  }, [featuredAttempt]);

  const latestAssistantWithSpots = useMemo(() => [...messages].reverse().find(message => message.role === 'assistant' && message.spots?.length), [messages]);
  const isPersonalized = Boolean(latestAssistantWithSpots);
  const candidates = useMemo(() => {
    const recommended = latestAssistantWithSpots?.spots?.map(spotToCandidate).slice(0, 3) ?? [];
    return recommended.length ? recommended : featured;
  }, [featured, latestAssistantWithSpots]);

  useEffect(() => {
    if (candidates.length && !candidates.some(candidate => candidate.id === selectedId)) setSelectedId(candidates[0].id);
  }, [candidates, selectedId]);

  const selected = candidates.find(candidate => candidate.id === selectedId) ?? candidates[0];
  const countedStores = useCountUp(storeTotal);
  // 候補の顔ぶれが変わったら配り直す。key を変えて登場アニメを頭から流す。
  const dealKey = candidates.map(candidate => candidate.id).join('|');

  const messagesRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = messagesRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages]);
  const mapCandidates: HomeMapCandidate[] = useMemo(
    () => candidates.map(({ id, name, lat, lng }) => ({ id, name, lat, lng })),
    [candidates],
  );

  const sendMessage = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText || isLoading) return;

    const userMessage: Message = { id: `${Date.now()}-user`, role: 'user', content: cleanText };
    const loadingMessage: Message = { id: `${Date.now()}-loading`, role: 'assistant', content: '', isLoading: true };
    setMessages(current => [...current, userMessage, loadingMessage]);
    setInput('');
    setIsLoading(true);
    const history = messages.map(message => ({ role: message.role, content: message.content }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: cleanText, conversationId, history, language }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Request failed');
      if (data.language) setLanguage(data.language);
      if (data.conversationId) setConversationId(data.conversationId);
      if (data.spots?.length) setRecommendationQuery(cleanText);
      setMessages(current => [...current.filter(message => !message.isLoading), { id: `${Date.now()}-assistant`, role: 'assistant', content: data.reply, spots: data.spots ?? [] }]);
      if (data.spots?.[0]?.id) setSelectedId(data.spots[0].id);
    } catch {
      setMessages(current => [...current.filter(message => !message.isLoading), { id: `${Date.now()}-error`, role: 'assistant', content: tr.chat.errorMsg }]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [conversationId, isLoading, language, messages, tr.chat.errorMsg]);

  const chooseCandidate = (candidate: Candidate) => {
    const courseStore: CourseStore = { id: candidate.id, name: candidate.name, tachinomi_type: candidate.type ?? null, lat: candidate.lat, lng: candidate.lng, budget_max: candidate.budgetMax ?? null };
    addCourseStore(courseStore);
  };

  return (
    <div className="home-experience">
      <section className="home-intro" aria-labelledby="home-title">
        <div className="home-intro__copy" data-reveal>
          <p className="ui-kicker">KOBE NIGHT GUIDE</p>
          <h1 id="home-title"><span className="kg-line"><span>今夜、どこで飲む？</span></span></h1>
          <p className="home-intro__lead">気分・予算・エリアをひと言で。神戸の立ち飲みから3軒に絞り、写真と地図で比べられます。</p>
          <div className="use-steps" aria-label="使い方3ステップ" data-stagger>
            {[
              ['01', '相談する', '気分や予算を書く'],
              ['02', '3軒で比較', '写真と理由を見る'],
              ['03', 'コース作成', '地図で順番を決める'],
            ].map(([number, title, text]) => (
              <div className="use-step" key={number}><span className="use-step__number">{number}</span><span><strong>{title}</strong><small>{text}</small></span></div>
            ))}
          </div>
        </div>
        <div className="home-intro__visual kg-noren" data-reveal>
          <StoreImage name="神戸の立ち飲み風景" className="home-intro__visual-image" eager width={1536} height={1024} />
          <div className="home-intro__visual-copy"><strong>三宮・元町、<span className="kg-tally">{countedStores}</span>軒。</strong><span>広告順ではなく、あなたの条件で提案します。</span></div>
        </div>
      </section>

      <div className="chat-layout">
        <div className="consult-column">
          <section className="chat-panel" aria-labelledby="consult-title" data-reveal>
          <div className="panel-heading"><div><p className="ui-kicker">STEP 01</p><h2 id="consult-title">条件を相談</h2><p>短い言葉で大丈夫です。</p></div></div>
          <div className="chat-messages" aria-live="polite" ref={messagesRef}>
            {messages.length === 0 ? (
              <div className="chat-message chat-message--guide"><span className="chat-message__icon"><ChatCircleDots size={18} weight="fill" aria-hidden="true" /></span><div><span className="chat-message__label">KOBE GUIDE</span><p>たとえば「三宮で、ひとり。日本酒が飲みたい」と入力してください。</p></div></div>
            ) : messages.map(message => (
              <div key={message.id} className={`chat-message ${message.role === 'user' ? 'chat-message--user' : 'chat-message--guide'}`}>
                <span className="chat-message__icon">{message.role === 'user' ? <User size={17} aria-hidden="true" /> : <ChatCircleDots size={18} weight="fill" aria-hidden="true" />}</span>
                <div><span className="chat-message__label">{message.role === 'user' ? 'YOU' : 'KOBE GUIDE'}</span>{message.isLoading ? <p className="loading-inline"><SpinnerGap size={17} className="spin" aria-hidden="true" />三宮・元町から探しています…</p> : <p>{message.role === 'assistant' ? cleanAssistantText(message.content) : message.content}</p>}</div>
              </div>
            ))}
          </div>

          <form className="chat-composer" onSubmit={event => { event.preventDefault(); sendMessage(input); }}>
            <label htmlFor="chat-message">どんな店を探しますか？</label>
            <div className="chat-composer__box">
              <textarea id="chat-message" name="chat-message" ref={inputRef} value={input} onChange={event => setInput(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(input); } }} rows={1} placeholder="例：三宮で、ひとり。日本酒が飲みたい…" autoComplete="off" disabled={isLoading} />
              <button className="chat-send" type="submit" disabled={!input.trim() || isLoading} aria-label="条件を送信">{isLoading ? <SpinnerGap size={20} className="spin" aria-hidden="true" /> : <PaperPlaneRight size={20} weight="bold" aria-hidden="true" />}</button>
            </div>
          </form>

          <div className="quick-prompts" aria-label="すぐに相談できる条件">
            {[
              ['ひとりで入りやすい', '三宮で、ひとりでも入りやすい立ち飲みを教えて'],
              ['駅から5分以内', '三宮駅から徒歩5分以内の立ち飲みを3軒教えて'],
              ['日本酒が充実', '日本酒の品ぞろえが良い立ち飲みを教えて'],
              ['2,000円以内', '予算2,000円以内で楽しめる立ち飲みを教えて'],
            ].map(([label, prompt]) => <button key={label} type="button" className="quick-prompt" onClick={() => sendMessage(prompt)}>{label}<ArrowRight size={14} aria-hidden="true" /></button>)}
          </div>
          </section>

          <section className="area-shortcuts" aria-labelledby="area-shortcuts-title" data-reveal>
            <div className="area-shortcuts__head">
              <div>
                <p className="ui-kicker">START BY AREA</p>
                <h2 id="area-shortcuts-title">街から今夜を選ぶ</h2>
              </div>
              <Link href="/stores" className="text-button">全店を見る<ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
            <div className="area-shortcuts__grid" data-stagger>
              <Link href="/stores?area=sannomiya" className="area-shortcut area-shortcut--sannomiya">
                <span className="area-shortcut__icon"><MapPin size={20} weight="fill" aria-hidden="true" /></span>
                <span className="area-shortcut__body"><span>01 / SANNOMIYA</span><strong>三宮</strong><small>駅近の立ち飲みを探す</small></span>
                <ArrowRight className="area-shortcut__arrow" size={18} aria-hidden="true" />
              </Link>
              <Link href="/stores?area=motomachi" className="area-shortcut area-shortcut--motomachi">
                <span className="area-shortcut__icon"><MapPin size={20} weight="fill" aria-hidden="true" /></span>
                <span className="area-shortcut__body"><span>02 / MOTOMACHI</span><strong>元町</strong><small>路地の名店から探す</small></span>
                <ArrowRight className="area-shortcut__arrow" size={18} aria-hidden="true" />
              </Link>
              <Link href="/map" className="area-shortcut area-shortcut--map">
                <span className="area-shortcut__icon"><MapTrifold size={21} weight="fill" aria-hidden="true" /></span>
                <span className="area-shortcut__body"><span>03 / MAP</span><strong>地図から近い順に探す</strong><small>選んだ店をコースに追加できます</small></span>
                <ArrowRight className="area-shortcut__arrow" size={18} aria-hidden="true" />
              </Link>
            </div>
          </section>
        </div>

        <section className="recommendation-panel" aria-labelledby="recommend-title" data-reveal>
          <div className="recommendation-panel__head" aria-live="polite">
            <div>
              <p className="ui-kicker">STEP 02</p>
              <h2 id="recommend-title">{candidates.length === 0 ? '今夜の候補' : isPersonalized ? `今夜の ${candidates.length}軒` : `まず見る ${candidates.length}軒`}</h2>
              <p className="recommendation-panel__hint">
                {isPersonalized ? '条件に近い順に並べました。合っていた点をカードに出しています。' : '評価とエリア・店タイプを散らした入口です。相談すると、ここが入れ替わります。'}
              </p>
            </div>
            <span className={`recommendation-source ${isPersonalized ? 'is-personalized' : ''}`}>
              <Sparkle size={15} weight="fill" aria-hidden="true" />
              {isPersonalized ? 'AIが条件から選定' : '人気データから'}
            </span>
          </div>
          {candidates.length === 0 ? (
            <div className="store-empty" style={{ minHeight: 220 }}>
              {featuredStatus === 'error' ? (
                <div>
                  <h3>店舗情報を読み込めませんでした</h3>
                  <p>通信状態を確認して、もう一度お試しください。</p>
                  <button className="secondary-button" style={{ marginTop: 14 }} type="button" onClick={() => setFeaturedAttempt(attempt => attempt + 1)}>再読み込み</button>
                </div>
              ) : (
                <div><p className="loading-inline"><SpinnerGap size={20} className="spin" aria-hidden="true" />候補を読み込んでいます…</p></div>
              )}
            </div>
          ) : (
          <>
          <div className="recommendation-grid" key={dealKey}>
            {candidates.map((candidate, index) => {
              const active = candidate.id === selected?.id;
              const added = isInCourse(candidate.id);
              const walking = walkingEstimate(candidate.lat, candidate.lng);
              const reasons = getRecommendationReasons(candidate, recommendationQuery, isPersonalized);
              return (
                <article className={`recommendation-card ${active ? 'is-active' : ''}`} key={candidate.id}>
                  <button className="recommendation-card__select" type="button" onClick={() => setSelectedId(candidate.id)} aria-pressed={active} aria-label={`${candidate.name}を選択`}>
                    <StoreImage name={candidate.name} photoReference={candidate.photoReference} className="recommendation-card__image" eager={index === 0} />
                    <span className="recommendation-card__body">
                      <span className="recommendation-card__rank">{isPersonalized ? 'MATCH' : 'PICK'} {String(index + 1).padStart(2, '0')}</span>
                      <h3>{candidate.name}</h3>
                      <span className="recommendation-card__meta">
                        <span title="直線距離から算出した徒歩目安"><MapPin size={14} aria-hidden="true" />{walking.station}から徒歩目安{walking.minutes}分</span>
                        <span>{budgetLabel(candidate)}</span>
                        {candidate.openNow === true ? <span className="kg-open">営業中</span> : candidate.openNow === false ? <span className="kg-closed">営業時間外</span> : null}
                      </span>
                      {reasons.length > 0 ? <span className="recommendation-card__reasons" aria-label="選定理由">{reasons.map(reason => <span key={reason}>{reason}</span>)}</span> : null}
                      {active ? <span className="recommendation-card__summary">{candidate.summary}</span> : null}
                    </span>
                  </button>
                  <div className="recommendation-card__actions"><button className={`primary-button ${added ? 'is-success' : ''}`} type="button" onClick={() => chooseCandidate(candidate)} disabled={added}>{added ? <><Check size={18} aria-hidden="true" />コースに追加済み</> : <>この店をコースへ<ArrowRight size={17} aria-hidden="true" /></>}</button><Link href={`/stores/${candidate.id}`} className="secondary-button">詳細を見る</Link></div>
                </article>
              );
            })}
          </div>
          <div className="recommendation-map" aria-label="候補の位置"><HomeRecommendationMap candidates={mapCandidates} selectedId={selected?.id} onSelect={setSelectedId} /></div>
          </>
          )}
        </section>
      </div>
    </div>
  );
}
