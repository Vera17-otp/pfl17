-- 1. Create services table
create table services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  category text not null default 'General',
  is_active boolean not null default true,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_services_is_active on services(is_active);

-- 2. Create reservation_services table
create table reservation_services (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  service_id uuid not null references services(id),
  quantity integer not null default 1 check (quantity > 0),
  price_at_booking numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_reservation_services_reservation_id on reservation_services(reservation_id);
create index idx_reservation_services_service_id on reservation_services(service_id);

-- 3. Enable RLS on new tables
alter table services enable row level security;
alter table reservation_services enable row level security;

-- 4. RLS for services
create policy "select_active_services_all" on services
for select using (is_active = true or is_admin());

create policy "admin_insert_services" on services
for insert with check (is_admin());

create policy "admin_update_services" on services
for update using (is_admin());

create policy "admin_delete_services" on services
for delete using (is_admin());

-- 5. RLS for reservation_services
create policy "select_reservation_services" on reservation_services
for select using (
  is_admin() or
  exists (
    select 1 from reservations r
    where r.id = reservation_services.reservation_id
    and r.guest_id = auth.uid()
  )
);

create policy "insert_reservation_services" on reservation_services
for insert with check (
  is_admin() or
  exists (
    select 1 from reservations r
    where r.id = reservation_services.reservation_id
    and r.guest_id = auth.uid()
    and r.status = 'pending'
  )
);

create policy "update_reservation_services" on reservation_services
for update using (
  is_admin() or
  exists (
    select 1 from reservations r
    where r.id = reservation_services.reservation_id
    and r.guest_id = auth.uid()
    and r.status = 'pending'
  )
);

create policy "delete_reservation_services" on reservation_services
for delete using (
  is_admin() or
  exists (
    select 1 from reservations r
    where r.id = reservation_services.reservation_id
    and r.guest_id = auth.uid()
    and r.status = 'pending'
  )
);
