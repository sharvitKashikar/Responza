import React, { useState, useEffect } from 'react';
import { ResourceForm } from '../components/resourceManagement/ResourceForm';
import { Resource } from '../types/resource.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';
import { ResourceTypeFilter, ResourceType } from '../components/common/ResourceTypeFilter';
import { ResourceStatus } from '../types/resource.types';
import { supabase } from '../lib/supabase';

interface ResourceManagementProps {
  department?: ResourceType;
}

export const ResourceManagement: React.FC<ResourceManagementProps> = ({ department: initialDepartment }) => {
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatus | 'all'>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<ResourceType | 'all'>(initialDepartment || 'all');
  const [resourcesData, setResourcesData] = useState<Resource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = (data || []).map(item => ({
        ...item,
        location: typeof item.location === 'string' 
          ? {
              latitude: parseFloat(item.location.split(',')[0]),
              longitude: parseFloat(item.location.split(',')[1]),
              address: ''
            }
          : item.location
      })) as Resource[];
      
      setResourcesData(transformedData);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddResource = async (resourceData: Omit<Resource, 'id'>) => {
    try {
      console.log('Adding resource with data:', resourceData);
      
      const formattedData = {
        name: resourceData.name,
        type: resourceData.type,
        status: resourceData.status,
        location: {
          latitude: parseFloat(resourceData.location.latitude.toString()),
          longitude: parseFloat(resourceData.location.longitude.toString()),
          address: resourceData.location.address
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Formatted data for Supabase:', formattedData);

      const { data, error } = await supabase
        .from('resources')
        .insert([formattedData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from insert operation');
      }

      console.log('Successfully added resource:', data);
      
      setResourcesData(prev => [data as Resource, ...prev]);
      setShowAddModal(false);
      
      await fetchResources();
    } catch (error: any) {
      console.error('Error adding resource:', error);
      alert(`Failed to add resource: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEditResource = async (resource: Resource) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update({
          ...resource,
          updated_at: new Date().toISOString()
        })
        .eq('id', resource.id)
        .select()
        .single();

      if (error) throw error;

      setResourcesData(prev => prev.map(r => r.id === resource.id ? data as Resource : r));
      setEditingResource(null);
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Failed to update resource. Please try again.');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId);

      if (error) throw error;

      setResourcesData(prev => prev.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  const filteredResources = resourcesData.filter((resource: Resource) => {
    const matchesDepartment = selectedDepartment === 'all' || resource.type === selectedDepartment;
    const matchesStatus = selectedStatus === 'all' || resource.status === selectedStatus;
    return matchesDepartment && matchesStatus;
  });

  const getStatusCount = (status: ResourceStatus) => {
    return resourcesData.filter((r: Resource) => r.status === status).length;
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Resource Management</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add New Resource
            </button>
          </div>

          {/* Filters */}
          <div className="flex space-x-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value as ResourceType)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Departments</option>
                <option value="ambulance">AMBULANCE</option>
                <option value="fire_truck">FIRE TRUCK</option>
                <option value="police_vehicle">POLICE VEHICLE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ResourceStatus)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="available">AVAILABLE</option>
                <option value="in_use">IN USE</option>
                <option value="maintenance">MAINTENANCE</option>
                <option value="offline">OFFLINE</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResources.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {resource.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.type.replace('_', ' ').toUpperCase()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      resource.status === 'available' ? 'bg-green-100 text-green-800' :
                      resource.status === 'in_use' ? 'bg-yellow-100 text-yellow-800' :
                      resource.status === 'maintenance' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {resource.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {resource.location.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(resource.updated_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setEditingResource(resource)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Resources</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{resourcesData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{getStatusCount('available')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Use</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{getStatusCount('in_use')}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{getStatusCount('maintenance')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Resource Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Resource</h3>
              <ResourceForm
                onSubmit={handleAddResource}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Resource Modal */}
      {editingResource && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Edit Resource</h3>
              <ResourceForm
                resource={editingResource}
                onSubmit={async (data) => {
                  await handleEditResource({ ...data, id: editingResource.id });
                }}
                onCancel={() => setEditingResource(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourceManagement;
