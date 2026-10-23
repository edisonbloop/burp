export type BirthdayTheme = "gold" | "blush" | "midnight" | "garden";

export interface BirthdayCard {
  id: string;
  slug: string;
  honoree_name: string;
  birthday: string | null;
  turning_age: number | null;
  headline: string | null;
  organiser_name: string;
  organiser_note: string | null;
  photo_urls: string[];
  theme: BirthdayTheme;
  accepting_messages: boolean;
  created_at: string;
}

export interface BirthdayMessage {
  id: string;
  card_id: string;
  author_name: string;
  message: string;
  photo_url: string | null;
  created_at: string;
}

export interface BirthdayCardInput {
  /** CRM person this card is for, when picked from the roster. */
  person_id?: string | null;
  honoree_name: string;
  birthday?: string | null;
  turning_age?: number | null;
  headline?: string | null;
  organiser_name: string;
  organiser_note?: string | null;
  photo_urls: string[];
  theme: BirthdayTheme;
}

/** A community member with a known birthday (from the CRM roster). */
export interface Celebrant {
  person_id: string;
  full_name: string;
  first_name: string;
  month: number;
  day: number;
  /** Next occurrence, YYYY-MM-DD. */
  next_birthday: string;
  days_away: number;
  /** A card started for this birthday already. */
  existing_card: { slug: string; organiser_name: string } | null;
}
