-- video_submissions: TikTok video links submitted by creators for required missions
create table if not exists video_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  user_email text not null,
  post_id uuid not null references lounge_posts(id) on delete cascade,
  video_url text not null,
  submitted_at timestamptz not null default now(),
  unique(user_id, post_id)
);

alter table video_submissions enable row level security;

-- Creators can read their own submissions
create policy "Users can view own video submissions"
  on video_submissions for select
  using (auth.uid() = user_id);

-- Creators can insert their own submissions
create policy "Users can insert own video submissions"
  on video_submissions for insert
  with check (auth.uid() = user_id);

-- Admin can view all submissions
create policy "Admin can view all video submissions"
  on video_submissions for select
  using (auth.email() = 'hello@wellinder.co.kr');
