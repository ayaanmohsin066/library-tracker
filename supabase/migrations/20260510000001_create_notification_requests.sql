create table if not exists notification_requests (
  id           uuid        primary key default gen_random_uuid(),
  library_name text        not null,
  uni          text        not null,
  threshold    integer     not null check (threshold between 0 and 100),
  email        text        not null,
  created_at   timestamptz not null default now()
);

alter table notification_requests enable row level security;

create policy "anon_insert" on notification_requests
  for insert to anon with check (true);

create policy "anon_select" on notification_requests
  for select to anon using (true);

create policy "anon_delete" on notification_requests
  for delete to anon using (true);
