import { useEffect, useState, useCallback } from "react";
import { Flame, Trash2, Check, Repeat } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Habit, HabitCheckin } from "../lib/types";
import { todayISO, last7Days, dayLabel, formatShortDate } from "../lib/date";
import { calcStreak } from "../lib/streaks";
import AddHabitInline from "../components/AddHabitInline";

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const today = todayISO();
  const days = last7Days();

  const load = useCallback(async () => {
    setLoading(true);
    const [habitsRes, checkinsRes] = await Promise.all([
      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("habit_checkins").select("*"),
    ]);
    setHabits(habitsRes.data ?? []);
    setCheckins(checkinsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function isChecked(habitId: string, date: string): boolean {
    return checkins.some(
      (c) => c.habit_id === habitId && c.check_in_date === date
    );
  }

  async function toggleCheckin(habit: Habit, date: string) {
    const existing = checkins.find(
      (c) => c.habit_id === habit.id && c.check_in_date === date
    );
    if (existing) {
      await supabase.from("habit_checkins").delete().eq("id", existing.id);
      setCheckins((prev) => prev.filter((c) => c.id !== existing.id));
    } else {
      const { data } = await supabase
        .from("habit_checkins")
        .insert({ habit_id: habit.id, check_in_date: date })
        .select()
        .single();
      if (data) setCheckins((prev) => [...prev, data]);
    }
  }

  async function deleteHabit(id: string) {
    await supabase.from("habits").delete().eq("id", id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCheckins((prev) => prev.filter((c) => c.habit_id !== id));
  }

  const checkedToday = habits.filter((h) => isChecked(h.id, today)).length;
  const totalStreaks = habits.reduce((sum, h) => sum + calcStreak(h.id, checkins), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
          <Repeat className="w-5 h-5 text-orange-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Habits</h1>
          <p className="text-sm text-slate-400">Build streaks by checking in daily</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-slate-400">Checked today</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">
            {checkedToday}
            <span className="text-lg text-slate-300">/{habits.length}</span>
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs text-slate-400">Total streak days</span>
          </div>
          <p className="text-3xl font-bold text-slate-800">{totalStreaks}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {habits.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400 mb-4">No habits yet. Add one to start building streaks.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left text-xs font-medium text-slate-400 px-4 py-3">Habit</th>
                  {days.map((d) => (
                    <th key={d} className="text-center px-2 py-3">
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="text-xs text-slate-400">{dayLabel(d)}</span>
                        <span
                          className={`text-xs font-medium ${
                            d === today ? "text-brand-600" : "text-slate-300"
                          }`}
                        >
                          {formatShortDate(d).split(" ")[1]}
                        </span>
                      </div>
                    </th>
                  ))}
                  <th className="text-center text-xs font-medium text-slate-400 px-3 py-3">Streak</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {habits.map((habit) => {
                  const streak = calcStreak(habit.id, checkins);
                  return (
                    <tr
                      key={habit.id}
                      className="border-b border-slate-50 last:border-0 group"
                    >
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-slate-700">{habit.name}</span>
                      </td>
                      {days.map((d) => {
                        const checked = isChecked(habit.id, d);
                        const isToday = d === today;
                        return (
                          <td key={d} className="text-center px-2 py-3">
                            <button
                              onClick={() => toggleCheckin(habit, d)}
                              className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center transition-all ${
                                checked
                                  ? "bg-emerald-500 text-white"
                                  : isToday
                                  ? "border-2 border-brand-300 hover:bg-brand-50"
                                  : "border border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              {checked && <Check className="w-4 h-4" />}
                            </button>
                          </td>
                        );
                      })}
                      <td className="text-center px-3 py-3">
                        {streak > 0 ? (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-orange-500">
                            <Flame className="w-3.5 h-3.5" />
                            {streak}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-2 py-3">
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-4 border-t border-slate-50">
          <AddHabitInline onAdded={load} />
        </div>
      </div>
    </div>
  );
}
