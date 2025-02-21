import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

export const SystemStatus = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60000);

      // Get active tables (tables with recent orders)
      const { data: activeTables } = await supabase
        .from('orders')
        .select('table_id')
        .gt('created_at', fiveMinutesAgo.toISOString())
        .not('status', 'eq', 'completed');

      // Get tables with pending orders
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('status', 'pending');

      return {
        activeTables: new Set(activeTables?.map(o => o.table_id)).size,
        pendingOrders: pendingOrders?.length || 0,
      };
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          System Status
        </CardTitle>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : stats?.activeTables || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          Active tables ({stats?.pendingOrders || 0} pending orders)
        </p>
      </CardContent>
    </Card>
  );
}; 