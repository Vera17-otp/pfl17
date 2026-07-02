-- 1. Create point transaction type enum
create type point_transaction_type as enum ('earn', 'redeem', 'adjustment');

-- 2. Create point_transactions table
create table point_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id),
  reservation_id uuid references reservations(id),
  points integer not null,
  type point_transaction_type not null,
  note text,
  created_at timestamptz not null default now()
);

-- Index for performance
create index idx_point_transactions_profile_id on point_transactions(profile_id);

-- 3. Enable Row Level Security (RLS) on point_transactions
alter table point_transactions enable row level security;

create policy "select_own_points_or_admin" on point_transactions
for select using (is_admin() or profile_id = auth.uid());

-- Insert allowed by admin or trigger (rpc has security definer)
create policy "no_direct_insert" on point_transactions
for insert with check (is_admin());

-- 4. Function for processing checkouts (earning points and tier upgrades)
create or replace function fn_process_checkout(p_reservation_id uuid)
returns void as $$
declare
  v_guest_id uuid;
  v_total numeric;
  v_points integer;
begin
  select guest_id, total_price into v_guest_id, v_total
  from reservations where id = p_reservation_id;

  v_points := floor(v_total / 10000);

  insert into point_transactions (profile_id, reservation_id, points, type, note)
  values (v_guest_id, p_reservation_id, v_points, 'earn', 'Poin dari checkout reservasi');

  update profiles
  set total_points = total_points + v_points,
      tier_id = (
        select id from member_tiers
        where min_points <= total_points + v_points
        order by min_points desc limit 1
      )
  where id = v_guest_id;

  update reservations set points_earned = v_points where id = p_reservation_id;
end;
$$ language plpgsql security definer;

-- 5. Trigger to protect sensitive columns in profiles
create or replace function fn_protect_sensitive_profile_fields()
returns trigger as $$
begin
  if not is_admin() then
    new.role := old.role;
    new.tier_id := old.tier_id;
    new.total_points := old.total_points;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_protect_profile
before update on profiles
for each row execute function fn_protect_sensitive_profile_fields();
