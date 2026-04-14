create table if not exists creator_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  country text not null,
  survey_a_reasons text[] not null default '{}',
  survey_a_other text,
  survey_b_goals text[] not null default '{}',
  survey_b_other text,
  created_at timestamptz not null default now()
);

alter table creator_profiles enable row level security;

create policy "Users can read own profile"
  on creator_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on creator_profiles for insert
  with check (auth.uid() = id);
