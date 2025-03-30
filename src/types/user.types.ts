export type UserRole = 'super_admin' | 'ambulance_admin' | 'fire_truck_admin' | 'police_vehicle_admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}
