-- Check auth schema configuration
select * from auth.config;

-- Check if email auth is enabled
select * from auth.providers where provider = 'email';

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated;
grant all privileges on all tables in schema public to postgres, anon, authenticated;
grant all privileges on all sequences in schema public to postgres, anon, authenticated;

-- Enable realtime for all tables
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.resources;
alter publication supabase_realtime add table public.incidents; 