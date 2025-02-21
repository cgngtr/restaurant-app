import { useQuery } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

export const useRestaurant = () => {
  const { user, isSuperadmin } = useUser();

  // Return early for superadmin
  if (isSuperadmin) {
    return {
      restaurant: { id: null, name: 'Admin' },
      isLoading: false,
      error: null,
      restaurantId: null,
    };
  }

  const { data: restaurant, isLoading, error } = useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: staffRecord, error: staffError } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('profile_id', user.id)
        .single();

      if (staffError || !staffRecord) {
        throw new Error('Bu kullanıcıya atanmış restoran bulunamadı');
      }

      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', staffRecord.restaurant_id)
        .single();

      if (restaurantError || !restaurant) {
        throw new Error('Restoran bilgileri alınamadı');
      }

      return restaurant;
    },
    enabled: !!user?.id,
    retry: false,
  });

  return {
    restaurant,
    isLoading,
    error,
    restaurantId: restaurant?.id,
  };
}; 