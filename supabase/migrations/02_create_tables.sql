-- Enable UUID extension
create extension if not exists "uuid-ossp";

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