import { OrderWithDetails } from '@/types/orders';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useState } from 'react';

interface OrderListProps {
  orders: OrderWithDetails[];
  selectedOrderId?: string;
  onOrderSelect: (order: OrderWithDetails) => void;
}

export function OrderList({ orders, selectedOrderId, onOrderSelect }: OrderListProps) {
  // Use state to handle client-side rendering of dates
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string) => {
    if (!mounted) return ''; // Return empty string during SSR
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Orders</h2>
      </div>
      <div className="divide-y">
        {orders.map((order) => (
          <div
            key={order.id}
            className={cn(
              'p-4 cursor-pointer hover:bg-gray-50 transition-colors',
              selectedOrderId === order.id && 'bg-gray-50'
            )}
            onClick={() => onOrderSelect(order)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Table {order.table.table_number}</span>
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  getStatusColor(order.status)
                )}>
                  {order.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(order.created_at)}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {order.order_items.length} items · ${order.total_amount.toFixed(2)}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </div>
  );
} 