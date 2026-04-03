-- ============================================================
-- Kobe Night Guide — Seed Data (Demo Spots)
-- Based on Sannomiya / Motomachi / Kitano / Nankinmachi area
-- NOTE: These are illustrative demo entries — verify details before launch
-- ============================================================

-- ============================================================
-- SPOTS
-- ============================================================
insert into spots (
  name, area, category, latitude, longitude,
  budget_min, budget_max, vibe_tags, solo_friendly,
  foreigner_friendly, english_menu, cashless,
  opening_hours, google_maps_url,
  priority_score, internal_notes, caution_notes, is_published
) values

-- 1. 三宮 立ち飲み
(
  '立ち飲み 三宮横丁',
  'sannomiya',
  ARRAY['standing-bar', 'izakaya'],
  34.6942, 135.1956,
  1500, 3000,
  ARRAY['local', 'lively', 'casual', 'after-work'],
  true, true, false, false,
  '{"mon-fri": "17:00-23:00", "sat": "16:00-23:00", "sun": "closed"}',
  'https://maps.google.com/?q=34.6942,135.1956',
  85,
  'マスターが英語少し話せる。カウンター8席のみ。金曜は激混み19時以降。常連が多く最初の入店で声かければフレンドリー。',
  'Cash only. Very small — 8 seats. Gets crowded after 7pm on weekdays.',
  true
),

-- 2. 神戸牛 手頃価格
(
  '神戸牛 一膳 三宮店',
  'sannomiya',
  ARRAY['kobe-beef', 'casual'],
  34.6938, 135.1962,
  3000, 6000,
  ARRAY['kobe-beef', 'value', 'tourist-friendly', 'lunch-dinner'],
  true, true, true, true,
  '{"daily": "11:30-15:00 / 17:00-22:00"}',
  'https://maps.google.com/?q=34.6938,135.1962',
  90,
  '神戸牛ランチ1,980円が最強コスパ。ランチは並ぶ。インスタ映えするので写真OK。クレジット使える数少ない神戸牛店。外国人多い。英語メニューあり。',
  'Lunch queue possible (15-20 min). English menu available. Card OK.',
  true
),

-- 3. 日本酒バー
(
  '酒処 北野坂',
  'kitano',
  ARRAY['sake-bar', 'casual'],
  34.7005, 135.1935,
  2500, 5000,
  ARRAY['sake', 'intimate', 'local', 'quiet'],
  true, true, true, false,
  '{"tue-sun": "18:00-24:00", "mon": "closed"}',
  'https://maps.google.com/?q=34.7005,135.1935',
  80,
  '兵庫地酒20種以上。店主が英語話せる（海外在住歴あり）。一人客歓迎の雰囲気。カウンターのみ10席。おすすめは灘の生酒。月曜定休忘れずに。',
  'Monday closed. Cash only. Counter seats only. Owner speaks English.',
  true
),

-- 4. 元町 深夜ラーメン
(
  '元町製麺 本店',
  'motomachi',
  ARRAY['ramen', 'late-night'],
  34.6908, 135.1878,
  800, 1500,
  ARRAY['late-night', 'solo', 'casual', 'quick'],
  true, true, false, false,
  '{"mon-sat": "11:00-03:00", "sun": "11:00-24:00"}',
  'https://maps.google.com/?q=34.6908,135.1878',
  75,
  '深夜2時まで営業。締めに最高。外国人も多い。醤油ラーメンが看板。一人でカウンターに座れる。写真映え普通だが味は本物。',
  'Open until 3am weekdays. English menu not available — point to photos.',
  true
),

-- 5. 南京町 小籠包
(
  '南京町 老祥記',
  'nankinmachi',
  ARRAY['casual', 'late-night'],
  34.6895, 135.1862,
  300, 800,
  ARRAY['street-food', 'quick', 'iconic', 'budget'],
  true, true, false, true,
  '{"daily": "10:00-19:00"}',
  'https://maps.google.com/?q=34.6895,135.1862',
  88,
  '行列は観光地だが味は本物。豚まん1個90円。並ぶ価値あり。夕方17時以降は列が短くなる傾向。南京町散策の定番スタート地点として紹介するのが吉。',
  'Queue expected (5-20 min). Worth it! Opens at 10am, sells out by evening.',
  true
),

-- 6. 三宮 立ち飲み（もう1軒）
(
  'BAR STAND 神戸',
  'sannomiya',
  ARRAY['standing-bar', 'sake-bar'],
  34.6951, 135.1971,
  2000, 4000,
  ARRAY['craft-sake', 'standing', 'modern', 'instagram'],
  true, true, true, true,
  '{"wed-mon": "16:00-23:30", "tue": "closed"}',
  'https://maps.google.com/?q=34.6951,135.1971',
  82,
  '英語メニューあり。クラフト日本酒に特化。インバウンド客が多く入りやすい雰囲気。スタッフ若め。QRコードメニューあり。外国人グループで来ても大丈夫な珍しい立ち飲み。',
  'English menu available. Craft sake focus. Foreign-friendly standing bar.',
  true
),

-- 7. 居酒屋 北野
(
  '炭火居酒屋 北野',
  'kitano',
  ARRAY['izakaya', 'kobe-beef'],
  34.7012, 135.1928,
  3000, 6000,
  ARRAY['charcoal-grill', 'izakaya', 'authentic', 'local'],
  true, true, false, false,
  '{"daily": "18:00-23:00"}',
  'https://maps.google.com/?q=34.7012,135.1928',
  78,
  '神戸牛串が最安クラス。1本500円〜。炭火の煙が目立つ。外観地味で入りにくいが中は最高。英語メニューなしだが写真で指差しOK。予約推奨（特に週末）。',
  'No English menu but photos available. Reservation recommended on weekends. Cash only.',
  true
),

-- 8. 元町 立ち飲みワイン
(
  'Wine Stand Motomachi',
  'motomachi',
  ARRAY['standing-bar', 'casual'],
  34.6912, 135.1890,
  1500, 3500,
  ARRAY['wine', 'standing', 'stylish', 'date'],
  true, true, true, true,
  '{"tue-sun": "17:00-23:00", "mon": "closed"}',
  'https://maps.google.com/?q=34.6912,135.1890',
  77,
  'ナチュラルワイン専門。外国人スタッフが1名いる。英語OK。グラス700円〜と安い。元町商店街近くで場所わかりやすい。雨の日にも最適なこじんまりした空間。',
  'Natural wine specialist. English-speaking staff. Glass from ¥700.',
  true
),

-- 9. 三宮 深夜バー
(
  'Night Kobe Bar',
  'sannomiya',
  ARRAY['late-night', 'casual'],
  34.6946, 135.1983,
  2000, 5000,
  ARRAY['late-night', 'cocktail', 'chill', 'foreigner-friendly'],
  true, true, true, true,
  '{"daily": "20:00-04:00"}',
  'https://maps.google.com/?q=34.6946,135.1983',
  80,
  '深夜2時以降も営業。外国人観光客も多い。スタッフ英語堪能。神戸ビールとカクテルが中心。一人でも入りやすいカウンター中心レイアウト。',
  'Open until 4am. English-speaking staff. Good for solo travelers.',
  true
),

-- 10. 元町 コスパ神戸牛
(
  '神戸牛バル MOTOMACHI',
  'motomachi',
  ARRAY['kobe-beef', 'casual', 'standing-bar'],
  34.6903, 135.1872,
  2500, 5000,
  ARRAY['kobe-beef', 'bar-style', 'value', 'wine-pairing'],
  true, true, true, true,
  '{"daily": "12:00-14:30 / 17:30-22:30"}',
  'https://maps.google.com/?q=34.6903,135.1872',
  87,
  '神戸牛をバル形式で。タパス感覚でいろいろ食べられる。ワインとのペアリングが人気。ランチコース2,800円は最強コスパ。英語メニューあり。インスタ映えする盛り付け。外国人カップルに人気。',
  'Kobe beef tapas style. English menu. Great value at ¥2,500-5,000pp.',
  true
);

-- ============================================================
-- TRANSLATIONS (English + more)
-- ============================================================
insert into spot_translations (spot_id, language, description, highlight, caution)
select
  s.id,
  'en',
  case s.name
    when '立ち飲み 三宮横丁' then
      'A tiny standing bar tucked in the backstreets of Sannomiya. This is where Kobe salarymen unwind after work — plastic cups, cold draft beer, and plates of yakitori. Pure local energy. The master will give you a nod; nod back and you belong.'
    when '神戸牛 一膳 三宮店' then
      'The best value Kobe beef in town. Lunch sets start at ¥1,980 — yes, real Kobe certified beef at that price. Teppanyaki style, small counter, efficient. Get the sirloin set. They have an English menu and accept cards, making this the perfect first Kobe beef experience.'
    when '酒処 北野坂' then
      'A hidden gem on the Kitano slope. Over 20 varieties of Hyogo-prefecture sake including rare nama-sake from the Nada brewing district. The owner lived abroad and speaks excellent English — he loves explaining sake to curious visitors. Very intimate, 10 counter seats only.'
    when '元町製麺 本店' then
      'The go-to late-night spot after drinks. Open until 3am on weekdays. Simple, honest shoyu ramen that''s been perfected over decades. No frills, no English menu, but point at the photos and you''ll be fine. The kind of place locals eat ramen at midnight without thinking twice.'
    when '南京町 老祥記' then
      'Kobe''s Chinatown (Nankinmachi) landmark since 1915. These pork buns (nikuman) at ¥90 each are legendary. Yes, there''s a queue — but it moves fast and is part of the Nankinmachi experience. Best strategy: visit around 5pm when the line shortens. Get at least 3.'
    when 'BAR STAND 神戸' then
      'A modern craft sake standing bar that''s actually welcoming to foreigners. English menu, QR ordering, friendly young staff. They specialize in small-production sake from across Japan. Great starting point before exploring Sannomiya nightlife. No experience with sake needed — staff will guide you.'
    when '炭火居酒屋 北野' then
      'Hidden behind an unremarkable exterior is one of Kobe''s best charcoal-grill izakayas. Kobe beef skewers starting at ¥500 — among the cheapest you''ll find for certified beef. The smoke and sizzle, cold draft beer, and shouted orders make this feel authentically Japanese. No English menu but photos help.'
    when 'Wine Stand Motomachi' then
      'A tiny natural wine bar standing-style near Motomachi shopping street. One English-speaking staff member makes this very accessible. Glass of wine from ¥700 while chatting with locals. Perfect rainy evening spot — cozy, warm, and under the radar for tourists.'
    when 'Night Kobe Bar' then
      'The late-night refuge. Open until 4am, English-speaking staff, and a mix of locals and travelers creates a unique Kobe nightlife atmosphere. Solo travelers fit in easily at the bar counter. Kobe craft beer and cocktails. This is where the night ends or continues, depending on you.'
    when '神戸牛バル MOTOMACHI' then
      'Kobe beef Spanish tapas-style — small plates, sharing format, wine pairings. English menu available. The lunch course at ¥2,800 is exceptional value for certified Kobe beef. Great for couples or small groups. Instagrammable plating without the tourist-trap pricing.'
    else 'A great local spot in Kobe.'
  end,
  case s.name
    when '立ち飲み 三宮横丁' then 'The most local standing bar in Sannomiya'
    when '神戸牛 一膳 三宮店' then 'Best-value Kobe beef — from ¥1,980'
    when '酒処 北野坂' then 'English-speaking owner, 20+ local sakes'
    when '元町製麺 本店' then 'Open until 3am — perfect ramen nightcap'
    when '南京町 老祥記' then 'Legendary pork buns since 1915 — ¥90 each'
    when 'BAR STAND 神戸' then 'Foreign-friendly craft sake standing bar'
    when '炭火居酒屋 北野' then 'Kobe beef skewers from ¥500 over charcoal'
    when 'Wine Stand Motomachi' then 'Natural wine from ¥700, English-speaking staff'
    when 'Night Kobe Bar' then 'Open until 4am — English OK, solo-friendly'
    when '神戸牛バル MOTOMACHI' then 'Kobe beef tapas — lunch from ¥2,800'
    else 'Local gem'
  end,
  case s.name
    when '立ち飲み 三宮横丁' then 'Cash only. Tiny — 8 standing spots. Gets packed after 7pm.'
    when '神戸牛 一膳 三宮店' then 'Lunch queue 15-20min on weekdays. Reservations not taken for lunch.'
    when '酒処 北野坂' then 'Closed Mondays. Cash only. 10 seats — arrive early on weekends.'
    when '元町製麺 本店' then 'No English menu — use photos. No card payment.'
    when '南京町 老祥記' then 'Queue expected 5-20min. Sell out possible after 6pm.'
    when 'BAR STAND 神戸' then 'Closed Tuesdays. Can get busy after 8pm.'
    when '炭火居酒屋 北野' then 'No English menu. Cash only. Reservation recommended on weekends.'
    when 'Wine Stand Motomachi' then 'Closed Mondays. Small space — no reservation, first come first served.'
    when 'Night Kobe Bar' then 'Gets crowded after midnight. Prices slightly higher late night.'
    when '神戸牛バル MOTOMACHI' then 'Dinner reservations recommended on weekends.'
    else null
  end
from spots s;
