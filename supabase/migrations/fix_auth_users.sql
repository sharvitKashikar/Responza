-- First, clean up existing users
delete from auth.users where email in (
    'super.admin@emergency.com',
    'ambulance.admin@emergency.com',
    'fire.admin@emergency.com',
    'police.admin@emergency.com'
);

-- Insert users with proper metadata
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
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin
) values
-- Super Admin
(
    '00000000-0000-0000-0000-000000000000',
    'ca53da30-effe-44da-9550-0246ff9f4a56',
    'authenticated',
    'authenticated',
    'super.admin@emergency.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "super_admin"}',
    true
);

-- Update email configurations
update auth.config set 
    site_url = 'http://localhost:3000',
    additional_redirect_urls = array['http://localhost:3000/**'],
    mailer_autoconfirm = true,
    enable_signup = true; 