export type AssignmentMethod = "self_pick" | "auto_match" | "manual";

export interface SecretSantaRound {
  id: string;
  year: number;
  is_active: boolean;
  created_at: string;
}

export interface SecretSantaAssignment {
  id: string;
  round_id: string;
  giver_person_id: string;
  recipient_person_id: string;
  assigned_method: AssignmentMethod;
  created_at: string;
}

/** Admin oversight view: a full assignment row joined with names. */
export interface SecretSantaMappingRow {
  id: string;
  giver_person_id: string;
  giver_name: string;
  recipient_person_id: string;
  recipient_name: string;
  assigned_method: AssignmentMethod;
}

/** What a signed-in participant sees about their own round status. */
export type MyAssignmentStatus =
  | { state: "not_signed_in" }
  | { state: "not_in_roster" }
  | { state: "no_active_round" }
  | { state: "not_picked_yet"; roundYear: number }
  | { state: "assigned"; roundYear: number; recipientName: string; recipientNotes: string | null };
