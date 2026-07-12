export type PersonStatus = "active" | "semi_active" | "occasional" | "inactive";

export const PERSON_STATUSES: { value: PersonStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "semi_active", label: "Semi-Active" },
  { value: "occasional", label: "Occasional" },
  { value: "inactive", label: "Inactive" },
];

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export interface Person {
  id: string;
  full_name: string;
  birthday_month: number | null;
  birthday_day: number | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  status: PersonStatus;
  linked_user_id: string | null;
  secret_santa_opt_out: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonFormData {
  full_name: string;
  birthday_month?: number | null;
  birthday_day?: number | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  status: PersonStatus;
  secret_santa_opt_out?: boolean;
}

export interface BulkImportResult {
  imported: number;
  skippedDuplicates: string[];
  unparsedLines: string[];
  error?: string;
}
