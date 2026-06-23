"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import { getOwnedBulletinPost } from "@/lib/bulletin-actions";
import BulletinForm from "@/components/BulletinForm";
import PageHeader from "@/components/PageHeader";
import type { BulletinPost } from "@/types/bulletin";

type Status = "loading" | "unauth" | "notfound" | "ready";

export default function EditBulletinPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const supabase = getSupabaseBrowserClient();
  const [status, setStatus] = useState<Status>("loading");
  const [post, setPost] = useState<BulletinPost | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!active) return;
      if (!session) {
        setStatus("unauth");
        return;
      }
      const owned = await getOwnedBulletinPost(id, session.user.id);
      if (!active) return;
      if (!owned) {
        setStatus("notfound");
        return;
      }
      setPost(owned);
      setStatus("ready");
    })();
    return () => {
      active = false;
    };
  }, [id, supabase]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-vellum text-ink">
      <PageHeader
        title="Edit Post"
        subtitle="Update your bulletin post. Edits go back for a quick admin review."
        backHref={`/bulletin/${id}`}
      />

      <div className="flex-1 py-10 px-4 sm:px-6">
        {status === "loading" && (
          <p className="text-center text-sm text-stone-mid py-20">Loading your post…</p>
        )}

        {status === "unauth" && (
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Please sign in
            </h2>
            <p className="text-sm text-stone-mid mb-6">
              You need to be signed in as the member who created this post to edit it.
            </p>
            <Link
              href={`/signin?redirect=/bulletin/${id}/edit`}
              className="inline-block px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Sign in
            </Link>
          </div>
        )}

        {status === "notfound" && (
          <div className="max-w-md mx-auto text-center py-20">
            <h2 className="text-2xl font-bold text-ink mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Can&rsquo;t edit this post
            </h2>
            <p className="text-sm text-stone-mid mb-6">
              This post doesn&rsquo;t exist, or it wasn&rsquo;t posted from your account.
            </p>
            <Link
              href="/bulletin"
              className="inline-block px-6 py-3 rounded-xl bg-ink hover:bg-stone text-vellum font-semibold text-sm transition-colors"
            >
              Back to the Bulletin
            </Link>
          </div>
        )}

        {status === "ready" && post && <BulletinForm initial={post} />}
      </div>
    </div>
  );
}
