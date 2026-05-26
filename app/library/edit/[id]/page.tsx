"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getLibraryItemById, getTopics } from "@/lib/library-actions";
import LibrarySubmitForm from "@/components/LibrarySubmitForm";
import type { LibraryItem, Topic } from "@/types/library";

export default function EditLibraryItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [item, setItem] = useState<LibraryItem | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push(`/signin?redirect=/library/edit/${id}`);
        return;
      }

      const [fetchedItem, fetchedTopics] = await Promise.all([
        getLibraryItemById(id),
        getTopics(),
      ]);

      if (!fetchedItem) {
        setError("This piece couldn't be found.");
        setLoading(false);
        return;
      }

      if (fetchedItem.user_id !== session.user.id) {
        setError("You don't have permission to edit this piece.");
        setLoading(false);
        return;
      }

      setItem(fetchedItem);
      setTopics(fetchedTopics);
      setLoading(false);
    };

    load();
  }, [id, supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-vellum flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-2xl px-6">
          <div className="h-6 bg-parchment-soft rounded w-48" />
          <div className="h-12 bg-parchment-soft rounded-2xl" />
          <div className="h-64 bg-parchment-soft rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-vellum flex flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-stone-mid text-sm">{error}</p>
        <Link
          href="/dashboard"
          className="text-xs font-bold uppercase tracking-widest text-gold hover:text-gold-deep transition-colors"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!item) return null;

  return (
    <main className="min-h-screen bg-vellum">
      {/* Top bar */}
      <div className="w-full bg-parchment-soft border-b border-stone-edge py-4 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-xs font-bold tracking-widest text-stone uppercase hover:text-ink transition-colors"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            ← Dashboard
          </Link>
          <span
            className="text-xs font-bold tracking-widest text-gold-deep uppercase"
            style={{ fontFamily: "var(--font-accent)" }}
          >
            Editing piece
          </span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1
          className="text-3xl font-bold text-ink mb-1"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Edit your piece
        </h1>
        <p className="text-sm text-stone-mid mb-8">
          After saving, your edits will go back to pending admin review before they&rsquo;re live again.
        </p>

        <LibrarySubmitForm
          initialTopics={topics}
          editItem={item}
        />
      </div>
    </main>
  );
}
