export interface WorshipRsvp {
  id: string;
  full_name: string;
  email: string;
  guest_count: number;
  notes: string | null;
  notified: boolean;
  created_at: string;
}

export interface WorshipRsvpFormData {
  full_name: string;
  email: string;
  guest_count: number;
  notes?: string;
}
