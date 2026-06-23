"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { deleteMyBulletinPost } from "@/lib/bulletin-actions";

interface Props {
  postId: string;
  postUserId: string | null;
}

export default function BulletinOwnerActions({ postId, postUserId }: Props) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!postUserId) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) setUserId(session.user.id);
    });
  }, [postUserId]);

  const isOwner = !!userId && userId === postUserId;
  if (!isOwner) return null;

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setError("");
    setDeleting(true);
    const res = await deleteMyBulletinPost(postId, userId!);
    setDeleting(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    router.push("/bulletin");
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Link
          href={`/bulletin/${postId}/edit`}
          className="px-4 py-2.5 rounded-full border border-stone-edge bg-vellum hover:border-gold text-stone hover:text-ink text-xs font-semibold tracking-wider uppercase transition-all duration-140 shadow-sm"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2.5 rounded-full border border-red-200 bg-vellum hover:bg-red-50 text-red-600 text-xs font-semibold tracking-wider uppercase transition-all duration-140 shadow-sm disabled:opacity-50"
          style={{ fontFamily: "var(--font-accent)" }}
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error && <p className="text-[10px] text-red-600 font-semibold">{error}</p>}
    </div>
  );
}
