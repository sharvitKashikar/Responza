import { useState, useEffect } from 'react';
import { Incident, IncidentStatus } from '../types/incident.types';
import { supabase } from '../lib/supabase';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const { data, error: fetchError } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setIncidents(data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch incidents');
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateIncidentStatus = async (id: string, status: IncidentStatus) => {
    try {
      const { data, error: updateError } = await supabase
        .from('incidents')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setIncidents(prev => prev.map(incident =>
        incident.id === id ? data : incident
      ));
    } catch (err) {
      setError('Failed to update incident status');
      console.error('Error updating incident status:', err);
      throw err;
    }
  };

  const assignResource = async (incidentId: string, resourceId: string) => {
    try {
      const { data, error: assignError } = await supabase
        .from('incidents')
        .update({
          assigned_ambulance_id: resourceId,
          status: 'assigned',
          updated_at: new Date().toISOString()
        })
        .eq('id', incidentId)
        .select()
        .single();

      if (assignError) throw assignError;
      setIncidents(prev => prev.map(incident =>
        incident.id === incidentId ? data : incident
      ));
    } catch (err) {
      setError('Failed to assign resource');
      console.error('Error assigning resource:', err);
      throw err;
    }
  };

  return {
    incidents,
    loading,
    error,
    updateIncidentStatus,
    assignResource,
  };
};
