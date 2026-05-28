import { getSupabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ProfileLink { label: string; url: string }

interface Profile {
  id: string;
  full_name?: string | null;
  username?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  bio?: string | null;
  expertise?: string | null;
  interests?: string | null;
  links?: ProfileLink[];
}

// UUID pattern check
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getProfile(slug: string): Promise<Profile | null> {
  const supabase = getSupabase();

  // Try username first, then fall back to UUID lookup
  const isUuid = UUID_RE.test(slug);

  if (isUuid) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, role, bio, expertise, interests, links")
      .eq("id", slug)
      .single();
    return data ?? null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url, role, bio, expertise, interests, links")
    .eq("username", slug)
    .single();
  return data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const profile = await getProfile(username);
  if (!profile) return { title: "Profile not found" };
  const name = profile.full_name || profile.username || "Profile";
  return {
    title: `${name} — BURP`,
    description: profile.bio || `${name}'s profile on BURP`,
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const profile = await getProfile(username);

  if (!profile) notFound();

  const name = profile.full_name || profile.username || "Community Member";

  // Build initials for avatar fallback
  const nameParts = (profile.full_name ?? "").trim().split(/\s+/).filter(Boolean);
  const initials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : (profile.full_name ?? profile.username ?? "?").slice(0, 2).toUpperCase();

  const expertiseItems = profile.expertise
    ? profile.expertise.split(/[·,]/).map((s) => s.trim()).filter(Boolean)
    : [];

  const interestItems = profile.interests
    ? profile.interests.split(/[·,]/).map((s) => s.trim()).filter(Boolean)
    : [];

  const links: ProfileLink[] = Array.isArray(profile.links) ? profile.links : [];

  return (
    <div className="min-h-screen bg-vellum">
      {/* Top nav bar */}
      <header className="border-b border-stone-edge bg-parchment-soft px-6 py-4 flex items-center gap-4">
        <Link
          href="/"
          className="text-xl font-bold text-gold tracking-widest"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          BURP
        </Link>
        <span className="text-stone-edge text-lg font-light">·</span>
        <span className="text-sm text-stone-mid">Community Member</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-14">

        {/* ── Avatar + name ─────────────────────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-parchment-soft shadow-md mb-5 flex-shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="w-full h-full bg-gold flex items-center justify-center text-vellum text-2xl font-bold"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {initials}
              </span>
            )}
          </div>

          <h1
            className="text-4xl font-bold text-ink mb-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {name}
          </h1>

          {profile.role && (
            <p className="text-sm text-stone-mid font-medium">{profile.role}</p>
          )}

          {profile.username && (
            <p className="text-xs text-stone-light mt-1">@{profile.username}</p>
          )}
        </div>

        {/* ── Bio ──────────────────────────────────────────────────────── */}
        {profile.bio && (
          <section className="mb-10">
            <p className="text-base text-stone-mid leading-relaxed text-center max-w-lg mx-auto">
              {profile.bio}
            </p>
          </section>
        )}

        {/* ── Expertise + Interests ─────────────────────────────────────── */}
        {(expertiseItems.length > 0 || interestItems.length > 0) && (
          <section className="mb-10 grid sm:grid-cols-2 gap-6">
            {expertiseItems.length > 0 && (
              <div>
                <h2
                  className="text-[10px] font-bold uppercase tracking-widest text-gold-deep mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {expertiseItems.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-parchment-soft border border-stone-edge text-stone-mid"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {interestItems.length > 0 && (
              <div>
                <h2
                  className="text-[10px] font-bold uppercase tracking-widest text-gold-deep mb-3"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {interestItems.map((item) => (
                    <span
                      key={item}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-parchment-soft border border-stone-edge text-stone-mid"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── Links ────────────────────────────────────────────────────── */}
        {links.length > 0 && (
          <section className="mb-10">
            <h2
              className="text-[10px] font-bold uppercase tracking-widest text-gold-deep mb-4"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              Links
            </h2>
            <div className="space-y-2">
              {links.map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-stone-edge bg-parchment-soft hover:border-gold hover:bg-gold-wash transition-colors group"
                >
                  {/* Chain link icon */}
                  <svg
                    className="w-4 h-4 text-stone-mid group-hover:text-gold-deep flex-shrink-0 transition-colors"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                  <span className="text-sm font-medium text-ink group-hover:text-gold-deep transition-colors">
                    {link.label || link.url}
                  </span>
                  <svg
                    className="w-3 h-3 text-stone-light group-hover:text-gold ml-auto flex-shrink-0 transition-colors"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 11L11 1M5 1h6v6" />
                  </svg>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* ── Footer callout ────────────────────────────────────────────── */}
        <div className="border-t border-stone-edge pt-10 text-center">
          <p className="text-xs text-stone-light mb-3">Part of the BURP community</p>
          <Link
            href="/"
            className="inline-block text-[10px] font-bold tracking-widest uppercase px-5 py-2 rounded-full border border-gold-soft text-gold hover:bg-gold-wash hover:text-gold-deep transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Explore BURP →
          </Link>
        </div>

      </main>
    </div>
  );
}
