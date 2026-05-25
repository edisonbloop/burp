export type SharehouseCategory =
  | "financial"
  | "medical"
  | "job"
  | "education"
  | "emotional"
  | "practical"
  | "other";

export type SharehouseStatus = "active" | "met" | "resolved";

export interface SharehouseNeed {
  id: string;
  title: string;
  description: string;
  category: SharehouseCategory;
  full_name: string;
  anonymous: boolean;
  contact_info: string;
  evidence_url: string | null;
  approved: boolean;
  featured: boolean;
  status: SharehouseStatus;
  update_testimony: string | null;
  created_at: string;
  updated_at: string;
}

export interface SharehouseNeedFormData {
  title: string;
  description: string;
  category: SharehouseCategory;
  full_name: string;
  anonymous: boolean;
  contact_info: string;
  evidence_url?: string;
}
