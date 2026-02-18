# Live Clipboard

Web clipboard with 4 persistent pages, multi-device sync (~1–2s), and no auth.

## Stack

- **Frontend**: Vite + React + TypeScript
- **Backend**: Supabase (Postgres + Realtime)
- **Hosting**: Netlify (static)

## Supabase Setup

### 1. Create project

1. Go to [supabase.com](https://supabase.com) and create a project
2. Wait for provisioning

### 2. Create table

In **SQL Editor**, run:

```sql
CREATE TABLE IF NOT EXISTS clipboard_pages (
  id TEXT PRIMARY KEY CHECK (id IN ('page-1', 'page-2', 'page-3', 'page-4')),
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO clipboard_pages (id, content) VALUES
  ('page-1', ''),
  ('page-2', ''),
  ('page-3', ''),
  ('page-4')
ON CONFLICT (id) DO NOTHING;

-- RLS (no auth - public read/write)
ALTER TABLE clipboard_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select" ON clipboard_pages
  FOR SELECT USING (true);

CREATE POLICY "Allow public update" ON clipboard_pages
  FOR UPDATE USING (true);

-- Realtime - if this errors with "already member", enable in Dashboard > Database > Replication
ALTER PUBLICATION supabase_realtime ADD TABLE clipboard_pages;
```

### 3. Enable Realtime (if needed)

If the `ALTER PUBLICATION` fails: **Database** → **Replication** → add `clipboard_pages` to the realtime publication.

### 4. Get API keys

**Project Settings** → **API**:

- `Project URL` → `VITE_SUPABASE_URL`
- `anon public` key → `VITE_SUPABASE_ANON_KEY`

## Environment

Create `.env`:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

Or copy `.env.example` and fill in values.

## Local dev

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Netlify deploy

1. Connect repo to Netlify
2. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
3. Add env vars in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## Features

- 4 pages: `/page-1`, `/page-2`, `/page-3`, `/page-4`
- Persistent content (survives reload)
- Multi-device sync via Supabase Realtime (~1–2s)
- "Someone is editing…" when another client is typing
- Remote changes: if you're typing, updates show as "Remote changes available" with Load button
- Autosave every 5s when there are unsaved changes
- Clear (with confirm), Copy to clipboard, Save
