-- 1. Create enum for user role
create type user_role as enum ('admin', 'member', 'guest');

-- 2. Create member_tiers table
create table member_tiers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  min_points integer not null default 0,
  benefits text,
  created_at timestamptz not null default now()
);

-- Seed member tiers
insert into member_tiers (name, min_points, benefits) values
('Silver', 0, 'Benefit dasar'),
('Gold', 500, 'Diskon 5% + late checkout'),
('Platinum', 2000, 'Diskon 10% + free upgrade kamar (subject to availability)');

-- 3. Create profiles table
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  role user_role not null default 'member',
  tier_id uuid references member_tiers(id),
  total_points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for performance
create index idx_profiles_role on profiles(role);

-- 4. Helper function to check if user is admin
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- 5. Enable Row Level Security (RLS) on profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "select_own_or_admin" on profiles
for select using (id = auth.uid() or is_admin());

create policy "update_own_profile" on profiles
for update using (id = auth.uid() or is_admin());

create policy "insert_admin_only" on profiles
for insert with check (is_admin());

-- 6. Trigger to automatically create profile on sign up
create or replace function fn_handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email, phone, role)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'full_name', ''), 
    new.email,
    coalesce(new.raw_user_meta_data->>'phone', ''), 
    'member'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_on_auth_user_created
after insert on auth.users
for each row execute function fn_handle_new_user();
