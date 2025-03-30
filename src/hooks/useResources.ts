import { useState, useEffect } from 'react';
import { Ambulance, ResourceFilters, AmbulanceLocation } from '../types/resource.types';
import { getAmbulances, updateAmbulanceStatus, updateAmbulanceLocation } from '../lib/supabaseClient';

export const useResources = (userRole: 'cityAdmin' | 'departmentAdmin', departmentId?: string, cityId?: string) => {
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ResourceFilters>({});

  useEffect(() => {
    const fetchAmbulances = async () => {
      try {
        setLoading(true);
        const queryFilters: ResourceFilters = {
          ...filters,
          departmentId: userRole === 'departmentAdmin' ? departmentId : undefined,
          cityId: userRole === 'cityAdmin' ? cityId : undefined,
        };
        const data = await getAmbulances(queryFilters);
        setAmbulances(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch ambulances');
      } finally {
        setLoading(false);
      }
    };

    fetchAmbulances();
  }, [filters, userRole, departmentId, cityId]);

  const updateStatus = async (ambulanceId: string, status: Ambulance['status'], incidentId?: string) => {
    try {
      const updatedAmbulance = await updateAmbulanceStatus(ambulanceId, status, incidentId);
      setAmbulances(prev => 
        prev.map(ambulance => 
          ambulance.id === ambulanceId ? updatedAmbulance : ambulance
        )
      );
      return updatedAmbulance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ambulance status');
      throw err;
    }
  };

  const updateLocation = async (ambulanceId: string, location: AmbulanceLocation) => {
    try {
      const updatedAmbulance = await updateAmbulanceLocation(ambulanceId, location);
      setAmbulances(prev => 
        prev.map(ambulance => 
          ambulance.id === ambulanceId ? updatedAmbulance : ambulance
        )
      );
      return updatedAmbulance;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ambulance location');
      throw err;
    }
  };

  const applyFilters = (newFilters: ResourceFilters) => {
    setFilters(newFilters);
  };

  return {
    ambulances,
    loading,
    error,
    updateStatus,
    updateLocation,
    applyFilters,
  };
};
