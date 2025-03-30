-- Create resources table if it doesn't exist
create table if not exists resources (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  type text not null check (type in ('ambulance', 'fire_truck', 'police_vehicle')),
  status text not null check (status in ('available', 'in_use', 'busy', 'maintenance', 'offline')),
  location jsonb not null,
  owner_id uuid references users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table resources enable row level security;

-- Create policies for authenticated users
create policy "Allow authenticated users to read resources"
on resources for select
using (auth.role() = 'authenticated');

create policy "Allow authenticated users to insert resources"
on resources for insert
with check (auth.role() = 'authenticated');

create policy "Allow authenticated users to update resources"
on resources for update
using (auth.role() = 'authenticated');

create policy "Allow authenticated users to delete resources"
on resources for delete
using (auth.role() = 'authenticated');

-- Create policy for anon users to read resources
create policy "Allow anonymous users to read resources"
on resources for select
using (true);

-- Create updated_at trigger
create trigger resources_updated_at
  before update on resources
  for each row
  execute procedure public.handle_updated_at();

-- Insert sample resources
insert into resources (name, type, status, location) values
  ('Ambulance 101', 'ambulance', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central"}'),
  ('Fire Truck 101', 'fire_truck', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central Fire Station"}'),
  ('Police Vehicle 101', 'police_vehicle', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central Police Station"}'); 