-- Create custom types for user roles
create type user_role as enum ('super_admin', 'ambulance_admin', 'fire_truck_admin', 'police_vehicle_admin');

-- Create users table
create table if not exists users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,  -- Should be hashed in production
  role user_role not null,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users
alter table users enable row level security;

-- Create policy for users
drop policy if exists "Allow all operations" on users;
create policy "Allow all operations" on users for all using (true);

-- Create trigger for users updated_at
create trigger users_updated_at
  before update on users
  for each row
  execute procedure public.handle_updated_at();

-- Insert sample admin users
insert into users (email, password, role, first_name, last_name) values
  ('super.admin@emergency.com', 'hashed_password_123', 'super_admin', 'Super', 'Admin'),
  ('ambulance.admin@emergency.com', 'hashed_password_123', 'ambulance_admin', 'Ambulance', 'Admin'),
  ('fire.admin@emergency.com', 'hashed_password_123', 'fire_truck_admin', 'Fire', 'Admin'),
  ('police.admin@emergency.com', 'hashed_password_123', 'police_vehicle_admin', 'Police', 'Admin');

-- Modify resources table to add owner_id
alter table resources add column if not exists owner_id uuid references users(id);

-- Update RLS policies for resources to be role-based
drop policy if exists "Allow all operations" on resources;

-- Super admin can do everything
create policy "Super admin can do everything" on resources
for all to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid()
    and users.role = 'super_admin'
  )
);

-- Department admins can only manage their own department's resources
create policy "Department admins can manage their resources" on resources
for all to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid()
    and (
      (users.role = 'ambulance_admin' and resources.type = 'ambulance') or
      (users.role = 'fire_truck_admin' and resources.type = 'fire_truck') or
      (users.role = 'police_vehicle_admin' and resources.type = 'police_vehicle')
    )
  )
);

-- Update incidents table to add department-specific fields
alter table incidents 
  add column if not exists assigned_fire_truck_id uuid references resources(id),
  add column if not exists assigned_police_vehicle_id uuid references resources(id);

-- Update RLS policies for incidents
drop policy if exists "Allow all operations" on incidents;

-- Super admin can do everything
create policy "Super admin can do everything" on incidents
for all to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid()
    and users.role = 'super_admin'
  )
);

-- Department admins can view all incidents but only manage their assignments
create policy "Department admins can manage their incidents" on incidents
for all to authenticated
using (
  exists (
    select 1 from users
    where users.id = auth.uid()
    and (
      (users.role = 'ambulance_admin' and incidents.assigned_ambulance_id is not null) or
      (users.role = 'fire_truck_admin' and incidents.assigned_fire_truck_id is not null) or
      (users.role = 'police_vehicle_admin' and incidents.assigned_police_vehicle_id is not null)
    )
  )
);

-- Insert more sample data for resources
insert into resources (name, type, status, location) values
  ('Ambulance 102', 'ambulance', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central"}'),
  ('Ambulance 103', 'ambulance', 'in_use', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla"}'),
  ('Fire Truck 101', 'fire_truck', 'available', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Fire Station"}'),
  ('Fire Truck 102', 'fire_truck', 'maintenance', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Fire Station"}'),
  ('Police Vehicle 101', 'police_vehicle', 'available', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Police Station"}'),
  ('Police Vehicle 102', 'police_vehicle', 'in_use', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Police Station"}');

-- Insert more sample incidents
insert into incidents (title, description, status, location, priority, reported_by, contact_number) values
  ('Fire Emergency', 'Building fire reported', 'pending', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla"}', 'high', 'Jane Smith', '555-0124'),
  ('Traffic Accident', 'Multi-vehicle collision', 'pending', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Mumbai Central"}', 'high', 'Mike Johnson', '555-0125');

-- Check tables
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM resources;
SELECT COUNT(*) FROM incidents; 