CREATE TABLE IF NOT EXISTS tiktok_videos (
  id bigserial PRIMARY KEY,
  creator_handle text NOT NULL,
  video_id text NOT NULL,
  video_url text,
  views bigint DEFAULT 0,
  likes bigint DEFAULT 0,
  saves bigint DEFAULT 0,
  comments bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  posted_at timestamptz,
  scraped_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(video_id)
);

CREATE INDEX IF NOT EXISTS idx_tiktok_videos_handle ON tiktok_videos(creator_handle);
CREATE INDEX IF NOT EXISTS idx_tiktok_videos_posted_at ON tiktok_videos(posted_at DESC);

ALTER TABLE tiktok_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tiktok_videos"
  ON tiktok_videos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage tiktok_videos"
  ON tiktok_videos FOR ALL
  USING (auth.email() = 'hello@wellinder.co.kr');
