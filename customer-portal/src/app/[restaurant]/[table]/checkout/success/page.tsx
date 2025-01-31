'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'

export default function OrderSuccessPage() {
  const handleReturnToMenu = () => {
    // Get the base path (removing /checkout/success)
    const basePath = window.location.pathname.split('/checkout')[0]
    window.location.href = basePath
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center space-y-8">
        <div className="flex justify-center">
          <Check className="h-32 w-32 text-green-500 stroke-[1.5]" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-green-600">Order Received!</h1>
          <p className="text-lg text-muted-foreground">
            Your order has been successfully placed and is being prepared. Please wait while we get everything ready for you.
          </p>
          <div className="pt-4">
            <Button
              onClick={handleReturnToMenu}
              size="lg"
              variant="outline"
              className="min-w-[200px]"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 