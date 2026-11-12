/*
# Update tasks table for kanban board and time blocking

1. Modified Tables
- `tasks`: add `status` column (text: 'todo', 'in_progress', 'done') with default 'todo', and `scheduled_time` column (time, nullable) for the time-block calendar.
- Existing rows: any task with `completed = true` gets its status set to 'done' so prior data stays consistent.

2. Security
- No new tables; RLS and grants already in place on `tasks`.
- `anon, authenticated` already have CRUD on `tasks`, which covers the new columns.

3. Notes
- The `completed` boolean column is kept for backwards compatibility but the kanban board uses `status` instead.
- `scheduled_time` is nullable — only tasks placed into a calendar slot get a time.
- `due_date` remains for tracking which day a task belongs to.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'status') THEN
    ALTER TABLE tasks ADD COLUMN status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'scheduled_time') THEN
    ALTER TABLE tasks ADD COLUMN scheduled_time time;
  END IF;
END $$;

UPDATE tasks SET status = 'done' WHERE completed = true AND status = 'todo';
