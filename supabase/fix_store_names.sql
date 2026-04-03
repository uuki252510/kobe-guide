-- ============================================================
-- 神戸立ち飲みマップ — 店舗名・データ全修正
-- tachinomi-complete.md (2026-03-22) の正確な内容で上書き
-- 実行: Supabase SQL Editor に貼り付けて実行
-- ============================================================

DELETE FROM restaurants;

-- ============================================================
-- 三宮エリア 60店
-- ============================================================
INSERT INTO restaurants (name, area, category, lat, lng, budget_min, budget_max, tachinomi_type, is_new_open, open_date, is_published, business_status, priority_score, source, vibe_tags) VALUES
('ライトスタンド',                   'sannomiya', ARRAY['standing-bar'], 34.6892, 135.1862, 500,  2000, 'tachinomi', true,  '2025-08-01', true, 'OPERATIONAL', 100, '食べログ/Retty/IG(@lightstand_kobe)', ARRAY['new-open','solo-friendly','ピアザ']),
('すたんど こうめ',                  'sannomiya', ARRAY['standing-bar'], 34.6942, 135.1948, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty/食べログ',                        ARRAY['solo-friendly']),
('伊藤勝商店',                       'sannomiya', ARRAY['kakuuchi'],     34.6938, 135.1962, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'Retty角打ち1位/神戸ジャーナル',          ARRAY['kakuuchi','cheap','solo-friendly']),
('立呑 Blend',                       'sannomiya', ARRAY['standing-bar'], 34.6935, 135.1965, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty/食べログ',                        ARRAY['solo-friendly']),
('酒家 風鶏',                        'sannomiya', ARRAY['yakitori'],     34.6934, 135.1947, 500,  2000, 'yakitori',  false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['yakitori']),
('にくひろ',                         'sannomiya', ARRAY['standing-bar'], 34.6940, 135.1953, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty/IG',                              ARRAY['meat']),
('蔵元酒場おやっとさぁ 三宮店',       'sannomiya', ARRAY['standing-bar'], 34.6948, 135.1970, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty',                                 ARRAY['local']),
('アザブバー (AZABU BAR)',            'sannomiya', ARRAY['bar'],         34.6943, 135.1958, 500,  1500, 'bar',       false, null,          true, 'OPERATIONAL', 100, 'Retty/食べログ',                        ARRAY['bar','solo-friendly']),
('宇宙と描いてSAKABAとよむ',          'sannomiya', ARRAY['standing-bar'], 34.6930, 135.1952, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログTOP',                          ARRAY['local','popular']),
('THE BAKE',                         'sannomiya', ARRAY['wine-bar'],     34.6932, 135.1957, 500,  2000, 'wine',      false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['wine','bread','daytime']),
('高羽',                             'sannomiya', ARRAY['standing-bar'], 34.6931, 135.1942, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['cheap','kushiage','solo-friendly']),
('4坪牡蠣小屋 キヨリト 東門店',       'sannomiya', ARRAY['seafood'],     34.6936, 135.1972, 500,  2000, 'seafood',   false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['oyster','seafood']),
('立ち呑み 京都商会',                 'sannomiya', ARRAY['standing-bar'], 34.6928, 135.1960, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['cheap','solo-friendly']),
('ハレとケ',                         'sannomiya', ARRAY['bar'],         34.6895, 135.1938, 500,  2000, 'bar',       false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['beer','bar']),
('Uo魚',                             'sannomiya', ARRAY['seafood'],     34.6879, 135.1890, 300,  1000, 'seafood',   false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['seafood','cheap','solo-friendly']),
('立呑すぎの',                       'sannomiya', ARRAY['standing-bar'], 34.6888, 135.1935, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['cheap','solo-friendly']),
('スタンド クラシック',               'sannomiya', ARRAY['standing-bar'], 34.6941, 135.1950, 1000, 3000, 'tachinomi', false, null,          true, 'OPERATIONAL', 80,  '食べログ/Retty',                        ARRAY['premium']),
('立呑処 ふう',                      'sannomiya', ARRAY['standing-bar'], 34.6929, 135.1944, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['kushiage']),
('ことり屋',                         'sannomiya', ARRAY['standing-bar'], 34.6921, 135.1945, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('肉料理ちぃちゃん はなれ',           'sannomiya', ARRAY['standing-bar'], 34.6933, 135.1955, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['meat']),
('立ち呑み かんぱい',                 'sannomiya', ARRAY['standing-bar'], 34.6926, 135.1968, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['cheap','local','retro']),
('スタンド GONTa2',                  'sannomiya', ARRAY['standing-bar'], 34.6936, 135.1967, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ/Retty',                        ARRAY['cheap','solo-friendly']),
('昭和ロマン おとめの台所 本店',       'sannomiya', ARRAY['standing-bar'], 34.6924, 135.1974, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['retro','local']),
('スタンド サンジ',                   'sannomiya', ARRAY['standing-bar'], 34.6938, 135.1975, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['popular']),
('焼鳥はりま',                       'sannomiya', ARRAY['yakitori'],     34.6890, 135.1933, 300,  1000, 'yakitori',  false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['yakitori','cheap']),
('路地裏スタンド アベック',            'sannomiya', ARRAY['standing-bar'], 34.6940, 135.1946, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ/Retty/IG',                     ARRAY['popular','local']),
('スタンド Gonta',                   'sannomiya', ARRAY['standing-bar'], 34.6926, 135.1962, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ/aumo',                         ARRAY['cheap','solo-friendly']),
('小林酒店',                         'sannomiya', ARRAY['kakuuchi'],     34.6919, 135.1958, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['kakuuchi','cheap','solo-friendly']),
('神戸手羽唐専門店 鶏冠屋 2号店',     'sannomiya', ARRAY['standing-bar'], 34.6931, 135.1978, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['chicken']),
('ワインの名に懸けて',                 'sannomiya', ARRAY['wine-bar'],     34.6929, 135.1980, 500,  2000, 'wine',      false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['wine']),
('スタンドうみねこ',                  'sannomiya', ARRAY['standing-bar'], 34.6923, 135.1951, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('朝呑み 楽酒',                      'sannomiya', ARRAY['standing-bar'], 34.6882, 135.1885, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['morning','cheap','kakuuchi']),
('GASTORONOMIA BUCO',                'sannomiya', ARRAY['italian'],      34.6927, 135.1984, 500,  2000, 'italian',   false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['italian','wine']),
('きりの台所',                       'sannomiya', ARRAY['standing-bar'], 34.6920, 135.1985, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['home-cooking']),
('立呑み 宵の盃',                    'sannomiya', ARRAY['standing-bar'], 34.6918, 135.1978, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('ムーン テイル',                    'sannomiya', ARRAY['bar'],         34.6915, 135.1970, 500,  2000, 'bar',       false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['bar']),
('浅野日本酒店 SANNOMIYA',            'sannomiya', ARRAY['standing-bar'], 34.6912, 135.1965, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 80,  '食べログ',                              ARRAY['sake','local']),
('キヨリト サカノバ 酒挟む',          'sannomiya', ARRAY['standing-bar'], 34.6922, 135.1940, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['cheap','senbero']),
('鶴亀八番',                         'sannomiya', ARRAY['standing-bar'], 34.6916, 135.1938, 300,  1000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'せんべろ.net/神戸ジャーナル',            ARRAY['cheap','local','kakuuchi']),
('一三酒店マルアール',                'sannomiya', ARRAY['kakuuchi'],     34.6908, 135.1935, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'feel-kobe',                             ARRAY['kakuuchi','cheap']),
('立ち飲み ごっち',                   'sannomiya', ARRAY['standing-bar'], 34.6895, 135.1870, 500,  2000, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, '食べログ/IG(@gocchi_kobe)',              ARRAY['new-open']),
('立ち飲み わらかど',                 'sannomiya', ARRAY['standing-bar'], 34.6898, 135.1868, 500,  1500, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, 'IG',                                    ARRAY['new-open','daytime']),
('立ち飲み 1',                       'sannomiya', ARRAY['wine-bar'],     34.6892, 135.1920, 500,  2000, 'wine',      true,  '2025-10-01',  true, 'OPERATIONAL', 100, '食べログ/IG(@tachinomi_1)',              ARRAY['new-open','wine']),
('立呑み よってこ',                   'sannomiya', ARRAY['standing-bar'], 34.6920, 135.1948, 500,  1500, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, 'IG(@_yotteko_)',                        ARRAY['new-open']),
('立呑み処 頂',                      'sannomiya', ARRAY['standing-bar'], 34.6955, 135.1945, 500,  2000, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, 'IG(@stand_itadaki)',                    ARRAY['new-open','late-night']),
('立ち飲み居酒屋 さんかく 三宮店',    'sannomiya', ARRAY['standing-bar'], 34.6958, 135.1950, 500,  1500, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, 'IG(@stand.sankaku)',                    ARRAY['new-open','oden']),
('立呑処 醅(ふう)',                   'sannomiya', ARRAY['standing-bar'], 34.6910, 135.1942, 500,  1500, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, 'IG(@tachinomi_fu_2023)',                ARRAY['new-open']),
('立ち呑みニューワールド',            'sannomiya', ARRAY['standing-bar'], 34.6962, 135.1955, 500,  1500, 'tachinomi', true,  '2024-06-01',  true, 'OPERATIONAL', 100, 'IG',                                    ARRAY['new-open']),
('Ready Steady Go!',                 'sannomiya', ARRAY['standing-bar'], 34.6888, 135.1925, 500,  2000, 'tachinomi', true,  '2026-03-05',  true, 'OPERATIONAL', 100, '食べログ新店',                          ARRAY['new-open','newest']),
('エキマエスタンド',                  'sannomiya', ARRAY['standing-bar'], 34.6943, 135.1944, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty',                                 ARRAY['station']),
('立ち呑み るぅちゃん',               'sannomiya', ARRAY['standing-bar'], 34.6900, 135.1872, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('立ちより酒場 魚天',                 'sannomiya', ARRAY['seafood'],     34.6897, 135.1875, 500,  1500, 'seafood',   false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['seafood']),
('立ち呑み Zen',                     'sannomiya', ARRAY['standing-bar'], 34.6903, 135.1878, 500,  1500, 'tachinomi', true,  '2024-03-01',  true, 'OPERATIONAL', 100, 'ちょい飲み手帖',                       ARRAY['new-open']),
('桜や',                             'sannomiya', ARRAY['standing-bar'], 34.6894, 135.1868, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('スタンドアップ トリウオ',            'sannomiya', ARRAY['standing-bar'], 34.6891, 135.1865, 500,  2000, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ/aumo',                        ARRAY['local']),
('スタンドサンジ2nd（セカンド）',      'sannomiya', ARRAY['standing-bar'], 34.6893, 135.1874, 300,  1000, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, '食べログ/Retty/IG(@standsanji32z)',     ARRAY['new-open','cheap','akashi-tako']),
('炭 ゔぁる原（ばるはら）',            'sannomiya', ARRAY['yakitori'],     34.6882, 135.1882, 500,  2000, 'yakitori',  true,  null,          true, 'OPERATIONAL', 100, '食べログ/IG(@kobe_valhalla)',           ARRAY['new-open','charcoal','hormones']),
('ホルモン 福寅（ふくとら）',          'sannomiya', ARRAY['standing-bar'], 34.6970, 135.1965, 500,  2000, 'hormones',  true,  null,          true, 'OPERATIONAL', 100, '食べログ/IG(@horumon_fukutora)',        ARRAY['new-open','hormones']),
('STAND COBE（スタンドコービー）',     'sannomiya', ARRAY['standing-bar'], 34.6888, 135.1918, 500,  2000, 'tachinomi', true,  null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['new-open']),
('ニュージョージ',                    'sannomiya', ARRAY['yakitori'],     34.6888, 135.1866, 500,  2000, 'yakitori',  true,  null,          true, 'OPERATIONAL', 100, '食べログ/IG(@jooji0725)',               ARRAY['new-open','yakitori']);

-- ============================================================
-- 元町・南京町エリア 15店
-- ============================================================
INSERT INTO restaurants (name, area, category, lat, lng, budget_min, budget_max, tachinomi_type, is_new_open, open_date, is_published, business_status, priority_score, source, vibe_tags) VALUES
('山下酒店',                         'motomachi', ARRAY['kakuuchi'],     34.6885, 135.1858, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, '神戸ジャーナル/食べログ',               ARRAY['kakuuchi','cheap','solo-friendly']),
('赤松酒店（赤松商店）',              'motomachi', ARRAY['kakuuchi'],     34.6882, 135.1845, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, '神戸ジャーナル(創業90年)',              ARRAY['kakuuchi','cheap','local','retro']),
('立ち飲み わらかど 元町',            'motomachi', ARRAY['standing-bar'], 34.6878, 135.1852, 500,  1200, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('お酒の美術館 神戸元町店',            'motomachi', ARRAY['bar'],         34.6880, 135.1848, 500,  1500, 'bar',       false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['bar','sake']),
('Moridini（モリディーニ）',          'motomachi', ARRAY['italian'],      34.6876, 135.1842, 500,  2000, 'italian',   true,  '2025-08-01',  true, 'OPERATIONAL', 100, 'ちょい飲み手帖',                       ARRAY['new-open','italian','wine']),
('昭和レトロBAR ニューロマン',         'motomachi', ARRAY['bar'],         34.6874, 135.1840, 500,  2000, 'bar',       true,  '2026-03-01',  true, 'OPERATIONAL', 100, 'ちょい飲み手帖(2026/3最新!)',           ARRAY['new-open','retro','bar']),
('家ごはん ひろよ',                   'motomachi', ARRAY['standing-bar'], 34.6872, 135.1838, 500,  1500, 'tachinomi', true,  '2026-03-01',  true, 'OPERATIONAL', 100, 'ちょい飲み手帖(2026/3最新!)',           ARRAY['new-open','home-cooking']),
('chotto（ちょっと）',               'motomachi', ARRAY['standing-bar'], 34.6870, 135.1835, 500,  1500, 'tachinomi', false, '2025-12-01',  true, 'OPERATIONAL', 100, 'ちょい飲み手帖',                       ARRAY['solo-friendly']),
('立ち呑み 稲田酒店',                 'motomachi', ARRAY['kakuuchi'],     34.6868, 135.1848, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'Google検索',                            ARRAY['kakuuchi','cheap']),
('イロハニリベロ',                    'motomachi', ARRAY['standing-bar'], 34.6895, 135.1862, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, '食べログ',                              ARRAY['local']),
('元町ワイン食堂 ル・マリアージュ',    'motomachi', ARRAY['wine-bar'],     34.6865, 135.1843, 500,  2000, 'wine',      false, null,          true, 'OPERATIONAL', 100, 'Google検索',                            ARRAY['wine']),
('角打ち 花巻',                      'motomachi', ARRAY['kakuuchi'],     34.6863, 135.1840, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'Google検索',                            ARRAY['kakuuchi','cheap']),
('立ち飲み いぶき',                   'motomachi', ARRAY['standing-bar'], 34.6862, 135.1855, 500,  1200, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Google検索',                            ARRAY['local']),
('スタンド海',                       'motomachi', ARRAY['seafood'],     34.6860, 135.1848, 500,  1500, 'seafood',   false, null,          true, 'OPERATIONAL', 100, 'Google検索',                            ARRAY['seafood']),
('立ち飲み とっくり',                 'motomachi', ARRAY['standing-bar'], 34.6858, 135.1850, 500,  1200, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Google検索',                            ARRAY['local']);

-- ============================================================
-- 周辺・新店エリア 15店
-- ============================================================
INSERT INTO restaurants (name, area, category, lat, lng, budget_min, budget_max, tachinomi_type, is_new_open, open_date, is_published, business_status, priority_score, source, vibe_tags) VALUES
('濱田屋',                           'surroundings', ARRAY['kakuuchi'],     34.7200, 135.2425, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 80,  'feel-kobe(創業70年)',                   ARRAY['kakuuchi','local','retro']),
('カナメ屋商店',                      'surroundings', ARRAY['kakuuchi'],     34.6985, 135.1980, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'Retty',                                 ARRAY['kakuuchi','cheap']),
('八喜為 新開地店',                   'surroundings', ARRAY['standing-bar'], 34.6847, 135.1669, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 80,  'じゃらん2位',                          ARRAY['local']),
('まさ 湊川店',                       'surroundings', ARRAY['standing-bar'], 34.6857, 135.1668, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 80,  'じゃらん3位',                          ARRAY['local']),
('立呑み 赤ひげ本店',                 'surroundings', ARRAY['standing-bar'], 34.6842, 135.1665, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty新開地1位',                       ARRAY['local','popular']),
('岡田酒類米穀店',                    'surroundings', ARRAY['kakuuchi'],     34.6845, 135.1662, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'Retty/角打ち文化',                     ARRAY['kakuuchi','cheap','local']),
('スタンドねこしゃん',                'surroundings', ARRAY['standing-bar'], 34.6850, 135.1672, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'Retty',                                 ARRAY['local']),
('トニカク',                         'surroundings', ARRAY['standing-bar'], 34.6860, 135.1670, 500,  1500, 'tachinomi', true,  '2026-03-02',  true, 'OPERATIONAL', 100, '食べログ新店',                          ARRAY['new-open','newest']),
('チヤップリン',                      'surroundings', ARRAY['standing-bar'], 34.6838, 135.1668, 500,  1500, 'tachinomi', true,  '2026-03-01',  true, 'OPERATIONAL', 100, '食べログ新店',                          ARRAY['new-open','newest']),
('串とメシにはサケキタル。三宮駅前店', 'sannomiya',   ARRAY['standing-bar'], 34.6965, 135.1960, 500,  2000, 'tachinomi', true,  '2026-02-05',  true, 'OPERATIONAL', 100, '2026/2/5 OPEN',                        ARRAY['new-open','next-gen']),
('蔬菜(sosai)',                       'surroundings', ARRAY['standing-bar'], 34.6943, 135.1938, 500,  2000, 'tachinomi', true,  '2025-12-01',  true, 'OPERATIONAL', 100, '神戸ジャーナル',                       ARRAY['new-open','kominka']),
('立ち飲み 三六',                     'surroundings', ARRAY['standing-bar'], 34.6935, 135.1957, 500,  1500, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'ローカル情報',                         ARRAY['local']),
('立ち飲み ふうり',                   'surroundings', ARRAY['wine-bar'],     34.6950, 135.1940, 500,  1500, 'wine',      false, null,          true, 'OPERATIONAL', 100, 'ローカル情報',                         ARRAY['wine','local']),
('立ち飲み 呑',                      'surroundings', ARRAY['standing-bar'], 34.7003, 135.1934, 500,  1200, 'tachinomi', false, null,          true, 'OPERATIONAL', 100, 'ローカル情報',                         ARRAY['local']),
('角打ち しんちゃん',                 'surroundings', ARRAY['kakuuchi'],     34.6940, 135.1935, 300,  1000, 'kakuuchi',  false, null,          true, 'OPERATIONAL', 100, 'ローカル情報',                         ARRAY['kakuuchi','cheap','local']);

-- 確認
SELECT area, count(*) FROM restaurants GROUP BY area ORDER BY area;
SELECT count(*) as total FROM restaurants;
