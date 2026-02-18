-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS clipboard_pages (
  id TEXT PRIMARY KEY CHECK (id IN ('page-1', 'page-2', 'page-3', 'page-4')),
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO clipboard_pages (id, content) VALUES
  ('page-1', ''),
  ('page-2', ''),
  ('page-3', ''),
  ('page-4', '')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE clipboard_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON clipboard_pages
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON clipboard_pages
  FOR UPDATE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE clipboard_pages;
