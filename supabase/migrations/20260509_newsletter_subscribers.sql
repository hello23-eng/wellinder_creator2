create table newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

alter table newsletter_subscribers enable row level security;

create policy "Anyone can subscribe"
  on newsletter_subscribers for insert
  with check (true);

create policy "Authenticated users can view subscribers"
  on newsletter_subscribers for select
  using (auth.role() = 'authenticated');
