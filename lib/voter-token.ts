const STORAGE_KEY = "burp_outreach_voter_token";

/**
 * A random per-browser token used to limit casual duplicate voting on open
 * (no-sign-in) polls. Not a real identity check — persisted in localStorage,
 * so clearing site data or using another browser resets it.
 */
export function getVoterToken(): string {
  if (typeof window === "undefined") return "";
  try {
    let token = localStorage.getItem(STORAGE_KEY);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, token);
    }
    return token;
  } catch {
    // Storage unavailable (private mode, blocked, etc.) — fall back to a
    // session-only token so voting still works, just without persistence.
    return crypto.randomUUID();
  }
}
