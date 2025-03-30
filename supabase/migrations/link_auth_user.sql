-- Insert the user into public.users table
insert into public.users (id, email, role, first_name, last_name)
select 
    id,
    email,
    'super_admin'::user_role,
    'Super',
    'Admin'
from auth.users
where email = 'super.admin@emergency.com'
on conflict (email) do update set
    role = 'super_admin',
    first_name = 'Super',
    last_name = 'Admin'; 