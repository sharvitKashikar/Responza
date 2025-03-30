import React from 'react';
import { Ambulance } from '../../types/resource.types';

interface ResourceMapProps {
  ambulances: Ambulance[];
  onAmbulanceSelect: (ambulance: Ambulance) => void;
}

export const ResourceMap: React.FC<ResourceMapProps> = ({
  ambulances,
  onAmbulanceSelect,
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Ambulance Locations</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ambulances.map((ambulance) => (
          <div
            key={ambulance.id}
            onClick={() => onAmbulanceSelect(ambulance)}
            className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">{ambulance.name}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                ambulance.status === 'available' ? 'bg-green-100 text-green-800' :
                ambulance.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                ambulance.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {ambulance.status}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <p>Location: {ambulance.location.address || `${ambulance.location.latitude}, ${ambulance.location.longitude}`}</p>
              <p>Capacity: {ambulance.capacity}</p>
              <p>Last Updated: {new Date(ambulance.lastUpdated).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
