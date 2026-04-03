import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const stores = [
  // ============ 三宮 60店 ============
  { name: 'ライトスタンド',                  area: 'sannomiya',   lat: 34.6892, lng: 135.1862, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2025-08-01', priority_score: 100, vibe_tags: ['new-open','solo-friendly'] },
  { name: 'すたんど こうめ',                 area: 'sannomiya',   lat: 34.6942, lng: 135.1948, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['solo-friendly'] },
  { name: '伊藤勝商店',                      area: 'sannomiya',   lat: 34.6938, lng: 135.1962, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap','solo-friendly'] },
  { name: '立呑 Blend',                      area: 'sannomiya',   lat: 34.6935, lng: 135.1965, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['solo-friendly'] },
  { name: '酒家 風鶏',                       area: 'sannomiya',   lat: 34.6934, lng: 135.1947, budget_min: 500,  budget_max: 2000, tachinomi_type: 'yakitori',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['yakitori'] },
  { name: 'にくひろ',                        area: 'sannomiya',   lat: 34.6940, lng: 135.1953, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['meat'] },
  { name: '蔵元酒場おやっとさぁ 三宮店',      area: 'sannomiya',   lat: 34.6948, lng: 135.1970, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'アザブバー (AZABU BAR)',           area: 'sannomiya',   lat: 34.6943, lng: 135.1958, budget_min: 500,  budget_max: 1500, tachinomi_type: 'bar',       is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['bar','solo-friendly'] },
  { name: '宇宙と描いてSAKABAとよむ',         area: 'sannomiya',   lat: 34.6930, lng: 135.1952, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local','popular'] },
  { name: 'THE BAKE',                        area: 'sannomiya',   lat: 34.6932, lng: 135.1957, budget_min: 500,  budget_max: 2000, tachinomi_type: 'wine',      is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['wine','daytime'] },
  { name: '高羽',                            area: 'sannomiya',   lat: 34.6931, lng: 135.1942, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','solo-friendly'] },
  { name: '4坪牡蠣小屋 キヨリト 東門店',      area: 'sannomiya',   lat: 34.6936, lng: 135.1972, budget_min: 500,  budget_max: 2000, tachinomi_type: 'seafood',   is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['oyster','seafood'] },
  { name: '立ち呑み 京都商会',               area: 'sannomiya',   lat: 34.6928, lng: 135.1960, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','solo-friendly'] },
  { name: 'ハレとケ',                        area: 'sannomiya',   lat: 34.6895, lng: 135.1938, budget_min: 500,  budget_max: 2000, tachinomi_type: 'bar',       is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['beer','bar'] },
  { name: 'Uo魚',                            area: 'sannomiya',   lat: 34.6879, lng: 135.1890, budget_min: 300,  budget_max: 1000, tachinomi_type: 'seafood',   is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['seafood','cheap','solo-friendly'] },
  { name: '立呑すぎの',                      area: 'sannomiya',   lat: 34.6888, lng: 135.1935, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','solo-friendly'] },
  { name: 'スタンド クラシック',              area: 'sannomiya',   lat: 34.6941, lng: 135.1950, budget_min: 1000, budget_max: 3000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 80,  vibe_tags: ['premium'] },
  { name: '立呑処 ふう',                     area: 'sannomiya',   lat: 34.6929, lng: 135.1944, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kushiage'] },
  { name: 'ことり屋',                        area: 'sannomiya',   lat: 34.6921, lng: 135.1945, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: '肉料理ちぃちゃん はなれ',          area: 'sannomiya',   lat: 34.6933, lng: 135.1955, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['meat'] },
  { name: '立ち呑み かんぱい',               area: 'sannomiya',   lat: 34.6926, lng: 135.1968, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','local','retro'] },
  { name: 'スタンド GONTa2',                 area: 'sannomiya',   lat: 34.6936, lng: 135.1967, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','solo-friendly'] },
  { name: '昭和ロマン おとめの台所 本店',     area: 'sannomiya',   lat: 34.6924, lng: 135.1974, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['retro','local'] },
  { name: 'スタンド サンジ',                  area: 'sannomiya',   lat: 34.6938, lng: 135.1975, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['popular'] },
  { name: '焼鳥はりま',                      area: 'sannomiya',   lat: 34.6890, lng: 135.1933, budget_min: 300,  budget_max: 1000, tachinomi_type: 'yakitori',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['yakitori','cheap'] },
  { name: '路地裏スタンド アベック',           area: 'sannomiya',   lat: 34.6940, lng: 135.1946, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['popular','local'] },
  { name: 'スタンド Gonta',                  area: 'sannomiya',   lat: 34.6926, lng: 135.1962, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','solo-friendly'] },
  { name: '小林酒店',                        area: 'sannomiya',   lat: 34.6919, lng: 135.1958, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap','solo-friendly'] },
  { name: '神戸手羽唐専門店 鶏冠屋 2号店',   area: 'sannomiya',   lat: 34.6931, lng: 135.1978, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['chicken'] },
  { name: 'ワインの名に懸けて',               area: 'sannomiya',   lat: 34.6929, lng: 135.1980, budget_min: 500,  budget_max: 2000, tachinomi_type: 'wine',      is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['wine'] },
  { name: 'スタンドうみねこ',                 area: 'sannomiya',   lat: 34.6923, lng: 135.1951, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: '朝呑み 楽酒',                     area: 'sannomiya',   lat: 34.6882, lng: 135.1885, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['morning','cheap'] },
  { name: 'GASTORONOMIA BUCO',               area: 'sannomiya',   lat: 34.6927, lng: 135.1984, budget_min: 500,  budget_max: 2000, tachinomi_type: 'italian',   is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['italian','wine'] },
  { name: 'きりの台所',                      area: 'sannomiya',   lat: 34.6920, lng: 135.1985, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['home-cooking'] },
  { name: '立呑み 宵の盃',                   area: 'sannomiya',   lat: 34.6918, lng: 135.1978, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'ムーン テイル',                   area: 'sannomiya',   lat: 34.6915, lng: 135.1970, budget_min: 500,  budget_max: 2000, tachinomi_type: 'bar',       is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['bar'] },
  { name: '浅野日本酒店 SANNOMIYA',           area: 'sannomiya',   lat: 34.6912, lng: 135.1965, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 80,  vibe_tags: ['sake','local'] },
  { name: 'キヨリト サカノバ 酒挟む',         area: 'sannomiya',   lat: 34.6922, lng: 135.1940, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','senbero'] },
  { name: '鶴亀八番',                        area: 'sannomiya',   lat: 34.6916, lng: 135.1938, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['cheap','local'] },
  { name: '一三酒店マルアール',              area: 'sannomiya',   lat: 34.6908, lng: 135.1935, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap'] },
  { name: '立ち飲み ごっち',                 area: 'sannomiya',   lat: 34.6895, lng: 135.1870, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open'] },
  { name: '立ち飲み わらかど',               area: 'sannomiya',   lat: 34.6898, lng: 135.1868, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','daytime'] },
  { name: '立ち飲み 1',                      area: 'sannomiya',   lat: 34.6892, lng: 135.1920, budget_min: 500,  budget_max: 2000, tachinomi_type: 'wine',      is_new_open: true,  open_date: '2025-10-01', priority_score: 100, vibe_tags: ['new-open','wine'] },
  { name: '立呑み よってこ',                 area: 'sannomiya',   lat: 34.6920, lng: 135.1948, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open'] },
  { name: '立呑み処 頂',                     area: 'sannomiya',   lat: 34.6955, lng: 135.1945, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','late-night'] },
  { name: '立ち飲み居酒屋 さんかく 三宮店',  area: 'sannomiya',   lat: 34.6958, lng: 135.1950, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','oden'] },
  { name: '立呑処 醅(ふう)',                  area: 'sannomiya',   lat: 34.6910, lng: 135.1942, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open'] },
  { name: '立ち呑みニューワールド',           area: 'sannomiya',   lat: 34.6962, lng: 135.1955, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2024-06-01', priority_score: 100, vibe_tags: ['new-open'] },
  { name: 'Ready Steady Go!',                area: 'sannomiya',   lat: 34.6888, lng: 135.1925, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2026-03-05', priority_score: 100, vibe_tags: ['new-open','newest'] },
  { name: 'エキマエスタンド',                area: 'sannomiya',   lat: 34.6943, lng: 135.1944, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['station'] },
  { name: '立ち呑み るぅちゃん',             area: 'sannomiya',   lat: 34.6900, lng: 135.1872, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: '立ちより酒場 魚天',               area: 'sannomiya',   lat: 34.6897, lng: 135.1875, budget_min: 500,  budget_max: 1500, tachinomi_type: 'seafood',   is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['seafood'] },
  { name: '立ち呑み Zen',                    area: 'sannomiya',   lat: 34.6903, lng: 135.1878, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2024-03-01', priority_score: 100, vibe_tags: ['new-open'] },
  { name: '桜や',                            area: 'sannomiya',   lat: 34.6894, lng: 135.1868, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'スタンドアップ トリウオ',          area: 'sannomiya',   lat: 34.6891, lng: 135.1865, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'スタンドサンジ2nd（セカンド）',    area: 'sannomiya',   lat: 34.6893, lng: 135.1874, budget_min: 300,  budget_max: 1000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','cheap'] },
  { name: '炭 ゔぁる原（ばるはら）',          area: 'sannomiya',   lat: 34.6882, lng: 135.1882, budget_min: 500,  budget_max: 2000, tachinomi_type: 'yakitori',  is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','charcoal'] },
  { name: 'ホルモン 福寅（ふくとら）',        area: 'sannomiya',   lat: 34.6970, lng: 135.1965, budget_min: 500,  budget_max: 2000, tachinomi_type: 'hormones',  is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','hormones'] },
  { name: 'STAND COBE（スタンドコービー）',   area: 'sannomiya',   lat: 34.6888, lng: 135.1918, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open'] },
  { name: 'ニュージョージ',                  area: 'sannomiya',   lat: 34.6888, lng: 135.1866, budget_min: 500,  budget_max: 2000, tachinomi_type: 'yakitori',  is_new_open: true,  open_date: null,         priority_score: 100, vibe_tags: ['new-open','yakitori'] },
  // ============ 元町 15店 ============
  { name: '山下酒店',                        area: 'motomachi',   lat: 34.6885, lng: 135.1858, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap','solo-friendly'] },
  { name: '赤松酒店（赤松商店）',             area: 'motomachi',   lat: 34.6882, lng: 135.1845, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap','retro'] },
  { name: '立ち飲み わらかど 元町',           area: 'motomachi',   lat: 34.6878, lng: 135.1852, budget_min: 500,  budget_max: 1200, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'お酒の美術館 神戸元町店',          area: 'motomachi',   lat: 34.6880, lng: 135.1848, budget_min: 500,  budget_max: 1500, tachinomi_type: 'bar',       is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['bar','sake'] },
  { name: 'Moridini（モリディーニ）',         area: 'motomachi',   lat: 34.6876, lng: 135.1842, budget_min: 500,  budget_max: 2000, tachinomi_type: 'italian',   is_new_open: true,  open_date: '2025-08-01', priority_score: 100, vibe_tags: ['new-open','italian','wine'] },
  { name: '昭和レトロBAR ニューロマン',        area: 'motomachi',   lat: 34.6874, lng: 135.1840, budget_min: 500,  budget_max: 2000, tachinomi_type: 'bar',       is_new_open: true,  open_date: '2026-03-01', priority_score: 100, vibe_tags: ['new-open','retro','bar'] },
  { name: '家ごはん ひろよ',                  area: 'motomachi',   lat: 34.6872, lng: 135.1838, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2026-03-01', priority_score: 100, vibe_tags: ['new-open','home-cooking'] },
  { name: 'chotto（ちょっと）',              area: 'motomachi',   lat: 34.6870, lng: 135.1835, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: '2025-12-01', priority_score: 100, vibe_tags: ['solo-friendly'] },
  { name: '立ち呑み 稲田酒店',               area: 'motomachi',   lat: 34.6868, lng: 135.1848, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap'] },
  { name: 'イロハニリベロ',                   area: 'motomachi',   lat: 34.6895, lng: 135.1862, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: '元町ワイン食堂 ル・マリアージュ',  area: 'motomachi',   lat: 34.6865, lng: 135.1843, budget_min: 500,  budget_max: 2000, tachinomi_type: 'wine',      is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['wine'] },
  { name: '角打ち 花巻',                     area: 'motomachi',   lat: 34.6863, lng: 135.1840, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap'] },
  { name: '立ち飲み いぶき',                  area: 'motomachi',   lat: 34.6862, lng: 135.1855, budget_min: 500,  budget_max: 1200, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'スタンド海',                      area: 'motomachi',   lat: 34.6860, lng: 135.1848, budget_min: 500,  budget_max: 1500, tachinomi_type: 'seafood',   is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['seafood'] },
  { name: '立ち飲み とっくり',               area: 'motomachi',   lat: 34.6858, lng: 135.1850, budget_min: 500,  budget_max: 1200, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  // ============ 周辺 15店 ============
  { name: '濱田屋',                          area: 'surroundings', lat: 34.7200, lng: 135.2425, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 80,  vibe_tags: ['kakuuchi','local','retro'] },
  { name: 'カナメ屋商店',                    area: 'surroundings', lat: 34.6985, lng: 135.1980, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap'] },
  { name: '八喜為 新開地店',                 area: 'surroundings', lat: 34.6847, lng: 135.1669, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 80,  vibe_tags: ['local'] },
  { name: 'まさ 湊川店',                     area: 'surroundings', lat: 34.6857, lng: 135.1668, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 80,  vibe_tags: ['local'] },
  { name: '立呑み 赤ひげ本店',               area: 'surroundings', lat: 34.6842, lng: 135.1665, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local','popular'] },
  { name: '岡田酒類米穀店',                  area: 'surroundings', lat: 34.6845, lng: 135.1662, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap','local'] },
  { name: 'スタンドねこしゃん',              area: 'surroundings', lat: 34.6850, lng: 135.1672, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: 'トニカク',                        area: 'surroundings', lat: 34.6860, lng: 135.1670, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2026-03-02', priority_score: 100, vibe_tags: ['new-open','newest'] },
  { name: 'チヤップリン',                    area: 'surroundings', lat: 34.6838, lng: 135.1668, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2026-03-01', priority_score: 100, vibe_tags: ['new-open','newest'] },
  { name: '串とメシにはサケキタル。三宮駅前店', area: 'sannomiya', lat: 34.6965, lng: 135.1960, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2026-02-05', priority_score: 100, vibe_tags: ['new-open','next-gen'] },
  { name: '蔬菜(sosai)',                      area: 'surroundings', lat: 34.6943, lng: 135.1938, budget_min: 500,  budget_max: 2000, tachinomi_type: 'tachinomi', is_new_open: true,  open_date: '2025-12-01', priority_score: 100, vibe_tags: ['new-open','kominka'] },
  { name: '立ち飲み 三六',                   area: 'surroundings', lat: 34.6935, lng: 135.1957, budget_min: 500,  budget_max: 1500, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: '立ち飲み ふうり',                 area: 'surroundings', lat: 34.6950, lng: 135.1940, budget_min: 500,  budget_max: 1500, tachinomi_type: 'wine',      is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['wine','local'] },
  { name: '立ち飲み 呑',                     area: 'surroundings', lat: 34.7003, lng: 135.1934, budget_min: 500,  budget_max: 1200, tachinomi_type: 'tachinomi', is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['local'] },
  { name: '角打ち しんちゃん',               area: 'surroundings', lat: 34.6940, lng: 135.1935, budget_min: 300,  budget_max: 1000, tachinomi_type: 'kakuuchi',  is_new_open: false, open_date: null,         priority_score: 100, vibe_tags: ['kakuuchi','cheap','local'] },
];

async function main() {
  console.log('既存データを削除中...');
  const { error: delErr } = await supabase.from('restaurants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delErr) { console.error('削除エラー:', delErr); process.exit(1); }
  console.log('削除完了');

  console.log(`${stores.length}店舗を挿入中...`);
  const rows = stores.map(s => ({
    ...s,
    category: ['standing-bar'],
    is_published: true,
    business_status: 'OPERATIONAL',
    budget_estimated: true,
    source: 'tachinomi-complete.md',
  }));

  const { error: insErr } = await supabase.from('restaurants').insert(rows);
  if (insErr) { console.error('挿入エラー:', insErr); process.exit(1); }

  const { count } = await supabase.from('restaurants').select('*', { count: 'exact', head: true });
  console.log(`✅ 完了: ${count}店舗がDBに登録されました`);
}

main();
