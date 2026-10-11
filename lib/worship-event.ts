// From the Heart — Friday 14 Aug 2026, 6:30 PM GMT (mirrors EVENT_ISO in app/worship/page.tsx)
const WORSHIP_EVENT_MS = Date.parse("2026-08-14T18:30:00+00:00");

export function isWorshipEventPast(): boolean {
  return Date.now() > WORSHIP_EVENT_MS;
}
