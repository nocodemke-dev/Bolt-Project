import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { supabase } from "../lib/supabase";
import type { Task, TimeBlock, Habit, HabitCheckin } from "../lib/types";
import { last7Days, last7Weeks, dayLabel, calcDurationHours } from "../lib/date";
import { calcStreak } from "../lib/streaks";
import { Flame, CheckCircle, Clock } from "lucide-react";

export default function StatsPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [checkins, setCheckins] = useState<HabitCheckin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [tasksRes, blocksRes, habitsRes, checkinsRes] = await Promise.all([
        supabase.from("tasks").select("*"),
        supabase.from("time_blocks").select("*"),
        supabase.from("habits").select("*"),
        supabase.from("habit_checkins").select("*"),
      ]);
      setTasks(tasksRes.data ?? []);
      setTimeBlocks(blocksRes.data ?? []);
      setHabits(habitsRes.data ?? []);
      setCheckins(checkinsRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const days = last7Days();
  const weeks = last7Weeks();

  const tasksPerWeek = useMemo(() => {
    return weeks.map((w) => {
      const completed = tasks.filter(
        (t) =>
          t.completed &&
          t.due_date &&
          t.due_date >= w.start &&
          t.due_date <= w.end
      ).length;
      return { label: w.label, completed };
    });
  }, [tasks, weeks]);

  const hoursPerDay = useMemo(() => {
    return days.map((d) => {
      const hours = timeBlocks
        .filter((b) => b.block_date === d)
        .reduce((sum, b) => sum + calcDurationHours(b.start_time, b.end_time), 0);
      return { label: dayLabel(d), hours: Math.round(hours * 10) / 10 };
    });
  }, [timeBlocks, days]);

  const habitStreaks = useMemo(() => {
    return habits.map((h) => ({
      name: h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name,
      streak: calcStreak(h.id, checkins),
    }));
  }, [habits, checkins]);

  const todayCheckins = checkins.filter((c) => c.check_in_date === days[days.length - 1]).length;
  const totalCompletedThisWeek = tasksPerWeek[tasksPerWeek.length - 1]?.completed ?? 0;
  const totalHoursThisWeek = hoursPerDay.reduce((sum, d) => sum + d.hours, 0);

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
        <h1 className="text-3xl font-bold text-slate-800">Progress</h1>
        <p className="text-slate-500 mt-1">Your productivity at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          icon={<CheckCircle className="w-5 h-5 text-brand-600" />}
          label="Tasks completed this week"
          value={String(totalCompletedThisWeek)}
        />
        <SummaryCard
          icon={<Clock className="w-5 h-5 text-brand-600" />}
          label="Hours time-blocked this week"
          value={`${totalHoursThisWeek.toFixed(1)}h`}
        />
        <SummaryCard
          icon={<Flame className="w-5 h-5 text-orange-500" />}
          label="Habits checked today"
          value={`${todayCheckins}/${habits.length}`}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tasks completed per week */}
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Tasks Completed Per Week</h2>
          <p className="text-sm text-slate-400 mb-6">Last 7 weeks</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={tasksPerWeek}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Hours time-blocked per day */}
        <section className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Hours Time-Blocked Per Day</h2>
          <p className="text-sm text-slate-400 mb-6">Last 7 days</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={hoursPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 13,
                }}
              />
              <Bar dataKey="hours" fill="#6366f1" radius={[6, 6, 0, 0]} name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Habit streaks */}
        <section className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-1">Habit Streaks</h2>
          <p className="text-sm text-slate-400 mb-6">Current consecutive days</p>
          {habitStreaks.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No habits to track yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={habitStreaks}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="streak"
                  stroke="#f97316"
                  strokeWidth={3}
                  dot={{ fill: "#f97316", r: 5 }}
                  name="Day streak"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-5">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
