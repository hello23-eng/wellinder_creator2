-- Add email to creator_profiles for admin cross-referencing
alter table creator_profiles add column if not exists email text;

-- Admin can read all creator profiles
create policy "Admin can view all creator profiles"
  on creator_profiles for select
  using (auth.email() = 'hello@wellinder.co.kr');

-- Add email to shipping_info for admin cross-referencing
alter table shipping_info add column if not exists email text;

-- Admin can read all shipping info
create policy "Admin can view all shipping info"
  on shipping_info for select
  using (auth.email() = 'hello@wellinder.co.kr');
