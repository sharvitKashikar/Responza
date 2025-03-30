import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useResources } from '../contexts/ResourceContext';

// Fix for default marker icon
const defaultIcon = new Icon({
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

export const LiveMap: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const { resources, loading } = useResources();

  const filteredResources = resources.filter(resource => 
    selectedType === 'all' || resource.type === selectedType.slice(0, -1) // Remove 's' from end
  );

  const getStatusCount = (status: string) => 
    filteredResources.filter(r => r.status === status).length;

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow-sm p-3">
        <h1 className="text-2xl font-semibold text-gray-900">Live Resource Tracking</h1>
        <p className="text-sm text-gray-600 mt-1">
          Real-time monitoring of {filteredResources.length} Resources in the system
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'all'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedType('ambulances')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'ambulances'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ambulances
          </button>
          <button
            onClick={() => setSelectedType('fire_trucks')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'fire_trucks'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Fire Trucks
          </button>
          <button
            onClick={() => setSelectedType('police_vehicles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedType === 'police_vehicles'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Police Vehicles
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="bg-white rounded-lg shadow-sm p-3">
        <div className="h-[calc(100vh-18rem)] w-full rounded-lg overflow-hidden">
          <MapContainer
            center={[19.0760, 72.8777]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredResources.map((resource) => (
              <Marker
                key={resource.id}
                position={[resource.location.latitude, resource.location.longitude]}
                icon={defaultIcon}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold">{resource.name}</h3>
                    <p className="text-sm text-gray-600">Type: {resource.type}</p>
                    <p className="text-sm text-gray-600">Status: {resource.status}</p>
                    <p className="text-sm text-gray-600">
                      Location: {resource.location.address || 'Address not available'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="mt-1 text-2xl font-semibold text-gray-900">{filteredResources.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">{getStatusCount('available')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Use</p>
              <p className="mt-1 text-2xl font-semibold text-red-600">{getStatusCount('in_use')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="mt-1 text-2xl font-semibold text-yellow-600">{getStatusCount('maintenance')}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Offline</p>
              <p className="mt-1 text-2xl font-semibold text-gray-600">{getStatusCount('offline')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 