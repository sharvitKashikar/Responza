export type AmbulanceStatus = 'available' | 'assigned' | 'maintenance' | 'offline';

export interface AmbulanceLocation {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Ambulance {
  id: string;
  name: string;
  status: AmbulanceStatus;
  location: AmbulanceLocation;
  departmentId: string;
  cityId: string;
  assignedIncidentId?: string;
  lastUpdated: string;
  capacity: number;
  equipment: string[];
}

export interface ResourceFilters {
  status?: AmbulanceStatus;
  departmentId?: string;
  cityId?: string;
  searchQuery?: string;
}

export type ResourceType = 'ambulance' | 'fire_truck' | 'police_vehicle';
export type ResourceStatus = 'available' | 'in_use' | 'maintenance' | 'offline';

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

// Alias for backward compatibility
export type ResourceLocation = Location;

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  location: Location;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}
