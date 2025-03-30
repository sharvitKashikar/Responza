import { Resource } from '../types/resource.types';
import { Incident } from '../types/incident.types';

const MOCK_USER_ID = '12345';

export const mockAmbulances: Resource[] = [
  {
    id: '1',
    name: 'Ambulance 101',
    type: 'ambulance',
    status: 'available',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: '101 Market St, San Francisco, CA',
    },
    owner_id: MOCK_USER_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Ambulance 102',
    type: 'ambulance',
    status: 'in_use',
    location: {
      latitude: 37.7833,
      longitude: -122.4167,
      address: '456 Mission St, San Francisco, CA',
    },
    owner_id: MOCK_USER_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Ambulance 103',
    type: 'ambulance',
    status: 'maintenance',
    location: {
      latitude: 37.7935,
      longitude: -122.4319,
      address: '789 Van Ness Ave, San Francisco, CA',
    },
    owner_id: MOCK_USER_ID,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockIncidents: Incident[] = [
  {
    id: '1',
    title: 'Medical Emergency',
    description: 'Patient experiencing chest pain',
    status: 'in_progress',
    location: {
      latitude: 19.7515,
      longitude: 75.7139,
      address: '123 Main St'
    },
    priority: 'high',
    reported_by: 'John Doe',
    contact_number: '555-0123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_ambulance_id: 'amb-1'
  },
  {
    id: '2',
    title: 'Fire Alert',
    description: 'Building fire reported',
    status: 'pending',
    location: {
      latitude: 19.7525,
      longitude: 75.7149,
      address: '456 Oak Ave'
    },
    priority: 'high',
    reported_by: 'Jane Smith',
    contact_number: '555-0124',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Traffic Accident',
    description: 'Multiple vehicle collision',
    status: 'resolved',
    location: {
      latitude: 19.7535,
      longitude: 75.7159,
      address: '789 Pine St'
    },
    priority: 'medium',
    reported_by: 'Mike Johnson',
    contact_number: '555-0125',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    assigned_ambulance_id: 'amb-2'
  }
];

export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms)); 