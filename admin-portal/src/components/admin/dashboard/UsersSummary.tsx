import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';

export const UsersSummary = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['users-stats'],
    queryFn: async () => {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('role');

      const stats = profiles?.reduce((acc, profile) => {
        acc.total++;
        if (profile.role === 'restaurant_owner') {
          acc.owners++;
        }
        return acc;
      }, { total: 0, owners: 0 });

      return stats;
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Users
        </CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : stats?.total || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          Including {stats?.owners || 0} restaurant owners
        </p>
      </CardContent>
    </Card>
  );
}; 