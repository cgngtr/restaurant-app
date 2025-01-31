'use client'

import { useCartStore } from '@/store/cart-store'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore()
  const [orderNotes, setOrderNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitOrder = async () => {
    setIsSubmitting(true)
    
    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Clear cart and navigate to success page
      clearCart()
      window.location.href = `${window.location.pathname}/success`
    } catch (error) {
      setIsSubmitting(false)
      // You might want to add error handling here
    }
  }

  const handleBack = () => {
    const currentPath = window.location.pathname
    const parentPath = currentPath.split('/checkout')[0]
    window.location.href = parentPath
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
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Place Order'}
          </Button>
        </div>
      </div>
    </div>
  )
} 