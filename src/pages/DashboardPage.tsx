import { useEffect, useState } from "react";
import { Link } from "../components/Link";
import type { Page } from "../lib/navigation";
import { supabase } from "../lib/supabase";
import type { Task, Habit, HabitCheckin } from "../lib/types";
import { todayISO, last7Days, dayLabel } from "../lib/date";
import { calcStreak } from "../lib/streaks";
import { CheckCircle, Clock, Flame, ArrowRight, Repeat, LayoutGrid, CalendarDays } from "lucide-react";

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  const today = todayISO();

  useEffect(() => {
    async function load() {
      const [tasksRes, habitsRes, checkinsRes] = await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("habits").select("*"),
        supabase.from("habit_checkins").select("*"),
      ]);
      setTasks(tasksRes.data ?? []);
      setHabits(habitsRes.data ?? []);
      setCheckins(checkinsRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const todayTasks = tasks.filter((t) => t.due_date === today);
  const doneCount = todayTasks.filter((t) => t.status === "done").length;
  const inProgressCount = todayTasks.filter((t) => t.status === "in_progress").length;
  const todoCount = todayTasks.filter((t) => t.status === "todo").length;
  const scheduledToday = tasks.filter(
    (t) => t.due_date === today && t.scheduled_time
  ).length;
  const checkedToday = habits.filter((h) =>
    checkins.some((c) => c.habit_id === h.id && c.check_in_date === today)
  ).length;
  const topStreaks = habits
    .map((h) => ({ name: h.name, streak: calcStreak(h.id, checkins) }))
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 4);

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
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">{todayLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<CheckCircle className="w-5 h-5 text-emerald-500" />}
          label="Tasks done"
          value={`${doneCount}/${todayTasks.length}`}
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-brand-500" />}
          label="Scheduled today"
          value={String(scheduledToday)}
        />
        <StatCard
          icon={<Repeat className="w-5 h-5 text-orange-500" />}
          label="Habits checked"
          value={`${checkedToday}/${habits.length}`}
        />
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Top streak"
          value={topStreaks[0] ? `${topStreaks[0].streak}d` : "0d"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Task overview */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Task Overview</h2>
            <Link to="kanban" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View board <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            <StatusRow label="To Do" count={todoCount} color="bg-slate-400" total={todayTasks.length} />
            <StatusRow label="In Progress" count={inProgressCount} color="bg-brand-500" total={todayTasks.length} />
            <StatusRow label="Done" count={doneCount} color="bg-emerald-500" total={todayTasks.length} />
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50">
            <h3 className="text-xs font-medium text-slate-400 mb-2">Upcoming tasks</h3>
            {todayTasks.filter((t) => t.status !== "done").slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center gap-2 py-1.5">
                <span className={`w-2 h-2 rounded-full ${
                  task.priority === "high" ? "bg-red-500" :
                  task.priority === "medium" ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                <span className="text-sm text-slate-600 truncate">{task.title}</span>
              </div>
            ))}
            {todayTasks.filter((t) => t.status !== "done").length === 0 && (
              <p className="text-sm text-slate-300 py-2">All tasks completed!</p>
            )}
          </div>
        </div>

        {/* Habit streaks */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Habit Streaks</h2>
            <Link to="habits" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {topStreaks.map((h) => (
              <div key={h.name} className="flex items-center gap-3">
                <span className="text-sm text-slate-600 flex-1 truncate">{h.name}</span>
                <span className="flex items-center gap-1 text-sm font-medium text-orange-500">
                  <Flame className="w-3.5 h-3.5" /> {h.streak} days
                </span>
              </div>
            ))}
            {topStreaks.length === 0 && (
              <p className="text-sm text-slate-300 py-2">No habits tracked yet.</p>
            )}
          </div>
        </div>

        {/* Quick links */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickLink to="kanban" icon={<LayoutGrid className="w-5 h-5" />} label="Kanban Board" desc="Manage tasks" />
          <QuickLink to="calendar" icon={<CalendarDays className="w-5 h-5" />} label="Time Blocking" desc="Schedule your day" />
          <QuickLink to="habits" icon={<Repeat className="w-5 h-5" />} label="Habit Tracker" desc="Build streaks" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function StatusRow({ label, count, color, total }: { label: string; count: number; color: string; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-xs text-slate-400">{count}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label, desc }: { to: Page; icon: React.ReactNode; label: string; desc: string }) {
  return (
    <Link to={to} className="bg-white rounded-2xl shadow-card p-5 flex items-center gap-4 hover:shadow-soft hover:border-brand-200 border border-transparent transition-all">
      <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
    </Link>
  );
}
