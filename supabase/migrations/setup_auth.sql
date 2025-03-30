-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- First, update resources to remove owner_id references
update public.resources
set owner_id = null
where owner_id in (
  select id from public.users where email in (
    'super.admin@emergency.com',
    'ambulance.admin@emergency.com',
    'fire.admin@emergency.com',
    'police.admin@emergency.com'
  )
);

-- Clean up existing data
delete from auth.users where email in (
  'super.admin@emergency.com',
  'ambulance.admin@emergency.com',
  'fire.admin@emergency.com',
  'police.admin@emergency.com'
);

delete from public.users where email in (
  'super.admin@emergency.com',
  'ambulance.admin@emergency.com',
  'fire.admin@emergency.com',
  'police.admin@emergency.com'
);

-- Create users in auth.users
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
  raw_user_meta_data,
  is_super_admin,
  confirmed_at
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
  '{"email": "super.admin@emergency.com", "role": "super_admin"}',
  false,
  now()
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
  '{"email": "ambulance.admin@emergency.com", "role": "ambulance_admin"}',
  false,
  now()
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
  '{"email": "fire.admin@emergency.com", "role": "fire_truck_admin"}',
  false,
  now()
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
  '{"email": "police.admin@emergency.com", "role": "police_vehicle_admin"}',
  false,
  now()
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

-- Update resources to reassign owner_ids
update public.resources
set owner_id = case
  when type = 'ambulance' then 'a659afb6-3c4f-44da-a69d-4b542467deaf'
  when type = 'fire_truck' then 'b207218c-61ae-4645-acef-d6502c6893cc'
  when type = 'police_vehicle' then '52b5d82d-a2e6-4694-930f-cb85c0fb0f89'
  else 'ca53da30-effe-44da-9550-0246ff9f4a56'
end
where owner_id is null; 