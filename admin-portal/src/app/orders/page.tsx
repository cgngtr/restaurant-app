'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { OrderWithDetails } from '@/types/orders';
import { OrderList } from '@/components/orders/order-list';
import { OrderDetails } from '@/components/orders/order-details';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const restaurantId = 'rest_demo1'; // For testing purposes

  const fetchOrders = async () => {
    console.log('Fetching orders for restaurant:', restaurantId);
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        table:tables(table_number),
        order_items(
          *,
          menu_item:menu_items(name, description)
        )
      `)
      .eq('restaurant_id', restaurantId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
      return;
    }

    console.log('Current orders in database:', data);
    setOrders(data as OrderWithDetails[]);

    // Update selected order if it exists in the new data
    if (selectedOrder) {
      const updatedSelectedOrder = data?.find(order => order.id === selectedOrder.id) as OrderWithDetails;
      if (updatedSelectedOrder) {
        setSelectedOrder(updatedSelectedOrder);
      }
    }
  };

  useEffect(() => {
    console.log('Setting up real-time subscription...');
    fetchOrders();

    // Subscribe to orders table changes
    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${restaurantId}`,
        },
        async (payload) => {
          console.log('Orders change received:', payload);
          
          const { eventType, new: newRecord, old: oldRecord } = payload;
          
          if (eventType === 'INSERT') {
            toast({
              title: 'New Order',
              description: `New order received for Table ${newRecord.table_number}`,
            });
          } else if (eventType === 'UPDATE') {
            toast({
              title: 'Order Updated',
              description: `Order status changed to ${newRecord.status}`,
            });
          }

          // Refresh orders after any change
          await fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('Orders subscription status:', status);
      });

    // Subscribe to order_items table changes
    const orderItemsSubscription = supabase
      .channel('order-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'order_items',
        },
        async (payload) => {
          console.log('Order items change received:', payload);
          // Refresh orders to get updated items
          await fetchOrders();
        }
      )
      .subscribe((status) => {
        console.log('Order items subscription status:', status);
      });

    return () => {
      console.log('Cleaning up subscriptions...');
      ordersSubscription.unsubscribe();
      orderItemsSubscription.unsubscribe();
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    console.log('Updating order status:', orderId, newStatus);
    
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
      return;
    }

    // No need to call fetchOrders here as the real-time subscription will handle it
    toast({
      title: 'Status Updated',
      description: `Order status changed to ${newStatus}`,
    });
  };

  const handleClearAllOrders = async () => {
    if (!process.env.NEXT_PUBLIC_DEVELOPMENT_MODE) return;
    
    if (!confirm('⚠️ Are you sure you want to clear ALL orders? This action cannot be undone.')) {
      return;
    }

    try {
      // Get all order IDs for this restaurant
      const { data: orderIds } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', restaurantId);

      if (orderIds && orderIds.length > 0) {
        // Delete all order items for these orders
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .in('order_id', orderIds.map(order => order.id));

        if (itemsError) {
          console.error('Error deleting order items:', itemsError);
          throw itemsError;
        }
      }

      // Then delete all orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('restaurant_id', restaurantId);

      if (ordersError) {
        console.error('Error deleting orders:', ordersError);
        throw ordersError;
      }

      setOrders([]); // Immediately clear the orders in the UI
      setSelectedOrder(null); // Clear selected order

      toast({
        title: 'Success',
        description: 'All orders have been cleared',
      });
    } catch (error) {
      console.error('Error clearing orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear orders',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Orders</h1>
        {process.env.NEXT_PUBLIC_DEVELOPMENT_MODE && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAllOrders}
            className="flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Clear All Orders (Dev Only)
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <OrderList 
          orders={orders} 
          selectedOrderId={selectedOrder?.id}
          onOrderSelect={(order) => setSelectedOrder(order)} 
        />
        {selectedOrder && (
          <OrderDetails 
            order={selectedOrder}
            onStatusChange={async (newStatus) => {
              await handleStatusChange(selectedOrder.id, newStatus);
            }}
          />
        )}
      </div>
    </div>
  );
} 