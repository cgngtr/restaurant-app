import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { X } from 'lucide-react'

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_available: boolean
  customization_options: {
    type: 'burger' | 'coffee' | null
    extras: Record<string, number>
    sides: Record<string, number>
    sizes: Record<string, number>
    milk_options: Record<string, number>
  }
}

interface CartItemProps {
  item: MenuItem
  quantity: number
  customizations: {
    selectedExtras: string[]
    selectedSide?: string
    selectedSize?: string
    selectedMilk?: string
  }
  onRemove: () => void
  onUpdateQuantity: (newQuantity: number) => void
}

export default function CartItem({
  item,
  quantity,
  customizations,
  onRemove,
  onUpdateQuantity
}: CartItemProps) {
  const calculateItemTotal = () => {
    let total = item.price

    // Add extras
    customizations.selectedExtras.forEach(extra => {
      total += item.customization_options.extras[extra] || 0
    })

    // Add side
    if (customizations.selectedSide) {
      total += item.customization_options.sides[customizations.selectedSide] || 0
    }

    // Add size
    if (customizations.selectedSize) {
      total += item.customization_options.sizes[customizations.selectedSize] || 0
    }

    // Add milk option
    if (customizations.selectedMilk) {
      total += item.customization_options.milk_options[customizations.selectedMilk] || 0
    }

    return total * quantity
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
          
          <div className="flex-grow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-sm text-gray-600">${calculateItemTotal().toFixed(2)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onRemove}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Customizations */}
            {(customizations.selectedExtras.length > 0 ||
              customizations.selectedSide ||
              customizations.selectedSize ||
              customizations.selectedMilk) && (
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                {customizations.selectedExtras.length > 0 && (
                  <p>
                    <span className="font-medium">Extras:</span>{' '}
                    {customizations.selectedExtras.join(', ')}
                  </p>
                )}
                {customizations.selectedSide && (
                  <p>
                    <span className="font-medium">Side:</span> {customizations.selectedSide}
                  </p>
                )}
                {customizations.selectedSize && (
                  <p>
                    <span className="font-medium">Size:</span> {customizations.selectedSize}
                  </p>
                )}
                {customizations.selectedMilk && (
                  <p>
                    <span className="font-medium">Milk:</span> {customizations.selectedMilk}
                  </p>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => onUpdateQuantity(Math.max(0, quantity - 1))}
                className="h-8 w-8"
              >
                -
              </Button>
              <span className="w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="h-8 w-8"
              >
                +
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 