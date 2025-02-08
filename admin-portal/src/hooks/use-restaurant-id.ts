import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useRestaurantId() {
  const { data } = useQuery({
    queryKey: ['current-restaurant'],
    queryFn: async () => {
      try {
        // Şimdilik sabit bir restaurant ID kullanacağız
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .single();

        return restaurant?.id;
      } catch (error) {
        console.error('Error fetching restaurant:', error);
        return null;
      }
    },
    staleTime: Infinity,
    retry: 1
  });

  return data;
} 