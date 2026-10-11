"use server";

import { getSupabase } from "./supabase";
import { getCurrentDayNumber } from "./day-number";

/**
 * "Burp It Quiz" — questions generated from the Bible readings in the Burp It
 * (One Year Bible) plan. Verse text comes from bible-api.com (WEB, public
 * domain), cached for a week. Nothing is stored; every round is fresh.
 */

export type QuizMode = "today" | "recent" | "journey";

export type QuizQuestion = {
  id: string;
  type: "fill" | "book";
  /** Verse text. For "fill", the blanked word is replaced with "_____". */
  verse: string;
  /** The full verse, shown on reveal. */
  fullVerse: string;
  options: string[];
  answer: string;
  reference: string;
  dayNumber: number;
  planId: string | null;
};

export type QuizResponse = { questions: QuizQuestion[]; error?: string };

type Verse = { chapter: number; verse: number; text: string };
type Chapter = { book: string; chapter: number; verses: Verse[] };

const CACHE = { next: { revalidate: 60 * 60 * 24 * 7 } };

const STOP = new Set(
  (
    "about after again against all also always among because been before being between both but came come could " +
    "did does done down each even every from give given goes going had has have her here him his how into its just " +
    "know made make many more most much must never not now only other our out over said shall should since some " +
    "such than that the their them then there these they this those thou thee thy thine through unto upon very " +
    "was were what when where which while who whom whose will with would yet you your ye"
  ).split(" ")
);

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

function parseRef(ref: string) {
  const m = ref.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/);
  if (!m) return null;
  const book = m[1];
  const chStart = parseInt(m[2], 10);
  const vStart = m[3] ? parseInt(m[3], 10) : undefined;
  const second = m[4] ? parseInt(m[4], 10) : undefined;
  const vEnd = m[5] ? parseInt(m[5], 10) : undefined;
  if (second === undefined) return { book, chStart, chEnd: chStart, vStart, vEnd: undefined as number | undefined };
  if (vEnd !== undefined) return { book, chStart, chEnd: second, vStart, vEnd };
  if (vStart !== undefined) return { book, chStart, chEnd: chStart, vStart, vEnd: second };
  return { book, chStart, chEnd: second, vStart: undefined, vEnd: undefined };
}

async function fetchChapter(book: string, chapter: number): Promise<Chapter | null> {
  try {
    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(`${book} ${chapter}`)}?translation=web`,
      CACHE
    );
    if (!res.ok) return null;
    const data = await res.json();
    const verses = (data.verses as { chapter: number; verse: number; text: string }[] | undefined)?.map((v) => ({
      chapter: v.chapter,
      verse: v.verse,
      text: v.text.replace(/\s+/g, " ").trim().replace(/^[“‘"']+/, "").replace(/[”’"']+$/, ""),
    }));
    if (!verses?.length) return null;
    return { book, chapter, verses };
  } catch {
    return null;
  }
}

const wordCount = (s: string) => s.split(/\s+/).length;

/** Candidate words to blank: meaningful, not too short, not at the very start/end. */
function blankCandidates(text: string): { word: string; index: number }[] {
  const tokens = text.split(" ");
  const out: { word: string; index: number }[] = [];
  tokens.forEach((tok, index) => {
    if (index === 0 || index >= tokens.length - 1) return;
    const word = tok.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
    if (word.length < 5 || !/^[A-Za-z]+$/.test(word)) return;
    if (STOP.has(word.toLowerCase())) return;
    out.push({ word, index });
  });
  return out;
}

function buildFill(text: string, pool: string[]) {
  const cands = blankCandidates(text);
  if (!cands.length) return null;
  const { word, index } = pick(cands);
  const tokens = text.split(" ");
  const prefix = tokens[index].match(/^[^A-Za-z]*/)![0];
  const suffix = tokens[index].match(/[^A-Za-z]*$/)![0];
  tokens[index] = `${prefix}_____${suffix}`;

  const isCap = /^[A-Z]/.test(word);
  const inVerse = new Set(text.toLowerCase().split(/[^a-z]+/));
  // Prefer look-alikes: same capitalisation, similar length, same word ending (-ed, -ing, -s…).
  const ending = (w: string) => (/(ing|ed|ly|s)$/i.exec(w)?.[1] ?? "").toLowerCase();
  const wEnd = ending(word);
  const scored = Array.from(new Set(pool))
    .filter((w) => w.toLowerCase() !== word.toLowerCase() && !inVerse.has(w.toLowerCase()))
    .filter((w) => /^[A-Z]/.test(w) === isCap && Math.abs(w.length - word.length) <= 3)
    .map((w) => ({ w, score: (ending(w) === wEnd ? 2 : 0) - Math.abs(w.length - word.length) * 0.5 + Math.random() }))
    .sort((a, b) => b.score - a.score);
  const distractors = shuffle(scored.slice(0, 8).map((x) => x.w)).slice(0, 3);
  if (distractors.length < 3) return null;
  return { verse: tokens.join(" "), answer: word, options: shuffle([word, ...distractors]) };
}

function poolFromChapters(chapters: Chapter[]): string[] {
  const words: string[] = [];
  for (const c of chapters)
    for (const v of c.verses)
      for (const tok of v.text.split(" ")) {
        const w = tok.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
        if (w.length >= 5 && /^[A-Za-z]+$/.test(w) && !STOP.has(w.toLowerCase())) words.push(w);
      }
  return words;
}

export async function getBurpItQuiz(mode: QuizMode): Promise<QuizResponse> {
  let supabase;
  try {
    supabase = getSupabase();
  } catch {
    return { questions: [], error: "The quiz is unavailable right now." };
  }

  const today = getCurrentDayNumber();
  const [daysRes, plansRes] = await Promise.all([
    supabase.from("one_year_plan_days").select("day_number, readings").order("day_number"),
    supabase.from("reading_plans").select("id, day_number").not("day_number", "is", null),
  ]);
  const allDays = (daysRes.data as { day_number: number; readings: string[] }[] | null) ?? [];
  if (!allDays.length) return { questions: [], error: "No readings found yet." };
  const planIdByDay = new Map<number, string>(
    ((plansRes.data as { id: string; day_number: number }[] | null) ?? []).map((p) => [p.day_number, p.id])
  );

  const lower = mode === "today" ? today : mode === "recent" ? Math.max(1, today - 13) : 1;
  const days = allDays.filter((d) => d.day_number >= lower && d.day_number <= today);
  const eligible = days.length ? days : allDays.filter((d) => d.day_number <= today);
  const want = mode === "today" ? 5 : 10;

  // Distinct books across the whole plan — fuel for "which book?" options.
  const allBooks = Array.from(
    new Set(allDays.flatMap((d) => d.readings.map((r) => parseRef(r)?.book).filter(Boolean) as string[]))
  );

  // Pick unique (day, reading, chapter) sources, then fetch them in parallel.
  type Source = { day: number; ref: string; book: string; chapter: number; vStart?: number; vEnd?: number; chStart: number; chEnd: number };
  const sources: Source[] = [];
  const seen = new Set<string>();
  let guard = 0;
  while (sources.length < want * 2 && guard++ < 200) {
    const d = pick(eligible);
    const ref = pick(d.readings);
    const p = parseRef(ref);
    if (!p) continue;
    const chapter = p.chStart + Math.floor(Math.random() * (p.chEnd - p.chStart + 1));
    const key = `${p.book}-${chapter}`;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ day: d.day_number, ref, book: p.book, chapter, vStart: p.vStart, vEnd: p.vEnd, chStart: p.chStart, chEnd: p.chEnd });
  }

  const chapters = await Promise.all(sources.map((s) => fetchChapter(s.book, s.chapter)));
  const usable = chapters.map((c, i) => ({ c, s: sources[i] })).filter((x): x is { c: Chapter; s: Source } => !!x.c);
  const pool = poolFromChapters(usable.map((u) => u.c));

  const questions: QuizQuestion[] = [];
  let n = 0;
  for (const { c, s } of usable) {
    if (questions.length >= want) break;
    const inRange = c.verses.filter((v) => {
      if (c.chapter === s.chStart && s.vStart !== undefined && v.verse < s.vStart) return false;
      if (c.chapter === s.chEnd && s.vEnd !== undefined && v.verse > s.vEnd) return false;
      return true;
    });
    const good = inRange.filter((v) => wordCount(v.text) >= 10 && wordCount(v.text) <= 34);
    if (!good.length) continue;
    const v = pick(good);
    const reference = `${c.book} ${c.chapter}:${v.verse}`;
    const base = { reference, dayNumber: s.day, planId: planIdByDay.get(s.day) ?? null, fullVerse: v.text };

    // Alternate types so a round feels varied.
    const wantBook = n % 2 === 1;
    if (!wantBook) {
      const f = buildFill(v.text, pool);
      if (f) {
        questions.push({ id: `q${n++}`, type: "fill", ...base, verse: f.verse, answer: f.answer, options: f.options });
        continue;
      }
    }
    const wrong = shuffle(allBooks.filter((b) => b !== c.book)).slice(0, 3);
    if (wrong.length === 3) {
      questions.push({
        id: `q${n++}`,
        type: "book",
        ...base,
        verse: v.text,
        answer: c.book,
        options: shuffle([c.book, ...wrong]),
      });
    }
  }

  if (!questions.length) return { questions: [], error: "Couldn't load verses right now. Please try again." };
  return { questions };
}
