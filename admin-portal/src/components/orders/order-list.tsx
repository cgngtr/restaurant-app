'use client';

import { OrderWithDetails } from '@/types/order';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface OrderListProps {
  orders: OrderWithDetails[];
  selectedOrderId?: string;
  onOrderSelect: (order: OrderWithDetails) => void;
}

export function OrderList({ orders, selectedOrderId, onOrderSelect }: OrderListProps) {
  return (
    <Card className="h-[calc(100vh-12rem)]">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>
      </div>
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="p-2">
          {orders.map((order) => (
            <div
              key={order.id}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                selectedOrderId === order.id
                  ? 'bg-primary/10'
                  : 'hover:bg-muted'
              }`}
              onClick={() => onOrderSelect(order)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{order.order_number}</p>
                  <p className="text-sm text-muted-foreground">
                    Table {order.table?.table_number || 'N/A'}
                  </p>
                </div>
                <Badge variant="outline" className={
                  order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                  order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                  order.status === 'ready' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                  'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }>
                  {order.status}
                </Badge>
              </div>
              <div className="space-y-1">
                {order.order_items.map((item) => (
                  <div key={item.id} className="text-sm">
                    {item.quantity}x {item.menu_item.name}
                  </div>
                ))}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {format(new Date(order.created_at), 'MMM d, HH:mm')}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
} 