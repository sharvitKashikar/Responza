import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Test the connection
console.log('Testing database connection...');
Promise.all([
  supabase.from('resources').select('count'),
  supabase.from('incidents').select('count')
]).then(([resourcesResult, incidentsResult]) => {
  console.log('Database connection test results:');
  console.log('Resources count result:', resourcesResult);
  console.log('Incidents count result:', incidentsResult);
  
  if (resourcesResult.error) {
    console.error('Resources table error:', resourcesResult.error);
    if (resourcesResult.error.code === '42P01') {
      console.error('Table "resources" does not exist. Please create the table using the provided SQL.');
    }
  } else {
    console.log('Resources table exists and is accessible');
  }
  
  if (incidentsResult.error) {
    console.error('Incidents table error:', incidentsResult.error);
    if (incidentsResult.error.code === '42P01') {
      console.error('Table "incidents" does not exist. Please create the table using the provided SQL.');
    }
  } else {
    console.log('Incidents table exists and is accessible');
  }
}).catch(error => {
  console.error('Database connection test failed:', error);
});

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any) => {
  console.error('Supabase error:', error);
  
  if (!error) {
    return 'An unknown error occurred';
  }

  if (error.code === '42P01') {
    return 'Database table not found. Please ensure all required tables are created.';
  }
  if (error.code === 'PGRST301') {
    return 'Database connection error. Please check your credentials.';
  }
  if (error.message) {
    return `Database error: ${error.message}`;
  }
  
  return 'An error occurred while processing your request';
};

/*
-- SQL to create incidents table:
create table if not exists incidents (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text not null,
  status text not null check (status in ('pending', 'assigned', 'in_progress', 'resolved', 'cancelled')),
  location jsonb not null,
  priority text not null check (priority in ('low', 'medium', 'high')),
  reported_by text not null,
  contact_number text not null,
  assigned_ambulance_id uuid references resources(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table incidents enable row level security;

-- Create policy
create policy "Allow all operations" on incidents for all using (true);

-- Create updated_at trigger
create trigger incidents_updated_at
  before update on incidents
  for each row
  execute procedure public.handle_updated_at();

-- Insert sample incident
insert into incidents (
  title,
  description,
  status,
  location,
  priority,
  reported_by,
  contact_number
) values (
  'Medical Emergency',
  'Patient experiencing chest pain',
  'pending',
  '{"latitude": 37.7833, "longitude": -122.4167, "address": "123 Main St, San Francisco, CA"}',
  'high',
  'John Doe',
  '555-0123'
);
*/ 