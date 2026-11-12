import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Priority, TaskStatus } from "../lib/types";
import { todayISO } from "../lib/date";

interface Props {
  status: TaskStatus;
  onAdded: () => void;
}

export default function AddTaskInline({ status, onAdded }: Props) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const { error } = await supabase.from("tasks").insert({
      title: title.trim(),
      due_date: todayISO(),
      priority,
      status,
    });
    if (error) return;
    setTitle("");
    setPriority("medium");
    setShow(false);
    onAdded();
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-1.5 w-full px-3 py-2 text-sm text-slate-400 hover:text-brand-600 hover:bg-brand-50/50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" /> Add task
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="p-3 bg-slate-50 rounded-lg space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        rows={2}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white resize-none"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit(e);
          }
        }}
      />
      <div className="flex items-center gap-2">
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
          type="submit"
          className="px-3 py-1.5 text-xs font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
        >
          Add
        </button>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="p-1.5 text-slate-400 hover:text-slate-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
