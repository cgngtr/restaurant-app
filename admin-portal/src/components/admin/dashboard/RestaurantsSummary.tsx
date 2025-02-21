import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store } from 'lucide-react';

export const RestaurantsSummary = () => {
  const { data: restaurantsCount, isLoading } = useQuery({
    queryKey: ['restaurants-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('restaurants')
        .select('*', { count: 'exact', head: true });
      return count;
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Restaurants
        </CardTitle>
        <Store className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : restaurantsCount || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          Active restaurants in the system
        </p>
      </CardContent>
    </Card>
  );
}; 