export const TIMETABLE_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type TimetableDay = (typeof TIMETABLE_DAYS)[number];

export interface FacilitationTimetable {
  monday: string | null;
  tuesday: string | null;
  wednesday: string | null;
  thursday: string | null;
  friday: string | null;
  saturday: string | null;
  sunday: string | null;
  monday_user_id: string | null;
  tuesday_user_id: string | null;
  wednesday_user_id: string | null;
  thursday_user_id: string | null;
  friday_user_id: string | null;
  saturday_user_id: string | null;
  sunday_user_id: string | null;
  note: string | null;
  updated_at: string;
}

/** One day's assignment from the admin form. */
export interface TimetableAssignment {
  name: string;
  userId: string | null;
}

export interface FacilitationTimetableInput {
  monday: TimetableAssignment;
  tuesday: TimetableAssignment;
  wednesday: TimetableAssignment;
  thursday: TimetableAssignment;
  friday: TimetableAssignment;
  saturday: TimetableAssignment;
  sunday: TimetableAssignment;
  note: string;
}

/** A member suggestion for the facilitator autocomplete. */
export interface MemberSuggestion {
  id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
}
