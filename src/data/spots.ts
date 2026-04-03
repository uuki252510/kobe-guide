export type MoodId = 'solo' | 'budget' | 'kakuuchi' | 'seafood' | 'wine' | 'new' | 'late' | 'second';

export interface SpotData {
  id: string;
  name: string;
  area: 'sannomiya' | 'motomachi' | 'surroundings';
  budgetMin: number;
  budgetMax: number;
  tags: string[];
  moodCategories: MoodId[];
  gradient: string;
  accentChar: string;
  photoUrl?: string;
  shortComment: string;
  isOpen: boolean;
  type: string;
  googleMapsUrl?: string;
}

export interface MoodItem {
  id: MoodId;
  label: string;
  sublabel: string;
  chatPrompt: string;
}

export const AREA_LABELS: Record<string, string> = {
  sannomiya: '三宮',
  motomachi: '元町',
  surroundings: '周辺',
};

export const MOODS: MoodItem[] = [
  {
    id: 'solo',
    label: '一人でふらっと',
    sublabel: 'サクッと入れる店を提案',
    chatPrompt: '三宮で一人でも入りやすい立ち飲み屋を教えてください。',
  },
  {
    id: 'budget',
    label: '1000円以内',
    sublabel: '財布に優しい一杯',
    chatPrompt: '予算1000円以内で飲める立ち飲み屋を教えてください。',
  },
  {
    id: 'kakuuchi',
    label: '角打ちを体験',
    sublabel: '本物の神戸酒文化へ',
    chatPrompt: '角打ちって何ですか？神戸でおすすめの角打ちを教えてください。',
  },
  {
    id: 'seafood',
    label: '海鮮で一杯',
    sublabel: '漁港直送の肴と地酒',
    chatPrompt: '神戸で海鮮料理と一緒にお酒が飲める立ち飲みは？',
  },
  {
    id: 'wine',
    label: 'ワインを飲む',
    sublabel: 'スタンドで気軽にグラスを',
    chatPrompt: '三宮・元町でワインが飲める立ち飲みスタンドを教えてください。',
  },
  {
    id: 'new',
    label: '新規オープン',
    sublabel: '話題の新しい店へ',
    chatPrompt: '最近オープンしたばかりの新しい立ち飲み屋を教えてください。',
  },
  {
    id: 'late',
    label: '深夜でも飲む',
    sublabel: '遅い時間も営業中',
    chatPrompt: '深夜でも営業している立ち飲み屋はありますか？',
  },
  {
    id: 'second',
    label: '2軒目を探す',
    sublabel: '締めの一杯にちょうどいい',
    chatPrompt: '一軒目の後、2軒目にちょうどいい立ち飲みを教えてください。',
  },
];

export const DUMMY_SPOTS: SpotData[] = [
  {
    id: 'd-1',
    name: '酒蔵いのうえ',
    area: 'motomachi',
    budgetMin: 500,
    budgetMax: 1000,
    tags: ['角打ち', '老舗', 'ひとり歓迎'],
    moodCategories: ['kakuuchi', 'solo', 'budget'],
    gradient: 'linear-gradient(145deg, #0f0720 0%, #1e1040 55%, #0a0518 100%)',
    accentChar: '酒',
    shortComment: '地元の人が夕方にふらっと立ち寄る、昭和の佇まいそのままの角打ち老舗',
    isOpen: true,
    type: '角打ち',
  },
  {
    id: 'd-2',
    name: 'ワインスタンド サンノミヤ',
    area: 'sannomiya',
    budgetMin: 800,
    budgetMax: 1500,
    tags: ['ナチュラルワイン', 'おひとり様◎', 'スタンディング'],
    moodCategories: ['wine', 'solo', 'second'],
    gradient: 'linear-gradient(145deg, #1a0010 0%, #2e0025 55%, #100010 100%)',
    accentChar: '赤',
    shortComment: '気軽に立ち飲みできるナチュラルワイン専門。2杯目の選択肢として最高',
    isOpen: true,
    type: 'ワインバー',
  },
  {
    id: 'd-3',
    name: '海の幸 たちのみ',
    area: 'sannomiya',
    budgetMin: 1000,
    budgetMax: 2000,
    tags: ['海鮮', '地酒', '鮮度抜群'],
    moodCategories: ['seafood', 'second'],
    gradient: 'linear-gradient(145deg, #000d20 0%, #001530 55%, #000810 100%)',
    accentChar: '魚',
    shortComment: '漁港直送の刺身が光る。日本酒との組み合わせが絶品の海鮮立ち飲み',
    isOpen: true,
    type: '海鮮立ち飲み',
  },
  {
    id: 'd-4',
    name: 'のんびり角打ち',
    area: 'motomachi',
    budgetMin: 400,
    budgetMax: 800,
    tags: ['角打ち', '格安', '地元民御用達'],
    moodCategories: ['kakuuchi', 'budget', 'solo'],
    gradient: 'linear-gradient(145deg, #0d0718 0%, #1a0d2e 55%, #080412 100%)',
    accentChar: '呑',
    shortComment: '1杯300円から。地元の常連が夕方から集まる昭和の角打ち',
    isOpen: false,
    type: '角打ち',
  },
  {
    id: 'd-5',
    name: 'あかり深夜バー',
    area: 'sannomiya',
    budgetMin: 800,
    budgetMax: 1500,
    tags: ['深夜営業', '2軒目OK', '落ち着いた空間'],
    moodCategories: ['late', 'second', 'solo'],
    gradient: 'linear-gradient(145deg, #080810 0%, #10101e 55%, #050508 100%)',
    accentChar: '夜',
    shortComment: '日付をまたいでも開いてる。神戸の夜を締めくくる大人の空間',
    isOpen: true,
    type: '立ち飲みバー',
  },
  {
    id: 'd-6',
    name: 'BISTRO STAND',
    area: 'sannomiya',
    budgetMin: 900,
    budgetMax: 1800,
    tags: ['新店', 'フレンチ', 'ワイン充実'],
    moodCategories: ['new', 'wine', 'second'],
    gradient: 'linear-gradient(145deg, #001a10 0%, #003020 55%, #000d08 100%)',
    accentChar: '新',
    shortComment: '2025年春オープン。本格フレンチをカジュアルに立ち飲みで楽しめる新感覚',
    isOpen: true,
    type: '洋風立ち飲み',
  },
  {
    id: 'd-7',
    name: '魚真 元町店',
    area: 'motomachi',
    budgetMin: 700,
    budgetMax: 1500,
    tags: ['海鮮', '日本酒', '格安'],
    moodCategories: ['seafood', 'budget'],
    gradient: 'linear-gradient(145deg, #000a18 0%, #001020 55%, #000508 100%)',
    accentChar: '海',
    shortComment: '朝獲れ鮮魚と神戸の地酒。元町の海鮮立ち飲みといえばここ',
    isOpen: true,
    type: '海鮮立ち飲み',
  },
  {
    id: 'd-8',
    name: '高架下ジャパン',
    area: 'sannomiya',
    budgetMin: 500,
    budgetMax: 1000,
    tags: ['角打ち', '高架下', '雰囲気◎'],
    moodCategories: ['kakuuchi', 'budget', 'solo'],
    gradient: 'linear-gradient(145deg, #100810 0%, #201020 55%, #080408 100%)',
    accentChar: '架',
    shortComment: '高架下の独特な空気感。日常から切り離された立ち飲みの聖地',
    isOpen: true,
    type: '角打ち',
  },
  {
    id: 'd-9',
    name: 'NIGHT STAND KOBE',
    area: 'sannomiya',
    budgetMin: 1000,
    budgetMax: 2000,
    tags: ['深夜', 'こだわりカクテル', 'BGMあり'],
    moodCategories: ['late', 'second'],
    gradient: 'linear-gradient(145deg, #050510 0%, #0a0a18 55%, #030308 100%)',
    accentChar: '深',
    shortComment: '音楽と深夜の空気が心地よい。最後の一軒に迷ったらここで決まり',
    isOpen: false,
    type: '立ち飲みバー',
  },
  {
    id: 'd-10',
    name: 'さくら立ち飲み',
    area: 'motomachi',
    budgetMin: 600,
    budgetMax: 1200,
    tags: ['新店', 'ひとり歓迎', 'おでん'],
    moodCategories: ['new', 'solo'],
    gradient: 'linear-gradient(145deg, #1a0808 0%, #2e1010 55%, #0d0404 100%)',
    accentChar: '桜',
    shortComment: '2025年オープン。おでんと熱燗が自慢の温かみある新店',
    isOpen: true,
    type: '立ち飲み',
  },
];
