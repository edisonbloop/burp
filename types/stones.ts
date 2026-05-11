export interface Stone {
  id: string;
  full_name: string;
  display_name: string | null;
  contact: string | null;
  journey_word: string;
  scripture: string | null;
  remembrance: string;
  testimony: string | null;
  consent_public: boolean;
  anonymous: boolean;
  approved: boolean;
  featured: boolean;
  created_at: string;
}

export interface PublicStone {
  id: string;
  display_name: string | null;
  full_name: string;
  anonymous: boolean;
  journey_word: string;
  scripture: string | null;
  remembrance: string;
  testimony: string | null;
  featured: boolean;
  created_at: string;
}

export interface StoneFormData {
  full_name: string;
  display_name?: string;
  contact?: string;
  journey_word: string;
  scripture?: string;
  remembrance: string;
  testimony?: string;
  consent_public: boolean;
  anonymous: boolean;
}
