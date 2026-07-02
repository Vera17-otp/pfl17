-- 1. Create enums for status
create type room_status as enum ('available', 'occupied', 'maintenance', 'dirty');
create type reservation_status as enum ('pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled');

-- 2. Create rooms table
create table rooms (
  id uuid primary key default gen_random_uuid(),
  room_number text not null unique,
  room_type text not null,
  price_per_night numeric(12,2) not null,
  capacity integer not null default 1,
  status room_status not null default 'available',
  description text,
  floor integer not null default 1,
  facilities text[] default '{}',
  image text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Create reservations table
create table reservations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references profiles(id),
  room_id uuid not null references rooms(id),
  check_in date not null,
  check_out date not null,
  status reservation_status not null default 'pending',
  total_price numeric(12,2) not null default 0,
  points_earned integer not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_dates check (check_out > check_in)
);

-- Indexes for performance
create index idx_reservations_guest_id on reservations(guest_id);
create index idx_reservations_room_id on reservations(room_id);
create index idx_reservations_status on reservations(status);

-- 4. Enable Row Level Security (RLS)
alter table rooms enable row level security;
alter table reservations enable row level security;

-- Rooms policies
create policy "public_select_rooms" on rooms
for select using (true);

create policy "admin_write_rooms" on rooms
for insert with check (is_admin());

create policy "admin_update_rooms" on rooms
for update using (is_admin());

create policy "admin_delete_rooms" on rooms
for delete using (is_admin());

-- Reservations policies
create policy "select_reservations" on reservations
for select using (is_admin() or guest_id = auth.uid());

create policy "insert_reservations" on reservations
for insert with check (is_admin() or guest_id = auth.uid());

create policy "update_reservations" on reservations
for update using (
  is_admin() or (guest_id = auth.uid() and status = 'pending')
);

create policy "delete_reservations" on reservations
for delete using (is_admin());
