'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Database } from '@/types/supabase'
import { Minus, Plus, ChevronLeft } from 'lucide-react'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ui/use-toast'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuItemWithExtras extends MenuItem {
  extras?: {
    size?: string;
    milk?: string;
    side?: string;
    extras?: Record<string, number>;
  }
}

interface DietaryFlag {
  id: string
  name: string
  description?: string
  icon_url?: string
}

interface DietaryFlagJoin {
  dietary_flags: DietaryFlag
}

// Ürün kategorileri
const BURGER_ITEMS = [
  'Classic Cheeseburger',
  'Grilled Chicken Club',
  'Bacon Avocado Burger',
  'Veggie Burger',
  'BBQ Pulled Pork'
]

const COFFEE_ITEMS = [
  'Fresh Coffee',
  'Iced Coffee'
]

// Ekstra seçenekler
const BURGER_EXTRAS = {
  'Extra Cheese': 1.50,
  'Bacon': 2.00,
  'Avocado': 2.00,
  'Fried Egg': 1.50,
  'Caramelized Onions': 1.00,
  'Sautéed Mushrooms': 1.00,
  'Jalapeños': 0.50
}

const BURGER_SIDES = {
  'French Fries': 0,
  'Sweet Potato Fries': 2.00,
  'Onion Rings': 2.50,
  'Side Salad': 2.00,
  'Coleslaw': 1.00
}

const COFFEE_SIZES = {
  'Small (12 oz)': -1.00,
  'Regular (16 oz)': 0,
  'Large (20 oz)': 1.50,
  'Extra Large (24 oz)': 2.50
}

const MILK_OPTIONS = {
  'Whole Milk': 0,
  'Skim Milk': 0,
  'Almond Milk': 1.00,
  'Oat Milk': 1.00,
  'Soy Milk': 1.00
}

const DEFAULT_FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe',
].map(url => `${url}?q=80&w=800&h=600&fit=crop&auto=format`);

function getRandomFallbackImage() {
  return DEFAULT_FOOD_IMAGES[Math.floor(Math.random() * DEFAULT_FOOD_IMAGES.length)];
}

interface MenuItemDialogProps {
  item: MenuItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CustomizationOption {
  id: string
  name: string
  price_adjustment: number
  is_default: boolean
}

interface CustomizationGroup {
  id: string
  name: string
  description?: string
  is_required: boolean
  min_selections: number
  max_selections: number
  options: CustomizationOption[]
}

interface CustomizationSelection {
  [groupId: string]: string[]
}

export function MenuItemDialog({ item, open, onOpenChange }: MenuItemDialogProps) {
  // States for different options
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({})
  const [selectedSide, setSelectedSide] = useState<string>('French Fries')
  const [selectedSize, setSelectedSize] = useState<string>('Regular (16 oz)')
  const [selectedMilk, setSelectedMilk] = useState<string>('Whole Milk')
  const [customizationSelections, setCustomizationSelections] = useState<CustomizationSelection>({})
  
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()

  // Show conditions
  const isBurger = BURGER_ITEMS.includes(item.name)
  const isCoffee = COFFEE_ITEMS.includes(item.name)

  // Dietary flags'leri çek
  const { data: dietaryFlags } = useQuery<DietaryFlag[]>({
    queryKey: ['dietary-flags', item.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_item_dietary_flags')
        .select(`
          dietary_flags(
            id,
            name,
            description,
            icon_url
          )
        `)
        .eq('menu_item_id', item.id);
      
      if (!data) return [];
      
      return (data as unknown as DietaryFlagJoin[]).map(item => ({
        id: item.dietary_flags.id,
        name: item.dietary_flags.name,
        description: item.dietary_flags.description || undefined,
        icon_url: item.dietary_flags.icon_url || undefined
      }));
    }
  });

  // Initialize default selections
  useEffect(() => {
    if (item.customization_groups) {
      const initialSelections: CustomizationSelection = {}
      item.customization_groups.forEach(({ customization_groups: group }) => {
        // If group has default options, select them
        const defaultOptions = group.options.filter(opt => opt.is_default)
        if (defaultOptions.length > 0) {
          initialSelections[group.id] = defaultOptions.map(opt => opt.id)
        } else if (group.is_required && group.min_selections > 0) {
          // If required and no defaults, select first option
          initialSelections[group.id] = [group.options[0].id]
        } else {
          initialSelections[group.id] = []
        }
      })
      setCustomizationSelections(initialSelections)
    }
  }, [item.customization_groups])

  const handleOptionToggle = (groupId: string, optionId: string) => {
    setCustomizationSelections(prev => {
      const group = item.customization_groups?.find(
        g => g.customization_groups.id === groupId
      )?.customization_groups

      if (!group) return prev

      const currentSelections = prev[groupId] || []
      let newSelections: string[]

      if (currentSelections.includes(optionId)) {
        // Remove if already selected
        if (group.is_required && currentSelections.length <= group.min_selections) {
          // Can't remove if it would violate minimum selections
          return prev
        }
        newSelections = currentSelections.filter(id => id !== optionId)
      } else {
        // Add if not selected
        if (currentSelections.length >= group.max_selections) {
          // If max selections reached, remove first selection
          newSelections = [...currentSelections.slice(1), optionId]
        } else {
          newSelections = [...currentSelections, optionId]
        }
      }

      return {
        ...prev,
        [groupId]: newSelections
      }
    })
  }

  // Calculate total price including customizations
  const calculateTotalPrice = () => {
    let total = item.price

    // Add customization prices
    if (item.customization_groups) {
      item.customization_groups.forEach(({ customization_groups: group }) => {
        const selectedOptions = customizationSelections[group.id] || []
        selectedOptions.forEach(optionId => {
          const option = group.options.find(opt => opt.id === optionId)
          if (option) {
            total += option.price_adjustment
          }
        })
      })
    }

    return total
  }

  const handleAddToCart = () => {
    try {
      const itemWithExtras: MenuItemWithExtras = {
        ...item,
        extras: {
          size: isCoffee ? selectedSize : undefined,
          milk: isCoffee ? selectedMilk : undefined,
          side: isBurger ? selectedSide : undefined,
          extras: isBurger ? selectedExtras : undefined
        }
      }
      addItem(itemWithExtras)
      toast({
        title: 'Added to cart',
        description: `${item.name} has been added to your cart.`,
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      })
    }
  }

  // Calculate total price
  const totalPrice = item.price +
    // Burger extras
    (isBurger ? Object.entries(selectedExtras).reduce((sum, [extra, count]) => 
      sum + (BURGER_EXTRAS[extra as keyof typeof BURGER_EXTRAS] || 0) * count, 0) : 0) +
    // Burger sides
    (isBurger ? (BURGER_SIDES[selectedSide as keyof typeof BURGER_SIDES] || 0) : 0) +
    // Coffee size
    (isCoffee ? (COFFEE_SIZES[selectedSize as keyof typeof COFFEE_SIZES] || 0) : 0) +
    // Coffee milk
    (isCoffee ? (MILK_OPTIONS[selectedMilk as keyof typeof MILK_OPTIONS] || 0) : 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full p-0 bg-white dark:bg-zinc-900 flex flex-col">
        <DialogTitle className="sr-only">
          {item.name} Details
        </DialogTitle>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Image with Header Overlay */}
          <div className="relative">
            {/* Image */}
            <div className="relative aspect-[16/9] w-full">
              <img
                src={item.image_url || getRandomFallbackImage()}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const imgElement = e.target as HTMLImageElement;
                  if (!imgElement.src.includes('fallback')) {
                    imgElement.src = getRandomFallbackImage();
                  }
                }}
              />
            </div>

            {/* Header Overlay */}
            <div className="absolute top-0 left-0 right-0 px-2 py-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
              <button
                onClick={() => onOpenChange(false)}
                className="flex items-center text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="text-sm font-medium ml-1">Back</span>
              </button>
              <button
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Title and Description */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p className="text-xl font-semibold">${item.price.toFixed(2)}</p>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
            </div>

            {/* Dietary Flags */}
            {dietaryFlags && dietaryFlags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Dietary Information</h3>
                <div className="flex flex-wrap gap-2">
                  {dietaryFlags.map((flag) => (
                    <div
                      key={flag.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-full"
                    >
                      {flag.icon_url && (
                        <img
                          src={flag.icon_url}
                          alt={flag.name}
                          className="w-4 h-4"
                        />
                      )}
                      <span className="text-sm font-medium">{flag.name}</span>
                      {flag.description && (
                        <span className="sr-only">{flag.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customization Options */}
            {item.customization_groups && item.customization_groups.length > 0 && (
              <div className="space-y-6">
                {item.customization_groups.map(({ customization_groups: group }) => (
                  <div key={group.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{group.name}</h3>
                        {group.description && (
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        )}
                      </div>
                      {group.is_required && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          Required • Min: {group.min_selections}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {group.options.map((option) => {
                        const isSelected = (customizationSelections[group.id] || []).includes(option.id)
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleOptionToggle(group.id, option.id)}
                            className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-primary/10 border-primary/20'
                                : 'bg-secondary/10 hover:bg-secondary/20 border-transparent'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-primary' : 'border-muted-foreground'
                              }`}>
                                {isSelected && (
                                  <div className="w-3 h-3 rounded-full bg-primary" />
                                )}
                              </div>
                              <span className="font-medium">{option.name}</span>
                            </div>
                            {option.price_adjustment > 0 && (
                              <span className="text-sm text-muted-foreground">
                                +${option.price_adjustment.toFixed(2)}
                              </span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Burger Options */}
            {isBurger && (
              <>
                {/* Extras Section */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-medium">Add Extras</h3>
                  <div className="space-y-3">
                    {Object.entries(BURGER_EXTRAS).map(([extra, price]) => (
                      <div key={extra} className="flex items-center justify-between bg-secondary/10 p-3 rounded-lg">
                        <div>
                          <span className="font-medium">{extra}</span>
                          <span className="text-sm text-muted-foreground ml-2">+${price.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              setSelectedExtras(prev => ({
                                ...prev,
                                [extra]: Math.max(0, (prev[extra] || 0) - 1)
                              }))
                            }}
                            disabled={!selectedExtras[extra]}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-4 text-center font-medium">
                            {selectedExtras[extra] || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => {
                              setSelectedExtras(prev => ({
                                ...prev,
                                [extra]: (prev[extra] || 0) + 1
                              }))
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side Options */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-medium">Choose Side</h3>
                  <div className="space-y-3">
                    {Object.entries(BURGER_SIDES).map(([side, price]) => (
                      <div 
                        key={side}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedSide === side 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-secondary/10 hover:bg-secondary/20'
                        }`}
                        onClick={() => setSelectedSide(side)}
                      >
                        <div>
                          <span className="font-medium">{side}</span>
                          {price > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">+${price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedSide === side 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Coffee Options */}
            {isCoffee && (
              <>
                {/* Size Options */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-medium">Choose Size</h3>
                  <div className="space-y-3">
                    {Object.entries(COFFEE_SIZES).map(([size, price]) => (
                      <div 
                        key={size}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedSize === size 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-secondary/10 hover:bg-secondary/20'
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        <div>
                          <span className="font-medium">{size}</span>
                          {price !== 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              {price > 0 ? `+$${price.toFixed(2)}` : `-$${Math.abs(price).toFixed(2)}`}
                            </span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedSize === size 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Milk Options */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-medium">Choose Milk</h3>
                  <div className="space-y-3">
                    {Object.entries(MILK_OPTIONS).map(([milk, price]) => (
                      <div 
                        key={milk}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedMilk === milk 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-secondary/10 hover:bg-secondary/20'
                        }`}
                        onClick={() => setSelectedMilk(milk)}
                      >
                        <div>
                          <span className="font-medium">{milk}</span>
                          {price > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">+${price.toFixed(2)}</span>
                          )}
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedMilk === milk 
                            ? 'border-primary bg-primary' 
                            : 'border-muted-foreground'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-background border-t">
          <Button 
            className="w-full h-12 text-base font-medium"
            size="lg"
            onClick={handleAddToCart}
          >
            Add to Cart • ${calculateTotalPrice().toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 