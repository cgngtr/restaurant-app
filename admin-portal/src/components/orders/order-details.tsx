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
  pending: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
} as const;

export function OrderDetails({ order, onStatusChange }: OrderDetailsProps) {
  const availableStatusTransitions = statusTransitions[order.status as keyof typeof statusTransitions];

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Order Details</h2>
          <Badge variant="outline">{order.status}</Badge>
        </div>
      </div>
      <ScrollArea className="h-[calc(100%-4rem)]">
        <div className="p-4 space-y-6">
          {/* Order Info */}
          <div className="space-y-2">
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
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-medium mb-2">Items</h3>
            <div className="space-y-2">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">
                      {item.quantity}x {item.menu_item.name}
                    </p>
                    {item.customizations && (
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
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="font-medium">${order.total_amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Actions */}
          {availableStatusTransitions.length > 0 && (
            <div className="pt-4 border-t space-y-2">
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
      </ScrollArea>
    </Card>
  );
} 