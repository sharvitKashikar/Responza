import React, { useState, useEffect } from 'react';
import { Resource, ResourceType, ResourceStatus, Location } from '../../types/resource.types';

interface ResourceFormProps {
  resource?: Resource;
  onSubmit: (resourceData: Omit<Resource, 'id'>) => Promise<void>;
  onCancel: () => void;
}

// Extended location type for form state
interface FormLocation extends Omit<Location, 'latitude' | 'longitude'> {
  latitude: string;
  longitude: string;
}

// Form data type with string coordinates
interface FormData extends Omit<Resource, 'id' | 'location'> {
  location: FormLocation;
  owner_id?: string;
}

export const ResourceForm: React.FC<ResourceFormProps> = ({
  resource,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'ambulance',
    status: 'available',
    location: {
      latitude: '',
      longitude: '',
      address: ''
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  useEffect(() => {
    if (resource) {
      const { id, ...rest } = resource;
      setFormData({
        ...rest,
        location: {
          ...rest.location,
          latitude: rest.location.latitude.toString(),
          longitude: rest.location.longitude.toString(),
        },
        updated_at: new Date().toISOString(),
      });
    }
  }, [resource]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'latitude' || name === 'longitude') {
      // Allow empty string or numbers only
      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          location: {
            ...prev.location,
            [name]: value
          }
        }));
      }
    } else if (name === 'address') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Please enter a resource name');
      return false;
    }

    if (!formData.location.latitude.trim() || !formData.location.longitude.trim()) {
      alert('Please enter both latitude and longitude');
      return false;
    }

    const lat = parseFloat(formData.location.latitude);
    const lng = parseFloat(formData.location.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      alert('Please enter valid numbers for latitude and longitude');
      return false;
    }

    if (lat < -90 || lat > 90) {
      alert('Latitude must be between -90 and 90');
      return false;
    }

    if (lng < -180 || lng > 180) {
      alert('Longitude must be between -180 and 180');
      return false;
    }

    if (!formData.location.address.trim()) {
      alert('Please enter an address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    // Convert string coordinates to numbers before submitting
    const submissionData: Omit<Resource, 'id'> = {
      ...formData,
      location: {
        ...formData.location,
        latitude: parseFloat(formData.location.latitude),
        longitude: parseFloat(formData.location.longitude)
      }
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to save resource. Please try again.');
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Resource Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="ambulance">Ambulance</option>
              <option value="fire_truck">Fire Truck</option>
              <option value="police_vehicle">Police Vehicle</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="available">Available</option>
              <option value="in_use">In Use</option>
              <option value="maintenance">Maintenance</option>
              <option value="offline">Offline</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                name="latitude"
                id="latitude"
                value={formData.location.latitude}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                placeholder="Enter latitude (-90 to 90)"
                min="-90"
                max="90"
              />
            </div>

            <div>
              <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                name="longitude"
                id="longitude"
                value={formData.location.longitude}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
                placeholder="Enter longitude (-180 to 180)"
                min="-180"
                max="180"
              />
            </div>
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.location.address}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
              placeholder="Enter full address"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {resource ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}; 