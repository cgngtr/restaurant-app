'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { OrderWithDetails } from '@/types/order';
import { OrderList } from '@/components/orders/order-list';
import { OrderDetails } from '@/components/orders/order-details';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

const HARDCODED_RESTAURANT_ID = '2f3c2e2e-6166-4f32-a0d9-6083548cac83';

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_number,
          table:tables(table_number),
          order_items(
            *,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('restaurant_id', HARDCODED_RESTAURANT_ID)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log('Fetched orders:', ordersData);
      setOrders(ordersData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch orders',
        variant: 'destructive',
      });
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    console.log('Setting up real-time subscription...');
    fetchOrders();

    const ordersSubscription = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `restaurant_id=eq.${HARDCODED_RESTAURANT_ID}`,
        },
        (payload) => {
          console.log('Orders change received:', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up subscriptions...');
      ordersSubscription.unsubscribe();
    };
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderWithDetails['status']) => {
    console.log('Updating order status:', orderId, newStatus);
    
    try {
      // First, update the local state optimistically
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => 
          prev ? { ...prev, status: newStatus } : null
        );
      }

      // Then, update in Supabase
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        throw error;
      }

      toast({
        title: 'Status Updated',
        description: `Order status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      
      // Revert the optimistic update on error
      await fetchOrders();
      
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  const handleClearAllOrders = async () => {
    if (!confirm('⚠️ Are you sure you want to clear ALL orders? This action cannot be undone.')) {
      return;
    }

    try {
      // Get all order IDs for this restaurant
      const { data: orderIds } = await supabase
        .from('orders')
        .select('id')
        .eq('restaurant_id', HARDCODED_RESTAURANT_ID);

      if (orderIds && orderIds.length > 0) {
        // Delete all order items for these orders
        const { error: itemsError } = await supabase
          .from('order_items')
          .delete()
          .in('order_id', orderIds.map(order => order.id));

        if (itemsError) throw itemsError;
      }

      // Then delete all orders
      const { error: ordersError } = await supabase
        .from('orders')
        .delete()
        .eq('restaurant_id', HARDCODED_RESTAURANT_ID);

      if (ordersError) throw ordersError;

      // Clear local state
      setOrders([]);
      setSelectedOrder(null);

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Orders</h1>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleClearAllOrders}
          className="flex items-center gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Clear All Orders
        </Button>
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