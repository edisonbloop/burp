export type OutreachPhase = "collecting" | "poll_open" | "closed";

export const MAX_VOTES_PER_PERSON = 3;

export interface OutreachRound {
  id: string;
  title: string;
  phase: OutreachPhase;
  created_at: string;
}

export interface OutreachIdea {
  id: string;
  round_id: string;
  title: string;
  summary: string | null;
  description: string;
  is_shortlisted: boolean;
  display_order: number;
  submitted_by_name: string | null;
  approved: boolean;
  created_at: string;
}

export interface OutreachComment {
  id: string;
  idea_id: string;
  name: string;
  comment: string;
  created_at: string;
}

export interface OutreachIdeaWithComments extends OutreachIdea {
  comments: OutreachComment[];
}

export interface NewIdeaFormData {
  round_id: string;
  name: string;
  title: string;
  description: string;
}

export interface CommentFormData {
  idea_id: string;
  name: string;
  comment: string;
}

export interface VoteTally {
  idea_id: string;
  title: string;
  count: number;
}
