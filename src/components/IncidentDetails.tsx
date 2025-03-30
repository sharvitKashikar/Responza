import React, { useState, useEffect } from 'react';
import { useIncidents } from '../contexts/IncidentContext';
import { useResources } from '../contexts/ResourceContext';
import { Incident, IncidentStatus } from '../types/incident.types';
import { Resource, ResourceLocation } from '../types/resource.types';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { formatDate } from '../lib/utils';

interface IncidentDetailsProps {
  incident: Incident;
  onClose: () => void;
  onUpdateStatus: (id: string, status: IncidentStatus) => Promise<void>;
}

const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incident, onClose, onUpdateStatus }) => {
  const { startResponse, markResolved, cancelIncident, loading, error } = useIncidents();
  const { resources } = useResources();
  const [selectedAmbulance, setSelectedAmbulance] = useState<Resource | null>(null);
  const { user } = useAuth();

  const availableAmbulances = resources.filter(
    resource => resource.type === 'ambulance' && resource.status === 'available'
  );

  const handleStartResponse = async () => {
    if (!selectedAmbulance) {
      alert('Please select an ambulance to respond');
      return;
    }

    try {
      await startResponse(incident, selectedAmbulance);
      alert('Response started successfully');
    } catch (error) {
      console.error('Error starting response:', error);
    }
  };

  const handleMarkResolved = async () => {
    try {
      await markResolved(incident);
      alert('Incident marked as resolved');
      onClose();
    } catch (error) {
      console.error('Error marking incident as resolved:', error);
    }
  };

  const handleCancelIncident = async () => {
    if (window.confirm('Are you sure you want to cancel this incident?')) {
      try {
        await cancelIncident(incident);
        alert('Incident cancelled successfully');
        onClose();
      } catch (error) {
        console.error('Error cancelling incident:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-900">{incident.title}</h2>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="mt-1 text-sm text-gray-900">{incident.status}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Description</h3>
          <p className="mt-1 text-sm text-gray-900">{incident.description}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Location</h3>
          <p className="mt-1 text-sm text-gray-900">
            {incident.location.address || `${incident.location.latitude}, ${incident.location.longitude}`}
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Priority</h3>
          <p className="mt-1 text-sm text-gray-900">{incident.priority}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Reported By</h3>
          <p className="mt-1 text-sm text-gray-900">{incident.reported_by}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
          <p className="mt-1 text-sm text-gray-900">{incident.contact_number}</p>
        </div>

        {incident.assigned_ambulance_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Assigned Ambulance</h3>
            <p className="mt-1 text-sm text-gray-900">{incident.assigned_ambulance_id}</p>
          </div>
        )}

        {incident.assigned_fire_truck_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Assigned Fire Truck</h3>
            <p className="mt-1 text-sm text-gray-900">{incident.assigned_fire_truck_id}</p>
          </div>
        )}

        {incident.assigned_police_vehicle_id && (
          <div>
            <h3 className="text-sm font-medium text-gray-500">Assigned Police Vehicle</h3>
            <p className="mt-1 text-sm text-gray-900">{incident.assigned_police_vehicle_id}</p>
          </div>
        )}
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Created At</h3>
          <p className="mt-1 text-sm text-gray-900">{formatDate(incident.created_at)}</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
          <p className="mt-1 text-sm text-gray-900">{formatDate(incident.updated_at)}</p>
        </div>
      </div>
      
      <div className="mt-6 flex space-x-3">
        {incident.status === 'pending' && (
          <Button
            variant="primary"
            onClick={() => onUpdateStatus(incident.id, 'in_progress')}
          >
            Start Response
          </Button>
        )}
        {incident.status === 'in_progress' && (
          <Button
            variant="primary"
            onClick={() => onUpdateStatus(incident.id, 'resolved')}
          >
            Mark Resolved
          </Button>
        )}
        {['pending', 'in_progress'].includes(incident.status) && (
          <Button
            variant="danger"
            onClick={() => onUpdateStatus(incident.id, 'cancelled')}
          >
            Cancel Incident
          </Button>
        )}
      </div>
    </div>
  );
};

export default IncidentDetails; 