"use client";

import { type ReactNode } from "react";
import { extractUrls, URL_REGEX, displayUrl, cleanTrailingPunctuation } from "@/lib/extract-urls";
import { parseVideoUrl } from "@/lib/video";
import VideoEmbed from "@/components/VideoEmbed";
import LinkPreviewCard from "@/components/LinkPreviewCard";

function renderTextWithLinks(text: string): ReactNode[] {
  const segments: ReactNode[] = [];
  const regex = new RegExp(URL_REGEX.source, "gi");
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.slice(lastIndex, match.index));
    }
    const raw = match[0];
    const url = cleanTrailingPunctuation(raw);
    segments.push(
      <a
        key={`${match.index}-${url}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gold-deep hover:text-gold underline underline-offset-2 break-all"
      >
        {displayUrl(url)}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(text.slice(lastIndex));
  }

  return segments.length ? segments : [text];
}

export default function RichPlainTextContent({
  content,
  className = "",
  textClassName = "text-sm text-ink leading-relaxed whitespace-pre-wrap",
}: {
  content: string;
  className?: string;
  textClassName?: string;
}) {
  if (!content?.trim()) return null;

  const urls = extractUrls(content);
  const videoUrls = urls.filter((u) => parseVideoUrl(u));
  const linkUrls = urls.filter((u) => !parseVideoUrl(u));

  return (
    <div className={className}>
      <p className={textClassName}>{renderTextWithLinks(content)}</p>

      {videoUrls.length > 0 && (
        <div className="mt-3 space-y-3">
          {videoUrls.map((url) => (
            <VideoEmbed key={url} url={url} />
          ))}
        </div>
      )}

      {linkUrls.length > 0 && (
        <div className="space-y-0">
          {linkUrls.map((url) => (
            <LinkPreviewCard key={url} url={url} />
          ))}
        </div>
      )}
    </div>
  );
}
