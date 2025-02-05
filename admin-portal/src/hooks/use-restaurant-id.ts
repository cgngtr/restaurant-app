import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRestaurantId() {
  const { data } = useQuery({
    queryKey: ['current-restaurant'],
    queryFn: async () => {
      console.log('Fetching current user...'); // Debug log
      
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user); // Debug log
      
      if (!user) throw new Error('Not authenticated');

      // Önce restaurant_staff tablosunu kontrol et
      const { data: staff, error: staffError } = await supabase
        .from('restaurant_staff')
        .select('restaurant_id')
        .eq('email', user.email)
        .single();

      if (staff?.restaurant_id) {
        return staff.restaurant_id;
      }

      // Eğer staff kaydı yoksa, direkt restaurants tablosuna bak
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .single();

      if (restaurantError) {
        console.error('Restaurant error:', restaurantError);
        throw restaurantError;
      }

      return restaurant.id;
    },
    staleTime: Infinity,
    retry: 1
  });

  return data;
} 