import { BIBLE_QUOTES, SPEAKER_POOL, type BibleQuote } from "./bible-quotes";

// xorshift32 — fast, deterministic, good enough for shuffling
function xorshift32(seed: number) {
  let s = (seed | 0) || 1;
  return (): number => {
    s ^= s << 13;
    s ^= s >> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967295;
  };
}

function seededShuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateSeed(dateStr: string): number {
  return dateStr.split("-").reduce((acc, n) => acc * 100 + parseInt(n, 10), 0);
}

export const DAILY_TOTAL = 5;

export function getDailyQuotes(dateStr: string): BibleQuote[] {
  const rand = xorshift32(dateSeed(dateStr));
  return seededShuffle(BIBLE_QUOTES, rand).slice(0, DAILY_TOTAL);
}

// Options are also seeded so every player sees the same 4 choices
export function getDailyOptions(quote: BibleQuote, questionIndex: number, dateStr: string): string[] {
  const seed = dateSeed(dateStr) ^ (questionIndex * 0x9e3779b9);
  const rand = xorshift32(seed);
  const pool = SPEAKER_POOL.filter((s) => s !== quote.speaker);
  const wrongs = seededShuffle(pool, rand).slice(0, 3);
  return seededShuffle([quote.speaker, ...wrongs], rand);
}

export function getDailyKey(dateStr: string): string {
  return `burp_daily_${dateStr}`;
}

export type DailyResult = {
  completed: boolean;
  score: number;
  total: number;
  completedAt: string;
};

export function hoursUntilTomorrow(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
}

export function formatDailyDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });
}
