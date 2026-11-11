import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Priority } from "../lib/types";
import { todayISO } from "../lib/date";

interface Props {
  onAdded: () => void;
}

export default function AddTaskForm({ onAdded }: Props) {
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
        className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add task
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setShow(false)}
        className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700"
      >
        Cancel
      </button>
    </form>
  );
}
