import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();
pptx.layout  = 'LAYOUT_WIDE';
pptx.author  = 'NexusAI';
pptx.title   = '神戸立ち飲みマップ 投資家向けピッチデック 2026';

// Colors
const NAVY  = '0D1B2A';
const GOLD  = 'C8970A';
const LGOLD = 'F0C040';
const GRAY  = '8899AA';
const WHITE = 'FFFFFF';
const DARK2 = '1A2F4A';

// Helpers
const bg = (s, color) =>
  s.addShape(pptx.ShapeType.rect, { x:0, y:0, w:'100%', h:'100%', fill:{ color } });

const tag = (s, text) =>
  s.addText(text, { x:0.5, y:0.38, w:12, h:0.3, fontSize:9, bold:true, color:GOLD, charSpacing:3, fontFace:'Meiryo' });

const line = (s, x, y, w=0.8) =>
  s.addShape(pptx.ShapeType.rect, { x, y, w, h:0.055, fill:{ color:GOLD } });

const num = (s, n) =>
  s.addText(`${String(n).padStart(2,'0')} / 11`, {
    x:12.0, y:7.1, w:1.1, h:0.28, fontSize:9, color:'334455', align:'right', fontFace:'Arial',
  });

const panel = (s, x, y, w, h, fillColor='0A1520', borderColor='1A2A3A') =>
  s.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h,
    fill:{ color:fillColor },
    line:{ color:borderColor, width:0.75 },
    rectRadius:0.12,
  });

// =============================================
// 01  表紙
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);

  tag(s, '投資家向けピッチデック  2026');

  s.addText('神戸', { x:0.5, y:0.75, w:11, h:1.1, fontSize:62, bold:true, color:LGOLD, fontFace:'Meiryo' });
  s.addText('立ち飲みマップ', { x:0.5, y:1.75, w:11, h:1.1, fontSize:52, bold:true, color:WHITE, fontFace:'Meiryo' });
  s.addText('AIチャットで「今夜どこ行く？」に答える 神戸三宮・元町エリア 立ち飲み発見サービス', {
    x:0.5, y:2.85, w:10, h:0.55, fontSize:13, color:GRAY, fontFace:'Meiryo',
  });

  line(s, 0.5, 3.55);

  s.addText('立ち飲み文化をテクノロジーでアップデート。\n地元住民からインバウンド観光客まで、神戸の夜を案内するAIガイド。', {
    x:0.5, y:3.75, w:9, h:1.0, fontSize:13, color:'CCCCCC', lineSpacingMultiple:1.6, fontFace:'Meiryo',
  });

  panel(s, 0.5, 5.1, 4.2, 0.55, NAVY, GOLD);
  s.addText('kobe-guide.vercel.app', {
    x:0.5, y:5.1, w:4.2, h:0.55, fontSize:13, color:GOLD, align:'center', fontFace:'Arial',
  });

  s.addText('KOBE', {
    x:8.5, y:1.5, w:4.5, h:5.5, fontSize:130, bold:true, color:'FFFFFF',
    transparency:93, align:'center', fontFace:'Arial',
  });

  num(s, 1);
}

// =============================================
// 02  課題
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, '課題');

  s.addText('神戸の「立ち飲み文化」は\nまだ誰にも届いていない', {
    x:0.5, y:0.7, w:12, h:1.4, fontSize:28, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Meiryo',
  });
  line(s, 0.5, 2.0);

  const cards = [
    { title:'[ 1 ]  情報が散在', body:'神戸の立ち飲み情報はSNS・食べログ・口コミに分散。「今夜どこへ行けばいい？」に答えるサービスが存在しない。' },
    { title:'[ 2 ]  インバウンド障壁', body:'訪日外国人は言語バリアで立ち飲み文化に入れない。看板も読めず、店員とも話せず、入口で諦める。' },
    { title:'[ 3 ]  小規模店舗の集客難', body:'個人経営の立ち飲み店はSNS運用に時間を割けない。広告費もかけられず、新規客の獲得手段がない。' },
  ];

  cards.forEach((c, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 2.2, 4.05, 4.8, '0A1520', '1A2A3A');
    s.addText(c.title, { x:x+0.2, y:2.45, w:3.65, h:0.5, fontSize:13, bold:true, color:LGOLD, fontFace:'Meiryo' });
    s.addText(c.body,  { x:x+0.2, y:3.1,  w:3.65, h:3.5, fontSize:12, color:'CCCCCC', lineSpacingMultiple:1.6, fontFace:'Meiryo' });
  });

  num(s, 2);
}

// =============================================
// 03  解決策
// =============================================
{
  const s = pptx.addSlide();
  bg(s, DARK2);
  tag(s, '解決策');

  s.addText('AIが神戸の夜の\n「ナビゲーター」になる', {
    x:0.5, y:0.7, w:8.5, h:1.4, fontSize:28, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Meiryo',
  });
  line(s, 0.5, 2.0);

  const sols = [
    { n:'1', title:'自然言語で探せるAIチャット', body:'「予算2,000円で一人でふらっと入れる店」を会話で即座に提案。Claude Sonnet 4.6搭載。' },
    { n:'2', title:'5言語対応（日・英・中・韓）', body:'送信メッセージの言語を自動検出。インバウンド旅行者が母国語でアクセスできる。' },
    { n:'3', title:'地図＋詳細フィルター', body:'エリア／予算／ソロOK／NEWなどで絞り込み。現在地からの距離表示対応。' },
  ];

  sols.forEach((sol, i) => {
    const y = 2.3 + i * 1.45;
    s.addShape(pptx.ShapeType.ellipse, { x:0.5, y, w:0.55, h:0.55, fill:{ color:GOLD } });
    s.addText(sol.n, { x:0.5, y, w:0.55, h:0.55, fontSize:18, bold:true, color:NAVY, align:'center', fontFace:'Arial' });
    s.addText(sol.title, { x:1.25, y:y+0.04, w:7.5, h:0.38, fontSize:15, bold:true, color:WHITE, fontFace:'Meiryo' });
    s.addText(sol.body,  { x:1.25, y:y+0.44, w:7.5, h:0.65, fontSize:12, color:GRAY, lineSpacingMultiple:1.4, fontFace:'Meiryo' });
    if (i < 2) s.addShape(pptx.ShapeType.rect, { x:0.5, y:y+1.28, w:9.5, h:0.02, fill:{ color:'2A3A4A' } });
  });

  panel(s, 9.8, 1.4, 3.2, 5.9, '1A1000', GOLD);
  s.addText('KOBE\nNIGHT\nGUIDE', {
    x:9.8, y:1.8, w:3.2, h:2.2, fontSize:34, bold:true, color:LGOLD,
    align:'center', lineSpacingMultiple:1.3, fontFace:'Arial',
  });
  s.addText('「今夜どこ行く？」\nAIに聞けば、\n神戸の夜が開く。', {
    x:9.9, y:4.1, w:3.0, h:2.2, fontSize:12, color:WHITE,
    align:'center', lineSpacingMultiple:1.7, fontFace:'Meiryo',
  });
  s.addText('kobe-guide.vercel.app', {
    x:9.8, y:6.55, w:3.2, h:0.4, fontSize:10, color:GOLD, align:'center', fontFace:'Arial',
  });

  num(s, 3);
}

// =============================================
// 04  プロダクト
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'プロダクト');

  s.addText('3つのコア機能 — シームレスな体験', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:24, bold:true, color:WHITE, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.28);

  const screens = [
    { title:'AIチャット',   sub:'Claude Sonnet 4.6搭載',  body:'会話するだけでその日の気分・人数・予算に合った店を即レコメンド。内部メモを学習したAIが的確に案内する。' },
    { title:'店舗一覧',     sub:'90店舗登録済み',           body:'エリア・カテゴリ・予算・ソロOK・NEWなど多彩なフィルター。リスト表示と地図表示をワンタップで切り替え。' },
    { title:'マップビュー', sub:'GPS位置情報対応',           body:'Leafletベースの地図に店舗ピンを表示。現在地から近い順にソート。Google Mapsリンク完備。' },
  ];

  screens.forEach((sc, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 1.7, 4.05, 5.3, '0A1520', GOLD);
    s.addText(sc.title, { x:x+0.2, y:2.1, w:3.65, h:0.55, fontSize:18, bold:true, color:LGOLD, fontFace:'Meiryo' });
    s.addText(sc.sub,   { x:x+0.2, y:2.65, w:3.65, h:0.38, fontSize:10, color:GOLD, fontFace:'Meiryo' });
    s.addShape(pptx.ShapeType.rect, { x:x+0.2, y:3.05, w:3.65, h:0.02, fill:{ color:'1A2A3A' } });
    s.addText(sc.body,  { x:x+0.2, y:3.2, w:3.65, h:3.3, fontSize:12, color:'CCCCCC', lineSpacingMultiple:1.6, fontFace:'Meiryo' });
  });

  s.addText('ライブデモ:  kobe-guide.vercel.app', {
    x:0, y:7.15, w:13.3, h:0.28, fontSize:11, color:GRAY, align:'center', fontFace:'Meiryo',
  });

  num(s, 4);
}

// =============================================
// 05  市場規模
// =============================================
{
  const s = pptx.addSlide();
  bg(s, '1A1000');
  tag(s, '市場機会');

  s.addText('巨大市場  x  ニッチ特化アプローチ', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:26, bold:true, color:WHITE, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.28);

  const mkts = [
    { num:'3,200万人+', label:'神戸への年間来訪者数', sub:'コロナ前ピーク（2019年）' },
    { num:'500万人+',   label:'兵庫県インバウンド観光客', sub:'年間（回復中）' },
    { num:'5万店+',     label:'全国の立ち飲み店数', sub:'神戸市内だけで200店以上' },
  ];

  mkts.forEach((m, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 1.7, 4.05, 3.1, '1A0800', '3D2800');
    s.addText(m.num,   { x, y:2.0, w:4.05, h:1.2, fontSize:36, bold:true, color:LGOLD, align:'center', fontFace:'Meiryo' });
    s.addText(m.label, { x, y:3.1, w:4.05, h:0.5, fontSize:12, color:WHITE, align:'center', fontFace:'Meiryo' });
    s.addText(m.sub,   { x, y:3.6, w:4.05, h:0.35, fontSize:10, color:GRAY, align:'center', fontFace:'Meiryo' });
  });

  panel(s, 0.4, 5.1, 12.5, 2.0, '1A0D00', GOLD);

  const phases = [
    { label:'現在', title:'神戸フォーカス', desc:'三宮・元町エリア\n立ち飲み特化' },
    { label:'次のステップ', title:'関西圏への展開', desc:'大阪・京都・奈良\n横展開' },
    { label:'将来', title:'全国・グローバル', desc:'日本の夜遊び\nガイドプラットフォーム' },
  ];

  phases.forEach((p, i) => {
    const x = 0.9 + i * 4.2;
    s.addText(p.label, { x, y:5.25, w:3.5, h:0.3, fontSize:9, bold:true, color:GOLD, fontFace:'Meiryo' });
    s.addText(p.title, { x, y:5.55, w:3.5, h:0.4, fontSize:14, bold:true, color:WHITE, fontFace:'Meiryo' });
    s.addText(p.desc,  { x, y:5.95, w:3.5, h:0.8, fontSize:11, color:GRAY, lineSpacingMultiple:1.4, fontFace:'Meiryo' });
    if (i < 2) s.addText('-->', { x:x+3.5, y:5.7, w:0.7, h:0.6, fontSize:18, bold:true, color:GOLD, align:'center', fontFace:'Arial' });
  });

  num(s, 5);
}

// =============================================
// 06  ビジネスモデル
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'ビジネスモデル');

  s.addText('3段階の収益モデルで\n安定した収益化を実現', {
    x:0.5, y:0.65, w:8.5, h:1.4, fontSize:26, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.9);

  const tiers = [
    { label:'収益1', title:'プレミアム掲載（店舗向け）', desc:'上位表示・写真強調・バッジ・AI優先推薦', price:'月額 5,000円〜', fill:'1A1000', border:GOLD },
    { label:'収益2', title:'バナー・スポット広告',        desc:'チャット返答内および店舗一覧ページへのネイティブ広告',    price:'月額 30,000円〜', fill:'0F1E2A', border:'2A3A4A' },
    { label:'収益3', title:'観光協会・自治体パートナー', desc:'神戸市・兵庫県観光局との共同コンテンツ制作',              price:'応相談',  fill:'0A1418', border:'1A2A30' },
  ];

  tiers.forEach((t, i) => {
    const y = 2.2 + i * 1.4;
    panel(s, 0.5, y, 8.6, 1.25, t.fill, t.border);
    s.addText(t.label, { x:0.7, y:y+0.12, w:1.1, h:0.45, fontSize:10, bold:true, color:GOLD, fontFace:'Meiryo' });
    s.addText(t.title, { x:1.9, y:y+0.1, w:5.0, h:0.44, fontSize:15, bold:true, color:WHITE, fontFace:'Meiryo' });
    s.addText(t.desc,  { x:1.9, y:y+0.55, w:5.0, h:0.44, fontSize:11, color:GRAY, fontFace:'Meiryo' });
    s.addText(t.price, { x:7.0, y:y+0.28, w:1.9, h:0.5, fontSize:14, bold:true, color:LGOLD, align:'right', fontFace:'Meiryo' });
  });

  panel(s, 9.3, 1.4, 3.8, 6.0, '1A1000', GOLD);
  s.addText('MRR試算\n（50店舗時）', {
    x:9.4, y:1.65, w:3.6, h:0.8, fontSize:12, color:GRAY, align:'center', lineSpacingMultiple:1.4, fontFace:'Meiryo',
  });
  s.addText('50万円', {
    x:9.3, y:2.55, w:3.8, h:0.9, fontSize:44, bold:true, color:LGOLD, align:'center', fontFace:'Meiryo',
  });
  s.addText('/ 月（想定）', {
    x:9.3, y:3.45, w:3.8, h:0.4, fontSize:11, color:GRAY, align:'center', fontFace:'Meiryo',
  });
  s.addShape(pptx.ShapeType.rect, { x:9.6, y:4.0, w:3.2, h:0.03, fill:{ color:'2A2000' } });
  s.addText('プレミアム 50店x5千円\n= 25万円\n\n広告枠 10枠x2.5万円\n= 25万円', {
    x:9.5, y:4.2, w:3.4, h:2.8, fontSize:11, color:'AAAAAA', lineSpacingMultiple:1.6, fontFace:'Meiryo',
  });

  num(s, 6);
}

// =============================================
// 07  進捗・トラクション
// =============================================
{
  const s = pptx.addSlide();
  bg(s, DARK2);
  tag(s, '進捗・トラクション');

  s.addText('MVP完成 — 本番稼働中', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:26, bold:true, color:WHITE, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.28);

  const metrics = [
    { num:'90',   label:'登録店舗数',      note:'Google Places API\n+ AI強化データ' },
    { num:'5',    label:'対応言語数',       note:'日・英・中（繁）\n中（簡）・韓' },
    { num:'100%', label:'MVP完成度',        note:'Vercelで本番デプロイ\n今日からデモ可能' },
  ];

  metrics.forEach((m, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 1.65, 4.05, 3.1, '0A1520', '1A2A3A');
    s.addText(m.num,   { x, y:1.85, w:4.05, h:1.2, fontSize:52, bold:true, color:LGOLD, align:'center', fontFace:'Arial' });
    s.addText(m.label, { x, y:3.0, w:4.05, h:0.45, fontSize:14, color:WHITE, align:'center', fontFace:'Meiryo' });
    s.addText(m.note,  { x, y:3.45, w:4.05, h:0.8, fontSize:10.5, color:GRAY, align:'center', lineSpacingMultiple:1.4, fontFace:'Meiryo' });
  });

  const checks = [
    '[完了]  AIチャット（Claude Sonnet 4.6）— 稼働中',
    '[完了]  店舗一覧 / マップ / フィルター — 実装済み',
    '[完了]  ユーザー認証 / お気に入り / 訪問ログ',
    '[完了]  管理パネル（店舗管理＋アナリティクス）',
    '[完了]  セキュリティ（APIキー完全サーバー分離）',
    '[完了]  Vercel本番稼働: kobe-guide.vercel.app',
  ];

  checks.forEach((c, i) => {
    const x = 0.4 + (i < 3 ? 0 : 6.5);
    const y = 4.95 + (i % 3) * 0.55;
    panel(s, x, y, 6.2, 0.46, '0A1520', '1A2A3A');
    s.addText(c, { x:x+0.15, y, w:5.9, h:0.46, fontSize:12, color:'CCCCCC', fontFace:'Meiryo' });
  });

  num(s, 7);
}

// =============================================
// 08  技術スタック
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, '技術スタック');

  s.addText('モダンなスタックで\nスケールに備える', {
    x:0.5, y:0.65, w:8.5, h:1.35, fontSize:28, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.88);

  const techs = [
    { name:'Next.js 16',        desc:'App Router / SSR / Edge' },
    { name:'Claude Sonnet 4.6', desc:'Anthropic API / AIチャット' },
    { name:'Supabase',          desc:'PostgreSQL + Auth + RLS' },
    { name:'Leaflet',           desc:'インタラクティブマップ' },
    { name:'Google Places',     desc:'店舗データ＋写真' },
    { name:'Vercel',            desc:'エッジデプロイ / CDN' },
  ];

  techs.forEach((t, i) => {
    const x = 0.5 + (i % 2) * 4.2;
    const y = 2.2 + Math.floor(i / 2) * 1.38;
    panel(s, x, y, 4.0, 1.2, '0A1520', '1A2A3A');
    s.addText(t.name, { x:x+0.25, y:y+0.15, w:3.5, h:0.45, fontSize:14, bold:true, color:WHITE, fontFace:'Arial' });
    s.addText(t.desc, { x:x+0.25, y:y+0.62, w:3.5, h:0.38, fontSize:11, color:GRAY, fontFace:'Meiryo' });
  });

  panel(s, 9.1, 1.4, 4.0, 6.1, '1A1000', GOLD);
  s.addText('競合優位性', {
    x:9.2, y:1.6, w:3.8, h:0.38, fontSize:11, bold:true, color:GOLD,
    align:'center', fontFace:'Meiryo',
  });

  const edges = [
    '立ち飲みニッチ x AI の組合せ',
    'インバウンド多言語対応',
    'APIキーを完全サーバーサイド化',
    '店舗管理＋アナリティクス内蔵',
    '限界費用ゼロでスケール可能',
  ];
  edges.forEach((e, i) => {
    s.addText(e, {
      x:9.3, y:2.25 + i * 0.9, w:3.6, h:0.65,
      fontSize:12, color:'DDDDDD', lineSpacingMultiple:1.4, fontFace:'Meiryo',
    });
  });

  num(s, 8);
}

// =============================================
// 09  ロードマップ
// =============================================
{
  const s = pptx.addSlide();
  bg(s, DARK2);
  tag(s, 'ロードマップ');

  s.addText('神戸から — 日本全国の夜へ', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:26, bold:true, color:WHITE, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.28);

  const roadmap = [
    { col:0, title:'MVP本番ローンチ',      tag:'完了',     tagFill:'1A1000', body:'AIチャット / 店舗一覧 / マップ / 管理パネル' },
    { col:0, title:'有料掲載プラン開始',   tag:'2026 Q2',  tagFill:'003A00', body:'店舗へのプレミアムプランの営業・販売' },
    { col:0, title:'SEO / 流入拡大',       tag:'2026 Q2',  tagFill:'003A00', body:'「神戸 立ち飲み」検索でトップランクを狙う' },
    { col:1, title:'大阪・京都への展開',   tag:'2026 Q3',  tagFill:'001A3A', body:'関西主要都市への横展開' },
    { col:1, title:'予約・クーポン機能',   tag:'2026 Q3',  tagFill:'001A3A', body:'紹介手数料モデルの追加' },
    { col:1, title:'B2B APIライセンス',    tag:'2026 Q4',  tagFill:'1A001A', body:'旅行会社・ホテル向けAPIの提供' },
  ];

  s.addText('2026 Q1-Q2  --  神戸フェーズ', {
    x:0.5, y:1.6, w:6, h:0.38, fontSize:11, bold:true, color:GOLD, fontFace:'Meiryo',
  });
  s.addText('2026 Q3-Q4  --  展開フェーズ', {
    x:6.8, y:1.6, w:6, h:0.38, fontSize:11, bold:true, color:GOLD, fontFace:'Meiryo',
  });

  roadmap.forEach((item, i) => {
    const x = item.col === 0 ? 0.5 : 6.8;
    const idx = i % 3;
    const y = 2.2 + idx * 1.62;

    const isDone = item.tag === '完了';
    s.addShape(pptx.ShapeType.ellipse, {
      x:x+0.1, y:y+0.1, w:0.42, h:0.42,
      fill:{ color: isDone ? GOLD : '1A2A3A' },
      line:{ color:GOLD, width:1 },
    });
    if (!isDone) {
      s.addShape(pptx.ShapeType.ellipse, { x:x+0.2, y:y+0.2, w:0.22, h:0.22, fill:{ color:GOLD, transparency:50 } });
    }

    s.addText(item.title, {
      x:x+0.7, y:y+0.06, w:4.0, h:0.38, fontSize:14, bold:true, color:WHITE, fontFace:'Meiryo',
    });
    panel(s, x+4.0, y+0.06, 1.55, 0.3, item.tagFill, GOLD);
    s.addText(item.tag, {
      x:x+4.0, y:y+0.06, w:1.55, h:0.3, fontSize:9, bold:true, color:LGOLD, align:'center', fontFace:'Meiryo',
    });
    s.addText(item.body, {
      x:x+0.7, y:y+0.48, w:4.9, h:0.45, fontSize:11.5, color:GRAY, fontFace:'Meiryo',
    });
    if (idx < 2) {
      s.addShape(pptx.ShapeType.rect, { x:x+0.28, y:y+0.53, w:0.05, h:1.0, fill:{ color:'2A3A4A' } });
    }
  });

  num(s, 9);
}

// =============================================
// 10  資金調達
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, '資金調達');

  s.addText('投資家への提案', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:28, bold:true, color:WHITE, fontFace:'Meiryo',
  });
  line(s, 0.5, 1.28);

  s.addText('TBD', {
    x:0.5, y:1.45, w:5.5, h:1.6, fontSize:90, bold:true, color:LGOLD, fontFace:'Arial',
  });
  s.addText('調達金額（詳細は別途ご相談）', {
    x:0.5, y:3.0, w:6, h:0.45, fontSize:13, color:GRAY, fontFace:'Meiryo',
  });

  s.addText('資金使途', {
    x:0.5, y:3.7, w:8, h:0.4, fontSize:11, bold:true, color:GOLD, charSpacing:2, fontFace:'Meiryo',
  });

  const uses = [
    { label:'エンジニアリング・採用', pct:40 },
    { label:'マーケティング',         pct:30 },
    { label:'関西圏への展開',         pct:20 },
    { label:'インフラ・運営',         pct:10 },
  ];

  uses.forEach((u, i) => {
    const y = 4.25 + i * 0.68;
    s.addText(u.label, { x:0.5, y, w:2.8, h:0.5, fontSize:13, color:WHITE, fontFace:'Meiryo' });
    s.addShape(pptx.ShapeType.roundRect, { x:3.5, y:y+0.16, w:5.5, h:0.2, fill:{ color:'1A2A3A' }, rectRadius:0.06 });
    s.addShape(pptx.ShapeType.roundRect, { x:3.5, y:y+0.16, w:5.5*(u.pct/100), h:0.2, fill:{ color:GOLD }, rectRadius:0.06 });
    s.addText(`${u.pct}%`, { x:9.2, y, w:0.8, h:0.5, fontSize:14, bold:true, color:LGOLD, align:'right', fontFace:'Arial' });
  });

  panel(s, 9.5, 1.4, 3.6, 5.9, '1A1000', GOLD);
  s.addText('なぜ投資すべきか', {
    x:9.6, y:1.65, w:3.4, h:0.4, fontSize:11, bold:true, color:GOLD, align:'center', fontFace:'Meiryo',
  });
  const vals = [
    '日本初の立ち飲みAIガイド',
    'インバウンド回復の追い風',
    'MVP稼働済み・スケール準備完了',
    '小さく始めて全国展開へ',
    'AI×地域知識の参入障壁',
  ];
  vals.forEach((v, i) => {
    s.addText(v, {
      x:9.6, y:2.3 + i * 0.9, w:3.4, h:0.65,
      fontSize:12, color:'DDDDDD', lineSpacingMultiple:1.4, fontFace:'Meiryo',
    });
  });

  num(s, 10);
}

// =============================================
// 11  連絡先
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  s.addShape(pptx.ShapeType.ellipse, {
    x:5.5, y:0.5, w:9, h:7, fill:{ color:'1A0800', transparency:40 },
  });

  tag(s, '連絡先');

  s.addText('神戸の夜を、一緒に変えよう。', {
    x:0, y:1.2, w:13.3, h:1.0, fontSize:40, bold:true, color:WHITE,
    align:'center', fontFace:'Meiryo',
  });
  s.addText('Let\'s change Kobe\'s night --- together.', {
    x:0, y:2.3, w:13.3, h:0.8, fontSize:22, bold:true, color:LGOLD,
    align:'center', fontFace:'Arial',
  });

  s.addShape(pptx.ShapeType.rect, { x:5.5, y:3.35, w:2.3, h:0.06, fill:{ color:GOLD } });

  s.addText('kobe-guide.vercel.app', {
    x:0, y:3.9, w:13.3, h:0.6, fontSize:18, color:'CCCCCC', align:'center', fontFace:'Arial',
  });

  panel(s, 3.8, 5.1, 5.7, 0.75, GOLD, GOLD);
  s.addText('ライブデモを見る  --  kobe-guide.vercel.app', {
    x:3.8, y:5.1, w:5.7, h:0.75, fontSize:12, bold:true, color:NAVY, align:'center', fontFace:'Meiryo',
  });

  s.addText('KOBE', {
    x:0, y:0.5, w:13.3, h:7, fontSize:200, bold:true, color:WHITE,
    transparency:95, align:'center', fontFace:'Arial',
  });

  num(s, 11);
}

// =============================================
// WRITE
// =============================================
await pptx.writeFile({ fileName: 'pitch-deck-ja.pptx' });
console.log('pitch-deck-ja.pptx generated');
