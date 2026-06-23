export type BulletinCategory = "event" | "promotion" | "product" | "service";

export type BulletinStatus = "active" | "expired" | "closed";

export interface BulletinPost {
  id: string;
  user_id: string | null;
  category: BulletinCategory;
  title: string;
  description: string;
  full_name: string;
  business_name: string | null;
  contact_info: string;
  link_url: string | null;
  image_url: string | null;
  video_url: string | null;
  price: string | null;
  location: string | null;
  event_date: string | null;
  approved: boolean;
  featured: boolean;
  status: BulletinStatus;
  created_at: string;
  updated_at: string;
}

export interface BulletinPostFormData {
  userId?: string;
  category: BulletinCategory;
  title: string;
  description: string;
  full_name: string;
  business_name?: string;
  contact_info: string;
  link_url?: string;
  image_url?: string;
  video_url?: string;
  price?: string;
  location?: string;
  event_date?: string;
}
