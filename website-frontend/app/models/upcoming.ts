import { getContent } from "../services/content";

export interface UpcomingDate {
  date: string;
  end?: string | null;
  event: string;
  type: string;
  location?: string | null;
}

/** Key dates, soonest first (edited in Admin > Key dates). */
export async function loadUpcomingDates(): Promise<UpcomingDate[]> {
  return getContent<UpcomingDate[]>("dates");
}
