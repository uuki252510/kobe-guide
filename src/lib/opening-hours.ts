/**
 * Google Places の opening_hours_json.periods から「いま開いているか」を判定する。
 *
 * レスポンスに含まれる openNow は取得時点のスナップショットで、DBに保存した瞬間から
 * 古くなる。表示のたびに periods から計算し直す。
 * 対象は神戸の店なので、端末のタイムゾーンに関係なく常に日本時間で判定する。
 */

export interface OpeningPoint {
  day: number; // 0 = 日曜
  hour: number;
  minute: number;
}

export interface OpeningPeriod {
  open?: OpeningPoint;
  close?: OpeningPoint;
}

export interface OpeningHours {
  periods?: OpeningPeriod[];
  weekdayDescriptions?: string[];
}

const WEEK_MINUTES = 7 * 24 * 60;
const DAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const tokyoFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo',
  weekday: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** 週の先頭(日曜0:00)からの経過分。日本時間基準。 */
function tokyoWeekMinutes(at: Date) {
  const parts = tokyoFormat.formatToParts(at);
  const get = (type: string) => parts.find(part => part.type === type)?.value ?? '';
  const day = DAY_INDEX[get('weekday')];
  if (day === undefined) return null;
  return day * 1440 + Number(get('hour')) * 60 + Number(get('minute'));
}

function periodRange(period: OpeningPeriod) {
  if (!period.open) return null;
  const start = period.open.day * 1440 + period.open.hour * 60 + period.open.minute;
  // close が無い = 24時間営業
  if (!period.close) return { start, end: start + WEEK_MINUTES };
  let end = period.close.day * 1440 + period.close.hour * 60 + period.close.minute;
  // 深夜1時閉店など、開店より前の時刻になる場合は翌週側へ送る
  if (end <= start) end += WEEK_MINUTES;
  return { start, end };
}

export interface OpenState {
  /** null = 営業時間データが無く判定不能 */
  open: boolean | null;
  /** 営業中のとき、閉店までの残り分数 */
  closesInMinutes?: number;
}

export function getOpenState(hours: OpeningHours | null | undefined, at: Date = new Date()): OpenState {
  const periods = hours?.periods;
  if (!periods?.length) return { open: null };

  const now = tokyoWeekMinutes(at);
  if (now === null) return { open: null };

  for (const period of periods) {
    const range = periodRange(period);
    if (!range) continue;
    // 週をまたぐ区間も拾えるよう、今週と翌週ぶんの位置で照合する
    for (const point of [now, now + WEEK_MINUTES]) {
      if (point >= range.start && point < range.end) {
        return { open: true, closesInMinutes: range.end - point };
      }
    }
  }

  return { open: false };
}

/** 「まもなく閉店」を出す残り時間のしきい値 */
export const CLOSING_SOON_MINUTES = 60;
