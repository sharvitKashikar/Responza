import React, { useState } from 'react';
import { ResourceFilters } from './ResourceFilters';
import { ResourceMap } from './ResourceMap';
import { ResourceTable } from './ResourceTable';
import { useResources } from '../../hooks/useResources';
import { ResourceFilters as ResourceFiltersType, Ambulance } from '../../types/resource.types';

interface ResourceManagementProps {
  userRole: 'cityAdmin' | 'departmentAdmin';
  departmentId?: string;
  cityId?: string;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({
  userRole,
  departmentId,
  cityId,
}) => {
  const [selectedAmbulance, setSelectedAmbulance] = useState<Ambulance | null>(null);
  const [filters, setFilters] = useState<ResourceFiltersType>({});

  const {
    ambulances,
    loading,
    error,
    updateStatus,
    applyFilters,
  } = useResources(userRole, departmentId, cityId);

  const handleFilterChange = (newFilters: ResourceFiltersType) => {
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const handleAmbulanceSelect = (ambulance: Ambulance) => {
    setSelectedAmbulance(ambulance);
  };

  const handleAssignToIncident = async (incidentId: string) => {
    if (!selectedAmbulance) return;
    
    try {
      await updateStatus(selectedAmbulance.id, 'assigned', incidentId);
      setSelectedAmbulance(null);
    } catch (error) {
      console.error('Failed to assign ambulance to incident:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Resource Management</h2>
        
        <ResourceFilters
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        <div className="mt-6">
          <ResourceMap
            ambulances={ambulances}
            onAmbulanceSelect={handleAmbulanceSelect}
          />
        </div>

        <div className="mt-6">
          <ResourceTable
            ambulances={ambulances}
            onAmbulanceSelect={handleAmbulanceSelect}
          />
        </div>

        {selectedAmbulance && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Selected Ambulance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{selectedAmbulance.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium">{selectedAmbulance.status}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">
                  {selectedAmbulance.location.address || 
                    `${selectedAmbulance.location.latitude}, ${selectedAmbulance.location.longitude}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Capacity</p>
                <p className="font-medium">{selectedAmbulance.capacity}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => handleAssignToIncident('incident-id')} // Replace with actual incident ID
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Assign to Incident
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
