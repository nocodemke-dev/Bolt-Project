import { useEffect, useState, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Task, TimeBlock, Habit, HabitCheckin } from "../lib/types";
import { todayISO, formatTime, calcDurationHours } from "../lib/date";
import { calcStreak } from "../lib/streaks";
import AddTaskForm from "../components/AddTaskForm";
import AddTimeBlockForm from "../components/AddTimeBlockForm";
import AddHabitForm from "../components/AddHabitForm";
import { Check, Clock, Flame, Trash2, Circle } from "lucide-react";

const priorityColors: Record<string, string> = {
  high: "bg-red-100 text-red-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export default function TodayPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const today = todayISO();

  const load = useCallback(async () => {
    setLoading(true);

    const [tasksRes, blocksRes, habitsRes, checkinsRes] = await Promise.all([
      supabase.from("tasks").select("*").eq("due_date", today).order("created_at", { ascending: false }),
      supabase.from("time_blocks").select("*").eq("block_date", today).order("start_time"),
      supabase.from("habits").select("*").order("created_at", { ascending: false }),
      supabase.from("habit_checkins").select("*"),
    ]);

    setTasks(tasksRes.data ?? []);
    setTimeBlocks(blocksRes.data ?? []);
    setHabits(habitsRes.data ?? []);
    setCheckins(checkinsRes.data ?? []);
    setLoading(false);
  }, [today]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleTask(task: Task) {
    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", task.id);
    if (error) return;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: !t.completed } : t))
    );
  }

  async function deleteTask(id: string) {
    await supabase.from("tasks").delete().eq("id", id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function deleteBlock(id: string) {
    await supabase.from("time_blocks").delete().eq("id", id);
    setTimeBlocks((prev) => prev.filter((b) => b.id !== id));
  }

  async function toggleHabit(habit: Habit) {
    const todayCheckin = checkins.find(
      (c) => c.habit_id === habit.id && c.check_in_date === today
    );
    if (todayCheckin) {
      await supabase.from("habit_checkins").delete().eq("id", todayCheckin.id);
      setCheckins((prev) => prev.filter((c) => c.id !== todayCheckin.id));
    } else {
      const { data } = await supabase
        .from("habit_checkins")
        .insert({ habit_id: habit.id, check_in_date: today })
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

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalHours = timeBlocks.reduce(
    (sum, b) => sum + calcDurationHours(b.start_time, b.end_time),
    0
  );
  const checkedHabits = habits.filter((h) =>
    checkins.some((c) => c.habit_id === h.id && c.check_in_date === today)
  ).length;

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Today</h1>
        <p className="text-slate-500 mt-1">{todayLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Tasks done" value={`${completedTasks}/${tasks.length}`} />
        <StatCard label="Time blocked" value={`${totalHours.toFixed(1)}h`} />
        <StatCard label="Habits checked" value={`${checkedHabits}/${habits.length}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks */}
        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Tasks Due Today</h2>
            <span className="text-sm text-slate-400">{tasks.length} total</span>
          </div>

          <div className="space-y-2 mb-4">
            {tasks.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No tasks due today.</p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <button
                  onClick={() => toggleTask(task)}
                  className="shrink-0 transition-transform hover:scale-110"
                >
                  {task.completed ? (
                    <Check className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </button>
                <span
                  className={`flex-1 text-sm ${
                    task.completed ? "line-through text-slate-400" : "text-slate-700"
                  }`}
                >
                  {task.title}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <AddTaskForm onAdded={load} />
        </section>

        {/* Time Blocks */}
        <section className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Today's Schedule</h2>
            <span className="text-sm text-slate-400">{totalHours.toFixed(1)}h total</span>
          </div>

          <div className="space-y-2 mb-4">
            {timeBlocks.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center">No time blocks today.</p>
            )}
            {timeBlocks.map((block) => (
              <div
                key={block.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="shrink-0 w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-brand-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{block.title}</p>
                  <p className="text-xs text-slate-400">
                    {formatTime(block.start_time)} – {formatTime(block.end_time)}
                  </p>
                </div>
                <span className="text-xs text-slate-400">
                  {calcDurationHours(block.start_time, block.end_time).toFixed(1)}h
                </span>
                <button
                  onClick={() => deleteBlock(block.id)}
                  className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <AddTimeBlockForm onAdded={load} />
        </section>

        {/* Habits */}
        <section className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Habits</h2>
            <span className="text-sm text-slate-400">
              {checkedHabits}/{habits.length} done today
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {habits.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center col-span-2">
                No habits yet. Add one to start tracking.
              </p>
            )}
            {habits.map((habit) => {
              const isChecked = checkins.some(
                (c) => c.habit_id === habit.id && c.check_in_date === today
              );
              const streak = calcStreak(habit.id, checkins);
              return (
                <div
                  key={habit.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-brand-200 transition-colors group"
                >
                  <button
                    onClick={() => toggleHabit(habit)}
                    className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isChecked
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-slate-300 hover:border-brand-400"
                    }`}
                  >
                    {isChecked && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isChecked ? "text-slate-400" : "text-slate-700"
                      }`}
                    >
                      {habit.name}
                    </p>
                    {streak > 0 && (
                      <span className="flex items-center gap-1 text-xs text-orange-500 mt-0.5">
                        <Flame className="w-3 h-3" /> {streak} day streak
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          <AddHabitForm onAdded={load} />
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-4 text-center">
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
