-- Enable the pgcrypto extension if not already enabled
create extension if not exists pgcrypto;

-- First, ensure we're working with clean data
delete from auth.users where email in (
  'super.admin@emergency.com',
  'ambulance.admin@emergency.com',
  'fire.admin@emergency.com',
  'police.admin@emergency.com'
);

-- Create super admin
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
  confirmation_token,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  'ca53da30-effe-44da-9550-0246ff9f4a56',
  'authenticated',
  'authenticated',
  'super.admin@emergency.com',
  crypt('hashed_password_123', gen_salt('bf')),
  now(),
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex')
);

-- Create ambulance admin
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
  confirmation_token,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  'a659afb6-3c4f-44da-a69d-4b542467deaf',
  'authenticated',
  'authenticated',
  'ambulance.admin@emergency.com',
  crypt('hashed_password_123', gen_salt('bf')),
  now(),
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex')
);

-- Create fire truck admin
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
  confirmation_token,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  'b207218c-61ae-4645-acef-d6502c6893cc',
  'authenticated',
  'authenticated',
  'fire.admin@emergency.com',
  crypt('hashed_password_123', gen_salt('bf')),
  now(),
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex')
);

-- Create police vehicle admin
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
  confirmation_token,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  '52b5d82d-a2e6-4694-930f-cb85c0fb0f89',
  'authenticated',
  'authenticated',
  'police.admin@emergency.com',
  crypt('hashed_password_123', gen_salt('bf')),
  now(),
  now(),
  now(),
  encode(gen_random_bytes(32), 'hex'),
  encode(gen_random_bytes(32), 'hex')
);

-- Link the auth users to our public.users table
insert into public.users (id, email, password, role, first_name, last_name)
select 
  au.id,
  au.email,
  '**hashed**', -- We don't store the actual password here
  case 
    when au.email = 'super.admin@emergency.com' then 'super_admin'
    when au.email = 'ambulance.admin@emergency.com' then 'ambulance_admin'
    when au.email = 'fire.admin@emergency.com' then 'fire_truck_admin'
    when au.email = 'police.admin@emergency.com' then 'police_vehicle_admin'
  end::user_role,
  case 
    when au.email = 'super.admin@emergency.com' then 'Super'
    when au.email = 'ambulance.admin@emergency.com' then 'Ambulance'
    when au.email = 'fire.admin@emergency.com' then 'Fire'
    when au.email = 'police.admin@emergency.com' then 'Police'
  end,
  case 
    when au.email = 'super.admin@emergency.com' then 'Admin'
    when au.email = 'ambulance.admin@emergency.com' then 'Admin'
    when au.email = 'fire.admin@emergency.com' then 'Admin'
    when au.email = 'police.admin@emergency.com' then 'Admin'
  end
from auth.users au
where au.email in (
  'super.admin@emergency.com',
  'ambulance.admin@emergency.com',
  'fire.admin@emergency.com',
  'police.admin@emergency.com'
); 