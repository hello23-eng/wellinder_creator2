-- 1. tiktok_videos 기존 데이터 전체 삭제
TRUNCATE TABLE tiktok_videos;

-- 2. tracked_creators 테이블 생성
CREATE TABLE IF NOT EXISTS tracked_creators (
  id bigserial PRIMARY KEY,
  handle text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tracked_creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read tracked_creators"
  ON tracked_creators FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage tracked_creators"
  ON tracked_creators FOR ALL
  USING (auth.email() = 'hello@wellinder.co.kr');

-- 3. 9명 핸들 등록
INSERT INTO tracked_creators (handle) VALUES
  ('ilikemyfriesthin'),
  ('xzyphrxx'),
  ('annsybamsy'),
  ('epiechan'),
  ('taniaangelia'),
  ('chhloecore'),
  ('nita.mov'),
  ('charmsleia'),
  ('ft_siddhika')
ON CONFLICT (handle) DO NOTHING;
