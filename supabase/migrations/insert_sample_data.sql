-- First, let's store the super admin ID in a temporary table for reuse
create temporary table if not exists temp_admin_id as
select id from public.users where email = 'super.admin@emergency.com';

-- Insert sample resources
insert into public.resources (name, type, status, location, owner_id)
select 
    r.name,
    r.type::resource_type,
    r.status::resource_status,
    r.location::jsonb,
    (select id from temp_admin_id)
from (
    values
        ('Ambulance 1', 'ambulance', 'available', '{"latitude": 19.7515, "longitude": 75.7139, "address": "Emergency Center 1"}'),
        ('Ambulance 2', 'ambulance', 'available', '{"latitude": 19.7525, "longitude": 75.7149, "address": "Emergency Center 2"}'),
        ('Fire Truck 1', 'fire_truck', 'available', '{"latitude": 19.7535, "longitude": 75.7159, "address": "Fire Station 1"}'),
        ('Fire Truck 2', 'fire_truck', 'available', '{"latitude": 19.7545, "longitude": 75.7169, "address": "Fire Station 2"}'),
        ('Police Vehicle 1', 'police_vehicle', 'available', '{"latitude": 19.7555, "longitude": 75.7179, "address": "Police Station 1"}'),
        ('Police Vehicle 2', 'police_vehicle', 'available', '{"latitude": 19.7565, "longitude": 75.7189, "address": "Police Station 2"}')
) as r(name, type, status, location);

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
)
select 
    i.title,
    i.description,
    i.status::incident_status,
    i.priority::incident_priority,
    i.reported_by,
    i.contact_number,
    i.location::jsonb,
    (select id from temp_admin_id)
from (
    values
        (
            'Medical Emergency',
            'Patient experiencing chest pain',
            'pending',
            'high',
            'John Doe',
            '+1234567890',
            '{"latitude": 19.7515, "longitude": 75.7139, "address": "123 Main St"}'
        ),
        (
            'Fire Alert',
            'Building fire reported',
            'in_progress',
            'high',
            'Jane Smith',
            '+1987654321',
            '{"latitude": 19.7525, "longitude": 75.7149, "address": "456 Oak Ave"}'
        ),
        (
            'Traffic Accident',
            'Multiple vehicle collision',
            'pending',
            'medium',
            'Mike Johnson',
            '+1122334455',
            '{"latitude": 19.7535, "longitude": 75.7159, "address": "789 Pine St"}'
        )
) as i(title, description, status, priority, reported_by, contact_number, location);

-- Drop the temporary table
drop table if exists temp_admin_id;

-- Verify the data was inserted
select 'Resources:' as table_name, count(*) from public.resources
union all
select 'Incidents:', count(*) from public.incidents; 