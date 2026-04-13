CREATE TABLE submission_attempts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_submission_attempts_ip_created
  ON submission_attempts (ip_address, created_at);
