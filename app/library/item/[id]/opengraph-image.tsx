import { ImageResponse } from "next/og";
import { getLibraryItemById } from "@/lib/library-actions";

export const runtime = "nodejs";
export const alt = "BURP Content Library";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const TYPE_LABELS: Record<string, string> = {
  poems: "Poem",
  "write-ups": "Write-Up",
  "long-messages": "Long Message",
  videos: "Video",
  others: "Other",
};

export default async function OGImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getLibraryItemById(id);

  const title = item?.title ?? "BURP Content Library";
  const author = item?.author || "Anonymous";
  const topic = item?.topic ?? "";
  const typeLabel = item ? (TYPE_LABELS[item.type] ?? item.type) : "";
  const excerpt = item
    ? (item.excerpt || item.content).slice(0, 180) + ((item.content.length > 180) ? "…" : "")
    : "Berean Upper Room Platform";

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
        {/* Gold top border */}
        <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #B8924A, #E8C9A0, #B8924A)", display: "flex" }} />

        {/* Main content area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: "60px 80px 50px",
            justifyContent: "space-between",
          }}
        >
          {/* Top row: type badge + BURP brand */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            {typeLabel ? (
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
                {typeLabel}
              </div>
            ) : (
              <div style={{ display: "flex" }} />
            )}
            <div
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "#A89A85",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              BURP · Berean Upper Room Platform
            </div>
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: title.length > 50 ? "52px" : "64px",
              fontWeight: 700,
              color: "#1A1714",
              lineHeight: 1.15,
              maxWidth: "900px",
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Excerpt */}
          <div
            style={{
              fontSize: "22px",
              color: "#6B5F50",
              lineHeight: 1.6,
              maxWidth: "860px",
              display: "flex",
              fontStyle: "italic",
            }}
          >
            {excerpt}
          </div>

          {/* Bottom row: author + topic */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "36px",
                  height: "2px",
                  background: "#B8924A",
                  display: "flex",
                }}
              />
              <div
                style={{
                  fontSize: "16px",
                  color: "#6B5F50",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {author}
              </div>
            </div>
            {topic ? (
              <div
                style={{
                  background: "#F5E9D2",
                  border: "1px solid #D6CCB8",
                  borderRadius: "999px",
                  padding: "6px 18px",
                  fontSize: "14px",
                  color: "#8E6F33",
                  fontWeight: 600,
                  display: "flex",
                }}
              >
                {topic}
              </div>
            ) : null}
          </div>
        </div>

        {/* Gold bottom border */}
        <div style={{ width: "100%", height: "6px", background: "linear-gradient(90deg, #B8924A, #E8C9A0, #B8924A)", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
