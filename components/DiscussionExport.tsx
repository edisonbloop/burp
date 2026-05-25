"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface ExportComment {
  id: string;
  content: string;
  created_at: string;
  attributed_to?: string | null;
  profiles: { full_name: string | null } | null;
}

interface Props {
  discussionId: string;
  discussionTitle: string; // person's name
  discussionContent: string | null;
  planTitle: string;
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function displayName(c: ExportComment) {
  return c.attributed_to ?? c.profiles?.full_name ?? "Anonymous";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

export default function DiscussionExport({
  discussionId, discussionTitle, discussionContent, planTitle,
}: Props) {
  const supabase = getSupabaseBrowserClient();
  const exportRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<ExportComment[] | null>(null);
  const [busy, setBusy] = useState(false);

  const ensureComments = async () => {
    if (comments !== null) return comments;
    const { data } = await supabase
      .from("comments")
      .select("*, attributed_to, profiles(full_name)")
      .eq("discussion_id", discussionId)
      .order("created_at", { ascending: true });
    const fetched = (data ?? []) as ExportComment[];
    setComments(fetched);
    return fetched;
  };

  const capture = async () => {
    setBusy(true);
    await ensureComments();
    // Give React one frame to paint the hidden div with comments
    await new Promise((r) => setTimeout(r, 400));

    const el = exportRef.current;
    if (!el) { setBusy(false); return null; }

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#f5efe3",
      logging: false,
    });
    setBusy(false);
    return canvas;
  };

  const slug = discussionTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const downloadImage = async () => {
    const canvas = await capture();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `burp-${slug}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const downloadPDF = async () => {
    const canvas = await capture();
    if (!canvas) return;
    const { jsPDF } = await import("jspdf");
    const w = canvas.width / 2;
    const h = canvas.height / 2;
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [w, h] });
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, w, h);
    pdf.save(`burp-${slug}.pdf`);
  };

  const c = comments ?? [];

  // ── Palette (inline for html2canvas reliability) ──────────────────────────
  const bg      = "#f5efe3";
  const card    = "#fdf8f0";
  const border  = "#ddc9a3";
  const gold    = "#c4893a";
  const goldDp  = "#a96e28";
  const ink     = "#2d1f0e";
  const mid     = "#5a3e25";
  const light   = "#a8906b";
  const avatarBg = "#e8d4b0";

  return (
    <>
      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={downloadPDF}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded-lg border border-stone-edge text-stone-mid font-semibold hover:border-gold hover:text-gold-deep transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 2v6M3 6l3 3 3-3" /><path d="M1 10h10" />
          </svg>
          {busy ? "Preparing…" : "PDF"}
        </button>
        <button
          onClick={downloadImage}
          disabled={busy}
          className="text-xs px-3 py-1.5 rounded-lg border border-stone-edge text-stone-mid font-semibold hover:border-gold hover:text-gold-deep transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="2" width="10" height="8" rx="1" /><circle cx="4" cy="5" r="1" /><path d="M1 9l3-3 2 2 2-2 3 3" />
          </svg>
          {busy ? "Preparing…" : "Image"}
        </button>
      </div>

      {/* ── Off-screen export canvas ────────────────────────────────────────── */}
      <div
        style={{
          position: "fixed", left: -9999, top: 0,
          pointerEvents: "none", zIndex: -1,
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: 700, backgroundColor: bg,
            padding: "48px 52px 52px",
            fontFamily: "Georgia, 'Times New Roman', serif",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${border}`, paddingBottom: 24, marginBottom: 32 }}>
            <div>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: 16, fontWeight: 700, letterSpacing: "0.3em", color: gold, textTransform: "uppercase", margin: 0 }}>
                B U R P
              </p>
              <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, letterSpacing: "0.2em", color: goldDp, textTransform: "uppercase", margin: "4px 0 0" }}>
                {planTitle}
              </p>
            </div>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: light, margin: 0 }}>
              {fmtDate(new Date().toISOString())}
            </p>
          </div>

          {/* Original post */}
          <div style={{ display: "flex", gap: 16, marginBottom: 32 }}>
            {/* Avatar */}
            <div style={{ width: 48, height: 48, borderRadius: "50%", backgroundColor: gold, display: "flex", alignItems: "center", justifyContent: "center", color: "#fdf8f0", fontWeight: 700, fontSize: 15, flexShrink: 0, fontFamily: "Arial, sans-serif" }}>
              {initials(discussionTitle)}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: 18, color: ink, margin: "0 0 4px", fontFamily: "Georgia, serif" }}>
                {discussionTitle}
              </p>
              {discussionContent && (
                <div style={{ backgroundColor: card, border: `1px solid ${border}`, borderRadius: 10, padding: "18px 20px", marginTop: 10 }}>
                  <p style={{ fontSize: 14, color: ink, lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0 }}>
                    {discussionContent}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider + count */}
          {c.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: border }} />
              <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.2em", color: light, textTransform: "uppercase", margin: 0, flexShrink: 0 }}>
                {c.length} {c.length === 1 ? "Reflection" : "Reflections"}
              </p>
              <div style={{ flex: 1, height: 1, backgroundColor: border }} />
            </div>
          )}

          {/* Comments */}
          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {c.map((comment, i) => (
              <div key={comment.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: i < c.length - 1 ? 22 : 0, borderBottom: i < c.length - 1 ? `1px solid ${border}88` : "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", backgroundColor: avatarBg, display: "flex", alignItems: "center", justifyContent: "center", color: mid, fontWeight: 700, fontSize: 11, flexShrink: 0, fontFamily: "Arial, sans-serif" }}>
                  {initials(displayName(comment))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: ink }}>
                      {displayName(comment)}
                    </span>
                    {comment.attributed_to && (
                      <span style={{ fontFamily: "Arial, sans-serif", fontSize: 8, color: light, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        group
                      </span>
                    )}
                    <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: light, marginLeft: "auto" }}>
                      {fmtDate(comment.created_at)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: mid, lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${border}`, marginTop: 44, paddingTop: 20, textAlign: "center" }}>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, color: light, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              FEAST · REFLECT · QUESTION · GROW &nbsp;·&nbsp; burp.ink
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
