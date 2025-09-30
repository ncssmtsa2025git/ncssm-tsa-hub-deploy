export interface CheckinCreate {
  links: string[]; // client uses string URLs; backend will validate
}

export interface Checkin {
  id: string;
  team_id: string;
  submitted_at: string; // ISO datetime
  links: string[];
  created_at: string;
}
