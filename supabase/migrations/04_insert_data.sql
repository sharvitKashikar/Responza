-- Insert sample users
insert into public.users (email, password, role, first_name, last_name) values
  ('super.admin@emergency.com', 'hashed_password_123', 'super_admin', 'Super', 'Admin'),
  ('ambulance.admin@emergency.com', 'hashed_password_123', 'ambulance_admin', 'Ambulance', 'Admin'),
  ('fire.admin@emergency.com', 'hashed_password_123', 'fire_truck_admin', 'Fire', 'Admin'),
  ('police.admin@emergency.com', 'hashed_password_123', 'police_vehicle_admin', 'Police', 'Admin');

-- Insert sample resources with proper owner_id
insert into public.resources (name, type, status, location, owner_id) 
select 
  r.name, r.type, r.status, r.location::jsonb, u.id
from (
  values 
    ('Ambulance 101', 'ambulance', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central"}'),
    ('Ambulance 102', 'ambulance', 'available', '{"latitude": 19.0760, "longitude": 72.8777, "address": "Mumbai Central"}'),
    ('Ambulance 103', 'ambulance', 'in_use', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla"}'),
    ('Fire Truck 101', 'fire_truck', 'available', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Fire Station"}'),
    ('Fire Truck 102', 'fire_truck', 'maintenance', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Fire Station"}'),
    ('Police Vehicle 101', 'police_vehicle', 'available', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Police Station"}'),
    ('Police Vehicle 102', 'police_vehicle', 'in_use', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla Police Station"}')
) as r(name, type, status, location)
cross join (
  select id from public.users where role = 'super_admin' limit 1
) as u;

-- Insert sample incidents
insert into public.incidents (title, description, status, location, priority, reported_by, contact_number) values
  ('Fire Emergency', 'Building fire reported', 'pending', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Byculla"}', 'high', 'Jane Smith', '555-0124'),
  ('Traffic Accident', 'Multi-vehicle collision', 'pending', '{"latitude": 19.0728, "longitude": 72.8826, "address": "Mumbai Central"}', 'high', 'Mike Johnson', '555-0125');

-- Verify setup
select 'Users count: ' || count(*)::text from public.users;
select 'Resources count: ' || count(*)::text from public.resources;
select 'Incidents count: ' || count(*)::text from public.incidents; 