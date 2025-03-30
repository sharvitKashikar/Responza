-- First, disable RLS on all tables to avoid policy conflicts during cleanup
alter table if exists public.incidents disable row level security;
alter table if exists public.resources disable row level security;
alter table if exists public.users disable row level security;
alter table if exists public.ambulances disable row level security;

-- Drop all existing policies
drop policy if exists "Super admin can do everything" on public.incidents;
drop policy if exists "Department admins can manage their incidents" on public.incidents;
drop policy if exists "Everyone can view incidents" on public.incidents;
drop policy if exists "Super admin can do everything" on public.resources;
drop policy if exists "Department admins can manage their resources" on public.resources;
drop policy if exists "Everyone can view resources" on public.resources;
drop policy if exists "Allow authenticated read" on public.users;
drop policy if exists "Allow individual user update" on public.users;
drop policy if exists "Allow insert for authenticated users" on public.resources;
drop policy if exists "Allow update for resource owners" on public.resources;
drop policy if exists "Allow delete for resource owners" on public.resources;
drop policy if exists "Allow select for all users" on public.resources;
drop policy if exists "Allow all operations for super admin" on public.incidents;
drop policy if exists "Allow department admins to manage their incidents" on public.incidents;
drop policy if exists "Allow select for all authenticated users" on public.incidents;

-- Drop existing tables (in correct order due to dependencies)
drop table if exists public.incidents cascade;
drop table if exists public.resources cascade;
drop table if exists public.ambulances cascade;
drop table if exists public.users cascade;

-- Drop existing types and functions
drop type if exists user_role cascade;
drop function if exists public.handle_updated_at() cascade;

-- Clean up auth.users
delete from auth.users where email in (
  'super.admin@emergency.com',
  'ambulance.admin@emergency.com',
  'fire.admin@emergency.com',
  'police.admin@emergency.com'
);

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Create custom types for user roles
create type user_role as enum ('super_admin', 'ambulance_admin', 'fire_truck_admin', 'police_vehicle_admin');

-- Create the updated_at function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create users table
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  password text not null,
  role user_role not null,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resources table
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('ambulance', 'fire_truck', 'police_vehicle')),
  status text not null check (status in ('available', 'in_use', 'maintenance', 'offline')),
  location jsonb not null,
  owner_id uuid references public.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create incidents table
create table public.incidents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  status text not null check (status in ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled')),
  location jsonb not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  reported_by text not null,
  contact_number text not null,
  assigned_ambulance_id uuid references public.resources(id),
  assigned_fire_truck_id uuid references public.resources(id),
  assigned_police_vehicle_id uuid references public.resources(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create triggers for updated_at
create trigger users_updated_at
  before update on public.users
  for each row
  execute procedure public.handle_updated_at();

create trigger resources_updated_at
  before update on public.resources
  for each row
  execute procedure public.handle_updated_at();

create trigger incidents_updated_at
  before update on public.incidents
  for each row
  execute procedure public.handle_updated_at();

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

-- Create users in auth.users with minimal required fields
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) values
-- Super Admin
(
  '00000000-0000-0000-0000-000000000000',
  'ca53da30-effe-44da-9550-0246ff9f4a56',
  'authenticated',
  'authenticated',
  'super.admin@emergency.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "super.admin@emergency.com", "role": "super_admin"}'
),
-- Ambulance Admin
(
  '00000000-0000-0000-0000-000000000000',
  'a659afb6-3c4f-44da-a69d-4b542467deaf',
  'authenticated',
  'authenticated',
  'ambulance.admin@emergency.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "ambulance.admin@emergency.com", "role": "ambulance_admin"}'
),
-- Fire Admin
(
  '00000000-0000-0000-0000-000000000000',
  'b207218c-61ae-4645-acef-d6502c6893cc',
  'authenticated',
  'authenticated',
  'fire.admin@emergency.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "fire.admin@emergency.com", "role": "fire_truck_admin"}'
),
-- Police Admin
(
  '00000000-0000-0000-0000-000000000000',
  '52b5d82d-a2e6-4694-930f-cb85c0fb0f89',
  'authenticated',
  'authenticated',
  'police.admin@emergency.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "police.admin@emergency.com", "role": "police_vehicle_admin"}'
);

-- Create users in public.users
insert into public.users (id, email, password, role, first_name, last_name)
values
(
  'ca53da30-effe-44da-9550-0246ff9f4a56',
  'super.admin@emergency.com',
  '**hashed**',
  'super_admin',
  'Super',
  'Admin'
),
(
  'a659afb6-3c4f-44da-a69d-4b542467deaf',
  'ambulance.admin@emergency.com',
  '**hashed**',
  'ambulance_admin',
  'Ambulance',
  'Admin'
),
(
  'b207218c-61ae-4645-acef-d6502c6893cc',
  'fire.admin@emergency.com',
  '**hashed**',
  'fire_truck_admin',
  'Fire',
  'Admin'
),
(
  '52b5d82d-a2e6-4694-930f-cb85c0fb0f89',
  'police.admin@emergency.com',
  '**hashed**',
  'police_vehicle_admin',
  'Police',
  'Admin'
);

-- Insert sample resources
insert into public.resources (name, type, status, location, owner_id)
values
(
  'Ambulance 1',
  'ambulance',
  'available',
  '{"latitude": 19.0760, "longitude": 72.8777}',
  'a659afb6-3c4f-44da-a69d-4b542467deaf'
),
(
  'Fire Truck 1',
  'fire_truck',
  'available',
  '{"latitude": 19.0760, "longitude": 72.8777}',
  'b207218c-61ae-4645-acef-d6502c6893cc'
),
(
  'Police Vehicle 1',
  'police_vehicle',
  'available',
  '{"latitude": 19.0760, "longitude": 72.8777}',
  '52b5d82d-a2e6-4694-930f-cb85c0fb0f89'
); 