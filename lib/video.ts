export interface VideoEmbed {
  provider: "youtube" | "vimeo";
  id: string;
  embedUrl: string;
  thumbnail: string | null;
}

/**
 * Parse a YouTube or Vimeo URL into an embeddable form.
 * Returns null for unrecognized links so callers can fall back to a plain link.
 */
export function parseVideoUrl(raw?: string | null): VideoEmbed | null {
  if (!raw) return null;
  const url = raw.trim();

  // YouTube — watch?v=, youtu.be/, shorts/, embed/
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    const match =
      url.match(/[?&]v=([^&\n#]+)/) ||
      url.match(/youtu\.be\/([^?&\n#]+)/) ||
      url.match(/youtube\.com\/shorts\/([^?&\n#]+)/) ||
      url.match(/youtube\.com\/embed\/([^?&\n#]+)/);
    if (match) {
      const id = match[1];
      return {
        provider: "youtube",
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        thumbnail: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }

  // Vimeo — vimeo.com/123456789 or vimeo.com/video/123456789
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) {
    const id = vimeo[1];
    return {
      provider: "vimeo",
      id,
      embedUrl: `https://player.vimeo.com/video/${id}`,
      thumbnail: null,
    };
  }

  return null;
}
