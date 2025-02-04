import { useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import CustomizationOptions from './CustomizationOptions'

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

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem, customizations: {
    selectedExtras: string[]
    selectedSide?: string
    selectedSize?: string
    selectedMilk?: string
  }) => void
}

interface CustomizationState {
  selectedExtras: string[]
  selectedSide?: string
  selectedSize?: string
  selectedMilk?: string
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [showCustomization, setShowCustomization] = useState(false)
  const [selectedCustomizations, setSelectedCustomizations] = useState<CustomizationState>({
    selectedExtras: [],
    selectedSide: undefined,
    selectedSize: undefined,
    selectedMilk: undefined
  })

  const calculateTotalPrice = () => {
    let total = item.price

    // Add extras
    selectedCustomizations.selectedExtras.forEach(extra => {
      total += item.customization_options.extras[extra] || 0
    })

    // Add side
    if (selectedCustomizations.selectedSide) {
      total += item.customization_options.sides[selectedCustomizations.selectedSide] || 0
    }

    // Add size
    if (selectedCustomizations.selectedSize) {
      total += item.customization_options.sizes[selectedCustomizations.selectedSize] || 0
    }

    // Add milk option
    if (selectedCustomizations.selectedMilk) {
      total += item.customization_options.milk_options[selectedCustomizations.selectedMilk] || 0
    }

    return total
  }

  const handleAddToCart = () => {
    if (item.customization_options.type && !showCustomization) {
      setShowCustomization(true)
      return
    }

    onAddToCart(item, selectedCustomizations)
    setShowCustomization(false)
    setSelectedCustomizations({
      selectedExtras: [],
      selectedSide: undefined,
      selectedSize: undefined,
      selectedMilk: undefined
    })
  }

  const handleCustomizationChange = (customizations: CustomizationState) => {
    setSelectedCustomizations(customizations)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="relative h-48 w-full">
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover rounded-md"
          />
        </div>
        <CardTitle className="mt-4">{item.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{item.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <Badge variant="secondary">{item.category}</Badge>
          <p className="font-semibold">${calculateTotalPrice().toFixed(2)}</p>
        </div>

        {showCustomization && (
          <CustomizationOptions
            customizationOptions={item.customization_options}
            onCustomizationChange={handleCustomizationChange}
            className="mt-4"
          />
        )}
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleAddToCart}
          disabled={!item.is_available}
          className="w-full"
        >
          {!item.is_available
            ? 'Out of Stock'
            : showCustomization
            ? 'Add to Cart'
            : item.customization_options.type
            ? 'Customize'
            : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  )
} 