import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from './useUser';

export function useRestaurantId() {
  const { user } = useUser();
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    async function getRestaurantId() {
      if (!user) return;

      const { data, error } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('profile_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching restaurant ID:', error);
        return;
      }

      setRestaurantId(data.restaurant_id);
    }

    getRestaurantId();
  }, [user]);

  return restaurantId;
} 