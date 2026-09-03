"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getActiveRound,
  getRoundIdeas,
  getMyVotes,
  submitVotes,
  getPublicVoteResults,
} from "@/lib/outreach-actions";
import { getVoterToken } from "@/lib/voter-token";
import OutreachIdeaCard from "@/components/OutreachIdeaCard";
import OutreachNewIdeaForm from "@/components/OutreachNewIdeaForm";
import { MAX_VOTES_PER_PERSON } from "@/types/outreach";
import type { OutreachRound, OutreachIdeaWithComments, VoteTally } from "@/types/outreach";

const accent = { fontFamily: "var(--font-accent)" };
const display = { fontFamily: "var(--font-display)" };

const PHASE_LABEL: Record<string, string> = {
  collecting: "Gathering Ideas & Feedback",
  poll_open: "Voting Is Open",
  closed: "Voting Closed — Results Are In",
};

export default function OutreachPage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [round, setRound] = useState<OutreachRound | null>(null);
  const [ideas, setIdeas] = useState<OutreachIdeaWithComments[]>([]);
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [tallies, setTallies] = useState<VoteTally[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [voteError, setVoteError] = useState("");
  const [voteSubmitting, setVoteSubmitting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [tab, setTab] = useState<"shortlisted" | "all">("all");

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const r = await getActiveRound();
        if (!active) return;
        setRound(r);
        if (!r) return;

        const [ideaList, votes, results] = await Promise.all([
          getRoundIdeas(r.id),
          getMyVotes(r.id, getVoterToken()),
          getPublicVoteResults(r.id),
        ]);
        if (!active) return;
        setIdeas(ideaList);
        setMyVotes(votes);
        setSelected(votes);
        setTallies(results);
      } catch (e) {
        if (!active) return;
        setLoadError(e instanceof Error ? e.message : "Something went wrong loading this page.");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  function toggleVote(ideaId: string) {
    setVoteError("");
    setSelected((prev) => {
      if (prev.includes(ideaId)) return prev.filter((id) => id !== ideaId);
      if (prev.length >= MAX_VOTES_PER_PERSON) return prev;
      return [...prev, ideaId];
    });
  }

  async function handleSubmitVotes() {
    if (!round) return;
    setVoteError("");
    if (selected.length === 0) {
      setVoteError("Pick at least one idea before submitting.");
      return;
    }
    setVoteSubmitting(true);
    const res = await submitVotes(round.id, getVoterToken(), selected);
    setVoteSubmitting(false);
    if (res.error) {
      setVoteError(res.error);
      return;
    }
    setMyVotes(selected);
    setVoteSubmitted(true);
    setTimeout(() => setVoteSubmitted(false), 3000);
  }

  const shortlisted = ideas.filter((i) => i.is_shortlisted);

  return (
    <main className="flex flex-col flex-1 min-h-screen bg-vellum text-ink">
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors duration-140" style={accent}>
            ← B U R P
          </Link>
        </div>
      </div>

      <section
        className="py-14 px-4 text-center border-b border-stone-edge/50"
        style={{ background: "radial-gradient(ellipse 120% 90% at 50% 0%, var(--color-gold-wash) 0%, var(--color-vellum) 70%)" }}
      >
        <span className="text-[10px] font-bold tracking-widest text-gold-deep uppercase block mb-3" style={accent}>
          Relational · Sustainable · Dignified
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold text-ink tracking-tight leading-tight mb-4" style={display}>
          Community Outreach
        </h1>
        {round && (
          <p className="text-xs font-bold uppercase tracking-widest text-stone-mid" style={accent}>
            🗳 {PHASE_LABEL[round.phase]}
          </p>
        )}
      </section>

      <section className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {loading && <p className="text-center text-sm text-stone-mid py-16">Loading…</p>}

        {!loading && loadError && (
          <div className="text-center py-16">
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 inline-block">{loadError}</p>
            <br />
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !loadError && !round && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-ink mb-3" style={display}>
              Nothing here yet
            </h2>
            <p className="text-sm text-stone-mid">Check back soon for our next outreach initiative.</p>
          </div>
        )}

        {!loading && !loadError && round && (
          <div className="space-y-8">
            {/* Final results — shown above the tabs once voting closes */}
            {round.phase === "closed" && tallies.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-ink mb-5" style={display}>
                  Final Results
                </h2>
                <div className="space-y-3">
                  {tallies.map((t, i) => {
                    const max = tallies[0]?.count || 1;
                    return (
                      <div key={t.idea_id} className="rounded-xl border border-stone-edge bg-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-bold text-ink">
                            {i === 0 && "🏆 "}
                            {t.title}
                          </p>
                          <span className="text-sm font-bold text-gold-deep">{t.count} vote{t.count === 1 ? "" : "s"}</span>
                        </div>
                        <div className="h-2 rounded-full bg-parchment-soft overflow-hidden">
                          <div className="h-full bg-gold rounded-full" style={{ width: `${(t.count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="flex gap-1.5 bg-parchment-soft rounded-2xl p-1.5 border border-stone-edge w-fit">
              <button
                onClick={() => setTab("all")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                  tab === "all" ? "bg-ink text-vellum shadow-md" : "text-stone-mid hover:text-ink"
                }`}
                style={accent}
              >
                <span>All Ideas</span>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 leading-none ${tab === "all" ? "bg-gold text-white" : "bg-stone-edge/50 text-stone-mid"}`}>
                  {ideas.length}
                </span>
              </button>
              <button
                onClick={() => setTab("shortlisted")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center gap-2 ${
                  tab === "shortlisted" ? "bg-ink text-vellum shadow-md" : "text-stone-mid hover:text-ink"
                }`}
                style={accent}
              >
                <span>Shortlisted</span>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 leading-none ${tab === "shortlisted" ? "bg-gold text-white" : "bg-stone-edge/50 text-stone-mid"}`}>
                  {shortlisted.length}
                </span>
              </button>
            </div>

            {/* Shortlisted tab */}
            {tab === "shortlisted" && (
              <div>
                {round.phase === "poll_open" ? (
                  <div className="rounded-3xl border-2 border-gold-soft/70 bg-gold-wash/20 p-6">
                    <h2 className="text-2xl font-bold text-ink mb-2" style={display}>
                      Vote for Your Top {MAX_VOTES_PER_PERSON}
                    </h2>
                    <p className="text-sm text-stone-mid mb-5">
                      Pick up to {MAX_VOTES_PER_PERSON} initiatives you&rsquo;d most like to see us pursue. You can
                      change your picks any time before voting closes.
                    </p>
                    <p className="text-xs font-bold text-gold-deep uppercase tracking-wider mb-6" style={accent}>
                      {selected.length} / {MAX_VOTES_PER_PERSON} selected
                    </p>

                    <div className="space-y-4 mb-6">
                      {shortlisted.map((idea) => (
                        <OutreachIdeaCard
                          key={idea.id}
                          idea={idea}
                          voteMode
                          selected={selected.includes(idea.id)}
                          voteDisabled={selected.length >= MAX_VOTES_PER_PERSON}
                          onToggleVote={toggleVote}
                          onCommentAdded={() => setRefreshKey((k) => k + 1)}
                        />
                      ))}
                    </div>

                    {voteError && (
                      <p className="text-sm text-danger-earthen bg-red-50 border border-red-200 rounded-lg px-3 py-2 font-medium mb-4">
                        {voteError}
                      </p>
                    )}

                    <button
                      onClick={handleSubmitVotes}
                      disabled={voteSubmitting}
                      className="w-full py-4 rounded-xl bg-ink hover:bg-stone text-vellum font-bold text-sm uppercase tracking-wide transition-colors disabled:opacity-60"
                      style={accent}
                    >
                      {voteSubmitting ? "Submitting…" : voteSubmitted ? "✓ Votes Saved!" : myVotes.length > 0 ? "Update My Votes" : "Submit My Votes"}
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-stone-mid mb-5">
                      {round.phase === "collecting"
                        ? "These initiatives are shortlisted for the upcoming vote. Comment below with thoughts, questions, or suggestions."
                        : "How each shortlisted idea did in the final vote."}
                    </p>
                    {shortlisted.length === 0 ? (
                      <p className="text-sm text-stone-light italic py-8 text-center">Nothing shortlisted yet.</p>
                    ) : (
                      <div className="space-y-4">
                        {shortlisted.map((idea) => (
                          <OutreachIdeaCard key={idea.id} idea={idea} onCommentAdded={() => setRefreshKey((k) => k + 1)} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* All ideas tab */}
            {tab === "all" && (
              <div>
                <p className="text-sm text-stone-mid mb-5">
                  Every idea on the table, shortlisted or not. If one of these resonates, say so in the comments.
                </p>
                {ideas.length === 0 ? (
                  <p className="text-sm text-stone-light italic py-8 text-center">No ideas yet.</p>
                ) : (
                  <div className="space-y-4">
                    {ideas.map((idea) => (
                      <OutreachIdeaCard key={idea.id} idea={idea} onCommentAdded={() => setRefreshKey((k) => k + 1)} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New idea submission — open during the collecting phase */}
            {round.phase === "collecting" && <OutreachNewIdeaForm roundId={round.id} />}
          </div>
        )}
      </section>

      <footer className="bg-parchment-deep border-t border-stone-edge py-12 px-4 text-center">
        <p className="text-[10px] text-stone-light leading-relaxed uppercase tracking-widest" style={accent}>
          BURP · FEAST · REFLECT · QUESTION · GROW
        </p>
      </footer>
    </main>
  );
}
