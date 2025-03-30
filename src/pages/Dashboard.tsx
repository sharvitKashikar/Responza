import React, { useState } from 'react';
import { useIncidents } from '../contexts/IncidentContext';
import { useResources } from '../contexts/ResourceContext';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { ResourceTypeFilter, ResourceType } from '../components/common/ResourceTypeFilter';
import { Incident } from '../types/incident.types';
import { Resource } from '../contexts/ResourceContext';

export const Dashboard: React.FC = () => {
  const { incidents, loading: incidentsLoading, error: incidentsError } = useIncidents();
  const { resources, loading: resourcesLoading, error: resourcesError } = useResources();
  const [selectedType, setSelectedType] = useState<ResourceType | 'all'>('all');

  if (incidentsLoading || resourcesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (incidentsError || resourcesError) {
    return <ErrorAlert message={incidentsError || resourcesError || 'An error occurred'} />;
  }

  // Filter resources based on selected type
  const filteredResources = selectedType === 'all' 
    ? resources 
    : resources.filter((r: Resource) => r.type === selectedType);

  // Filter incidents based on selected type and resource assignments
  const filteredIncidents = selectedType === 'all'
    ? incidents
    : incidents.filter((incident: Incident) => {
        if (selectedType === 'ambulance') {
          return incident.assigned_ambulance_id !== undefined;
        }
        // Currently only ambulance assignments are tracked
        return false;
      });

  const getStatusCount = (status: string) => {
    return filteredResources.filter(r => r.status === status).length;
  };

  const getActiveIncidentCount = () => {
    return filteredIncidents.filter(i => i.status === 'in_progress').length;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-600">
          Real-time monitoring of emergency resources and incidents
        </p>
      </div>

      {/* Resource Type Filter */}
      <div className="mb-6">
        <ResourceTypeFilter 
          selectedType={selectedType} 
          onTypeChange={setSelectedType} 
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Resources</p>
              <p className="text-2xl font-semibold text-gray-900">{filteredResources.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Incidents</p>
              <p className="text-2xl font-semibold text-gray-900">{getActiveIncidentCount()}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Resources</p>
              <p className="text-2xl font-semibold text-gray-900">{getStatusCount('available')}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resources in Use</p>
              <p className="text-2xl font-semibold text-gray-900">{getStatusCount('in_use')}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Resource Status Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Resource Status Overview
        </h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
              <span className="text-gray-700">Available</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{getStatusCount('available')}</span>
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

      {/* Recent Incidents */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Incidents
        </h2>
        <div className="space-y-4">
          {filteredIncidents.slice(0, 5).map((incident) => (
            <div key={incident.id} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{incident.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium
                  ${incident.status === 'in_progress' ? 'bg-red-100 text-red-800' : ''}
                  ${incident.status === 'resolved' ? 'bg-green-100 text-green-800' : ''}
                  ${incident.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${incident.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                  ${incident.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                `}>
                  {incident.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{incident.description}</p>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(incident.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
