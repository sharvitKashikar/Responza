-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Create custom types
create type user_role as enum ('super_admin', 'ambulance_admin', 'fire_truck_admin', 'police_vehicle_admin');
create type resource_type as enum ('ambulance', 'fire_truck', 'police_vehicle');
create type resource_status as enum ('available', 'in_use', 'maintenance', 'offline');
create type incident_status as enum ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled');
create type incident_priority as enum ('low', 'medium', 'high');

-- Create users table (this needs to be created first as other tables reference it)
create table if not exists public.users (
    id uuid primary key references auth.users(id),
    email text not null unique,
    first_name text,
    last_name text,
    role user_role not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create resources table
create table if not exists public.resources (
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
create table if not exists public.incidents (
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

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.resources enable row level security;
alter table public.incidents enable row level security;

-- Create policies for users
create policy "Users can read their own profile"
    on public.users
    for select
    to authenticated
    using (auth.uid() = id);

create policy "Super admin can manage all users"
    on public.users
    for all
    to authenticated
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and users.role = 'super_admin'
        )
    );

-- Create policies for resources
create policy "Super admin can do everything with resources"
    on public.resources
    for all
    to authenticated
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and users.role = 'super_admin'
        )
    );

create policy "Department admins can manage their resources"
    on public.resources
    for all
    to authenticated
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and (
                (users.role = 'ambulance_admin' and resources.type = 'ambulance') or
                (users.role = 'fire_truck_admin' and resources.type = 'fire_truck') or
                (users.role = 'police_vehicle_admin' and resources.type = 'police_vehicle')
            )
        )
    );

create policy "Everyone can view resources"
    on public.resources
    for select
    to authenticated
    using (true);

-- Create policies for incidents
create policy "Super admin can do everything with incidents"
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

create policy "Department admins can manage their incidents"
    on public.incidents
    for all
    to authenticated
    using (
        exists (
            select 1 from public.users
            where users.id = auth.uid()
            and (
                (users.role = 'ambulance_admin' and incidents.assigned_ambulance_id is not null) or
                (users.role = 'fire_truck_admin' and incidents.assigned_fire_truck_id is not null) or
                (users.role = 'police_vehicle_admin' and incidents.assigned_police_vehicle_id is not null)
            )
        )
    );

create policy "Everyone can view incidents"
    on public.incidents
    for select
    to authenticated
    using (true);

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.users (id, email, role)
    values (new.id, new.email, 'super_admin')
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated;
grant all privileges on all tables in schema public to postgres;
grant all privileges on all sequences in schema public to postgres;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to authenticated;
grant all on all sequences in schema public to authenticated;

-- Enable realtime for all tables
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.resources;
alter publication supabase_realtime add table public.incidents;

-- Insert sample data for resources
insert into public.resources (name, type, status, location)
values
    ('Ambulance 1', 'ambulance', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Emergency Center 1"}'::jsonb),
    ('Ambulance 2', 'ambulance', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Emergency Center 2"}'::jsonb),
    ('Fire Truck 1', 'fire_truck', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Fire Station 1"}'::jsonb),
    ('Fire Truck 2', 'fire_truck', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Fire Station 2"}'::jsonb),
    ('Police Vehicle 1', 'police_vehicle', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Police Station 1"}'::jsonb),
    ('Police Vehicle 2', 'police_vehicle', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Police Station 2"}'::jsonb);

-- Insert sample data for incidents
insert into public.incidents (title, description, status, priority, reported_by, contact_number, location)
values
    ('Medical Emergency', 'Patient experiencing chest pain', 'pending', 'high', 'John Doe', '+1234567890', '{"latitude": 19.7515, "longitude": 75.7139, "address": "123 Main St"}'::jsonb),
    ('Fire Alert', 'Building fire reported', 'in_progress', 'high', 'Jane Smith', '+1987654321', '{"latitude": 19.7515, "longitude": 75.7139, "address": "456 Oak Ave"}'::jsonb),
    ('Traffic Accident', 'Multiple vehicle collision', 'pending', 'medium', 'Mike Johnson', '+1122334455', '{"latitude": 19.7515, "longitude": 75.7139, "address": "789 Pine St"}'::jsonb); 