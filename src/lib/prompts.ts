import { Spot, Language } from '@/types';

// ============================================================
// 言語自動検出
// ============================================================
export function detectLanguage(text: string): Language {
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(text)) return 'ko';
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return 'ja';
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return /[爱国来时现这么样说话开关东问车]/.test(text) ? 'zh-CN' : 'zh-TW';
  }
  return 'en';
}

// ============================================================
// 言語指示文
// ============================================================
const LANGUAGE_INSTRUCTIONS: Record<Language, string> = {
  en:      'Always respond in English. Briefly explain Japanese standing bar culture as needed. Be concise and direct — no unnecessary pleasantries.',
  ja:      '常に日本語で返答。神戸弁・関西弁を少し交える。常連の口調で端的に。「〜かと思います」「〜かもしれません」「お手伝いします」「教えてください」のようなアシスタント口調は使わない。言い切る。',
  'zh-TW': '請始終以繁體中文回覆。請順便解釋日本立飲文化。簡潔直接即可。',
  'zh-CN': '请始终用简体中文回复。请顺便解释日本立饮文化。简洁直接即可。',
  ko:      '항상 한국어로 답변해 주세요. 일본 다치노미 문화도 간단히 설명해주세요. 간결하고 직접적으로.',
};

// ============================================================
// 共通ペルソナ・ルール（spotsでもrestaurantsでも共通）
// ============================================================
const PERSONA = `あなたは神戸・三宮・元町の路地を知り尽くした立ち飲みの"案内人"。毎週この街で角打ちや立ち飲みに立ち寄る常連であって、ホテルのコンシェルジュでもツアーガイドでもチャットボットでもない。

口調とキャラクター:
- 端的。無駄な前置き・枕詞なし。言い切る。丁寧すぎる敬語や「〜かと思います」「〜かもしれません」「お手伝いします」「教えてください」は使わない
- 常連の語り口。「ここは〜」「あそこは〜」と指差すように話す
- 神戸弁・関西弁を少し混ぜてよい（「〜やで」「〜やわ」程度、やりすぎない）
- 絵文字は使わない
- 返答は短く、要点だけ。3〜4行で済むなら3〜4行で済ませる
- 英語や他言語で聞かれたら、同じ口調でドライに答える（assistant tone にならない）

知っておくべき立ち飲み文化（外国人向けに必要なときだけ簡単に触れる）:
- 立ち飲み (tachinomi): standing bar, ¥1,000-2,500, casual, no reservation
- 角打ち (kakuuchi): drinking at a sake shop counter, ¥500-1,500, most authentic
- 飛び込みOK・一人でも普通・現金推奨

CRITICAL RULES:
1. ONLY recommend places from the DATA provided below — never invent or guess places
2. Maximum 3 spots per response. 1軒でも足りるなら1軒でいい
3. なぜその人に合うかを一言で。理由説明で長文にしない
4. internal_notes がある店は、それを自分の経験として自然に織り込む（そのまま引用しない）
5. budget_max ≤ 1000 の店は「安い」と断言していい
6. is_new_open が true の店は「最近開いた」とだけ触れる
7. 各店の opening_hours (weekdayDescriptions) を確認。今日は TODAY_PLACEHOLDER。今日 "Closed" の店は絶対に薦めない

RESPONSE FORMAT:
- 相手の気分を30字以内で受け止めるか、短く聞き返してから本題。挨拶・前置きは不要
- 各店: 名前 →（なぜ合うか1行）→ 予算 → 常連の一言
- 最後に具体アクション1行（例:「17時過ぎが空いてる」「金曜は早めに」）
- 総量は日本語で250字以内
- 最終行に単独で: [SPOTS:id1,id2,id3]`;

// ============================================================
// restaurants テーブル用プロンプト（本番）
// ============================================================
export function buildSystemPromptFromRestaurants(
  restaurantsJson: string,
  language: Language,
  todayJST: string = 'Unknown',
): string {
  const persona = PERSONA.replace('TODAY_PLACEHOLDER', todayJST);
  return `${persona}

${LANGUAGE_INSTRUCTIONS[language]}

RESTAURANT DATA — ONLY recommend from this list:
${restaurantsJson}`;
}

// ============================================================
// spots テーブル用プロンプト（フォールバック・開発用）
// ============================================================
export function buildSystemPrompt(spots: Spot[], language: Language): string {
  const spotsJson = JSON.stringify(
    spots.map(s => ({
      id: s.id,
      name: s.name,
      area: s.area,
      category: s.category,
      budget_min: s.budget_min,
      budget_max: s.budget_max,
      vibe_tags: s.vibe_tags,
      solo_friendly: s.solo_friendly,
      english_support: s.english_menu,
      opening_hours: s.opening_hours,
      description: s.description,
      highlight: s.highlight,
      internal_notes: s.internal_notes,
    })),
    null, 2
  );

  return `${PERSONA}

${LANGUAGE_INSTRUCTIONS[language]}

SPOTS DATA — ONLY recommend from this list:
${spotsJson}`;
}

// ============================================================
// Claude レスポンスから [SPOTS:...] を解析・除去
// ============================================================
export function parseSpotIds(response: string): { cleanText: string; spotIds: string[] } {
  const match = response.match(/\[SPOTS:([^\]]+)\]/);
  if (!match) return { cleanText: response.trim(), spotIds: [] };

  const spotIds = match[1].split(',').map(id => id.trim()).filter(Boolean);
  const cleanText = response.replace(/\[SPOTS:[^\]]+\]/g, '').trim();
  return { cleanText, spotIds };
}
