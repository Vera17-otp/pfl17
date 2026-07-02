-- 1. Helpdesk Tickets table
create table helpdesk_tickets (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  room_number text,
  category text not null,
  description text not null,
  priority text not null default 'Medium',
  status text not null default 'Open',
  department text,
  notes jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS on helpdesk_tickets
alter table helpdesk_tickets enable row level security;
create policy "select_helpdesk_all_for_admin" on helpdesk_tickets
for select using (is_admin());
create policy "all_helpdesk_for_admin" on helpdesk_tickets
for all using (is_admin());

-- 2. System Notifications table
create table system_notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id),
  title text not null,
  content text not null,
  type text not null default 'info',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS on system_notifications
alter table system_notifications enable row level security;
create policy "select_own_notifications" on system_notifications
for select using (profile_id = auth.uid() or is_admin());
create policy "insert_notifications_admin" on system_notifications
for insert with check (is_admin());
create policy "update_own_notifications" on system_notifications
for update using (profile_id = auth.uid() or is_admin());

-- 3. Financial Transactions table
create table financial_transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null, -- 'income' or 'expense'
  amount numeric not null,
  category text not null,
  description text,
  payment_method text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table financial_transactions enable row level security;
create policy "all_finance_for_admin" on financial_transactions
for all using (is_admin());

-- 4. Marketing Promos table
create table marketing_promos (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_percentage integer not null,
  valid_until date not null,
  description text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table marketing_promos enable row level security;
create policy "select_promos_all" on marketing_promos
for select using (true);
create policy "all_promos_admin" on marketing_promos
for all using (is_admin());

-- 5. Guest Reviews / Feedback table
create table guest_reviews (
  id uuid primary key default gen_random_uuid(),
  guest_name text not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  source text not null default 'Internal',
  reply_text text,
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table guest_reviews enable row level security;
create policy "select_reviews_all" on guest_reviews
for select using (true);
create policy "all_reviews_admin" on guest_reviews
for all using (is_admin());

-- 6. Staff Tasks table
create table staff_tasks (
  id uuid primary key default gen_random_uuid(),
  room_number text,
  task_name text not null,
  description text,
  assigned_to text,
  dept text,
  priority text not null default 'Sedang',
  status text not null default 'Belum Dimulai',
  completed_at timestamptz,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table staff_tasks enable row level security;
create policy "all_tasks_for_admin" on staff_tasks
for all using (is_admin());

-- 7. Chat Messages table
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references profiles(id),
  sender_name text not null,
  message text not null,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table chat_messages enable row level security;
create policy "all_chats_all_users" on chat_messages
for all using (true);
