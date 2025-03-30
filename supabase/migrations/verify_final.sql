-- Check auth.users
select count(*) as auth_users_count from auth.users;

-- Check public.users
select count(*) as public_users_count from public.users;

-- Check if super admin exists in both tables
select 
    au.email as auth_email,
    au.id as auth_id,
    pu.email as public_email,
    pu.id as public_id,
    pu.role as public_role
from auth.users au
left join public.users pu on au.id = pu.id
where au.email = 'super.admin@emergency.com'; 