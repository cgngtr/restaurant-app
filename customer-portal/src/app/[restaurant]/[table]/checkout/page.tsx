'use client'

import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from '@/components/ui/use-toast'

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [restaurantData, setRestaurantData] = useState<{ id: string } | null>(null)
  const [restaurantSlug, setRestaurantSlug] = useState<string>('')
  const [tableNumber, setTableNumber] = useState<string>('')

  // Get URL parameters after component mounts
  useEffect(() => {
    const pathParts = window.location.pathname.split('/')
    setRestaurantSlug(pathParts[1])
    setTableNumber(pathParts[2])
  }, [])

  // Fetch restaurant data when restaurantSlug is available
  useEffect(() => {
    if (!restaurantSlug) return;

    const fetchRestaurant = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', restaurantSlug)
        .single();

      if (error) {
        console.error('Error fetching restaurant:', error);
        return;
      }

      console.log('Restaurant data:', data);
      setRestaurantData(data);
    };

    fetchRestaurant();
  }, [restaurantSlug]);

  const handleSubmitOrder = async () => {
    if (!restaurantData || !restaurantSlug || !tableNumber) {
      console.error('Required data not available');
      return;
    }

    setIsSubmitting(true)
    
    try {
      // First, get the table ID and update its status
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('id')
        .eq('restaurant_id', restaurantData.id)
        .eq('table_number', tableNumber)
        .single();

      if (tableError) {
        console.error('Error fetching table:', tableError);
        throw tableError;
      }

      // Update table status to occupied
      const { error: updateError } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', tableData.id);

      if (updateError) {
        console.error('Error updating table status:', updateError);
        throw updateError;
      }

      // Create order with UUID
      const orderId = crypto.randomUUID()
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          restaurant_id: restaurantData.id,
          table_id: tableData.id,
          status: 'pending',
          total_amount: getTotal() + 2, // Including service fee
          notes: orderNotes,
        })
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created:', order);

      // Create order items
      const orderItems = items.map(item => ({
        id: crypto.randomUUID(), // Generate UUID for each item
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        notes: item.special_instructions,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items creation error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created:', orderItems);

      // Clear cart and navigate to order status page
      clearCart()
      window.location.href = `/${restaurantSlug}/${tableNumber}/orders/${orderId}`
    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit order. Please try again.',
        variant: 'destructive',
      });
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (restaurantSlug && tableNumber) {
      window.location.href = `/${restaurantSlug}/${tableNumber}`
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <p className="text-lg text-muted-foreground">Your cart is empty</p>
          <Button
            variant="outline"
            onClick={handleBack}
          >
            Return to Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Checkout</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Order Items</h2>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between pb-4 border-b last:border-0 last:pb-0">
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                    {item.special_instructions && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        Instructions: {item.special_instructions}
                      </p>
                    )}
                  </div>
                  <p className="font-medium">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Additional Notes</h2>
            <Textarea
              placeholder="Any special requests for your order?"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="h-32"
            />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span>{formatCurrency(2)}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal() + 2)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Button
            className="w-full"
            size="lg"
            onClick={handleSubmitOrder}
            disabled={isSubmitting || !restaurantData}
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  )
} 