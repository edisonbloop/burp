export type LibraryType = "poems" | "write-ups" | "long-messages" | "videos" | "others";

export interface LibraryItem {
  id: string;
  type: LibraryType;
  title: string;
  excerpt: string;
  content: string;
  author?: string | null;
  topic: string;
  featured: boolean;
  approved: boolean;
  created_at: string;
  /** Auth user who submitted — nullable for older items */
  user_id?: string | null;
  /** Link to original publication if the piece was published elsewhere first */
  source_url?: string | null;
  /** Page view count */
  view_count?: number;
}

export interface Topic {
  id: string;
  name: string;
  created_at: string;
}

export interface LibraryItemFormData {
  type: LibraryType;
  title: string;
  content: string;
  author?: string;
  topic: string;
  sourceUrl?: string;
  userId?: string;
}
