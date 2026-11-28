export const THANKSGIVING_NOTE_MAX = 160;

/** What a guest sees about themselves (via their secret link). */
export interface MyThanksgivingRsvp {
  name: string;
  dish: string | null;
  /** The person they write for; null while they wait for someone else to RSVP. */
  target_name: string | null;
  note: string | null;
  rsvps_open: boolean;
  guest_count: number;
}

export interface AdminThanksgivingRsvp {
  id: string;
  token: string;
  name: string;
  dish: string | null;
  target_id: string | null;
  note: string | null;
  extra_note: string | null;
  created_at: string;
}

/** One printed place card: a name on the front, notes on the back. */
export interface PlaceCardData {
  id: string;
  name: string;
  notes: string[];
}
