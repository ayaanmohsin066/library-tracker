create table if not exists occupancy_snapshots (
  id           uuid        primary key default gen_random_uuid(),
  library_name text        not null,
  floor_name   text,
  percent_full integer     not null,
  recorded_at  timestamptz not null default now()
);

-- Index for time-series queries
create index if not exists occupancy_snapshots_recorded_at_idx
  on occupancy_snapshots (recorded_at desc);

-- Index for per-library queries
create index if not exists occupancy_snapshots_library_name_idx
  on occupancy_snapshots (library_name, recorded_at desc);

-- Row Level Security
alter table occupancy_snapshots enable row level security;

-- App (anon key) can insert snapshots
create policy "anon_insert" on occupancy_snapshots
  for insert to anon with check (true);

-- Reads require the service role (analytics / admin only)
