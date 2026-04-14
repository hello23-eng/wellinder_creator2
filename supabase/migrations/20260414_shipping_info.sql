-- shipping_info: 크리에이터 배송 정보 + 연사 설문 (1인 1회 제출)
create table if not exists shipping_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  recipient_name text not null,
  address text not null,
  phone text not null,
  speaker_preferences text[] not null default '{}',
  speaker_other text,
  submitted_at timestamptz not null default now()
);

alter table shipping_info enable row level security;

create policy "Users can read own shipping info"
  on shipping_info for select
  using (auth.uid() = user_id);

create policy "Users can insert own shipping info"
  on shipping_info for insert
  with check (auth.uid() = user_id);

-- lounge_posts: 어드민이 관리할 수 있도록 정책 추가
-- type 값: 'required' | 'optional' | 'session' | 'webinar' | 'announcement'
create policy "Admin can manage lounge posts"
  on lounge_posts for all
  using (
    (select email from auth.users where id = auth.uid()) = 'hello@wellinder.co.kr'
  );

create policy "Approved users can read lounge posts"
  on lounge_posts for select
  using (
    exists (
      select 1 from applications
      where email = (select email from auth.users where id = auth.uid())
      and status = 'approved'
    )
  );
