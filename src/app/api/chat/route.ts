import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export const dynamic = 'force-dynamic';
import { supabaseAdmin } from '@/lib/supabase-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
  buildSystemPromptFromRestaurants,
  buildSystemPrompt,
  detectLanguage,
  parseSpotIds,
} from '@/lib/prompts';
import { ChatRequest, Language, Spot } from '@/types';
import { Restaurant } from '@/types/restaurant';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// ============================================================
// Restaurant → Claude用データ
// internal_notes を含む（AIペルソナ構築用）
// ユーザーには絶対に返さない
// ============================================================
function toAIData(r: Restaurant) {
  return {
    id:                       r.id,
    name:                     r.name,
    area:                     r.area,
    category:                 r.category,
    budget_min:               r.budget_min,
    budget_max:               r.budget_max,
    budget_estimated:         r.budget_estimated,
    vibe_tags:                r.vibe_tags,
    rating:                   r.rating,
    english_support:          r.english_support,
    reservation_required:     r.reservation_required,
    must_try_menu:            r.must_try_menu,
    foreigner_friendly_score: r.foreigner_friendly_score,
    solo_friendly_score:      r.solo_friendly_score,
    local_experience_score:   r.local_experience_score,
    internal_notes:           r.internal_notes, // AIのみ参照
    opening_hours:            r.opening_hours_json?.weekdayDescriptions ?? null,
  };
}

// ============================================================
// Restaurant → Spot（SpotCard表示用）
// internal_notes は含めない
// ============================================================
function restaurantToSpot(r: Restaurant): Spot {
  // opening_hours_json の weekdayDescriptions を Record<string, string> に変換
  const openingHours: Record<string, string> = {};
  if (r.opening_hours_json?.weekdayDescriptions) {
    const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    r.opening_hours_json.weekdayDescriptions.forEach((desc, i) => {
      // "Monday: 5:00 – 11:00 PM" → key: "Mon", value: "5:00 – 11:00 PM"
      const parts = desc.split(': ');
      const hours = parts.slice(1).join(': ') || desc;
      openingHours[dayKeys[i] ?? `day${i}`] = hours;
    });
  }

  // ユーザー向け注意書きを自動生成
  const cautions: string[] = [];
  if (r.reservation_required === true) cautions.push('Reservation recommended.');
  if (r.english_support === false)     cautions.push('No English menu — point at photos.');
  if (r.budget_estimated)              cautions.push('Budget is approximate.');

  return {
    id:               r.id,
    name:             r.name,
    area:             r.area,
    category:         r.category,
    budget_min:       r.budget_min ?? undefined,
    budget_max:       r.budget_max ?? undefined,
    vibe_tags:        r.vibe_tags,
    solo_friendly:    (r.solo_friendly_score ?? 0) >= 3,
    foreigner_friendly: (r.foreigner_friendly_score ?? 0) >= 3,
    english_menu:     r.english_support ?? false,
    cashless:         false,            // restaurants テーブルには未実装
    opening_hours:    openingHours,
    reservation_url:  r.website ?? undefined,
    google_maps_url:  r.google_maps_url ?? '',
    priority_score:   r.priority_score,
    caution_notes:    cautions.length > 0 ? cautions.join(' ') : undefined,
    highlight:        r.must_try_menu ?? undefined,
    description:      undefined,        // 将来: AI生成の多言語説明文
    is_published:     r.is_published,
    // internal_notes はここに含めない（フロントに返さない）
  };
}

// ============================================================
// メインハンドラー
// ============================================================
export async function POST(req: NextRequest) {
  // レート制限: 1IPあたり1分間に10リクエストまで
  const ip = getClientIp(req);
  const { allowed, resetAt } = checkRateLimit(ip, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a moment.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  try {
    const body: ChatRequest = await req.json();
    const { message, conversationId, history, language: clientLanguage } = body;

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const language: Language = clientLanguage || detectLanguage(message);

    // ─── データ取得: restaurants → spots フォールバック ───────────────
    let systemPrompt: string;
    let spots: Spot[];

    const { data: restaurants, error: restaurantsError } = await supabaseAdmin
      .from('restaurants')
      .select('*')
      .eq('is_published', true)
      .eq('business_status', 'OPERATIONAL')
      .order('priority_score', { ascending: false })
      .order('rating',         { ascending: false, nullsFirst: false })
      .limit(80);

    if (!restaurantsError && restaurants && restaurants.length > 0) {
      // ── 本番: restaurants テーブル ──────────────────────────────────
      const aiData = restaurants.map(toAIData);
      const todayJST = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'Asia/Tokyo' });
      systemPrompt = buildSystemPromptFromRestaurants(
        JSON.stringify(aiData, null, 2),
        language,
        todayJST,
      );
      spots = restaurants.map(restaurantToSpot);

    } else {
      // ── フォールバック: spots テーブル（開発・デモ用）───────────────
      console.warn('[chat] restaurants が空または取得失敗 → spots にフォールバック');

      const lang = language === 'zh-TW' ? 'zh-TW'
                 : language === 'zh-CN' ? 'zh-CN'
                 : language === 'ko'    ? 'ko'
                 : language === 'ja'    ? 'ja'
                 : 'en';

      let { data: spotData } = await supabaseAdmin
        .from('spots')
        .select(`*, spot_translations!inner(description, highlight, caution)`)
        .eq('is_published', true)
        .eq('spot_translations.language', lang)
        .order('priority_score', { ascending: false });

      // 翻訳なければ英語フォールバック
      if (!spotData || spotData.length === 0) {
        const { data: enSpots } = await supabaseAdmin
          .from('spots')
          .select(`*, spot_translations!inner(description, highlight, caution)`)
          .eq('is_published', true)
          .eq('spot_translations.language', 'en')
          .order('priority_score', { ascending: false });
        spotData = enSpots ?? [];
      }

      spots = spotData.map(flattenSpotTranslation);
      systemPrompt = buildSystemPrompt(spots, language);
    }

    // ─── Claude 呼び出し ──────────────────────────────────────────────
    const claudeHistory = history.slice(-6).map(m => ({
      role:    m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 1024,
      system:     systemPrompt,
      messages:   [...claudeHistory, { role: 'user', content: message }],
    });

    const rawReply = response.content[0].type === 'text' ? response.content[0].text : '';
    const { cleanText, spotIds } = parseSpotIds(rawReply);

    // 推薦スポット: internal_notes を除去してフロントに返す
    const recommendedSpots = spots
      .filter(s => spotIds.includes(s.id))
      .map(({ internal_notes: _removed, ...rest }) => rest as Spot);

    // ─── 会話ログ保存 ─────────────────────────────────────────────────
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const { data: conv } = await supabaseAdmin
        .from('conversations')
        .insert({ session_id: sessionId, language })
        .select('id')
        .single();
      activeConversationId = conv?.id;
    } else {
      await supabaseAdmin
        .from('conversations')
        .update({ last_active: new Date().toISOString() })
        .eq('id', activeConversationId);
    }

    if (activeConversationId) {
      await supabaseAdmin.from('messages').insert({
        conversation_id: activeConversationId,
        role:    'user',
        content: message,
      });
      await supabaseAdmin.from('messages').insert({
        conversation_id:      activeConversationId,
        role:                 'assistant',
        content:              cleanText,
        recommended_spot_ids: spotIds,
      });
    }

    return NextResponse.json({
      reply:          cleanText,
      spots:          recommendedSpots,
      conversationId: activeConversationId,
      language,
    });

  } catch (err) {
    console.error('[chat] API error:', err);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

// ============================================================
// spots テーブル用ヘルパー（フォールバック時のみ使用）
// ============================================================
function flattenSpotTranslation(spot: Record<string, unknown>): Spot {
  const translations = spot.spot_translations as Array<{
    description: string;
    highlight:   string;
    caution?:    string;
  }> | undefined;
  const tr = Array.isArray(translations) ? translations[0] : undefined;
  return {
    ...(spot as unknown as Spot),
    description: tr?.description,
    highlight:   tr?.highlight,
    caution:     tr?.caution,
  };
}
