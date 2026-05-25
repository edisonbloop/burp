"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface ExportComment {
  id: string;
  content: string;
  created_at: string;
  discussion_id: string;
  attributed_to?: string | null;
  profiles: { full_name: string | null } | null;
}

interface ExportDiscussion {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  comments: ExportComment[];
}

interface Props {
  planId: string;
  planTitle: string;
}

function ini(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  return p.length >= 2
    ? (p[0][0] + p[p.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function dn(c: ExportComment) {
  return c.attributed_to ?? c.profiles?.full_name ?? "Anonymous";
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ── Palette ────────────────────────────────────────────────────────────────
const P = {
  bg:      "#f5efe3",
  card:    "#fdf8f0",
  border:  "#ddc9a3",
  gold:    "#c4893a",
  goldDp:  "#a96e28",
  ink:     "#2d1f0e",
  mid:     "#5a3e25",
  light:   "#a8906b",
  avBg:    "#e8d4b0",
};

export default function PlanExport({ planId, planTitle }: Props) {
  const supabase = getSupabaseBrowserClient();
  const exportRef = useRef<HTMLDivElement>(null);
  const [discussions, setDiscussions] = useState<ExportDiscussion[] | null>(null);
  const [busy, setBusy] = useState(false);

  const fetchAll = async (): Promise<ExportDiscussion[]> => {
    if (discussions !== null) return discussions;

    // 1. All discussions for the plan
    const { data: discs } = await supabase
      .from("discussions")
      .select("id, title, content, created_at")
      .eq("plan_id", planId)
      .order("created_at", { ascending: true });

    if (!discs || discs.length === 0) {
      setDiscussions([]);
      return [];
    }

    // 2. All comments for all those discussions in one query
    const discIds = discs.map((d) => d.id);
    const { data: allComments } = await supabase
      .from("comments")
      .select("id, content, created_at, discussion_id, attributed_to, profiles(full_name)")
      .in("discussion_id", discIds)
      .order("created_at", { ascending: true });

    const commentsByDisc: Record<string, ExportComment[]> = {};
    (allComments ?? []).forEach((c) => {
      if (!commentsByDisc[c.discussion_id]) commentsByDisc[c.discussion_id] = [];
      commentsByDisc[c.discussion_id].push(c as unknown as ExportComment);
    });

    const result: ExportDiscussion[] = discs.map((d) => ({
      ...d,
      comments: commentsByDisc[d.id] ?? [],
    }));

    setDiscussions(result);
    return result;
  };

  const capture = async () => {
    setBusy(true);
    await fetchAll();
    await new Promise((r) => setTimeout(r, 500)); // let React paint

    const el = exportRef.current;
    if (!el) { setBusy(false); return null; }

    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      backgroundColor: P.bg,
      logging: false,
    });
    setBusy(false);
    return canvas;
  };

  const slug = planTitle.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

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

  const downloadImage = async () => {
    const canvas = await capture();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = `burp-${slug}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const discs = discussions ?? [];

  return (
    <>
      {/* Buttons — shown inline on the plan header */}
      <div className="flex gap-2">
        <button
          onClick={downloadPDF}
          disabled={busy}
          className="text-sm px-4 py-2 rounded-lg border border-gold-soft text-gold-deep font-semibold hover:bg-gold-wash transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M6 2v6M3 6l3 3 3-3" /><path d="M1 10h10" />
          </svg>
          {busy ? "Preparing…" : "Download PDF"}
        </button>
        <button
          onClick={downloadImage}
          disabled={busy}
          className="text-sm px-4 py-2 rounded-lg border border-stone-edge text-stone-mid font-semibold hover:border-gold hover:text-gold-deep transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <rect x="1" y="2" width="10" height="8" rx="1" /><circle cx="4" cy="5" r="1" /><path d="M1 9l3-3 2 2 2-2 3 3" />
          </svg>
          {busy ? "Preparing…" : "Image"}
        </button>
      </div>

      {/* ── Off-screen export template ────────────────────────────────────── */}
      <div style={{ position: "fixed", left: -9999, top: 0, pointerEvents: "none", zIndex: -1 }}>
        <div
          ref={exportRef}
          style={{ width: 720, backgroundColor: P.bg, padding: "52px 56px 60px", fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          {/* Document header */}
          <div style={{ borderBottom: `2px solid ${P.border}`, paddingBottom: 28, marginBottom: 40 }}>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: 18, fontWeight: 700, letterSpacing: "0.35em", color: P.gold, textTransform: "uppercase", margin: 0 }}>
              B U R P
            </p>
            <p style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: P.ink, margin: "10px 0 6px" }}>
              {planTitle}
            </p>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: P.light, margin: 0 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              {discs.length > 0 && ` · ${discs.length} discussion${discs.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Discussions */}
          {discs.length === 0 && (
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 13, color: P.light, fontStyle: "italic" }}>
              No discussions yet.
            </p>
          )}

          {discs.map((disc, di) => (
            <div key={disc.id} style={{ marginBottom: di < discs.length - 1 ? 44 : 0 }}>
              {/* Discussion post */}
              <div style={{ display: "flex", gap: 16, marginBottom: disc.comments.length > 0 ? 24 : 0 }}>
                {/* Avatar */}
                <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: P.gold, display: "flex", alignItems: "center", justifyContent: "center", color: "#fdf8f0", fontWeight: 700, fontSize: 14, flexShrink: 0, fontFamily: "Arial, sans-serif" }}>
                  {ini(disc.title || "?")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, color: P.ink }}>{disc.title}</span>
                    <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: P.light }}>{fmtDate(disc.created_at)}</span>
                  </div>
                  {disc.content && (
                    <div style={{ backgroundColor: P.card, border: `1px solid ${P.border}`, borderRadius: 10, padding: "16px 20px" }}>
                      <p style={{ fontSize: 14, color: P.ink, lineHeight: 1.85, whiteSpace: "pre-wrap", margin: 0 }}>
                        {disc.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Replies */}
              {disc.comments.length > 0 && (
                <div style={{ marginLeft: 60, borderLeft: `2px solid ${P.border}`, paddingLeft: 20 }}>
                  <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", color: P.light, textTransform: "uppercase", margin: "0 0 14px" }}>
                    {disc.comments.length} {disc.comments.length === 1 ? "Reply" : "Replies"}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {disc.comments.map((c) => (
                      <div key={c.id} style={{ display: "flex", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: P.avBg, display: "flex", alignItems: "center", justifyContent: "center", color: P.mid, fontWeight: 700, fontSize: 10, flexShrink: 0, fontFamily: "Arial, sans-serif" }}>
                          {ini(dn(c))}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 12, color: P.ink }}>{dn(c)}</span>
                            {c.attributed_to && (
                              <span style={{ fontFamily: "Arial, sans-serif", fontSize: 8, color: P.light, textTransform: "uppercase", letterSpacing: "0.1em" }}>group</span>
                            )}
                            <span style={{ fontFamily: "Arial, sans-serif", fontSize: 10, color: P.light, marginLeft: "auto" }}>{fmtDate(c.created_at)}</span>
                          </div>
                          <p style={{ fontSize: 13, color: P.mid, lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                            {c.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section divider */}
              {di < discs.length - 1 && (
                <div style={{ borderTop: `1px solid ${P.border}`, marginTop: 40 }} />
              )}
            </div>
          ))}

          {/* Footer */}
          <div style={{ borderTop: `1px solid ${P.border}`, marginTop: 48, paddingTop: 20, textAlign: "center" }}>
            <p style={{ fontFamily: "Arial, sans-serif", fontSize: 9, color: P.light, letterSpacing: "0.2em", textTransform: "uppercase", margin: 0 }}>
              FEAST · REFLECT · QUESTION · GROW &nbsp;·&nbsp; burp.ink
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
