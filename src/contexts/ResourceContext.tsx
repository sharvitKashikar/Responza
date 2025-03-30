import React, { createContext, useContext, useState, useEffect } from 'react';
import { Resource as ResourceType, ResourceStatus, ResourceLocation } from '../types/resource.types';
import { supabase } from '../lib/supabase';

export type Resource = ResourceType;

interface ResourceContextType {
  resources: Resource[];
  loading: boolean;
  error: string | null;
  addResource: (resource: Omit<Resource, 'id'>) => Promise<void>;
  updateResource: (id: string, resource: Partial<Resource>) => Promise<void>;
  deleteResource: (id: string) => Promise<void>;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export const ResourceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch of resources
  useEffect(() => {
    fetchResources();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('resources')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'resources'
      }, () => {
        fetchResources();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
      setError(null);
    } catch (error) {
      setError('Failed to fetch resources');
      console.error('Error in fetchResources:', error);
    } finally {
      setLoading(false);
    }
  };

  const addResource = async (resource: Omit<Resource, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([resource])
        .select()
        .single();

      if (error) throw error;
      setResources(prev => [data, ...prev]);
    } catch (error) {
      setError('Failed to add resource');
      throw error;
    }
  };

  const updateResource = async (id: string, resource: Partial<Resource>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .update(resource)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setResources(prev =>
        prev.map(r => r.id === id ? data : r)
      );
    } catch (error) {
      setError('Failed to update resource');
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      setError('Failed to delete resource');
      throw error;
    }
  };

  return (
    <ResourceContext.Provider
      value={{
        resources,
        loading,
        error,
        addResource,
        updateResource,
        deleteResource,
      }}
    >
      {children}
    </ResourceContext.Provider>
  );
};

export const useResources = () => {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResources must be used within a ResourceProvider');
  }
  return context;
};

