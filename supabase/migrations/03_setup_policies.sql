-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.resources enable row level security;
alter table public.incidents enable row level security;

-- Create policies for users
create policy "Allow authenticated read"
  on public.users
  for select
  to authenticated
  using (true);

create policy "Allow individual user update"
  on public.users
  for update
  to authenticated
  using (auth.uid() = id);

-- Create policies for resources
create policy "Allow insert for authenticated users"
  on public.resources
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and (
        users.role = 'super_admin'
        or (users.role = 'ambulance_admin' and type = 'ambulance')
        or (users.role = 'fire_truck_admin' and type = 'fire_truck')
        or (users.role = 'police_vehicle_admin' and type = 'police_vehicle')
      )
    )
  );

create policy "Allow update for resource owners"
  on public.resources
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and (
        users.role = 'super_admin'
        or (users.role = 'ambulance_admin' and type = 'ambulance')
        or (users.role = 'fire_truck_admin' and type = 'fire_truck')
        or (users.role = 'police_vehicle_admin' and type = 'police_vehicle')
      )
    )
  );

create policy "Allow delete for resource owners"
  on public.resources
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and (
        users.role = 'super_admin'
        or (users.role = 'ambulance_admin' and type = 'ambulance')
        or (users.role = 'fire_truck_admin' and type = 'fire_truck')
        or (users.role = 'police_vehicle_admin' and type = 'police_vehicle')
      )
    )
  );

create policy "Allow select for all users"
  on public.resources
  for select
  to authenticated
  using (true);

-- Create policies for incidents
create policy "Allow all operations for super admin"
  on public.incidents
  for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and users.role = 'super_admin'
    )
  );

create policy "Allow department admins to manage their incidents"
  on public.incidents
  for all
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid()
      and (
        (users.role = 'ambulance_admin' and incidents.assigned_ambulance_id is not null)
        or (users.role = 'fire_truck_admin' and incidents.assigned_fire_truck_id is not null)
        or (users.role = 'police_vehicle_admin' and incidents.assigned_police_vehicle_id is not null)
      )
    )
  );

create policy "Allow select for all authenticated users"
  on public.incidents
  for select
  to authenticated
  using (true); 