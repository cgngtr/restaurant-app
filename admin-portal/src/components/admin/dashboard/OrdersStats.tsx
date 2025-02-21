import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

export const OrdersStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['orders-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: orders } = await supabase
        .from('orders')
        .select('status, created_at');

      const stats = orders?.reduce((acc, order) => {
        acc.total++;
        
        const orderDate = new Date(order.created_at);
        if (orderDate >= today) {
          acc.today++;
        }

        if (order.status === 'completed') {
          acc.completed++;
        }

        return acc;
      }, { total: 0, today: 0, completed: 0 });

      return stats;
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Total Orders
        </CardTitle>
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? '...' : stats?.total || 0}
        </div>
        <p className="text-xs text-muted-foreground">
          {stats?.today || 0} orders today ({stats?.completed || 0} completed)
        </p>
      </CardContent>
    </Card>
  );
}; 