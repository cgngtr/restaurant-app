'use client';

import { OrderWithDetails } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface OrderDetailsProps {
  order: OrderWithDetails;
  onStatusChange: (newStatus: OrderWithDetails['status']) => Promise<void>;
}

const statusTransitions = {
  'pending': ['preparing', 'cancelled'],
  'preparing': ['ready', 'cancelled'],
  'ready': ['completed', 'cancelled'],
  'completed': [],
  'cancelled': []
} as const;

export function OrderDetails({ order, onStatusChange }: OrderDetailsProps) {
  const availableStatusTransitions = statusTransitions[order.status as keyof typeof statusTransitions];

  return (
    <div className="divide-y">
      {/* Order Info */}
      <div className="space-y-2 pb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Order ID</span>
          <span className="font-mono text-sm">{order.id.slice(0, 8)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Table</span>
          <span className="font-medium">{order.table?.table_number}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Created</span>
          <span className="text-sm">
            {format(new Date(order.created_at), 'MMM d, yyyy HH:mm')}
          </span>
        </div>
        {order.notes && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Notes</span>
            <span className="text-sm">{order.notes}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant="outline">{order.status}</Badge>
        </div>
      </div>

      {/* Order Items */}
      <div className="py-4">
        <h3 className="font-medium mb-2">Items</h3>
        <div className="space-y-2">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {item.quantity}x {item.menu_item?.name || 'Unknown Item'}
                </p>
                {item.customizations && Object.keys(item.customizations).length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {Object.entries(item.customizations)
                      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
                      .join(' | ')}
                  </p>
                )}
              </div>
              <span className="font-medium">${(item.unit_price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="py-4">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total</span>
          <span className="font-medium">${order.total_amount.toFixed(2)}</span>
        </div>
      </div>

      {/* Status Actions */}
      {availableStatusTransitions.length > 0 && (
        <div className="pt-4">
          <h3 className="font-medium mb-2">Actions</h3>
          <div className="flex flex-wrap gap-2">
            {availableStatusTransitions.map((status) => (
              <Button
                key={status}
                variant={status === 'cancelled' ? 'destructive' : 'default'}
                onClick={() => onStatusChange(status as OrderWithDetails['status'])}
              >
                Mark as {status}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 