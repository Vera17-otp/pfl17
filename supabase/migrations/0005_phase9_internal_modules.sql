-- 1. Hotel Settings Table
create table hotel_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text not null unique,
  setting_value jsonb not null,
  is_public boolean not null default false,
  updated_by uuid references profiles(id),
  updated_at timestamptz not null default now()
);

alter table hotel_settings enable row level security;
create policy "select_settings" on hotel_settings
for select using (is_public = true or is_admin());
create policy "admin_write_settings" on hotel_settings
for all using (is_admin()) with check (is_admin());

-- 2. Occupancy Forecasts Table
create table occupancy_forecasts (
  id uuid primary key default gen_random_uuid(),
  forecast_date date not null,
  predicted_occupancy_rate numeric(5,2) not null,
  predicted_revenue numeric(12,2),
  model_note text,
  generated_at timestamptz not null default now(),
  generated_by uuid references profiles(id)
);

alter table occupancy_forecasts enable row level security;
create policy "admin_only_forecasts" on occupancy_forecasts
for all using (is_admin()) with check (is_admin());

-- 3. Views for Reports
create or replace view view_revenue_summary as
select
  date_trunc('month', created_at) as period,
  sum(amount) filter (where type = 'income') as total_revenue,
  count(*) filter (where type = 'income') as paid_invoice_count
from financial_transactions
where is_admin()
group by 1
order by 1 desc;

create or replace view view_occupancy_summary as
select
  date_trunc('day', r.check_in) as day,
  count(*) as total_reservations,
  count(*) filter (where r.status in ('confirmed','checked_in','checked_out')) as confirmed_reservations
from reservations r
where is_admin()
group by 1
order by 1 desc;
