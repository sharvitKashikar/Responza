-- First, disable RLS on all tables
alter table if exists public.incidents disable row level security;
alter table if exists public.resources disable row level security;
alter table if exists public.users disable row level security;

-- Drop all existing policies
drop policy if exists "Super admin can do everything" on public.incidents;
drop policy if exists "Department admins can manage their incidents" on public.incidents;
drop policy if exists "Everyone can view incidents" on public.incidents;
drop policy if exists "Super admin can do everything" on public.resources;
drop policy if exists "Department admins can manage their resources" on public.resources;
drop policy if exists "Everyone can view resources" on public.resources;
drop policy if exists "Allow authenticated read" on public.users;
drop policy if exists "Allow individual user update" on public.users;
drop policy if exists "Allow insert for authenticated users" on public.resources;
drop policy if exists "Allow update for resource owners" on public.resources;
drop policy if exists "Allow delete for resource owners" on public.resources;
drop policy if exists "Allow select for all users" on public.resources;
drop policy if exists "Allow all operations for super admin" on public.incidents;
drop policy if exists "Allow department admins to manage their incidents" on public.incidents;
drop policy if exists "Allow select for all authenticated users" on public.incidents;

-- Drop existing tables (in correct order due to dependencies)
drop table if exists public.incidents cascade;
drop table if exists public.resources cascade;
drop table if exists public.users cascade;

-- Drop existing types and functions
drop type if exists user_role cascade;
drop function if exists public.handle_updated_at() cascade; 