/** Match http(s) URLs in plain text — stops at common trailing punctuation. */
export const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;

export function extractUrls(text: string): string[] {
  const matches = text.match(URL_REGEX) ?? [];
  return [...new Set(matches.map(cleanTrailingPunctuation))];
}

export function cleanTrailingPunctuation(url: string): string {
  return url.replace(/[.,;:!?)]+$/g, "");
}

export function displayUrl(url: string, max = 48): string {
  const cleaned = cleanTrailingPunctuation(url);
  try {
    const parsed = new URL(cleaned);
    const short = parsed.hostname + parsed.pathname;
    if (short.length <= max) return short;
    return short.slice(0, max - 1) + "…";
  } catch {
    return cleaned.length > max ? cleaned.slice(0, max - 1) + "…" : cleaned;
  }
}
