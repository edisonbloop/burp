/** Normalize text for case-insensitive search. */
export function normalizeSearchQuery(query: string): string {
  return query.trim().toLocaleLowerCase("en-US");
}

/** Case-insensitive substring match. Empty query matches everything. */
export function textMatchesQuery(
  text: string | null | undefined,
  query: string
): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  if (!text) return false;
  return text.toLocaleLowerCase("en-US").includes(q);
}

/** Match if any of the provided strings contain the query (case-insensitive). */
export function anyTextMatchesQuery(
  query: string,
  ...texts: (string | null | undefined)[]
): boolean {
  const q = normalizeSearchQuery(query);
  if (!q) return true;
  return texts.some((text) => textMatchesQuery(text, q));
}
