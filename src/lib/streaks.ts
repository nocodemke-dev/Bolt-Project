import type { HabitCheckin } from "./types";

export function calcStreak(habitId: string, checkins: HabitCheckin[]): number {
  const dates = new Set(
    checkins
      .filter((c) => c.habit_id === habitId)
      .map((c) => c.check_in_date)
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60 * 1000);
    const iso = local.toISOString().split("T")[0];
    if (dates.has(iso)) {
      streak++;
    } else if (i === 0) {
      continue;
    } else {
      break;
    }
  }
  return streak;
}
