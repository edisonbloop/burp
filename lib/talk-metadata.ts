import { parseVideoUrl } from "./video";
import { extractUrls } from "./extract-urls";

export const BASE_URL = "https://www.burp.ink";

export function discussionPath(discussionId: string) {
  return `/talk-it-over/discussion/${discussionId}`;
}

export function discussionUrl(discussionId: string) {
  return `${BASE_URL}${discussionPath(discussionId)}`;
}

export function planPath(planId: string) {
  return `/talk-it-over/${planId}`;
}

export function planUrl(planId: string) {
  return `${BASE_URL}${planPath(planId)}`;
}

export function truncateForMeta(text: string, max = 160): string {
  return text.replace(/\s+/g, " ").trim().slice(0, max);
}

export function discussionShareTitle(authorName: string, planTitle: string) {
  return `${authorName} on ${planTitle} — Talk It Over`;
}

/** First YouTube/Vimeo thumbnail found in any content strings. */
export function firstVideoThumbnail(
  ...contents: (string | null | undefined)[]
): string | undefined {
  for (const content of contents) {
    if (!content) continue;
    for (const url of extractUrls(content)) {
      const video = parseVideoUrl(url);
      if (video?.thumbnail) return video.thumbnail;
    }
  }
  return undefined;
}

export function combinedDiscussionText(
  ...contents: (string | null | undefined)[]
): string {
  return contents.filter(Boolean).join(" ");
}
