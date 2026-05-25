"use client";

import { useEffect, useRef } from "react";
import { incrementViewCount } from "@/lib/dashboard-actions";

/** Silently increments the view count for a library item on first mount. */
export default function ViewTracker({ itemId }: { itemId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    incrementViewCount(itemId).catch(() => {
      // Non-critical — ignore failures silently
    });
  }, [itemId]);

  return null;
}
