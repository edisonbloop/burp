"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { CommunityMember } from "@/lib/community-actions";

interface Props {
  members: CommunityMember[];
}

function MemberAvatar({ member }: { member: CommunityMember }) {
  const initials = member.full_name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((acc: string, w: string, i: number, arr: string[]) =>
      i === 0 || i === arr.length - 1 ? acc + w[0].toUpperCase() : acc, "")
    .slice(0, 2) || "?";

  if (member.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={member.avatar_url}
        alt={member.full_name}
        className="w-full h-full object-cover"
      />
    );
  }
  return (
    <span
      className="text-vellum text-xl font-bold"
      style={{ fontFamily: "var(--font-accent)" }}
    >
      {initials}
    </span>
  );
}

export default function CommunityClient({ members }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => {
      return (
        m.full_name.toLowerCase().includes(q) ||
        (m.role ?? "").toLowerCase().includes(q) ||
        (m.expertise ?? "").toLowerCase().includes(q) ||
        (m.interests ?? "").toLowerCase().includes(q)
      );
    });
  }, [members, query]);

  const profileHref = (m: CommunityMember) =>
    `/profile/${m.username ?? m.id}`;

  return (
    <>
      {/* ── Header ── */}
      <section className="border-b border-stone-edge bg-parchment-soft px-6 py-12 sm:py-16">
        <div className="max-w-4xl mx-auto">
          <p
            className="text-[10px] font-bold tracking-[0.4em] uppercase text-gold mb-3"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            BURP · Community
          </p>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h1
                className="text-4xl sm:text-5xl font-bold text-ink mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Meet the Room
              </h1>
              <p className="text-stone-mid text-base">
                {members.length} member{members.length !== 1 ? "s" : ""} and counting.
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-light pointer-events-none"
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              >
                <circle cx="7" cy="7" r="4.5" />
                <path d="M10.5 10.5l3 3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, role, expertise…"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 w-full">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-stone-mid">No members match &ldquo;{query}&rdquo;</p>
            <button
              onClick={() => setQuery("")}
              className="mt-3 text-sm text-gold hover:text-gold-deep font-semibold transition-colors"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((member) => {
              const expertiseTags = member.expertise
                ? member.expertise.split(/[·,]/).map((s) => s.trim()).filter(Boolean).slice(0, 3)
                : [];

              return (
                <Link
                  key={member.id}
                  href={profileHref(member)}
                  className="group bg-parchment-soft border border-stone-edge rounded-3xl p-6 flex flex-col hover:border-gold-soft hover:shadow-md transition-all"
                >
                  {/* Avatar + name row */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gold flex items-center justify-center flex-shrink-0 ring-2 ring-transparent group-hover:ring-gold-soft transition-all">
                      <MemberAvatar member={member} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="font-bold text-ink text-base leading-snug truncate group-hover:text-gold-deep transition-colors"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {member.full_name}
                      </p>
                      {member.role && (
                        <p className="text-xs text-stone-mid truncate mt-0.5">
                          {member.role}
                        </p>
                      )}
                      {member.username && (
                        <p className="text-[10px] text-stone-light mt-0.5">
                          @{member.username}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio snippet */}
                  {member.bio && (
                    <p className="text-sm text-stone-mid leading-relaxed line-clamp-2 mb-4 flex-1">
                      {member.bio}
                    </p>
                  )}

                  {/* Expertise chips */}
                  {expertiseTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {expertiseTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-vellum border border-stone-edge text-stone-mid"
                          style={{ fontFamily: "var(--font-accent)" }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* No bio/expertise fallback */}
                  {!member.bio && expertiseTags.length === 0 && (
                    <p className="text-xs text-stone-light italic mt-auto">
                      View profile →
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
