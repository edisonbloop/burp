export type BibleProvider = "bible-api" | "esv-api" | "api-bible";

export interface BibleVersionInfo {
  id: string;
  label: string;
  abbreviation: string;
  provider: BibleProvider;
  /** Env var name that must be set for this version to work. Undefined = no key needed. */
  requiresEnvKey?: string;
  /**
   * The abbreviation to search for in api.bible's catalog, when it differs
   * from the display `abbreviation` (e.g. their NIV is catalogued as "NIV11").
   */
  apiLookupAbbreviation?: string;
}

/**
 * Every version BURP knows how to fetch. Public-domain versions (bible-api.com)
 * work with zero setup. ESV and the api.bible-hosted versions need the site
 * owner to register a free key with the publisher — see lib/bible-actions.ts.
 */
export const BIBLE_VERSIONS: BibleVersionInfo[] = [
  { id: "kjv", label: "King James Version", abbreviation: "KJV", provider: "bible-api" },
  { id: "web", label: "World English Bible", abbreviation: "WEB", provider: "bible-api" },
  { id: "asv", label: "American Standard Version", abbreviation: "ASV", provider: "bible-api" },
  { id: "bbe", label: "Bible in Basic English", abbreviation: "BBE", provider: "bible-api" },
  { id: "esv", label: "English Standard Version", abbreviation: "ESV", provider: "esv-api", requiresEnvKey: "ESV_API_KEY" },
  { id: "nlt", label: "New Living Translation", abbreviation: "NLT", provider: "api-bible", requiresEnvKey: "API_BIBLE_KEY" },
  { id: "msg", label: "The Message", abbreviation: "MSG", provider: "api-bible", requiresEnvKey: "API_BIBLE_KEY" },
  { id: "amp", label: "Amplified Bible", abbreviation: "AMP", provider: "api-bible", requiresEnvKey: "API_BIBLE_KEY" },
];

export interface BibleVerseResult {
  reference: string;
  text: string;
  versionId: string;
  versionAbbreviation: string;
}

export interface BibleLookupResponse {
  result?: BibleVerseResult;
  error?: string;
}
