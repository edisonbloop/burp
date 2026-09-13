"use server";

import { BIBLE_VERSIONS } from "@/types/bible";
import type { BibleLookupResponse, BibleVersionInfo } from "@/types/bible";

/** Cache actual verse *text* for a week — Bible text never changes, so this is safe and saves rate limit. */
const CACHE_OPTS = { next: { revalidate: 60 * 60 * 24 * 7 } };
/**
 * Cache the api.bible *catalog* (which translations this account can access)
 * for only 5 minutes — publisher access grants can change at any time, and a
 * long cache here would keep serving a stale "not available" verdict for a
 * translation that was just approved.
 */
const CATALOG_CACHE_OPTS = { next: { revalidate: 60 * 5 } };

/**
 * Every version BURP knows about, annotated with whether it's actually usable
 * right now (i.e. its required API key is configured on the server).
 */
export async function getAvailableBibleVersions(): Promise<
  (BibleVersionInfo & { configured: boolean })[]
> {
  return BIBLE_VERSIONS.map((v) => ({
    ...v,
    configured: !v.requiresEnvKey || !!process.env[v.requiresEnvKey],
  }));
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface BibleApiVerse {
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

async function fetchBibleApiChapter(
  book: string,
  chapter: number,
  translation: string
): Promise<BibleApiVerse[] | null> {
  const url = `https://bible-api.com/${encodeURIComponent(`${book} ${chapter}`)}?translation=${translation}`;
  const res = await fetch(url, CACHE_OPTS);
  if (!res.ok) return null;
  const data = await res.json();
  return (data.verses as BibleApiVerse[] | undefined) ?? null;
}

/**
 * Parses "Book Ch:V-Ch:V", "Book Ch:V-V" (same chapter), "Book Ch-Ch" (whole
 * chapters), "Book Ch:V", or "Book Ch" into its parts.
 */
function parseReference(reference: string): {
  book: string;
  chStart: number;
  vStart?: number;
  chEnd?: number;
  vEnd?: number;
} | null {
  const m = reference.match(/^(.+?)\s+(\d+)(?::(\d+))?(?:-(\d+)(?::(\d+))?)?$/);
  if (!m) return null;
  const [, book, chStartStr, vStartStr, secondStr, vEndStr] = m;
  const chStart = parseInt(chStartStr, 10);
  const vStart = vStartStr ? parseInt(vStartStr, 10) : undefined;
  const second = secondStr ? parseInt(secondStr, 10) : undefined;
  const vEnd = vEndStr ? parseInt(vEndStr, 10) : undefined;

  if (second === undefined) return { book, chStart, vStart };
  if (vEnd !== undefined) return { book, chStart, vStart, chEnd: second, vEnd };
  if (vStart !== undefined) return { book, chStart, vStart, chEnd: chStart, vEnd: second };
  return { book, chStart, chEnd: second };
}

/**
 * bible-api.com refuses any range spanning more than one chapter boundary
 * ("too many chapters"). Many of our reading-plan entries span several
 * chapters (e.g. "Genesis 1:1-3:24"), so for those we fetch each whole
 * chapter individually (always supported) and trim the first/last chapter
 * down to the requested verses ourselves, rather than relying on the API's
 * own (narrower) range support.
 */
async function fetchFromBibleApiCom(
  reference: string,
  version: BibleVersionInfo
): Promise<BibleLookupResponse> {
  const parsed = parseReference(reference);
  const spansMultipleChapters = parsed?.chEnd !== undefined && parsed.chEnd - parsed.chStart >= 2;

  if (!parsed || !spansMultipleChapters) {
    const url = `https://bible-api.com/${encodeURIComponent(reference)}?translation=${version.id}`;
    const res = await fetch(url, CACHE_OPTS);
    if (!res.ok) {
      return { error: `Couldn't find "${reference}" in ${version.abbreviation}.` };
    }
    const data = await res.json();
    if (data.error || !data.text) {
      return { error: data.error || `Couldn't find "${reference}" in ${version.abbreviation}.` };
    }
    return {
      result: {
        reference: data.reference || reference,
        text: (data.text as string).replace(/\s+/g, " ").trim(),
        versionId: version.id,
        versionAbbreviation: version.abbreviation,
      },
    };
  }

  const { book, chStart, vStart, chEnd, vEnd } = parsed;
  const chapterNumbers = Array.from({ length: chEnd! - chStart + 1 }, (_, i) => chStart + i);
  const chapters = await Promise.all(chapterNumbers.map((n) => fetchBibleApiChapter(book, n, version.id)));

  const verses: BibleApiVerse[] = [];
  for (let i = 0; i < chapterNumbers.length; i++) {
    const chapterVerses = chapters[i];
    if (!chapterVerses) continue;
    const n = chapterNumbers[i];
    for (const v of chapterVerses) {
      if (n === chStart && vStart !== undefined && v.verse < vStart) continue;
      if (n === chEnd && vEnd !== undefined && v.verse > vEnd) continue;
      verses.push(v);
    }
  }

  if (verses.length === 0) {
    return { error: `Couldn't find "${reference}" in ${version.abbreviation}.` };
  }

  return {
    result: {
      reference,
      text: verses.map((v) => v.text).join(" ").replace(/\s+/g, " ").trim(),
      versionId: version.id,
      versionAbbreviation: version.abbreviation,
    },
  };
}

async function fetchFromEsvApi(
  reference: string,
  version: BibleVersionInfo
): Promise<BibleLookupResponse> {
  const key = process.env.ESV_API_KEY;
  if (!key) {
    return { error: "ESV requires an API key — add ESV_API_KEY to your environment (free at api.esv.org)." };
  }

  const params = new URLSearchParams({
    q: reference,
    "include-headings": "false",
    "include-footnotes": "false",
    "include-verse-numbers": "false",
    "include-short-copyright": "false",
    "include-passage-references": "false",
  });

  const res = await fetch(`https://api.esv.org/v3/passage/text/?${params}`, {
    ...CACHE_OPTS,
    headers: { Authorization: `Token ${key}` },
  });

  if (!res.ok) {
    return { error: `ESV API error (${res.status}). Check your ESV_API_KEY.` };
  }

  const data = await res.json();
  const text = (data.passages?.[0] as string | undefined)?.replace(/\s+/g, " ").trim();
  if (!text) {
    return { error: `Couldn't find "${reference}" in ESV.` };
  }

  return {
    result: {
      reference: data.canonical || reference,
      text,
      versionId: version.id,
      versionAbbreviation: version.abbreviation,
    },
  };
}

// api.bible (scripture.api.bible) resolves a version abbreviation to an internal
// bibleId once, then searches that Bible for the passage. NIV specifically
// requires Biblica to have approved access on the developer's account — a
// valid key alone doesn't guarantee it's available.
async function resolveApiBibleId(abbreviation: string, key: string): Promise<string | null> {
  const res = await fetch("https://api.scripture.api.bible/v1/bibles?language=eng", {
    ...CATALOG_CACHE_OPTS,
    headers: { "api-key": key },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const match = (data.data as { id: string; abbreviation: string }[] | undefined)?.find(
    (b) => b.abbreviation?.toUpperCase() === abbreviation.toUpperCase()
  );
  return match?.id ?? null;
}

async function fetchFromApiBible(
  reference: string,
  version: BibleVersionInfo
): Promise<BibleLookupResponse> {
  const key = process.env.API_BIBLE_KEY;
  if (!key) {
    return {
      error: `${version.abbreviation} requires an API key — add API_BIBLE_KEY to your environment (free at scripture.api.bible).`,
    };
  }

  const bibleId = await resolveApiBibleId(version.apiLookupAbbreviation ?? version.abbreviation, key);
  if (!bibleId) {
    return {
      error: `${version.abbreviation} isn't available on your api.bible account yet — request access for it in your api.bible dashboard.`,
    };
  }

  const params = new URLSearchParams({ query: reference, limit: "1" });
  const res = await fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/search?${params}`, {
    ...CACHE_OPTS,
    headers: { "api-key": key },
  });

  if (res.status === 403) {
    return {
      error: `${version.abbreviation} is listed on your api.bible account but not authorized for content access yet — request access for it in your api.bible dashboard.`,
    };
  }
  if (!res.ok) {
    return { error: `${version.abbreviation} API error (${res.status}).` };
  }

  const data = await res.json();
  const passage = data.data?.passages?.[0];
  if (!passage?.content) {
    return { error: `Couldn't find "${reference}" in ${version.abbreviation}.` };
  }

  return {
    result: {
      reference: passage.reference || reference,
      text: stripHtml(passage.content),
      versionId: version.id,
      versionAbbreviation: version.abbreviation,
    },
  };
}

/**
 * Public: Look up a Bible reference (e.g. "John 3:16" or "Psalm 23:1-3") in a
 * given version. Routes to the right provider and returns a clear error if
 * that version isn't set up yet, rather than throwing.
 */
export async function getBibleVerse(
  reference: string,
  versionId: string
): Promise<BibleLookupResponse> {
  const ref = reference.trim();
  if (!ref) return { error: "Enter a reference, e.g. \"John 3:16\"." };

  const version = BIBLE_VERSIONS.find((v) => v.id === versionId);
  if (!version) return { error: "Unknown Bible version." };

  try {
    switch (version.provider) {
      case "bible-api":
        return await fetchFromBibleApiCom(ref, version);
      case "esv-api":
        return await fetchFromEsvApi(ref, version);
      case "api-bible":
        return await fetchFromApiBible(ref, version);
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong looking that up." };
  }
}
