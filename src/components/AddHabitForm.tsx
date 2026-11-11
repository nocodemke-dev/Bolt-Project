import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Props {
  onAdded: () => void;
}

export default function AddHabitForm({ onAdded }: Props) {
  const [name, setName] = useState("");
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const { error } = await supabase.from("habits").insert({ name: name.trim() });
    if (error) return;
    setName("");
    setShow(false);
    onAdded();
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add habit
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name"
        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400"
      />
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
