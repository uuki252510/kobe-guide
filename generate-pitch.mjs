import PptxGenJS from 'pptxgenjs';

const pptx = new PptxGenJS();
pptx.layout  = 'LAYOUT_WIDE';
pptx.author  = 'NexusAI';
pptx.title   = '神戸立ち飲みマップ Investor Pitch Deck 2026';

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
  s.addText(text, { x:0.5, y:0.38, w:12, h:0.3, fontSize:9, bold:true, color:GOLD, charSpacing:3, fontFace:'Arial' });

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
// 01  COVER
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);

  tag(s, 'INVESTOR PITCH DECK  2026');

  s.addText('Kobe', { x:0.5, y:0.75, w:11, h:1.1, fontSize:62, bold:true, color:LGOLD, fontFace:'Arial' });
  s.addText('Tachinomi Map', { x:0.5, y:1.75, w:11, h:1.1, fontSize:62, bold:true, color:WHITE, fontFace:'Arial' });
  s.addText('Kobe\'s AI-Powered Standing Bar Guide', {
    x:0.5, y:2.85, w:9, h:0.45, fontSize:15, color:GRAY, charSpacing:1, fontFace:'Arial',
  });

  line(s, 0.5, 3.45);

  s.addText('AI Chat de "Konya doko iku?" ni kotaeru\nKobe Sannomiya-Motomachi eria no tachinomi hakken service', {
    x:0.5, y:3.65, w:9, h:1.0, fontSize:13, color:'CCCCCC', lineSpacingMultiple:1.5, fontFace:'Meiryo',
  });

  panel(s, 0.5, 5.1, 3.8, 0.55, NAVY, GOLD);
  s.addText('kobe-guide.vercel.app', {
    x:0.5, y:5.1, w:3.8, h:0.55, fontSize:13, color:GOLD, align:'center', fontFace:'Arial',
  });

  // Anchor watermark (text only, no emoji)
  s.addText('Kobe', {
    x:8.5, y:1.5, w:4.5, h:5.5, fontSize:130, bold:true, color:'FFFFFF',
    transparency:93, align:'center', fontFace:'Arial',
  });

  num(s, 1);
}

// =============================================
// 02  PROBLEM
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'PROBLEM');

  s.addText('Kobe no "Tachinomi Bunka" wa\nmada dareni mo todoite inai', {
    x:0.5, y:0.7, w:12, h:1.4, fontSize:26, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Meiryo',
  });
  line(s, 0.5, 2.0);

  const cards = [
    { title:'[ 1 ]  Joho ga Sanzan', body:'Kobe no tachinomi joho wa SNS / Tabelog / kuchikomi ni bunsan. "Konya doko ikeba ii?" ni kotaeru service ga sonzai shinai.' },
    { title:'[ 2 ]  Inbound Kabe',   body:'Houichi gaikokujin wa gengo barrier de tachinomi bunka ni hairenai. Kanban mo yomezu, ten\'in to mo hanasenai.' },
    { title:'[ 3 ]  Shoten no Kyaku-nan', body:'Shokibo tachinomi-ten wa SNS un\'yo ni jikan wo sakenai. Koukoku-hi wo kakerarenai.' },
  ];

  cards.forEach((c, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 2.2, 4.05, 4.8, '0A1520', '1A2A3A');
    s.addText(c.title, { x:x+0.2, y:2.45, w:3.65, h:0.5, fontSize:14, bold:true, color:LGOLD, fontFace:'Arial' });
    s.addText(c.body,  { x:x+0.2, y:3.1,  w:3.65, h:3.5, fontSize:12, color:'CCCCCC', lineSpacingMultiple:1.6, fontFace:'Meiryo' });
  });

  num(s, 2);
}

// =============================================
// 03  SOLUTION
// =============================================
{
  const s = pptx.addSlide();
  bg(s, DARK2);
  tag(s, 'SOLUTION');

  s.addText('AI ga Kobe no Yoru no\n"Navigator" ni Naru', {
    x:0.5, y:0.7, w:8.5, h:1.4, fontSize:28, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Meiryo',
  });
  line(s, 0.5, 2.0);

  const sols = [
    { n:'1', title:'Shizen Gengo de Sagaseru AI Chat', body:'"Yosan 2000-en de hitori de furatto haireru mise" wo kaiwa de sokuto. Claude Sonnet 4.6 tosai.' },
    { n:'2', title:'5 Gengo Taiou (JP / EN / ZH / KO)',  body:'Okutta message no gengo wo jido-kenshutsu. Inbound ryoko-sha ga bokokugo de access dekiru.' },
    { n:'3', title:'Map + Shousai Filter',               body:'Area / yosan / solo-ka / NEW nado de shibo-komi. Genzaichi kara no kyori hyoji taiou.' },
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
  s.addText('"Konya doko iku?"\nAI ni kikeba,\nKobe no yoru ga hiraku.', {
    x:9.9, y:4.1, w:3.0, h:2.2, fontSize:12, color:WHITE,
    align:'center', lineSpacingMultiple:1.7, fontFace:'Meiryo',
  });
  s.addText('kobe-guide.vercel.app', {
    x:9.8, y:6.55, w:3.2, h:0.4, fontSize:10, color:GOLD, align:'center', fontFace:'Arial',
  });

  num(s, 3);
}

// =============================================
// 04  PRODUCT
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'PRODUCT');

  s.addText('3 Core Features — Seamless Experience', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:24, bold:true, color:WHITE, fontFace:'Arial',
  });
  line(s, 0.5, 1.28);

  const screens = [
    { title:'AI CHAT',      sub:'Claude Sonnet 4.6',   body:'Kaiwa suru dake de sono hi no kibun / ninzu / yosan ni atta mise wo soku-recommend. Naibu memo wo gakushuu shita AI ga tekikaku ni annai.' },
    { title:'STORE LIST',   sub:'90 stores registered', body:'Area / category / yosan / solo-OK / NEW nado tasai na filter. List hyoji to Map hyoji wo one-tap de kirikae.' },
    { title:'MAP VIEW',     sub:'GPS location support', body:'Leaflet base no chizu ni store pin wo hyoji. Genzaichi kara chikajun ni sort. Google Maps link kanbi.' },
  ];

  screens.forEach((sc, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 1.7, 4.05, 5.3, '0A1520', GOLD);
    s.addText(sc.title, { x:x+0.2, y:2.1, w:3.65, h:0.55, fontSize:18, bold:true, color:LGOLD, fontFace:'Arial' });
    s.addText(sc.sub,   { x:x+0.2, y:2.65, w:3.65, h:0.38, fontSize:10, color:GOLD, fontFace:'Arial' });
    s.addShape(pptx.ShapeType.rect, { x:x+0.2, y:3.05, w:3.65, h:0.02, fill:{ color:'1A2A3A' } });
    s.addText(sc.body,  { x:x+0.2, y:3.2, w:3.65, h:3.3, fontSize:12, color:'CCCCCC', lineSpacingMultiple:1.6, fontFace:'Meiryo' });
  });

  s.addText('Live Demo:  kobe-guide.vercel.app', {
    x:0, y:7.15, w:13.3, h:0.28, fontSize:11, color:GRAY, align:'center', fontFace:'Arial',
  });

  num(s, 4);
}

// =============================================
// 05  MARKET SIZE
// =============================================
{
  const s = pptx.addSlide();
  bg(s, '1A1000');
  tag(s, 'MARKET OPPORTUNITY');

  s.addText('Massive Market  x  Niche Approach', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:26, bold:true, color:WHITE, fontFace:'Arial',
  });
  line(s, 0.5, 1.28);

  const mkts = [
    { num:'32M+', label:'Annual visitors to Kobe', sub:'Pre-COVID peak (2019)' },
    { num:'5M+',  label:'Inbound tourists in Hyogo', sub:'Annual (recovering)' },
    { num:'50K+', label:'Standing bars nationwide', sub:'200+ in Kobe alone' },
  ];

  mkts.forEach((m, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 1.7, 4.05, 3.1, '1A0800', '3D2800');
    s.addText(m.num,   { x, y:2.0, w:4.05, h:1.2, fontSize:46, bold:true, color:LGOLD, align:'center', fontFace:'Arial' });
    s.addText(m.label, { x, y:3.1, w:4.05, h:0.5, fontSize:13, color:WHITE, align:'center', fontFace:'Meiryo' });
    s.addText(m.sub,   { x, y:3.6, w:4.05, h:0.35, fontSize:10, color:GRAY, align:'center', fontFace:'Arial' });
  });

  panel(s, 0.4, 5.1, 12.5, 2.0, '1A0D00', GOLD);

  const phases = [
    { label:'TODAY', title:'Kobe Focus', desc:'Sannomiya-Motomachi\nTachinomi specialized' },
    { label:'NEXT',  title:'Kansai Expansion', desc:'Osaka / Kyoto / Nara\nHorizontal rollout' },
    { label:'FUTURE',title:'Nationwide / Global', desc:'Japan night-out\nguide platform' },
  ];

  phases.forEach((p, i) => {
    const x = 0.9 + i * 4.2;
    s.addText(p.label, { x, y:5.25, w:3.5, h:0.3, fontSize:9, bold:true, color:GOLD, charSpacing:2, fontFace:'Arial' });
    s.addText(p.title, { x, y:5.55, w:3.5, h:0.4, fontSize:14, bold:true, color:WHITE, fontFace:'Arial' });
    s.addText(p.desc,  { x, y:5.95, w:3.5, h:0.8, fontSize:11, color:GRAY, lineSpacingMultiple:1.4, fontFace:'Meiryo' });
    if (i < 2) s.addText('-->', { x:x+3.5, y:5.7, w:0.7, h:0.6, fontSize:18, bold:true, color:GOLD, align:'center', fontFace:'Arial' });
  });

  num(s, 5);
}

// =============================================
// 06  BUSINESS MODEL
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'BUSINESS MODEL');

  s.addText('3-Tier Revenue Model\nfor Stable Monetization', {
    x:0.5, y:0.65, w:8.5, h:1.4, fontSize:26, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Arial',
  });
  line(s, 0.5, 1.9);

  const tiers = [
    { label:'TIER 1', title:'Premium Listing (Stores)', desc:'Top placement / photo boost / badge / AI recommend priority', price:'JPY 5,000+/mo', fill:'1A1000', border:GOLD },
    { label:'TIER 2', title:'Banner / Spot Ads',        desc:'Native ads inside chat replies and store list pages',           price:'JPY 30,000+/mo', fill:'0F1E2A', border:'2A3A4A' },
    { label:'TIER 3', title:'Tourism Board Partnership', desc:'Co-content with Kobe City / Hyogo Pref. tourism bureau',      price:'Negotiable',  fill:'0A1418', border:'1A2A30' },
  ];

  tiers.forEach((t, i) => {
    const y = 2.2 + i * 1.4;
    panel(s, 0.5, y, 8.6, 1.25, t.fill, t.border);
    s.addText(t.label, { x:0.7, y:y+0.12, w:1.1, h:0.45, fontSize:10, bold:true, color:GOLD, fontFace:'Arial' });
    s.addText(t.title, { x:1.9, y:y+0.1, w:5.0, h:0.44, fontSize:15, bold:true, color:WHITE, fontFace:'Arial' });
    s.addText(t.desc,  { x:1.9, y:y+0.55, w:5.0, h:0.44, fontSize:11, color:GRAY, fontFace:'Meiryo' });
    s.addText(t.price, { x:7.0, y:y+0.28, w:1.9, h:0.5, fontSize:14, bold:true, color:LGOLD, align:'right', fontFace:'Arial' });
  });

  panel(s, 9.3, 1.4, 3.8, 6.0, '1A1000', GOLD);
  s.addText('MRR Estimate\n(50 stores)', {
    x:9.4, y:1.65, w:3.6, h:0.8, fontSize:12, color:GRAY, align:'center', lineSpacingMultiple:1.4, fontFace:'Arial',
  });
  s.addText('JPY 500K', {
    x:9.3, y:2.55, w:3.8, h:0.9, fontSize:38, bold:true, color:LGOLD, align:'center', fontFace:'Arial',
  });
  s.addText('/ month (projected)', {
    x:9.3, y:3.45, w:3.8, h:0.4, fontSize:11, color:GRAY, align:'center', fontFace:'Arial',
  });
  s.addShape(pptx.ShapeType.rect, { x:9.6, y:4.0, w:3.2, h:0.03, fill:{ color:'2A2000' } });
  s.addText('Premium 50 stores x JPY 5K\n= JPY 250,000\n\nAds 10 slots x JPY 25K\n= JPY 250,000', {
    x:9.5, y:4.2, w:3.4, h:2.8, fontSize:11, color:'AAAAAA', lineSpacingMultiple:1.6, fontFace:'Arial',
  });

  num(s, 6);
}

// =============================================
// 07  TRACTION
// =============================================
{
  const s = pptx.addSlide();
  bg(s, DARK2);
  tag(s, 'TRACTION');

  s.addText('Already Running — MVP Live in Production', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:24, bold:true, color:WHITE, fontFace:'Arial',
  });
  line(s, 0.5, 1.28);

  const metrics = [
    { num:'90',   label:'Stores Registered',  note:'Google Places API\n+ AI-enriched data' },
    { num:'5',    label:'Languages Supported', note:'JA / EN / ZH-TW\nZH-CN / KO' },
    { num:'100%', label:'MVP Complete',        note:'Deployed on Vercel\nDemo-ready today' },
  ];

  metrics.forEach((m, i) => {
    const x = 0.4 + i * 4.25;
    panel(s, x, 1.65, 4.05, 3.1, '0A1520', '1A2A3A');
    s.addText(m.num,   { x, y:1.85, w:4.05, h:1.2, fontSize:52, bold:true, color:LGOLD, align:'center', fontFace:'Arial' });
    s.addText(m.label, { x, y:3.0, w:4.05, h:0.45, fontSize:13, color:WHITE, align:'center', fontFace:'Arial' });
    s.addText(m.note,  { x, y:3.45, w:4.05, h:0.8, fontSize:10.5, color:GRAY, align:'center', lineSpacingMultiple:1.4, fontFace:'Meiryo' });
  });

  const checks = [
    '[DONE]  AI Chat (Claude Sonnet 4.6) — Live',
    '[DONE]  Store list / Map / Filters — Implemented',
    '[DONE]  User auth / Favorites / Visit log',
    '[DONE]  Admin panel (Store mgmt + Analytics)',
    '[DONE]  Security (API keys fully server-isolated)',
    '[DONE]  Vercel Production: kobe-guide.vercel.app',
  ];

  checks.forEach((c, i) => {
    const x = 0.4 + (i < 3 ? 0 : 6.5);
    const y = 4.95 + (i % 3) * 0.55;
    panel(s, x, y, 6.2, 0.46, '0A1520', '1A2A3A');
    s.addText(c, { x:x+0.15, y, w:5.9, h:0.46, fontSize:12, color:'CCCCCC', fontFace:'Arial' });
  });

  num(s, 7);
}

// =============================================
// 08  TECHNOLOGY
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'TECHNOLOGY');

  s.addText('Modern Stack,\nBuilt to Scale', {
    x:0.5, y:0.65, w:8.5, h:1.35, fontSize:28, bold:true, color:WHITE,
    lineSpacingMultiple:1.3, fontFace:'Arial',
  });
  line(s, 0.5, 1.88);

  const techs = [
    { name:'Next.js 16',        desc:'App Router / SSR / Edge' },
    { name:'Claude Sonnet 4.6', desc:'Anthropic API / AI Chat' },
    { name:'Supabase',          desc:'PostgreSQL + Auth + RLS' },
    { name:'Leaflet',           desc:'Interactive Map' },
    { name:'Google Places',     desc:'Store data + Photos' },
    { name:'Vercel',            desc:'Edge Deploy / CDN' },
  ];

  techs.forEach((t, i) => {
    const x = 0.5 + (i % 2) * 4.2;
    const y = 2.2 + Math.floor(i / 2) * 1.38;
    panel(s, x, y, 4.0, 1.2, '0A1520', '1A2A3A');
    s.addText(t.name, { x:x+0.25, y:y+0.15, w:3.5, h:0.45, fontSize:14, bold:true, color:WHITE, fontFace:'Arial' });
    s.addText(t.desc, { x:x+0.25, y:y+0.62, w:3.5, h:0.38, fontSize:11, color:GRAY, fontFace:'Arial' });
  });

  panel(s, 9.1, 1.4, 4.0, 6.1, '1A1000', GOLD);
  s.addText('COMPETITIVE EDGE', {
    x:9.2, y:1.6, w:3.8, h:0.38, fontSize:10, bold:true, color:GOLD,
    align:'center', charSpacing:1.5, fontFace:'Arial',
  });

  const edges = [
    'Standing bar niche  x  AI',
    'Multilingual Inbound support',
    'API keys fully server-side',
    'Store mgmt + Analytics built-in',
    'Zero marginal cost to scale',
  ];
  edges.forEach((e, i) => {
    s.addText(e, {
      x:9.3, y:2.25 + i * 0.9, w:3.6, h:0.65,
      fontSize:12, color:'DDDDDD', lineSpacingMultiple:1.4, fontFace:'Arial',
    });
  });

  num(s, 8);
}

// =============================================
// 09  ROADMAP
// =============================================
{
  const s = pptx.addSlide();
  bg(s, DARK2);
  tag(s, 'ROADMAP');

  s.addText('From Kobe — to Every Night in Japan', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:26, bold:true, color:WHITE, fontFace:'Arial',
  });
  line(s, 0.5, 1.28);

  const roadmap = [
    // left column
    { col:0, title:'MVP Production Launch', tag:'DONE',     tagFill:'1A1000', body:'AI chat / Store list / Map / Admin panel' },
    { col:0, title:'Paid Listing Launch',   tag:'Q2 2026',  tagFill:'003A00', body:'Premium plan sales to stores' },
    { col:0, title:'SEO / Traffic Growth',  tag:'Q2 2026',  tagFill:'003A00', body:'Target "Kobe tachinomi" search top rank' },
    // right column
    { col:1, title:'Osaka / Kyoto Expansion', tag:'Q3 2026', tagFill:'001A3A', body:'Horizontal rollout to Kansai cities' },
    { col:1, title:'Booking / Coupon Feature', tag:'Q3 2026', tagFill:'001A3A', body:'Add referral commission model' },
    { col:1, title:'B2B API License',          tag:'Q4 2026', tagFill:'1A001A', body:'API for travel agencies & hotels' },
  ];

  s.addText('2026 Q1-Q2  --  Kobe Phase', {
    x:0.5, y:1.6, w:6, h:0.38, fontSize:11, bold:true, color:GOLD, charSpacing:1, fontFace:'Arial',
  });
  s.addText('2026 Q3-Q4  --  Expansion Phase', {
    x:6.8, y:1.6, w:6, h:0.38, fontSize:11, bold:true, color:GOLD, charSpacing:1, fontFace:'Arial',
  });

  roadmap.forEach((item, i) => {
    const x = item.col === 0 ? 0.5 : 6.8;
    const idx = i % 3;
    const y = 2.2 + idx * 1.62;

    const isDone = item.tag === 'DONE';
    s.addShape(pptx.ShapeType.ellipse, {
      x:x+0.1, y:y+0.1, w:0.42, h:0.42,
      fill:{ color: isDone ? GOLD : '1A2A3A' },
      line:{ color:GOLD, width:1 },
    });
    if (!isDone) {
      s.addShape(pptx.ShapeType.ellipse, { x:x+0.2, y:y+0.2, w:0.22, h:0.22, fill:{ color:GOLD, transparency:50 } });
    }

    s.addText(item.title, {
      x:x+0.7, y:y+0.06, w:4.0, h:0.38, fontSize:14, bold:true, color:WHITE, fontFace:'Arial',
    });
    panel(s, x+4.0, y+0.06, 1.55, 0.3, item.tagFill, GOLD);
    s.addText(item.tag, {
      x:x+4.0, y:y+0.06, w:1.55, h:0.3, fontSize:9, bold:true, color:LGOLD, align:'center', fontFace:'Arial',
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
// 10  ASK
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  tag(s, 'FUNDRAISING ASK');

  s.addText('Investment Ask', {
    x:0.5, y:0.7, w:12, h:0.65, fontSize:28, bold:true, color:WHITE, fontFace:'Arial',
  });
  line(s, 0.5, 1.28);

  s.addText('TBD', {
    x:0.5, y:1.45, w:5.5, h:1.6, fontSize:90, bold:true, color:LGOLD, fontFace:'Arial',
  });
  s.addText('Funding Amount (to be determined)', {
    x:0.5, y:3.0, w:6, h:0.45, fontSize:13, color:GRAY, fontFace:'Arial',
  });

  s.addText('USE OF FUNDS', {
    x:0.5, y:3.7, w:8, h:0.4, fontSize:11, bold:true, color:GOLD, charSpacing:2, fontFace:'Arial',
  });

  const uses = [
    { label:'Engineering / Hiring', pct:40 },
    { label:'Marketing',            pct:30 },
    { label:'Kansai Expansion',     pct:20 },
    { label:'Infra / Operations',   pct:10 },
  ];

  uses.forEach((u, i) => {
    const y = 4.25 + i * 0.68;
    s.addText(u.label, { x:0.5, y, w:2.4, h:0.5, fontSize:13, color:WHITE, fontFace:'Arial' });
    s.addShape(pptx.ShapeType.roundRect, { x:3.1, y:y+0.16, w:5.5, h:0.2, fill:{ color:'1A2A3A' }, rectRadius:0.06 });
    s.addShape(pptx.ShapeType.roundRect, { x:3.1, y:y+0.16, w:5.5*(u.pct/100), h:0.2, fill:{ color:GOLD }, rectRadius:0.06 });
    s.addText(`${u.pct}%`, { x:8.8, y, w:0.8, h:0.5, fontSize:14, bold:true, color:LGOLD, align:'right', fontFace:'Arial' });
  });

  panel(s, 9.5, 1.4, 3.6, 5.9, '1A1000', GOLD);
  s.addText('Why Invest', {
    x:9.6, y:1.65, w:3.4, h:0.4, fontSize:12, bold:true, color:GOLD, align:'center', fontFace:'Arial',
  });
  const vals = [
    'Japan\'s 1st tachinomi AI guide',
    'Inbound recovery tailwind',
    'MVP live, ready to scale',
    'Small start -> nationwide',
    'AI + local knowledge moat',
  ];
  vals.forEach((v, i) => {
    s.addText(v, {
      x:9.6, y:2.3 + i * 0.9, w:3.4, h:0.65,
      fontSize:12, color:'DDDDDD', lineSpacingMultiple:1.4, fontFace:'Arial',
    });
  });

  num(s, 10);
}

// =============================================
// 11  CONTACT
// =============================================
{
  const s = pptx.addSlide();
  bg(s, NAVY);
  s.addShape(pptx.ShapeType.ellipse, {
    x:5.5, y:0.5, w:9, h:7, fill:{ color:'1A0800', transparency:40 },
  });

  tag(s, 'CONTACT');

  s.addText("Let's change Kobe's night", {
    x:0, y:1.2, w:13.3, h:1.0, fontSize:42, bold:true, color:WHITE,
    align:'center', fontFace:'Arial',
  });
  s.addText('--- together. ---', {
    x:0, y:2.2, w:13.3, h:1.0, fontSize:42, bold:true, color:LGOLD,
    align:'center', fontFace:'Arial',
  });

  s.addShape(pptx.ShapeType.rect, { x:5.5, y:3.35, w:2.3, h:0.06, fill:{ color:GOLD } });

  s.addText('kobe-guide.vercel.app', {
    x:0, y:3.9, w:13.3, h:0.6, fontSize:18, color:'CCCCCC', align:'center', fontFace:'Arial',
  });

  panel(s, 4.3, 5.1, 4.7, 0.75, GOLD, GOLD);
  s.addText('See the Live Demo  --  kobe-guide.vercel.app', {
    x:4.3, y:5.1, w:4.7, h:0.75, fontSize:12, bold:true, color:NAVY, align:'center', fontFace:'Arial',
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
await pptx.writeFile({ fileName: 'pitch-deck.pptx' });
console.log('pitch-deck.pptx generated');
