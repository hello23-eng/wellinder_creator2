ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS application_type text DEFAULT 'creator_pool',
  ADD COLUMN IF NOT EXISTS platforms text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS platforms_other text,
  ADD COLUMN IF NOT EXISTS content_types text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS content_type_other text,
  ADD COLUMN IF NOT EXISTS rate_card text;
