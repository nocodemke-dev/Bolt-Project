export function todayISO(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().split("T")[0];
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${period}`;
}

export function formatShortDate(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function dayLabel(date: string): string {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export function calcDurationHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  return (endMin - startMin) / 60;
}

export function last7Days(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60 * 1000);
    days.push(local.toISOString().split("T")[0]);
  }
  return days;
}

export function last7Weeks(): { label: string; start: string; end: string }[] {
  const weeks: { label: string; start: string; end: string }[] = [];
  const today = new Date();
  const currentDay = today.getDay();
  const startOfThisWeek = new Date(today);
  startOfThisWeek.setDate(today.getDate() - currentDay);
  for (let i = 6; i >= 0; i--) {
    const start = new Date(startOfThisWeek);
    start.setDate(startOfThisWeek.getDate() - i * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const toISO = (d: Date) => {
      const off = d.getTimezoneOffset();
      const local = new Date(d.getTime() - off * 60 * 1000);
      return local.toISOString().split("T")[0];
    };
    weeks.push({
      label: `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
      start: toISO(start),
      end: toISO(end),
    });
  }
  return weeks;
}
