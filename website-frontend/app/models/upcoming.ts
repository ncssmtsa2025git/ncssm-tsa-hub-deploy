export interface UpcomingDate {
  date: string;
  end?: string;
  event: string;
  type: string;
  location?: string;
}

export async function loadUpcomingDates(): Promise<UpcomingDate[]> {
  // loads the public JSON file
  const res = await fetch('/data/upcoming_dates.json');
  if (!res.ok) return [];
  return res.json();
}
