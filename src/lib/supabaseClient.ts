import { createClient } from '@supabase/supabase-js';
import { Ambulance, ResourceFilters, AmbulanceLocation } from '../types/resource.types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getAmbulances = async (filters?: ResourceFilters) => {
  let query = supabase
    .from('ambulances')
    .select('*');

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.departmentId) {
    query = query.eq('departmentId', filters.departmentId);
  }

  if (filters?.cityId) {
    query = query.eq('cityId', filters.cityId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Ambulance[];
};

export const updateAmbulanceStatus = async (
  ambulanceId: string,
  status: Ambulance['status'],
  incidentId?: string
) => {
  const { data, error } = await supabase
    .from('ambulances')
    .update({
      status,
      assignedIncidentId: incidentId,
      lastUpdated: new Date().toISOString(),
    })
    .eq('id', ambulanceId)
    .select()
    .single();

  if (error) throw error;
  return data as Ambulance;
};

export const updateAmbulanceLocation = async (
  ambulanceId: string,
  location: AmbulanceLocation
) => {
  const { data, error } = await supabase
    .from('ambulances')
    .update({
      location,
      lastUpdated: new Date().toISOString(),
    })
    .eq('id', ambulanceId)
    .select()
    .single();

  if (error) throw error;
  return data as Ambulance;
};
