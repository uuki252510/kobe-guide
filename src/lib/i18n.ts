import type { UILang } from '@/hooks/useUILang';

type Translations = {
  nav: { guide: string; map: string; list: string; feed: string; articles: string; mypage: string; login: string };
  sheet: { viewDetails: string; addToCourse: string; added: string; nearby: string; nearbyLabel: string };
  chat: {
    placeholder: string; popular: string; thinking: string;
    userRole: string; aiRole: string;
    hero: string; heroSub: string; heroArea: string;
    ctaBtn: string; ctaSelf: string;
    moodSection: string; showMore: string; neutralNote: string; errorMsg: string;
  };
  area: Record<string, string>;
  type: Record<string, string>;
};

const t: Record<UILang, Translations> = {
  ja: {
    nav: { guide: '案内', map: '地図', list: '一覧', feed: 'フィード', articles: '記事', mypage: 'マイページ', login: 'ログイン' },
    sheet: { viewDetails: '詳細を見る', addToCourse: 'コース', added: '追加済', nearby: 'NEARBY', nearbyLabel: '近くの銘店' },
    chat: {
      placeholder: '気分や予算を教えてください…', popular: 'よく聞かれること', thinking: '考え中',
      userRole: '客', aiRole: '案内',
      hero: '今夜、どこ行く？', heroSub: '広告なし。地元民だけが知ってる85軒。', heroArea: '三宮・元町エリアの立ち飲み案内',
      ctaBtn: '案内してもらう', ctaSelf: '自分で探す →',
      moodSection: '気分で選ぶ', showMore: 'もっと見る', neutralNote: '広告・スポンサーなし · 中立な案内',
      errorMsg: '申し訳ありません、エラーが発生しました。もう一度お試しください。',
    },
    area: { sannomiya: '三宮', motomachi: '元町', surroundings: '周辺', kitano: '北野', nankinmachi: '南京町' },
    type: { tachinomi: '立ち飲み', kakuuchi: '角打ち', yakitori: '焼鳥', seafood: '海鮮', wine: 'ワイン', italian: 'イタリアン', hormones: 'ホルモン', bar: 'バー' },
  },
  en: {
    nav: { guide: 'Guide', map: 'Map', list: 'List', feed: 'Feed', articles: 'Articles', mypage: 'My Page', login: 'Login' },
    sheet: { viewDetails: 'View Details', addToCourse: 'Add', added: 'Added', nearby: 'NEARBY', nearbyLabel: 'Nearby spots' },
    chat: {
      placeholder: 'Tell me your mood or budget…', popular: 'Popular questions', thinking: 'Thinking…',
      userRole: 'You', aiRole: 'Guide',
      hero: "Where to tonight?", heroSub: 'No ads. 85 bars only locals know.', heroArea: 'Standing bars in Sannomiya & Motomachi',
      ctaBtn: 'Get recommendations', ctaSelf: 'Browse yourself →',
      moodSection: 'Pick a vibe', showMore: 'Show more', neutralNote: 'No ads · No sponsors · Unbiased guide',
      errorMsg: 'Sorry, an error occurred. Please try again.',
    },
    area: { sannomiya: 'Sannomiya', motomachi: 'Motomachi', surroundings: 'Surroundings', kitano: 'Kitano', nankinmachi: 'Nankinmachi' },
    type: { tachinomi: 'Standing bar', kakuuchi: 'Kakuuchi', yakitori: 'Yakitori', seafood: 'Seafood', wine: 'Wine', italian: 'Italian', hormones: 'Hormone', bar: 'Bar' },
  },
  'zh-TW': {
    nav: { guide: 'AI導覽', map: '地圖', list: '列表', feed: '動態', articles: '文章', mypage: '我的頁面', login: '登入' },
    sheet: { viewDetails: '查看詳情', addToCourse: '加入', added: '已加入', nearby: 'NEARBY', nearbyLabel: '附近名店' },
    chat: {
      placeholder: '請告訴我您的心情或預算…', popular: '常見問題', thinking: '思考中',
      userRole: '客', aiRole: '導覽',
      hero: '今晚去哪裡？', heroSub: '無廣告。85家在地人才知道的名店。', heroArea: '三宮・元町區域的立飲指南',
      ctaBtn: '請為我推薦', ctaSelf: '自己搜尋 →',
      moodSection: '依心情選擇', showMore: '更多', neutralNote: '無廣告・贊助 · 中立介紹',
      errorMsg: '抱歉，發生錯誤，請再試一次。',
    },
    area: { sannomiya: '三宮', motomachi: '元町', surroundings: '周邊', kitano: '北野', nankinmachi: '南京町' },
    type: { tachinomi: '立飲店', kakuuchi: '角打', yakitori: '燒鳥', seafood: '海鮮', wine: '葡萄酒', italian: '義式', hormones: '內臟', bar: '酒吧' },
  },
  'zh-CN': {
    nav: { guide: 'AI导览', map: '地图', list: '列表', feed: '动态', articles: '文章', mypage: '我的页面', login: '登录' },
    sheet: { viewDetails: '查看详情', addToCourse: '加入', added: '已加入', nearby: 'NEARBY', nearbyLabel: '附近名店' },
    chat: {
      placeholder: '请告诉我您的心情或预算…', popular: '常见问题', thinking: '思考中',
      userRole: '客', aiRole: '导览',
      hero: '今晚去哪里？', heroSub: '无广告。85家只有当地人知道的名店。', heroArea: '三宫・元町区域的立饮指南',
      ctaBtn: '请为我推荐', ctaSelf: '自己搜索 →',
      moodSection: '按心情选择', showMore: '更多', neutralNote: '无广告・赞助 · 中立介绍',
      errorMsg: '抱歉，发生错误，请再试一次。',
    },
    area: { sannomiya: '三宫', motomachi: '元町', surroundings: '周边', kitano: '北野', nankinmachi: '南京町' },
    type: { tachinomi: '立饮店', kakuuchi: '角打', yakitori: '烤鸡肉串', seafood: '海鲜', wine: '葡萄酒', italian: '意式', hormones: '内脏', bar: '酒吧' },
  },
  ko: {
    nav: { guide: 'AI 안내', map: '지도', list: '목록', feed: '피드', articles: '기사', mypage: '마이페이지', login: '로그인' },
    sheet: { viewDetails: '상세보기', addToCourse: '코스', added: '추가됨', nearby: 'NEARBY', nearbyLabel: '근처 명소' },
    chat: {
      placeholder: '기분이나 예산을 알려주세요…', popular: '자주 묻는 것', thinking: '생각 중',
      userRole: '손님', aiRole: '안내',
      hero: '오늘 밤 어디 갈까요?', heroSub: '광고 없음. 현지인만 아는 85개 가게.', heroArea: '산노미야・모토마치의 서서 마시는 바 안내',
      ctaBtn: '추천받기', ctaSelf: '직접 찾기 →',
      moodSection: '분위기로 선택', showMore: '더 보기', neutralNote: '광고・스폰서 없음 · 중립 안내',
      errorMsg: '죄송합니다, 오류가 발생했습니다. 다시 시도해주세요.',
    },
    area: { sannomiya: '산노미야', motomachi: '모토마치', surroundings: '주변', kitano: '기타노', nankinmachi: '난킨마치' },
    type: { tachinomi: '서서 마시는 바', kakuuchi: '카쿠우치', yakitori: '야키토리', seafood: '해산물', wine: '와인', italian: '이탈리안', hormones: '호르몬', bar: '바' },
  },
};

export function useT(lang: UILang) {
  return t[lang] ?? t.ja;
}
