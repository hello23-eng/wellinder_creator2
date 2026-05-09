create table creator_pool_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  tiktok_handle text,
  instagram_handle text,
  email text not null,
  country text,
  status text not null default 'pending',
  platforms text[] default '{}',
  platforms_other text,
  content_types text[] default '{}',
  content_type_other text,
  rate_card text,
  gifted boolean default false,
  gifted_date date,
  gifted_note text,
  created_at timestamptz default now()
);

alter table creator_pool_applications enable row level security;

create policy "Admin can manage creator_pool_applications"
  on creator_pool_applications for all
  using (auth.email() = 'hello@wellinder.co.kr');
