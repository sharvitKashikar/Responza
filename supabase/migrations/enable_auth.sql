-- Enable the auth schema and extensions
create schema if not exists auth;
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Grant necessary permissions
grant usage on schema public to postgres, anon, authenticated;
grant all privileges on all tables in schema public to postgres, anon, authenticated;
grant all privileges on all sequences in schema public to postgres, anon, authenticated;

-- Enable realtime for all tables
alter publication supabase_realtime add table public.users;
alter publication supabase_realtime add table public.resources;
alter publication supabase_realtime add table public.incidents;

-- Insert the super admin user directly into public.users first
insert into public.users (
    id,
    email,
    password,
    role,
    first_name,
    last_name
) values (
    'ca53da30-effe-44da-9550-0246ff9f4a56',
    'super.admin@emergency.com',
    crypt('password123', gen_salt('bf')),
    'super_admin',
    'Super',
    'Admin'
) on conflict (email) do update set
    password = excluded.password,
    role = excluded.role;

-- Create auth user
insert into auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) values (
    'ca53da30-effe-44da-9550-0246ff9f4a56',
    'super.admin@emergency.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "super_admin"}'
) on conflict (id) do update set
    encrypted_password = excluded.encrypted_password,
    email_confirmed_at = excluded.email_confirmed_at; 