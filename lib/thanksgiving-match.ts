/**
 * Who writes for whom at the Thanksgiving potluck. Pure, so it can be tested
 * without a database.
 *
 * Rules:
 * - Nobody is matched until MIN_GUESTS_TO_MATCH people have RSVP'd, so the
 *   first notes can't be traced back to a tiny pool.
 * - Nobody writes for themselves, and two people never write for each other:
 *   with A→B and B→A, both would know who wrote their note.
 * - Waiting writers are paired with people nobody is writing for yet. When
 *   the only unclaimed person is the newcomer themselves, they write for
 *   whoever has the fewest writers (that card gets two notes), so after the
 *   first group nobody ever waits.
 */

export const MIN_GUESTS_TO_MATCH = 4;

export interface MatchRow {
  id: string;
  target_id: string | null;
  note: string | null;
}

export interface MatchPlan {
  /** writer id → target id, for writers who were waiting */
  assign: Map<string, string>;
  /** writers whose match is withdrawn (only below the minimum, and only if they haven't written) */
  unassign: string[];
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function planMatches(rows: MatchRow[], rand: () => number = Math.random): MatchPlan {
  const ids = new Set(rows.map((r) => r.id));
  const current = new Map<string, string>();
  for (const r of rows) if (r.target_id && ids.has(r.target_id)) current.set(r.id, r.target_id);

  // Too few people: hold off, and withdraw any early matches nobody has written for yet.
  if (rows.length < MIN_GUESTS_TO_MATCH) {
    return { assign: new Map(), unassign: rows.filter((r) => current.has(r.id) && !r.note).map((r) => r.id) };
  }

  const waiting = rows.filter((r) => !current.has(r.id)).map((r) => r.id);
  if (!waiting.length) return { assign: new Map(), unassign: [] };

  const writerCount = new Map<string, number>(rows.map((r) => [r.id, 0]));
  for (const t of current.values()) writerCount.set(t, writerCount.get(t)! + 1);
  const unclaimed = rows.filter((r) => writerCount.get(r.id) === 0).map((r) => r.id);

  // Random pairings of waiting → unclaimed; keep the one that covers the most people.
  let best = new Map<string, string>();
  for (let attempt = 0; attempt < 200 && best.size < Math.min(waiting.length, unclaimed.length); attempt++) {
    const plan = new Map<string, string>();
    const targetOf = (x: string) => plan.get(x) ?? current.get(x);
    const pool = shuffle(unclaimed, rand);
    for (const w of shuffle(waiting, rand)) {
      const i = pool.findIndex((u) => u !== w && targetOf(u) !== w);
      if (i >= 0) plan.set(w, pool.splice(i, 1)[0]);
    }
    if (plan.size > best.size) best = plan;
  }

  // Anyone left writes for whoever has the fewest writers (never themselves, never a mutual pair).
  for (const t of best.values()) writerCount.set(t, writerCount.get(t)! + 1);
  for (const w of waiting) {
    if (best.has(w)) continue;
    const targetOf = (x: string) => best.get(x) ?? current.get(x);
    const options = shuffle(
      rows.filter((r) => r.id !== w && targetOf(r.id) !== w),
      rand
    ).sort((a, b) => writerCount.get(a.id)! - writerCount.get(b.id)!);
    if (!options.length) continue;
    best.set(w, options[0].id);
    writerCount.set(options[0].id, writerCount.get(options[0].id)! + 1);
  }

  return { assign: best, unassign: [] };
}
