import { supabase } from '@/utils/supabase';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { Alert } from 'react-native';

export interface Property {
  id: number;
  address: string;
  sector: string;
  size: string;
  price: string;
  notes: string;
  facing: string;
  contact: string;
  tags?: string[];
  created_at?: string;
  user_id?: string;
}

interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  error: string | null;
  addProperty: (property: Omit<Property, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  deleteProperty: (id: number) => Promise<void>;
  updateProperty: (property: Property) => Promise<void>;
  refreshProperties: () => Promise<void>;
}

export const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider = ({ children }: { children: ReactNode }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setProperties([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('UserProperties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching properties:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();

    // Listen for auth changes to refresh data
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProperties();
      } else {
        setProperties([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const addProperty = async (property: Omit<Property, 'id' | 'created_at' | 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('UserProperties')
        .insert([{
          address: property.address.toUpperCase(),
          sector: property.sector.toUpperCase(),
          size: parseFloat(property.size) || 0,
          price: property.price,
          notes: property.notes.toUpperCase(),
          facing: property.facing.toUpperCase(),
          contact: property.contact,
          tags: property.tags || [],
          user_id: user?.id,
        }])
        .select();


      if (error) {
        console.error('Supabase Error Details:', JSON.stringify(error, null, 2));
        if (error.code === '42501') {
          Alert.alert('Security Error', 'This operation was blocked by Row-Level Security (RLS). Please ensure you have the correct SELECT and INSERT policies on your Supabase table.');
        }
        throw error;
      }
      if (data) {
        setProperties((prev) => [data[0], ...prev]);
      }
    } catch (err: any) {
      console.error('Full Error Object:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const deleteProperty = async (id: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('UserProperties')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase Delete Error:', JSON.stringify(error, null, 2));
        throw error;
      }
      setProperties((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error('Full Delete Error Object:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  const updateProperty = async (updated: Property) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('UserProperties')
        .update({
          address: updated.address.toUpperCase(),
          sector: updated.sector.toUpperCase(),
          size: parseFloat(updated.size) || 0,
          price: updated.price,
          notes: updated.notes.toUpperCase(),
          facing: updated.facing.toUpperCase(),
          contact: updated.contact,
          tags: updated.tags,
        })
        .eq('id', updated.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Supabase Update Error:', JSON.stringify(error, null, 2));
        throw error;
      }
      setProperties((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err: any) {
      console.error('Full Update Error Object:', JSON.stringify(err, null, 2));
      throw err;
    }
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        loading,
        error,
        addProperty,
        deleteProperty,
        updateProperty,
        refreshProperties: fetchProperties
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};
