import React from 'react';

export type ResourceType = 'ambulance' | 'fire_truck' | 'police_vehicle';

interface ResourceTypeFilterProps {
  selectedType: ResourceType | 'all';
  onTypeChange: (type: ResourceType | 'all') => void;
}

export const ResourceTypeFilter: React.FC<ResourceTypeFilterProps> = ({ selectedType, onTypeChange }) => {
  return (
    <div className="flex items-center space-x-4">
      <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
      <div className="flex space-x-2">
        <button
          onClick={() => onTypeChange('all')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${selectedType === 'all' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          All
        </button>
        <button
          onClick={() => onTypeChange('ambulance')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${selectedType === 'ambulance' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Ambulances
        </button>
        <button
          onClick={() => onTypeChange('fire_truck')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${selectedType === 'fire_truck' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Fire Trucks
        </button>
        <button
          onClick={() => onTypeChange('police_vehicle')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors
            ${selectedType === 'police_vehicle' 
              ? 'bg-blue-100 text-blue-800' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          Police Vehicles
        </button>
      </div>
    </div>
  );
}; 