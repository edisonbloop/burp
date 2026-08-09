import { ImageResponse } from "next/og";
import { getDiscussion, getThreadPosts } from "@/lib/talk-actions";
import { truncateForMeta } from "@/lib/talk-metadata";

export const runtime = "nodejs";
export const alt = "Talk It Over — BURP";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage({
  params,
}: {
  params: Promise<{ discussionId: string }>;
}) {
  const { discussionId } = await params;
  const discussion = await getDiscussion(discussionId);

  const author = (discussion?.title as string | undefined) ?? "BURP Community";
  const planTitle =
    (discussion?.reading_plans as { title?: string } | undefined)?.title ??
    "Talk It Over";

  let excerpt = truncateForMeta((discussion?.content as string | undefined) ?? "", 180);
  if (discussion?.thread_id) {
    const threadPosts = await getThreadPosts(discussion.thread_id as string);
    excerpt = truncateForMeta(
      threadPosts.map((p) => p.content).filter(Boolean).join(" "),
      180
    );
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          background: "#F7F3EA",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "linear-gradient(90deg, #B8924A, #E8C9A0, #B8924A)",
            display: "flex",
          }}
        />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "56px 72px 48px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div
              style={{
                background: "#F1ECE0",
                border: "1px solid #D6CCB8",
                borderRadius: "999px",
                padding: "6px 18px",
                fontSize: "13px",
                fontWeight: 700,
                color: "#8E6F33",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              Talk It Over
            </div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "#A89A85",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              BURP
            </div>
          </div>

          <div
            style={{
              fontSize: excerpt.length > 120 ? "40px" : "48px",
              fontWeight: 700,
              color: "#1A1714",
              lineHeight: 1.2,
              maxWidth: "960px",
              display: "flex",
              fontStyle: "italic",
            }}
          >
            {excerpt || "A reflection from the Berean Upper Room Platform."}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "36px", height: "2px", background: "#B8924A", display: "flex" }} />
              <div style={{ fontSize: "18px", color: "#1A1714", fontWeight: 700, display: "flex" }}>
                {author}
              </div>
            </div>
            <div
              style={{
                fontSize: "15px",
                color: "#6B5F50",
                fontWeight: 600,
                display: "flex",
                maxWidth: "420px",
              }}
            >
              {planTitle}
            </div>
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "6px",
            background: "linear-gradient(90deg, #B8924A, #E8C9A0, #B8924A)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
