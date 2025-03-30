-- Drop existing tables (in correct order due to dependencies)
drop table if exists public.incidents cascade;
drop table if exists public.resources cascade;
drop table if exists public.users cascade;

-- Drop existing types
drop type if exists incident_priority cascade;
drop type if exists incident_status cascade;
drop type if exists resource_status cascade;
drop type if exists resource_type cascade;

-- Drop existing functions
drop function if exists public.handle_updated_at() cascade;

-- Enable required extensions
create extension if not exists "uuid-ossp" schema extensions;

-- Create custom types
create type resource_type as enum ('ambulance', 'fire_truck', 'police_vehicle');
create type resource_status as enum ('available', 'in_use', 'maintenance', 'offline');
create type incident_status as enum ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled');
create type incident_priority as enum ('low', 'medium', 'high');

-- Create users table
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    first_name text,
    last_name text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resources table
create table public.resources (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    type resource_type not null,
    status resource_status not null default 'available',
    location jsonb not null,
    owner_id uuid references public.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create incidents table
create table public.incidents (
    id uuid primary key default uuid_generate_v4(),
    title text not null,
    description text not null,
    status incident_status not null default 'pending',
    priority incident_priority not null default 'medium',
    reported_by text not null,
    contact_number text not null,
    location jsonb not null,
    assigned_ambulance_id uuid references public.resources(id),
    assigned_fire_truck_id uuid references public.resources(id),
    assigned_police_vehicle_id uuid references public.resources(id),
    created_by uuid references public.users(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger handle_users_updated_at
    before update on public.users
    for each row
    execute function public.handle_updated_at();

create trigger handle_resources_updated_at
    before update on public.resources
    for each row
    execute function public.handle_updated_at();

create trigger handle_incidents_updated_at
    before update on public.incidents
    for each row
    execute function public.handle_updated_at();

-- Insert sample data
do $$
declare
    admin_id uuid := gen_random_uuid();
begin
    -- Insert admin user
    insert into public.users (
        id,
        email,
        first_name,
        last_name
    ) values (
        admin_id,
        'admin@emergency.com',
        'Admin',
        'User'
    );

    -- Insert sample resources
    insert into public.resources (name, type, status, location, owner_id) 
    values 
        ('Ambulance 101', 'ambulance', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central"}', admin_id),
        ('Ambulance 102', 'ambulance', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central"}', admin_id),
        ('Fire Truck 101', 'fire_truck', 'available', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Fire Station"}', admin_id),
        ('Police Vehicle 101', 'police_vehicle', 'available', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Police Station"}', admin_id);

    -- Insert sample incidents
    insert into public.incidents (
        title,
        description,
        status,
        priority,
        reported_by,
        contact_number,
        location,
        created_by
    ) values 
        (
            'Fire Emergency',
            'Building fire reported',
            'pending',
            'high',
            'Jane Smith',
            '555-0124',
            '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla"}',
            admin_id
        ),
        (
            'Traffic Accident',
            'Multi-vehicle collision',
            'pending',
            'high',
            'Mike Johnson',
            '555-0125',
            '{"latitude": 19.0728, "longitude": 72.8826, "address": "Mumbai Central"}',
            admin_id
        );
end $$;

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated;
grant all privileges on all tables in schema public to postgres, anon, authenticated;
grant all privileges on all sequences in schema public to postgres, anon, authenticated;
grant all privileges on all routines in schema public to postgres, anon, authenticated; 