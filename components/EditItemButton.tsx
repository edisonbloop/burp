"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

interface Props {
  itemId: string;
  itemUserId?: string | null;
}

export default function EditItemButton({ itemId, itemUserId }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!itemUserId) return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id && session.user.id === itemUserId) {
        setShow(true);
      }
    });
  }, [itemUserId]);

  if (!show) return null;

  return (
    <Link
      href={`/library/edit/${itemId}`}
      className="text-xs font-bold tracking-widest text-stone-mid uppercase hover:text-gold-deep transition-colors duration-140"
      style={{ fontFamily: "var(--font-accent)" }}
    >
      Edit
    </Link>
  );
}
