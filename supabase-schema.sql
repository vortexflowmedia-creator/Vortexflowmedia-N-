-- Run this in your Supabase project's SQL Editor (https://supabase.com/dashboard/project/_/sql/new)

-- Create the content table for editable site data
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with current pricing and info
INSERT INTO site_content (key, value) VALUES
  ('service_webdesign_price', '3799 onwards'),
  ('service_video_price', '499 onwards'),
  ('service_writing_price', '299 onwards'),
  ('service_thumbnail_price', '99 onwards'),
  ('service_logo_price', '99 onwards'),
  ('service_social_price', '199 onwards'),
  ('contact_phone', '+91 7815880701'),
  ('contact_email', 'vortexflowmedia@gmail.com'),
  ('stat_projects_done', '20+'),
  ('stat_client_satisfaction', '98%')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Allow public (anon) to read — everyone can see pricing
DROP POLICY IF EXISTS "anon_can_read" ON site_content;
CREATE POLICY "anon_can_read"
  ON site_content
  FOR SELECT
  USING (true);

-- Only service_role (via Vercel server functions) can write
DROP POLICY IF EXISTS "service_role_can_write" ON site_content;
CREATE POLICY "service_role_can_write"
  ON site_content
  FOR ALL
  USING (auth.role() = 'service_role');
