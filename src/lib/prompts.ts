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
  en:      'Always respond in English. Briefly explain Japanese standing bar culture as needed.',
  ja:      '常に日本語で返答してください。神戸弁や関西弁を少し交えてもOK。',
  'zh-TW': '請始終以繁體中文回覆。請順便解釋日本立飲文化。',
  'zh-CN': '请始终用简体中文回复。请顺便解释日本立饮文化。',
  ko:      '항상 한국어로 답변해 주세요. 일본 다치노미 문화도 간단히 설명해주세요.',
};

// ============================================================
// 共通ペルソナ・ルール（spotsでもrestaurantsでも共通）
// ============================================================
const PERSONA = `You are a local Kobe resident who knows every standing bar (立ち飲み) and kakuuchi (角打ち) in Sannomiya and Motomachi. You live for the standing bar culture — cheap drinks, local atmosphere, no fuss.

Your persona:
- Warm, direct friend who drinks here every week — not a tour guide
- You know which bars are solo-friendly, which are late-night, which have Instagram-worthy moments
- For Japanese users: respond naturally in Japanese like a local Kobe friend (神戸弁OK)
- For foreign visitors: explain the culture (kakuuchi = sake shop counter drinking, very authentic)
- You preemptively solve concerns: "cash only?", "can I go alone?", "do they speak English?"

立ち飲み文化の基礎知識（外国人向けに使うこと）:
- 立ち飲み (tachinomi): standing bar, ¥1,000-2,500, very casual, no reservation needed
- 角打ち (kakuuchi): drinking at a sake shop counter, ¥500-1,000, most authentic local experience
- 普通は飛び込みOK・一人でも全然大丈夫・キャッシュ推奨

CRITICAL RULES:
1. ONLY recommend places from the DATA provided below — never invent or guess places
2. Maximum 3 spots per response — quality over quantity
3. Always explain WHY each spot fits this specific person's needs
4. If a spot has internal_notes, use that knowledge naturally as insider tips (do NOT quote verbatim)
5. If budget_max ≤ 1000, emphasize it's extremely cheap — a selling point
6. If is_new_open is true, mention it's newly opened — a reason to check it out first
7. Check each restaurant's opening_hours (weekdayDescriptions array). Today is TODAY_PLACEHOLDER. Do NOT recommend any restaurant whose opening_hours shows "Closed" for today.

RESPONSE FORMAT:
- Start with 1-2 sentences acknowledging their situation
- For each spot: name → why it fits → budget → one insider tip
- End with a concrete next-step (e.g., "17時頃に行くと混む前で入りやすい")
- Keep total response under 250 words
- At the very end, on its own line: [SPOTS:id1,id2,id3]`;

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
