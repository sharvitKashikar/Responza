-- First, ensure the auth.users table exists and create the auth user
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
    email_change_token_current,
    email_change_token_new,
    recovery_token
)
select
    '00000000-0000-0000-0000-000000000000',
    uuid_generate_v4(),
    'authenticated',
    'authenticated',
    'super.admin@emergency.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '',
    '',
    '',
    ''
where not exists (
    select 1 from auth.users where email = 'super.admin@emergency.com'
)
returning id, email;

-- The trigger we created earlier will automatically create the public.users record
-- But let's verify it exists and update it if needed
insert into public.users (id, email, role)
select 
    au.id,
    au.email,
    'super_admin'::user_role
from auth.users au
where au.email = 'super.admin@emergency.com'
    and not exists (
        select 1 from public.users where email = 'super.admin@emergency.com'
    );

-- Verify the user was created
select * from auth.users where email = 'super.admin@emergency.com';
select * from public.users where email = 'super.admin@emergency.com'; 