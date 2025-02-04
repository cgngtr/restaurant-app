import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

interface CustomizationOptionsProps {
  customizationOptions: {
    type: 'burger' | 'coffee' | null
    extras: Record<string, number>
    sides: Record<string, number>
    sizes: Record<string, number>
    milk_options: Record<string, number>
  }
  onCustomizationChange: (customizations: {
    selectedExtras: string[]
    selectedSide?: string
    selectedSize?: string
    selectedMilk?: string
  }) => void
  className?: string
}

interface CustomizationState {
  selectedExtras: string[]
  selectedSide?: string
  selectedSize?: string
  selectedMilk?: string
}

export default function CustomizationOptions({
  customizationOptions,
  onCustomizationChange,
  className
}: CustomizationOptionsProps) {
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [selectedSide, setSelectedSide] = useState<string | undefined>(undefined)
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [selectedMilk, setSelectedMilk] = useState<string | undefined>(undefined)

  const handleExtrasChange = (extra: string, checked: boolean) => {
    const newExtras = checked
      ? [...selectedExtras, extra]
      : selectedExtras.filter(e => e !== extra)
    
    setSelectedExtras(newExtras)
    onCustomizationChange({
      selectedExtras: newExtras,
      selectedSide,
      selectedSize,
      selectedMilk
    })
  }

  const handleSideChange = (side: string) => {
    setSelectedSide(side)
    onCustomizationChange({
      selectedExtras,
      selectedSide: side,
      selectedSize,
      selectedMilk
    })
  }

  const handleSizeChange = (size: string) => {
    setSelectedSize(size)
    onCustomizationChange({
      selectedExtras,
      selectedSide,
      selectedSize: size,
      selectedMilk
    })
  }

  const handleMilkChange = (milk: string) => {
    setSelectedMilk(milk)
    onCustomizationChange({
      selectedExtras,
      selectedSide,
      selectedSize,
      selectedMilk: milk
    })
  }

  if (!customizationOptions.type) return null

  return (
    <div className={cn('space-y-6', className)}>
      {/* Burger Options */}
      {customizationOptions.type === 'burger' && (
        <>
          {/* Extras */}
          {Object.keys(customizationOptions.extras).length > 0 && (
            <div className="space-y-3">
              <Label>Extras</Label>
              <div className="space-y-2">
                {Object.entries(customizationOptions.extras).map(([name, price]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <Checkbox
                      id={`extra-${name}`}
                      checked={selectedExtras.includes(name)}
                      onCheckedChange={(checked: boolean) => handleExtrasChange(name, checked)}
                    />
                    <label
                      htmlFor={`extra-${name}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {name} (+${price.toFixed(2)})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sides */}
          {Object.keys(customizationOptions.sides).length > 0 && (
            <div className="space-y-3">
              <Label>Choose a Side</Label>
              <RadioGroup
                value={selectedSide}
                onValueChange={handleSideChange}
              >
                {Object.entries(customizationOptions.sides).map(([name, price]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <RadioGroupItem value={name} id={`side-${name}`} />
                    <label
                      htmlFor={`side-${name}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {name} (+${price.toFixed(2)})
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </>
      )}

      {/* Coffee Options */}
      {customizationOptions.type === 'coffee' && (
        <>
          {/* Sizes */}
          {Object.keys(customizationOptions.sizes).length > 0 && (
            <div className="space-y-3">
              <Label>Size</Label>
              <RadioGroup
                value={selectedSize}
                onValueChange={handleSizeChange}
              >
                {Object.entries(customizationOptions.sizes).map(([name, price]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <RadioGroupItem value={name} id={`size-${name}`} />
                    <label
                      htmlFor={`size-${name}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {name} (+${price.toFixed(2)})
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}

          {/* Milk Options */}
          {Object.keys(customizationOptions.milk_options).length > 0 && (
            <div className="space-y-3">
              <Label>Milk Type</Label>
              <RadioGroup
                value={selectedMilk}
                onValueChange={handleMilkChange}
              >
                {Object.entries(customizationOptions.milk_options).map(([name, price]) => (
                  <div key={name} className="flex items-center space-x-2">
                    <RadioGroupItem value={name} id={`milk-${name}`} />
                    <label
                      htmlFor={`milk-${name}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {name} (+${price.toFixed(2)})
                    </label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </>
      )}
    </div>
  )
} 