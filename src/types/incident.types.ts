export type IncidentStatus = 'pending' | 'assigned' | 'in_progress' | 'resolved' | 'cancelled';
export type IncidentPriority = 'low' | 'medium' | 'high';

export interface Incident {
  id: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  reported_by: string;
  contact_number: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  assigned_ambulance_id?: string;
  assigned_fire_truck_id?: string;
  assigned_police_vehicle_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}
