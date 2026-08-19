export type BibleProvider = "bible-api" | "esv-api" | "api-bible";

export interface BibleVersionInfo {
  id: string;
  label: string;
  abbreviation: string;
  provider: BibleProvider;
  /** Env var name that must be set for this version to work. Undefined = no key needed. */
  requiresEnvKey?: string;
}

/**
 * Every version BURP knows how to fetch. Public-domain versions (bible-api.com)
 * work with zero setup. ESV and NIV need the site owner to register a free key
 * with the publisher and add it to the environment — see lib/bible-actions.ts.
 */
export const BIBLE_VERSIONS: BibleVersionInfo[] = [
  { id: "kjv", label: "King James Version", abbreviation: "KJV", provider: "bible-api" },
  { id: "web", label: "World English Bible", abbreviation: "WEB", provider: "bible-api" },
  { id: "asv", label: "American Standard Version", abbreviation: "ASV", provider: "bible-api" },
  { id: "bbe", label: "Bible in Basic English", abbreviation: "BBE", provider: "bible-api" },
  { id: "esv", label: "English Standard Version", abbreviation: "ESV", provider: "esv-api", requiresEnvKey: "ESV_API_KEY" },
  { id: "niv", label: "New International Version", abbreviation: "NIV", provider: "api-bible", requiresEnvKey: "API_BIBLE_KEY" },
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
