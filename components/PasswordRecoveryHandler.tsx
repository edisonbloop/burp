"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";

/**
 * Recovery links can land the user on any page (often the Site URL) already
 * signed in via a recovery session. We listen app-wide for the PASSWORD_RECOVERY
 * event and route them to the reset form so they can actually set a new password.
 */
export default function PasswordRecoveryHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/signin/reset") {
        router.replace("/signin/reset");
      }
    });
    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
