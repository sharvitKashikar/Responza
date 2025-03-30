import React, { createContext, useContext, useState, useEffect } from 'react';
import { Incident, IncidentStatus } from '../types/incident.types';
import { Resource } from '../types/resource.types';
import { supabase } from '../lib/supabase';

interface IncidentContextType {
  incidents: Incident[];
  loading: boolean;
  error: string | null;
  selectedIncident: Incident | null;
  setSelectedIncident: (incident: Incident | null) => void;
  startResponse: (incident: Incident, ambulance: Resource) => Promise<void>;
  markResolved: (incident: Incident) => Promise<void>;
  cancelIncident: (incident: Incident) => Promise<void>;
  refreshIncidents: () => Promise<void>;
}

const IncidentContext = createContext<IncidentContextType | undefined>(undefined);

export const IncidentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  useEffect(() => {
    fetchIncidents();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents'
      }, () => {
        fetchIncidents();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIncidents(data || []);
      setError(null);
    } catch (error) {
      setError('Failed to fetch incidents');
      console.error('Error in fetchIncidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const startResponse = async (incident: Incident, ambulance: Resource) => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          status: 'in_progress',
          assigned_ambulance_id: ambulance.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', incident.id)
        .select()
        .single();

      if (error) throw error;
      setIncidents(prev =>
        prev.map(i => i.id === incident.id ? data : i)
      );
    } catch (error) {
      setError('Failed to start response');
      throw error;
    }
  };

  const markResolved = async (incident: Incident) => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          status: 'resolved',
          updated_at: new Date().toISOString()
        })
        .eq('id', incident.id)
        .select()
        .single();

      if (error) throw error;
      setIncidents(prev =>
        prev.map(i => i.id === incident.id ? data : i)
      );
    } catch (error) {
      setError('Failed to mark incident as resolved');
      throw error;
    }
  };

  const cancelIncident = async (incident: Incident) => {
    try {
      const { data, error } = await supabase
        .from('incidents')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', incident.id)
        .select()
        .single();

      if (error) throw error;
      setIncidents(prev =>
        prev.map(i => i.id === incident.id ? data : i)
      );
    } catch (error) {
      setError('Failed to cancel incident');
      throw error;
    }
  };

  return (
    <IncidentContext.Provider
      value={{
        incidents,
        loading,
        error,
        selectedIncident,
        setSelectedIncident,
        startResponse,
        markResolved,
        cancelIncident,
        refreshIncidents: fetchIncidents,
      }}
    >
      {children}
    </IncidentContext.Provider>
  );
};

export const useIncidents = () => {
  const context = useContext(IncidentContext);
  if (context === undefined) {
    throw new Error('useIncidents must be used within an IncidentProvider');
  }
  return context;
}; 