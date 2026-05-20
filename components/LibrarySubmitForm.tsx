"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { createLibraryItem, createTopic } from "@/lib/library-actions";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Topic, LibraryType } from "@/types/library";

interface LibrarySubmitFormProps {
  initialTopics: Topic[];
  initialType?: string;
  initialTopic?: string;
}

// Per-type editor config
const TYPE_EDITOR: Record<
  LibraryType,
  {
    label: string;
    contentLabel: string;
    placeholder: string;
    hint: string;
    isVideo: boolean;
  }
> = {
  poems: {
    label: "Poem",
    contentLabel: "Poem Text",
    placeholder: "Write your poem here…\n\nEach line you write becomes a line of the poem.\nUse a blank line between stanzas.",
    hint: "Line breaks are preserved exactly — write it as you want it read.",
    isVideo: false,
  },
  "write-ups": {
    label: "Write-Up / Reflection",
    contentLabel: "Write-Up Content",
    placeholder: "Write your reflection or devotional here…\n\nUse a blank line between paragraphs.",
    hint: "Blank lines become paragraph breaks. Single Enter within a paragraph is fine too.",
    isVideo: false,
  },
  "long-messages": {
    label: "Long Message / Sermon",
    contentLabel: "Message Content",
    placeholder: "Paste or type the message here…\n\nUse a blank line between sections or paragraphs.",
    hint: "Good for full sermon transcripts, teachings, or extended letters. Paragraphs split on blank lines.",
    isVideo: false,
  },
  videos: {
    label: "Video",
    contentLabel: "YouTube Link",
    placeholder: "https://www.youtube.com/watch?v=…  or  https://youtu.be/…",
    hint: "Paste the full YouTube video URL. We'll embed it so others can watch directly.",
    isVideo: true,
  },
  others: {
    label: "Other Material",
    contentLabel: "Content",
    placeholder: "Paste or type your content here…",
    hint: "Anything that doesn't fit the other categories — quotes, outlines, notes, etc.",
    isVideo: false,
  },
};

export default function LibrarySubmitForm({
  initialTopics,
  initialType,
  initialTopic,
}: LibrarySubmitFormProps) {
  const [type, setType] = useState<LibraryType>(
    (initialType as LibraryType) || "poems"
  );
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [topic, setTopic] = useState(initialTopic || "");
  const [content, setContent] = useState("");
  const [videoDescription, setVideoDescription] = useState("");

  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [showNewTopicInput, setShowNewTopicInput] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [topicError, setTopicError] = useState("");
  const [isAddingTopic, setIsAddingTopic] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [signedInName, setSignedInName] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pre-fill author from the signed-in Talk It Over profile
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", session.user.id)
        .single();
      const name = profile?.full_name || session.user.email || null;
      if (name) {
        setSignedInName(name);
        setAuthor((prev) => prev || name); // only fill if field is still empty
      }
    });
  }, []);

  const editor = TYPE_EDITOR[type];

  // Auto-fetch YouTube title via the public oEmbed API (no API key needed)
  async function fetchYouTubeTitle(url: string) {
    const clean = url.trim();
    if (!clean.includes("youtube.com") && !clean.includes("youtu.be")) return;
    setFetchingTitle(true);
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=${encodeURIComponent(clean)}&format=json`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.title) setTitle(data.title);
      }
    } catch {
      // silently ignore — user can type the title manually
    } finally {
      setFetchingTitle(false);
    }
  }

  function handleVideoUrlChange(val: string) {
    setContent(val);
    // Debounce so we don't fire on every keystroke while pasting
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchYouTubeTitle(val), 600);
  }

  // When switching types, clear the content so a video URL doesn't stay in a poem textarea
  function handleTypeChange(next: LibraryType) {
    if (TYPE_EDITOR[next].isVideo !== editor.isVideo) setContent("");
    setType(next);
  }

  const handleAddTopic = async (e: React.MouseEvent) => {
    e.preventDefault();
    setTopicError("");
    const cleanName = newTopicName.trim();
    if (!cleanName) { setTopicError("Topic name cannot be empty"); return; }

    const exists = topics.some((t) => t.name.toLowerCase() === cleanName.toLowerCase());
    if (exists) {
      setTopic(cleanName);
      setShowNewTopicInput(false);
      setNewTopicName("");
      return;
    }

    setIsAddingTopic(true);
    const result = await createTopic(cleanName);
    setIsAddingTopic(false);

    if (result.error) {
      setTopicError(result.error);
    } else if (result.data) {
      setTopics((prev) => [...prev, result.data!].sort((a, b) => a.name.localeCompare(b.name)));
      setTopic(result.data.name);
      setShowNewTopicInput(false);
      setNewTopicName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!title.trim()) { setSubmitError("Title is required"); return; }
    if (!topic) { setSubmitError("Please select or suggest a topic category"); return; }
    if (!content.trim()) {
      setSubmitError(editor.isVideo ? "YouTube link is required" : "Content is required");
      return;
    }
    if (editor.isVideo && !content.includes("youtube.com") && !content.includes("youtu.be")) {
      setSubmitError("Please enter a valid YouTube URL (youtube.com or youtu.be)");
      return;
    }

    // For videos, store URL in content and optional description as excerpt hint
    const finalContent = editor.isVideo
      ? content.trim() + (videoDescription.trim() ? `\n\n${videoDescription.trim()}` : "")
      : content;

    setIsSubmitting(true);
    const response = await createLibraryItem({
      type,
      title,
      author: author.trim() || undefined,
      topic,
      content: finalContent,
    });
    setIsSubmitting(false);

    if (response.error) {
      setSubmitError(response.error);
    } else {
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-xl mx-auto">
        <div className="text-3xl text-gold-deep mb-6">★</div>
        <h2
          className="text-3xl font-bold text-ink mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {editor.isVideo ? "Video submitted!" : "Spiritual writing shared"}
        </h2>
        <p className="text-stone-mid text-xs leading-relaxed mb-8 max-w-md">
          Your contribution has been received and is pending admin review before going live in the library.
        </p>
        <div className="flex items-center justify-center gap-1.5 mb-8 text-stone-light">
          <span className="w-1 h-1 rounded-full bg-current" />
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="w-1 h-1 rounded-full bg-current" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => { setTitle(""); setAuthor(""); setContent(""); setVideoDescription(""); setIsSuccess(false); }}
            className="px-6 py-3 rounded-full border border-stone-edge text-stone hover:border-gold hover:text-ink font-semibold text-xs tracking-wider transition-all duration-140"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Submit Another
          </button>
          <Link
            href={`/library/type/${type}`}
            className="px-6 py-3 rounded-full bg-ink hover:bg-stone text-vellum font-semibold text-xs tracking-wider transition-all duration-140 text-center"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            View Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto p-1">
      {submitError && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200/60 rounded-2xl px-5 py-4 leading-relaxed">
          <span className="font-bold uppercase tracking-wider block mb-1">Submission Interrupted</span>
          {submitError}
        </div>
      )}

      {/* Row: Content Type & Author */}
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="submit-type"
            className="block text-xs font-bold tracking-widest text-gold-deep uppercase mb-2"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Content Type <span className="text-gold">*</span>
          </label>
          <select
            id="submit-type"
            value={type}
            onChange={(e) => handleTypeChange(e.target.value as LibraryType)}
            className="w-full px-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink text-sm font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140 cursor-pointer"
          >
            <option value="poems">Poem</option>
            <option value="write-ups">Write-Up / Reflection</option>
            <option value="long-messages">Long Message / Sermon</option>
            <option value="videos">Video (YouTube)</option>
            <option value="others">Other Material</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="submit-author"
              className="block text-xs font-bold tracking-widest text-stone uppercase"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              {editor.isVideo ? "Speaker / Creator" : "Author"}{" "}
              <span className="text-stone-light font-normal">(optional)</span>
            </label>
            {signedInName && (
              <span className="text-[10px] text-gold-deep flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Signed in
              </span>
            )}
          </div>
          <input
            id="submit-author"
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Anonymous"
            className="w-full px-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink text-sm font-medium placeholder:text-stone-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="submit-title"
            className="block text-xs font-bold tracking-widest text-gold-deep uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Title <span className="text-gold">*</span>
          </label>
          {fetchingTitle && (
            <span className="text-[10px] text-stone-light italic flex items-center gap-1">
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
              </svg>
              Fetching title…
            </span>
          )}
        </div>
        <input
          id="submit-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={editor.isVideo ? "Paste a YouTube link above to auto-fill" : "Give this piece a title"}
          required
          className={`w-full px-4 py-3 rounded-2xl border bg-vellum text-ink text-sm font-medium placeholder:text-stone-light focus:outline-none focus:ring-1 transition duration-140 ${
            fetchingTitle
              ? "border-gold/50 focus:border-gold focus:ring-gold/30 animate-pulse"
              : "border-stone-edge focus:border-gold focus:ring-gold"
          }`}
        />
      </div>

      {/* Topic */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label
            htmlFor="submit-topic"
            className="block text-xs font-bold tracking-widest text-gold-deep uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Topic / Category <span className="text-gold">*</span>
          </label>
          {!showNewTopicInput && (
            <button
              type="button"
              onClick={() => setShowNewTopicInput(true)}
              className="text-[10px] font-bold text-gold hover:text-gold-deep uppercase tracking-wider transition-colors duration-140"
              style={{ fontFamily: "var(--font-accent)" }}
            >
              + Suggest a new topic
            </button>
          )}
        </div>

        {!showNewTopicInput ? (
          <select
            id="submit-topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink text-sm font-medium focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140 cursor-pointer"
          >
            <option value="" disabled>Select a topic tag...</option>
            {topics.map((t) => (
              <option key={t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        ) : (
          <div className="bg-parchment-soft border border-gold-soft/50 rounded-2xl p-4">
            <span className="block text-[10px] font-bold text-gold-deep uppercase tracking-widest mb-2" style={{ fontFamily: "var(--font-accent)" }}>
              Suggest new topic tag
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder="e.g. Grace, Perseverance, Eschatology..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-stone-edge bg-vellum text-ink text-sm placeholder:text-stone-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition"
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleAddTopic}
                  disabled={isAddingTopic}
                  className="px-4 py-2.5 rounded-xl bg-ink text-vellum hover:bg-stone disabled:opacity-60 text-xs font-bold tracking-wide transition-colors"
                >
                  {isAddingTopic ? "Adding..." : "Add Tag"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNewTopicInput(false); setNewTopicName(""); setTopicError(""); }}
                  className="px-4 py-2.5 rounded-xl border border-stone-edge text-stone hover:text-ink text-xs font-bold tracking-wide transition"
                >
                  Cancel
                </button>
              </div>
            </div>
            {topicError && <p className="mt-2 text-[11px] text-red-600 italic">{topicError}</p>}
          </div>
        )}
      </div>

      {/* Content — video URL or textarea depending on type */}
      <div>
        <div className="flex justify-between items-baseline mb-2">
          <label
            htmlFor="submit-content"
            className="block text-xs font-bold tracking-widest text-gold-deep uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            {editor.contentLabel} <span className="text-gold">*</span>
          </label>
          {!editor.isVideo && (
            <span className="text-[10px] text-stone-light font-medium">
              {type === "poems" ? "Whitespace preserved" : "Double Enter = new paragraph"}
            </span>
          )}
        </div>

        <p className="text-[11px] text-stone-mid mb-3 italic">{editor.hint}</p>

        {editor.isVideo ? (
          /* Video: URL field + optional description */
          <div className="space-y-4">
            <input
              id="submit-content"
              type="url"
              value={content}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder={editor.placeholder}
              required
              className="w-full px-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink text-sm font-medium placeholder:text-stone-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140"
            />
            <div>
              <label
                htmlFor="submit-video-desc"
                className="block text-xs font-bold tracking-widest text-stone uppercase mb-2"
                style={{ fontFamily: "var(--font-accent)" }}
              >
                Description <span className="text-stone-light font-normal">(optional)</span>
              </label>
              <textarea
                id="submit-video-desc"
                value={videoDescription}
                onChange={(e) => setVideoDescription(e.target.value)}
                rows={3}
                placeholder="Briefly describe what this video is about…"
                className="w-full px-4 py-3 rounded-2xl border border-stone-edge bg-vellum text-ink text-sm placeholder:text-stone-light focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140 resize-none"
              />
            </div>
          </div>
        ) : (
          /* Text content: styled textarea with type-specific layout hints */
          <>
            <textarea
              id="submit-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={type === "long-messages" ? 18 : 12}
              placeholder={editor.placeholder}
              required
              className={`w-full px-6 py-5 rounded-3xl border border-stone-edge bg-vellum text-ink text-sm placeholder:text-stone-light/70 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition duration-140 resize-y min-h-[280px] ${
                type === "poems" ? "text-center font-serif leading-loose" : "font-sans leading-relaxed"
              }`}
              style={
                type === "poems"
                  ? { fontFamily: "var(--font-display)", fontSize: "1rem", lineHeight: "2rem" }
                  : {
                      backgroundImage: "linear-gradient(rgba(107, 95, 80, 0.05) 1px, transparent 1px)",
                      backgroundSize: "100% 2rem",
                      lineHeight: "2rem",
                    }
              }
            />
            <div className="flex justify-end mt-2 text-[10px] text-stone-light">
              <span>{content.length} characters</span>
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-4 px-6 rounded-full bg-ink hover:bg-stone text-vellum font-bold text-xs tracking-widest uppercase transition-all duration-140 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-md cursor-pointer"
        style={{ fontFamily: "var(--font-accent)" }}
      >
        {isSubmitting ? "Submitting to the library..." : "Submit to Content Library"}
      </button>
    </form>
  );
}
