'use client'

import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'

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

  const generateOrderId = () => {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `order_${timestamp}${randomStr}`
  }

  const handleSubmitOrder = async () => {
    if (!restaurantData || !restaurantSlug || !tableNumber) {
      console.error('Required data not available');
      return;
    }

    setIsSubmitting(true)
    
    try {
      // First, get the table ID
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

      console.log('Table data:', tableData);

      // Create order with generated ID
      const orderId = generateOrderId()
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
        id: `item_${generateOrderId()}`, // Generate unique ID for each item
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Your cart is empty</p>
          <Button
            className="mt-4"
            onClick={handleBack}
          >
            Return to Menu
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={handleBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Menu
      </Button>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Order Summary</h1>
          <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex justify-between">
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
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Additional Notes</h2>
            <Textarea
              placeholder="Any special requests for your order?"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="h-32"
            />
          </div>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(getTotal())}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Service Fee</span>
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