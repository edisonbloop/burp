export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export interface OneYearPlanDay {
  id: string;
  day_number: number;
  month: number;
  day_of_month: number;
  readings: string[];
}
