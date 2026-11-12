import { useEffect, useState, useCallback } from "react";
import { Clock, Trash2, CalendarDays } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Task } from "../lib/types";
import { todayISO, formatTime } from "../lib/date";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [dragTask, setDragTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("scheduled_time", { ascending: true, nullsFirst: false });
    setTasks(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unscheduledTasks = tasks.filter(
    (t) => !t.scheduled_time && t.due_date === selectedDate && t.status !== "done"
  );

  const tasksByHour = new Map<number, Task>();
  tasks
    .filter((t) => t.scheduled_time && t.due_date === selectedDate)
    .forEach((t) => {
      const hour = parseInt(t.scheduled_time!.split(":")[0], 10);
      tasksByHour.set(hour, t);
    });

  async function scheduleTask(task: Task, hour: number) {
    const timeStr = `${hour.toString().padStart(2, "0")}:00`;
    const updates: Partial<Task> = {
      scheduled_time: timeStr,
      due_date: selectedDate,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, ...updates } : t))
    );
    setDragTask(null);
    await supabase.from("tasks").update(updates).eq("id", task.id);
  }

  async function unscheduleTask(task: Task) {
    const updates: Partial<Task> = { scheduled_time: null };
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, ...updates } : t))
    );
    await supabase.from("tasks").update(updates).eq("id", task.id);
  }

  function shiftDate(days: number) {
    const d = new Date(selectedDate + "T00:00:00");
    d.setDate(d.getDate() + days);
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60 * 1000);
    setSelectedDate(local.toISOString().split("T")[0]);
  }

  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Time Blocking</h1>
          <p className="text-sm text-slate-400">Drag tasks into hourly time slots</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-6">
        {/* Unscheduled tasks tray */}
        <div className="bg-white rounded-2xl shadow-card p-4 h-fit lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> Unscheduled
          </h2>
          <div className="space-y-2 mb-3">
            {unscheduledTasks.length === 0 && (
              <p className="text-xs text-slate-300 text-center py-4">
                All tasks scheduled
              </p>
            )}
            {unscheduledTasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => setDragTask(task)}
                onDragEnd={() => setDragTask(null)}
                className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 cursor-grab active:cursor-grabbing hover:border-brand-300 transition-colors"
              >
                <p className="text-sm text-slate-700">{task.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">{dateLabel}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => shiftDate(-1)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedDate(todayISO())}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => shiftDate(1)}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          <div className="space-y-px">
            {HOURS.map((hour) => {
              const task = tasksByHour.get(hour);
              return (
                <div
                  key={hour}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => dragTask && scheduleTask(dragTask, hour)}
                  className="flex items-stretch gap-3 min-h-[56px] group"
                >
                  <div className="w-16 shrink-0 pt-2 text-right">
                    <span className="text-xs text-slate-400 font-medium">
                      {formatTime(`${hour.toString().padStart(2, "0")}:00`)}
                    </span>
                  </div>
                  <div
                    className={`flex-1 border-t border-slate-100 pt-1.5 pb-1 transition-colors ${
                      task ? "" : "group-hover:bg-brand-50/30"
                    }`}
                  >
                    {task ? (
                      <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-lg px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                        <span className="flex-1 text-sm text-slate-700 truncate">
                          {task.title}
                        </span>
                        <button
                          onClick={() => unscheduleTask(task)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-9" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
