import { useState } from "react";
import { Plus, X } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Props {
  onAdded: () => void;
}

export default function AddHabitInline({ onAdded }: Props) {
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
        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" /> New habit
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Habit name (e.g. Drink water)"
        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit(e);
          }
        }}
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
        className="p-2 text-slate-400 hover:text-slate-600"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
}
