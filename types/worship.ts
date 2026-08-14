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

export interface WorshipAttendance {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  guest_count: number;
  notes: string | null;
  created_at: string;
}

export interface WorshipAttendanceFormData {
  full_name: string;
  email?: string;
  phone?: string;
  guest_count?: number;
  notes?: string;
}
