/*
# Create productivity app tables (single-tenant, no auth)

1. New Tables
- `tasks`: user tasks with title, due date, completion status, priority, and created timestamp
- `time_blocks`: scheduled time blocks with title, start/end time, and date
- `habits`: recurring habits with name, created date
- `habit_checkins`: per-habit per-date check-in records (unique on habit_id + check_in_date)

2. Security
- Single-tenant app (no sign-in), so all policies use `TO anon, authenticated` with `USING (true)` because data is intentionally shared.
- RLS enabled on all tables.
- CRUD granted to `anon, authenticated` on all tables.

3. Notes
- `habit_checkins` has a unique constraint on (habit_id, check_in_date) so a habit can only be checked once per day.
- Habit streak is computed client-side from the habit_checkins records.
*/

CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  due_date date,
  completed boolean NOT NULL DEFAULT false,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_tasks" ON tasks;
CREATE POLICY "anon_select_tasks" ON tasks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_tasks" ON tasks;
CREATE POLICY "anon_insert_tasks" ON tasks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_tasks" ON tasks;
CREATE POLICY "anon_update_tasks" ON tasks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_tasks" ON tasks;
CREATE POLICY "anon_delete_tasks" ON tasks FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS time_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  block_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_blocks TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_time_blocks" ON time_blocks;
CREATE POLICY "anon_select_time_blocks" ON time_blocks FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_time_blocks" ON time_blocks;
CREATE POLICY "anon_insert_time_blocks" ON time_blocks FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_time_blocks" ON time_blocks;
CREATE POLICY "anon_update_time_blocks" ON time_blocks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_time_blocks" ON time_blocks;
CREATE POLICY "anon_delete_time_blocks" ON time_blocks FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON habits TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_habits" ON habits;
CREATE POLICY "anon_select_habits" ON habits FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_habits" ON habits;
CREATE POLICY "anon_insert_habits" ON habits FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_habits" ON habits;
CREATE POLICY "anon_update_habits" ON habits FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_habits" ON habits;
CREATE POLICY "anon_delete_habits" ON habits FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS habit_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  check_in_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE (habit_id, check_in_date)
);

ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON habit_checkins TO anon, authenticated;

DROP POLICY IF EXISTS "anon_select_habit_checkins" ON habit_checkins;
CREATE POLICY "anon_select_habit_checkins" ON habit_checkins FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_habit_checkins" ON habit_checkins;
CREATE POLICY "anon_insert_habit_checkins" ON habit_checkins FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_habit_checkins" ON habit_checkins;
CREATE POLICY "anon_update_habit_checkins" ON habit_checkins FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_habit_checkins" ON habit_checkins;
CREATE POLICY "anon_delete_habit_checkins" ON habit_checkins FOR DELETE TO anon, authenticated USING (true);
