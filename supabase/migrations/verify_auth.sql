-- Check if users exist in auth.users
select 
    id,
    email,
    raw_user_meta_data,
    raw_app_meta_data,
    encrypted_password is not null as has_password,
    email_confirmed_at is not null as is_confirmed
from auth.users
where email in (
    'super.admin@emergency.com',
    'ambulance.admin@emergency.com',
    'fire.admin@emergency.com',
    'police.admin@emergency.com'
);

-- Check if users exist in public.users
select *
from public.users
where email in (
    'super.admin@emergency.com',
    'ambulance.admin@emergency.com',
    'fire.admin@emergency.com',
    'police.admin@emergency.com'
);

-- Check if auth schema exists
select schema_name 
from information_schema.schemata 
where schema_name = 'auth';

-- Check if auth.users table exists
select table_name 
from information_schema.tables 
where table_schema = 'auth' 
and table_name = 'users';

-- Check if realtime publication exists
select * from pg_publication where pubname = 'supabase_realtime';

-- Check if our tables are in the publication
select schemaname, tablename 
from pg_publication_tables 
where pubname = 'supabase_realtime';

-- Verify our custom types
select typname, typtype 
from pg_type 
where typname in ('user_role', 'resource_type', 'resource_status', 'incident_status', 'incident_priority');

-- Check if RLS is enabled
select tablename, rowsecurity 
from pg_tables 
where schemaname = 'public' 
and tablename in ('users', 'resources', 'incidents'); 