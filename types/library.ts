export type LibraryType = "poems" | "write-ups" | "long-messages" | "videos" | "others";

export interface LibraryItem {
  id: string;
  type: LibraryType;
  title: string;
  excerpt: string;
  content: string;
  author?: string | null;
  topic: string; // Dynamic topic category string matching topics.name
  featured: boolean;
  approved: boolean;
  created_at: string;
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
}
