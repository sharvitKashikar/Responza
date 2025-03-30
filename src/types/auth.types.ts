export type UserRole = 'super_admin' | 'ambulance_admin' | 'fire_truck_admin' | 'police_vehicle_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  name?: string; // For backward compatibility
  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  isLoading: boolean; // Alias for loading
  isAuthenticated: boolean;
  error: string | null;
} 