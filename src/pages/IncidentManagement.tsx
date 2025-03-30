import React, { useState } from 'react';
import { IncidentList } from '../components/incidents/IncidentList';
import { IncidentDetails } from '../components/incidents/IncidentDetails';
import { useIncidents } from '../hooks/useIncidents';
import { Incident } from '../types/incident.types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorAlert } from '../components/common/ErrorAlert';

export const IncidentManagement: React.FC = () => {
  const { incidents, loading, error, updateIncidentStatus } = useIncidents();
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} />;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Incidents</h1>
        <p className="text-gray-600">Manage and monitor emergency incidents</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Incidents</h2>
          <IncidentList
            incidents={incidents}
            onIncidentClick={setSelectedIncident}
          />
        </div>
        <div>
          {selectedIncident ? (
            <IncidentDetails
              incident={selectedIncident}
              onClose={() => setSelectedIncident(null)}
              onUpdateStatus={(id, status) => updateIncidentStatus(id, status)}
            />
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-gray-500 text-center">Select an incident to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
