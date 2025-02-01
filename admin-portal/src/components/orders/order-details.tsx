import { OrderStatus, OrderWithDetails } from '@/types/orders';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface OrderDetailsProps {
  order: OrderWithDetails;
  onStatusChange: (newStatus: OrderStatus) => Promise<void>;
}

export function OrderDetails({ order, onStatusChange }: OrderDetailsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatDate = (date: string) => {
    if (!mounted) return ''; // Return empty string during SSR
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  const nextStatus: { [key in OrderStatus]?: OrderStatus } = {
    pending: 'preparing',
    preparing: 'ready',
    ready: 'completed',
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold">
            Order Details - Table {order.table.table_number}
          </h3>
          <p className="text-sm text-gray-500">
            Placed {formatDate(order.created_at)}
          </p>
        </div>
        {nextStatus[order.status] && (
          <Button
            onClick={() => onStatusChange(nextStatus[order.status]!)}
            variant="default"
          >
            Mark as {nextStatus[order.status]}
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Items</h4>
          <div className="space-y-2">
            {order.order_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start border-b pb-2"
              >
                <div>
                  <div className="font-medium">
                    {item.menu_item?.name || 'Unknown Item'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.menu_item?.description || 'No description available'}
                  </div>
                  {item.notes && (
                    <div className="text-sm text-gray-500 italic">
                      Note: {item.notes}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    {item.quantity} × ${item.price_at_time.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    ${(item.quantity * item.price_at_time).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between font-medium">
            <span>Total Amount</span>
            <span>${order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {order.notes && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Order Notes</h4>
            <p className="text-gray-600">{order.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
} 