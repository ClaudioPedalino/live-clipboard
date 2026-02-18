-- Clipboard pages table
CREATE TABLE IF NOT EXISTS clipboard_pages (
  id TEXT PRIMARY KEY CHECK (id IN ('page-1', 'page-2', 'page-3', 'page-4')),
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert initial empty rows for all 4 pages
INSERT INTO clipboard_pages (id, content) VALUES
  ('page-1', ''),
  ('page-2', ''),
  ('page-3', ''),
  ('page-4')
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for this table (required for live sync)
-- Run in Supabase SQL Editor. If you get "already member" error, enable via Dashboard: Database > Replication
ALTER PUBLICATION supabase_realtime ADD TABLE clipboard_pages;

-- RLS: Allow anonymous read/write (no auth)
ALTER TABLE clipboard_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON clipboard_pages
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON clipboard_pages
  FOR UPDATE USING (true);
