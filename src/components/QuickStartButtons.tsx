'use client';

interface QuickStartButtonsProps {
  onSelect: (prompt: string) => void;
  language: string;
}

const prompts: Record<string, Array<{ label: string; message: string; emoji: string }>> = {
  ja: [
    { emoji: '🍺', label: '一人で気軽に飲みたい', message: '三宮で一人でも入りやすい立ち飲み屋を教えてください。' },
    { emoji: '🍶', label: '角打ち体験したい',     message: '角打ちって何ですか？神戸でおすすめの角打ちを教えてください。' },
    { emoji: '💰', label: '1000円以内で飲みたい', message: '予算1000円以内で飲める立ち飲み屋を教えてください。' },
    { emoji: '🐟', label: '海鮮×お酒を楽しみたい', message: '神戸で海鮮料理と一緒にお酒が飲める立ち飲みは？' },
    { emoji: '🆕', label: '新しくオープンした店', message: '最近オープンしたばかりの新しい立ち飲み屋を教えてください。' },
    { emoji: '🍷', label: 'ワインが飲みたい',     message: '三宮・元町でワインが飲める立ち飲みスタンドを教えてください。' },
    { emoji: '🥂', label: '2軒目どこ行く？',      message: '一軒目の後、2軒目にちょうどいい立ち飲みを教えてください。' },
    { emoji: '🌙', label: '深夜でも飲める',        message: '深夜でも営業している立ち飲み屋はありますか？' },
  ],
  en: [
    { emoji: '🍺', label: 'Best standing bars',      message: 'What are the best standing bars near Sannomiya? I want a real local experience.' },
    { emoji: '🍶', label: 'What is kakuuchi?',        message: 'What is kakuuchi and where can I try it in Kobe?' },
    { emoji: '💰', label: 'Drinks under ¥1,000',      message: 'Where can I drink for under 1000 yen in Kobe?' },
    { emoji: '🐟', label: 'Seafood & drinks',         message: 'Where can I enjoy fresh seafood with drinks at a standing bar?' },
    { emoji: '🆕', label: 'Newly opened spots',       message: 'Are there any newly opened standing bars in Sannomiya?' },
    { emoji: '🍷', label: 'Wine standing bars',       message: 'Where can I drink wine at a standing bar in Kobe?' },
    { emoji: '🥂', label: 'Second bar of the night',  message: 'I already had one drink. Where should I go for the second bar?' },
    { emoji: '👤', label: 'Solo-friendly spots',      message: "I'm solo and a bit nervous. What are the most welcoming standing bars?" },
  ],
  'zh-TW': [
    { emoji: '🍺', label: '推薦立式居酒屋',    message: '三宮附近最好的立式居酒屋是哪裡？想體驗在地風情。' },
    { emoji: '🍶', label: '什麼是角打ち？',    message: '角打ち是什麼？神戶哪裡可以體驗？' },
    { emoji: '💰', label: '1000日圓內喝酒',    message: '1000日圓以內可以喝酒的地方？' },
    { emoji: '🐟', label: '海鮮×酒',           message: '可以邊吃新鮮海鮮邊喝酒的立式酒吧？' },
  ],
  'zh-CN': [
    { emoji: '🍺', label: '推荐立饮居酒屋',    message: '三宫附近最好的立饮酒吧是哪里？想体验当地氛围。' },
    { emoji: '🍶', label: '什么是角打ち？',    message: '角打ち是什么？神户哪里可以体验？' },
    { emoji: '💰', label: '1000日元内喝酒',    message: '1000日元以内可以喝酒的地方？' },
    { emoji: '🐟', label: '海鲜×酒',           message: '可以边吃新鲜海鲜边喝酒的立式酒吧？' },
  ],
  ko: [
    { emoji: '🍺', label: '서서 마시는 바 추천', message: '산노미야 근처 최고의 서서 마시는 바는 어디인가요?' },
    { emoji: '🍶', label: '카쿠우치란?',         message: '카쿠우치가 뭔가요? 고베에서 어디서 체험할 수 있나요?' },
    { emoji: '💰', label: '1000엔 이하',          message: '1000엔 이하로 마실 수 있는 곳은?' },
    { emoji: '🐟', label: '해산물 × 술',          message: '신선한 해산물을 먹으면서 마실 수 있는 서서 마시는 바는?' },
  ],
};

export default function QuickStartButtons({ onSelect, language }: QuickStartButtonsProps) {
  const lang = language === 'ja' ? 'ja' : (prompts[language] ? language : 'ja');
  const currentPrompts = prompts[lang];

  return (
    <div className="w-full">
      <p className="text-harbor-400 text-xs text-center mb-3 flex items-center justify-center gap-2">
        <span className="inline-block w-8 h-px bg-harbor-300" />
        よく聞かれること
        <span className="inline-block w-8 h-px bg-harbor-300" />
      </p>
      <div className="grid grid-cols-2 gap-2">
        {currentPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => onSelect(p.message)}
            className="flex items-center gap-2 px-3 py-3 bg-white hover:bg-harbor-100 border border-harbor-200 hover:border-kobe-gold/50 rounded-xl text-left transition-all duration-150 group active:scale-[0.97] shadow-card"
          >
            <span className="text-lg flex-shrink-0">{p.emoji}</span>
            <span className="text-harbor-600 group-hover:text-harbor-800 text-xs font-medium leading-snug transition-colors">
              {p.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
