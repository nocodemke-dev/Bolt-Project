export type Priority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: Priority;
  status: TaskStatus;
  scheduled_time: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  name: string;
  created_at: string;
}

export interface HabitCheckin {
  id: string;
  habit_id: string;
  check_in_date: string;
  created_at: string;
}
