export type Priority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  due_date: string | null;
  completed: boolean;
  priority: Priority;
  created_at: string;
}

export interface TimeBlock {
  id: string;
  title: string;
  block_date: string;
  start_time: string;
  end_time: string;
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
