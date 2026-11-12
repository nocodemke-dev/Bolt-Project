import { useDraggable } from "@dnd-kit/core";
import { Trash2 } from "lucide-react";
import type { Task, Priority } from "../lib/types";

const priorityStyles: Record<Priority, { dot: string; badge: string }> = {
  high: { dot: "bg-red-500", badge: "bg-red-50 text-red-600" },
  medium: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-600" },
  low: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-600" },
};

interface Props {
  task: Task;
  onDelete: (id: string) => void;
}

export default function KanbanCard({ task, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  const ps = priorityStyles[task.priority];

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group bg-white border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing transition-shadow ${
        isDragging ? "shadow-lg opacity-50" : "hover:shadow-soft"
      }`}
    >
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${ps.dot}`} />
        <p className="flex-1 text-sm text-slate-700 leading-snug">{task.title}</p>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {task.scheduled_time && (
        <span className="inline-block mt-2 text-xs text-slate-400">
          Scheduled
        </span>
      )}
    </div>
  );
}
