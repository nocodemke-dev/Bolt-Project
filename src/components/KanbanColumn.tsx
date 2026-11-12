import { useDroppable } from "@dnd-kit/core";
import type { Task, TaskStatus } from "../lib/types";
import KanbanCard from "./KanbanCard";
import AddTaskInline from "./AddTaskInline";

interface Props {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  accentColor: string;
  onDrop: (taskId: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onTaskAdded: () => void;
}

export default function KanbanColumn({
  status,
  title,
  tasks,
  accentColor,
  onDelete,
  onTaskAdded,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex flex-col bg-slate-50/70 rounded-2xl p-3 min-h-[300px]">
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${accentColor}`} />
          <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-white px-2 py-0.5 rounded-full">
          {tasks.length}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2 rounded-xl transition-colors ${
          isOver ? "bg-brand-50 ring-2 ring-brand-300 ring-inset" : ""
        }`}
      >
        {tasks.map((task) => (
          <KanbanCard key={task.id} task={task} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <div className={`text-center py-6 text-xs text-slate-300 ${isOver ? "" : ""}`}>
            Drop tasks here
          </div>
        )}
      </div>

      <div className="mt-2">
        <AddTaskInline status={status} onAdded={onTaskAdded} />
      </div>
    </div>
  );
}
