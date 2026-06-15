import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { postTweet } from "@/lib/twitter";

/** Called by Vercel Cron every day at 6 PM UTC */
export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron (or our own secret for manual triggers)
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();

    // -- This week's window --------------------------------------------------
    const now      = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const since    = yesterday.toISOString();

    // -- Pull stats in parallel ----------------------------------------------
    const [
      { count: postCount },
      { count: commentCount },
      { count: libraryCount },
      { data: topPosts },
    ] = await Promise.all([
      // Free-form feed posts this week
      supabase
        .from("discussions")
        .select("*", { count: "exact", head: true })
        .is("day_number", null)
        .gte("created_at", since),

      // Comments / reflections this week
      supabase
        .from("comments")
        .select("*", { count: "exact", head: true })
        .gte("created_at", since),

      // Approved library items this week
      supabase
        .from("library_items")
        .select("*", { count: "exact", head: true })
        .eq("approved", true)
        .gte("created_at", since),

      // Most replied-to discussion this week (for a quote)
      supabase
        .from("discussions")
        .select("id, title, content")
        .is("day_number", null)
        .not("content", "is", null)
        .gte("created_at", since)
        .limit(5),
    ]);

    const posts    = postCount    ?? 0;
    const comments = commentCount ?? 0;
    const library  = libraryCount ?? 0;

    // Bail quietly if it's been a very quiet week (no posts at all)
    if (posts === 0 && comments === 0) {
      return NextResponse.json({ skipped: true, reason: "Nothing new this week" });
    }

    // -- Pick a snippet from the top post ------------------------------------
    let snippet = "";
    if (topPosts && topPosts.length > 0) {
      const raw = topPosts[0].content ?? "";
      // Strip any HTML tags (in case of rich text)
      const plain = raw.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (plain.length > 0) {
        snippet = plain.length > 120 ? `"${plain.slice(0, 117)}…"` : `"${plain}"`;
      }
    }

    // -- Compose the tweet ---------------------------------------------------
    const lines: string[] = [];

    lines.push("Today in the Upper Room 📖");
    lines.push("");

    if (posts > 0)    lines.push(`💬 ${posts} post${posts !== 1 ? "s" : ""} shared`);
    if (comments > 0) lines.push(`✍️ ${comments} reflection${comments !== 1 ? "s" : ""} written`);
    if (library > 0)  lines.push(`📚 ${library} new piece${library !== 1 ? "s" : ""} in the Library`);

    if (snippet) {
      lines.push("");
      lines.push(snippet);
    }

    lines.push("");
    lines.push("Come feast with us → burp.ink");
    lines.push("");
    lines.push("#BURP #BibleStudy #Faith #Community");

    const tweetText = lines.join("\n");

    // Safety check — Twitter max is 280 chars
    if (tweetText.length > 280) {
      // Trim to version without snippet
      const short = [
        "Today in the Upper Room 📖",
        "",
        posts    > 0 ? `💬 ${posts} post${posts !== 1 ? "s" : ""} shared`              : null,
        comments > 0 ? `✍️ ${comments} reflection${comments !== 1 ? "s" : ""} written` : null,
        library  > 0 ? `📚 ${library} piece${library !== 1 ? "s" : ""} in the Library` : null,
        "",
        "Come feast with us → burp.ink",
        "#BURP #BibleStudy #Faith",
      ].filter(Boolean).join("\n");

      const result = await postTweet(short);
      return NextResponse.json({ ok: true, tweet: result, used: "short" });
    }

    const result = await postTweet(tweetText);
    return NextResponse.json({ ok: true, tweet: result });

  } catch (err) {
    console.error("Weekly digest error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
