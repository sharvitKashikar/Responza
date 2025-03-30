-- Check auth.users
select 'Auth Users:' as table_name, count(*) from auth.users;

-- Check public.users
select 'Public Users:' as table_name, count(*), array_agg(email) as emails 
from public.users;

-- Check resources
select 'Resources:' as table_name, count(*), array_agg(name) as resource_names 
from public.resources;

-- Check incidents
select 'Incidents:' as table_name, count(*), array_agg(title) as incident_titles 
from public.incidents;

-- Check RLS is enabled
select 
    schemaname, 
    tablename, 
    hasindexes, 
    hasrules, 
    hastriggers, 
    rowsecurity 
from pg_tables 
where schemaname = 'public' 
and tablename in ('users', 'resources', 'incidents'); 