export const ASSESSED_ADMINS = ["Adomaa", "Edison", "Obed"] as const;
export type AssessedAdmin = (typeof ASSESSED_ADMINS)[number];

export const RATING_QUESTIONS = [
  { key: "responsiveness", label: "Responsiveness", hint: "Replies to messages/requests in reasonable time" },
  { key: "communication", label: "Communication", hint: "Clear, warm, and easy to understand" },
  { key: "fairness", label: "Fairness", hint: "Even-handed in decisions and moderation" },
  { key: "leadership", label: "Leadership Example", hint: "Models the values of the community" },
  { key: "overall", label: "Overall Satisfaction", hint: "How they're doing overall" },
] as const;
export type RatingKey = (typeof RATING_QUESTIONS)[number]["key"];

export interface AdminRatingInput {
  admin_name: AssessedAdmin;
  responsiveness: number;
  communication: number;
  fairness: number;
  leadership: number;
  overall: number;
  strength_text: string;
  growth_text: string;
}

export interface AdminAssessmentFormData {
  ratings: AdminRatingInput[]; // one entry per assessed admin
  overall_team_comment?: string;
}

export interface AdminAssessmentRatingRow extends AdminRatingInput {
  id: string;
  assessment_id: string;
  created_at: string;
}

export interface AdminAssessmentSubmission {
  id: string;
  overall_team_comment: string | null;
  created_at: string;
  ratings: AdminAssessmentRatingRow[];
}

export interface AdminAggregateStats {
  admin_name: AssessedAdmin;
  responseCount: number;
  averages: Record<RatingKey, number>;
}
