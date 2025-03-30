import React, { useState } from 'react';
import { useResources } from '../contexts/ResourceContext';
import MapComponent from '../components/Map/Map';
import { Resource, ResourceStatus, ResourceType as ResourceTypeEnum } from '../types/resource.types';
import { ResourceTypeFilter, ResourceType } from '../components/common/ResourceTypeFilter';

export const MapView = () => {
  const { resources, loading, error } = useResources();
  const [focusAvailable, setFocusAvailable] = useState(false);
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.16))]">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500">Error: {error}</div>
    );
  }

  // Filter resources based on selected type
  const filteredResources = selectedType === 'all' 
    ? resources 
    : resources.filter((r: Resource) => r.type === selectedType);

  const totalResources = filteredResources.length;

  const getStatusCount = (status: ResourceStatus) => {
    return filteredResources.filter((r: Resource) => r.status === status).length;
  };

  const getResourceTypeLabel = (type: ResourceType | 'all') => {
    switch (type) {
      case 'ambulance':
        return 'Ambulances';
      case 'fire_truck':
        return 'Fire Trucks';
      case 'police_vehicle':
        return 'Police Vehicles';
      case 'all':
        return 'Resources';
      default:
        return 'Resources';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Resource Tracking</h1>
        <div className="flex items-center text-gray-600">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>Real-time monitoring of {totalResources} {getResourceTypeLabel(selectedType)} in the system</p>
        </div>
      </div>

      {/* Resource Type Filter */}
      <div className="mb-6">
        <ResourceTypeFilter 
          selectedType={selectedType} 
          onTypeChange={setSelectedType} 
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-9">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <MapComponent 
              resources={filteredResources} 
              focusAvailable={focusAvailable}
            />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Status Overview
            </h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                    <span className="text-gray-700">Available</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900">{getStatusCount('available')}</span>
                </div>
                <button
                  onClick={() => setFocusAvailable(!focusAvailable)}
                  className="w-full mt-2 py-1.5 px-3 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {focusAvailable ? 'Reset View' : 'Show on Map'}
                </button>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                  <span className="text-gray-700">In Use</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{getStatusCount('in_use')}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></div>
                  <span className="text-gray-700">Maintenance</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{getStatusCount('maintenance')}</span>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-gray-500 mr-3"></div>
                  <span className="text-gray-700">Offline</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">{getStatusCount('offline')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total {getResourceTypeLabel(selectedType)}</span>
                <span className="font-semibold text-gray-900">{totalResources}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Operational Rate</span>
                <span className="font-semibold text-gray-900">
                  {Math.round(((getStatusCount('available') + getStatusCount('in_use')) / totalResources) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView; 