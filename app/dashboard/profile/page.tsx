"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { updateUserProfile } from "@/lib/dashboard-actions";

interface ProfileLink { label: string; url: string }

interface Profile {
  full_name?: string | null;
  role?: string | null;
  bio?: string | null;
  expertise?: string | null;
  interests?: string | null;
  links?: ProfileLink[];
  avatar_url?: string | null;
  username?: string | null;
}

const BASE_URL = "https://burp.ink";

const inputCls =
  "w-full px-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink placeholder:text-stone-light text-sm focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140";
const labelCls =
  "block text-xs font-bold tracking-widest uppercase text-gold-deep mb-2";

export default function ProfilePage() {
  const supabase = getSupabaseBrowserClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState<"idle" | "checking" | "taken" | "ok">("idle");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [interests, setInterests] = useState("");
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);

  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      setUserId(session.user.id);
      const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
      if (data) {
        const p = data as Profile;
        setFullName(p.full_name ?? "");
        setUsername(p.username ?? "");
        setRole(p.role ?? "");
        setBio(p.bio ?? "");
        setExpertise(p.expertise ?? "");
        setInterests(p.interests ?? "");
        setLinks(Array.isArray(p.links) ? p.links : []);
        setAvatarUrl(p.avatar_url ?? null);
      }
      setLoading(false);
    });
  }, [supabase]);

  // ── Username uniqueness check (debounced) ─────────────────────────────────
  const checkUsername = useCallback((value: string, currentUserId: string) => {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (clean !== value) setUsername(clean);
    if (!clean || clean.length < 3) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    usernameTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .eq("username", clean)
        .neq("id", currentUserId)
        .maybeSingle();
      setUsernameStatus(data ? "taken" : "ok");
    }, 500);
  }, [supabase]);

  // ── Avatar upload ─────────────────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 3 * 1024 * 1024) { setError("Photo must be under 3 MB."); return; }

    setUploadingAvatar(true);
    setError("");

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      setError("Could not upload photo — " + upErr.message);
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const busted = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").upsert({ id: userId, avatar_url: publicUrl });
    setAvatarUrl(busted);
    setUploadingAvatar(false);
  };

  // ── Links helpers ─────────────────────────────────────────────────────────
  const addLink = () => { if (links.length < 5) setLinks(p => [...p, { label: "", url: "" }]); };
  const updateLink = (i: number, f: "label" | "url", v: string) =>
    setLinks(p => p.map((l, j) => j === i ? { ...l, [f]: v } : l));
  const removeLink = (i: number) => setLinks(p => p.filter((_, j) => j !== i));

  // ── Copy public link ──────────────────────────────────────────────────────
  const publicPath = username ? `/profile/${username}` : userId ? `/profile/${userId}` : null;
  const publicUrl = publicPath ? `${BASE_URL}${publicPath}` : null;

  const copyLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (usernameStatus === "taken") { setError("That username is already taken."); return; }

    setSaving(true);
    setError("");

    const cleanLinks = links
      .map(l => ({ label: l.label.trim(), url: l.url.trim() }))
      .filter(l => l.url);

    const result = await updateUserProfile(userId, {
      full_name: fullName.trim() || undefined,
      role: role.trim() || undefined,
      bio: bio.trim() || undefined,
      expertise: expertise.trim() || undefined,
      interests: interests.trim() || undefined,
      links: cleanLinks,
      username: username.trim() || undefined,
    });

    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSaved(false), 3000);
    }
  };

  // ── Avatar circle ─────────────────────────────────────────────────────────
  const initials = fullName.trim().split(/\s+/).filter(Boolean);
  const avatarInitials = initials.length >= 2
    ? (initials[0][0] + initials[initials.length - 1][0]).toUpperCase()
    : (fullName.slice(0, 2).toUpperCase() || "?");

  if (loading) {
    return (
      <div className="p-4 sm:p-8 lg:p-12 max-w-2xl mx-auto space-y-4 animate-pulse">
        <div className="h-6 bg-parchment-soft rounded w-40" />
        <div className="h-24 w-24 bg-parchment-soft rounded-full" />
        <div className="h-12 bg-parchment-soft rounded-2xl" />
        <div className="h-24 bg-parchment-soft rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-2xl mx-auto">
      <header className="mb-10">
        <p className="text-xs font-bold tracking-widest uppercase text-gold mb-1" style={{ fontFamily: "var(--font-accent)" }}>
          My Account
        </p>
        <h1 className="text-4xl font-bold text-ink mb-2" style={{ fontFamily: "var(--font-display)" }}>
          Edit Profile
        </h1>
        <p className="text-stone-mid text-sm">
          Help the community know who you are and what you bring.
        </p>
      </header>

      <form onSubmit={handleSave} className="space-y-10">

        {/* ── Photo ──────────────────────────────────────────────────────── */}
        <section>
          <p className={labelCls} style={{ fontFamily: "var(--font-accent)" }}>Profile Photo</p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-stone-edge hover:ring-gold transition-all group focus:outline-none"
              title="Change photo"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span
                  className="w-full h-full bg-gold flex items-center justify-center text-vellum text-xl font-bold"
                  style={{ fontFamily: "var(--font-accent)" }}
                >
                  {avatarInitials}
                </span>
              )}
              {/* Hover overlay */}
              <span className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <svg className="w-5 h-5 text-white animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                )}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <div>
              <p className="text-sm text-ink font-medium">
                {uploadingAvatar ? "Uploading…" : "Click photo to change"}
              </p>
              <p className="text-xs text-stone-light mt-0.5">JPG, PNG or WebP · max 3 MB</p>
            </div>
          </div>
        </section>

        {/* ── Public link ────────────────────────────────────────────────── */}
        <section className="bg-parchment-soft border border-stone-edge rounded-2xl px-5 py-5 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gold-deep" style={{ fontFamily: "var(--font-accent)" }}>
            Your Public Profile Link
          </p>

          {/* Slug editor */}
          <div>
            <label className="block text-xs text-stone-mid mb-1.5">
              Choose the name that appears in your link:
            </label>
            <div className="flex items-center rounded-2xl border border-stone-edge bg-vellum focus-within:border-gold focus-within:ring-1 focus-within:ring-gold transition overflow-hidden">
              <span className="pl-4 pr-1 text-stone-light text-sm whitespace-nowrap select-none flex-shrink-0">
                burp.ink/profile/
              </span>
              <input
                className="flex-1 pr-4 py-3 bg-transparent text-ink text-sm placeholder:text-stone-light focus:outline-none min-w-0"
                value={username}
                onChange={e => {
                  const v = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                  setUsername(v);
                  if (userId) checkUsername(v, userId);
                }}
                placeholder="your-name"
                maxLength={30}
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
              />
            </div>
            <p className="text-[10px] text-stone-light mt-1">
              Lowercase letters, numbers and hyphens only. e.g. <em>john-doe</em>
            </p>
            {usernameStatus === "taken" && (
              <p className="text-xs text-red-500 mt-1">That name is already taken — try another.</p>
            )}
            {usernameStatus === "ok" && (
              <p className="text-xs text-gold-deep mt-1">✓ Available</p>
            )}
            {usernameStatus === "checking" && (
              <p className="text-xs text-stone-light mt-1">Checking…</p>
            )}
          </div>

          {/* Live preview + copy */}
          {publicUrl && (
            <div className="flex items-center gap-3 pt-1">
              <p className="flex-1 text-sm text-stone-mid truncate min-w-0">{publicUrl}</p>
              <button
                type="button"
                onClick={copyLink}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors ${
                  copied
                    ? "bg-gold-wash text-gold-deep border border-gold-soft"
                    : "border border-stone-edge text-stone-mid hover:border-gold hover:text-gold-deep"
                }`}
                style={{ fontFamily: "var(--font-accent)" }}
              >
                {copied ? "Copied ✓" : "Copy link"}
              </button>
            </div>
          )}
        </section>

        {/* ── Basic info ─────────────────────────────────────────────────── */}
        <section className="space-y-5">
          <h2 className="text-xs font-bold tracking-widest uppercase text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            Basic Info
          </h2>

          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-accent)" }}>Full Name</label>
            <input className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" />
          </div>

          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-accent)" }}>
              What You Do{" "}
              <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input className={inputCls} value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Software Engineer · Writer · Pastor" />
          </div>

          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-accent)" }}>
              Bio{" "}
              <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A few sentences about yourself — your faith journey, background, what drives you…"
              maxLength={400}
            />
            <p className="text-[10px] text-stone-light mt-1 text-right">{bio.length}/400</p>
          </div>
        </section>

        {/* ── Background ─────────────────────────────────────────────────── */}
        <section className="space-y-5">
          <h2 className="text-xs font-bold tracking-widest uppercase text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>
            Background
          </h2>

          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-accent)" }}>
              Expertise{" "}
              <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input className={inputCls} value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="e.g. Biblical theology · Product design · Mental health" />
            <p className="text-[10px] text-stone-light mt-1">Separate areas with · or comma.</p>
          </div>

          <div>
            <label className={labelCls} style={{ fontFamily: "var(--font-accent)" }}>
              Interests{" "}
              <span className="text-stone-light font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input className={inputCls} value={interests} onChange={e => setInterests(e.target.value)} placeholder="e.g. Preaching · Photography · Church history" />
          </div>
        </section>

        {/* ── Links ──────────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold tracking-widest uppercase text-stone-light" style={{ fontFamily: "var(--font-accent)" }}>Links</h2>
            {links.length < 5 && (
              <button type="button" onClick={addLink} className="text-xs font-bold text-gold hover:text-gold-deep uppercase tracking-widest transition-colors" style={{ fontFamily: "var(--font-accent)" }}>
                + Add link
              </button>
            )}
          </div>

          {links.length === 0 && (
            <p className="text-sm text-stone-light italic">
              No links yet.{" "}
              <button type="button" onClick={addLink} className="text-gold hover:text-gold-deep transition-colors not-italic font-semibold">Add one →</button>
            </p>
          )}

          <div className="space-y-3">
            {links.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid grid-cols-5 gap-2">
                  <input className={`${inputCls} col-span-2`} value={link.label} onChange={e => updateLink(i, "label", e.target.value)} placeholder="Label (e.g. Blog)" />
                  <input className={`${inputCls} col-span-3`} value={link.url} onChange={e => updateLink(i, "url", e.target.value)} placeholder="https://…" type="url" />
                </div>
                <button type="button" onClick={() => removeLink(i)} className="mt-2.5 w-8 h-8 flex items-center justify-center rounded-xl text-stone-light hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0" title="Remove">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l8 8M12 4l-8 8" /></svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Error / save ───────────────────────────────────────────────── */}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            disabled={saving || usernameStatus === "taken"}
            className="px-8 py-3 rounded-full bg-ink hover:bg-stone text-vellum font-bold text-xs tracking-widest uppercase transition-colors disabled:opacity-50"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {saving ? "Saving…" : "Save Profile"}
          </button>
          {saved && (
            <span className="text-sm text-gold-deep flex items-center gap-1.5 font-medium">
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l4 4 6-7" /></svg>
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
