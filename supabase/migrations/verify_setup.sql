-- Check table counts
select 'Users' as table_name, count(*) as count from users
union all
select 'Resources', count(*) from resources
union all
select 'Incidents', count(*) from incidents;

-- Check user roles distribution
select role, count(*) from users group by role;

-- Check resource types and status
select type, status, count(*) 
from resources 
group by type, status 
order by type, status;

-- Check incident statuses
select status, count(*) 
from incidents 
group by status;

-- Check auth.users table
select id, email, role from auth.users;

-- Check if extensions are enabled
select * from pg_extension where extname in ('uuid-ossp', 'pgcrypto');

-- Check public.users table
select id, email, role, first_name, last_name from public.users;

-- Check resources table
select id, name, type, status, owner_id from public.resources;

-- Check RLS is enabled
select tablename, relrowsecurity from pg_tables 
join pg_class on pg_tables.tablename = pg_class.relname
where schemaname = 'public' 
and tablename in ('users', 'resources', 'incidents');

-- Check policies
select schemaname, tablename, policyname, permissive, roles, cmd, qual 
from pg_policies 
where schemaname = 'public'; 