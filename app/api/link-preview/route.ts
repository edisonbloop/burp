import { NextResponse } from "next/server";

function metaContent(html: string, property: string): string | undefined {
  const patterns = [
    new RegExp(`property=["']${property}["']\\s+content=["']([^"']+)["']`, "i"),
    new RegExp(`content=["']([^"']+)["']\\s+property=["']${property}["']`, "i"),
    new RegExp(`name=["']${property}["']\\s+content=["']([^"']+)["']`, "i"),
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1]) return decodeHtmlEntities(match[1]);
  }
  return undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function titleFromHtml(html: string): string | undefined {
  return metaContent(html, "og:title") ?? html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BURPBot/1.0; +https://www.burp.ink)",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({
        url: parsed.toString(),
        title: parsed.hostname,
        siteName: parsed.hostname,
      });
    }

    const html = await res.text();
    const title = titleFromHtml(html);
    const description = metaContent(html, "og:description") ?? metaContent(html, "description");
    const image = metaContent(html, "og:image");
    const siteName = metaContent(html, "og:site_name") ?? parsed.hostname;

    return NextResponse.json({
      url: parsed.toString(),
      title,
      description: description?.slice(0, 200),
      image,
      siteName,
    });
  } catch {
    return NextResponse.json({
      url: parsed.toString(),
      title: parsed.hostname,
      siteName: parsed.hostname,
    });
  }
}
