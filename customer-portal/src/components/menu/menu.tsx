'use client'

import { useState } from 'react'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ui/use-toast'
import { 
  ChevronLeft,
  Coffee,
  Soup,
  Pizza,
  Beef,
  Cookie,
  Wine,
  Salad,
  IceCream,
  type LucideIcon,
  Plus
} from 'lucide-react'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategoryType = Database['public']['Tables']['menu_categories']['Row']

interface MenuProps {
  categories: MenuCategoryType[]
  items: MenuItem[]
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Starters': Soup,
  'Main Course': Beef,
  'Main Courses': Beef,
  'Desserts': IceCream,
  'Drinks': Coffee,
  'Wines': Wine,
  'Salads': Salad,
  'Pizza': Pizza,
  'Snacks': Cookie,
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

export function Menu({ categories, items }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const addItem = useCartStore((state) => state.addItem)
  const { toast } = useToast()
  
  // Sort categories by sort_order
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    .filter(category => category.active)
    .map(category => ({
      ...category,
      icon: CATEGORY_ICONS[category.name] || Coffee
    }))

  const filteredItems = selectedCategory
    ? items.filter(item => 
        item.category_id === selectedCategory && 
        item.is_available &&
        (searchQuery 
          ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
          : true)
      )
    : []

  const handleAddToCart = async (item: MenuItem) => {
    setLoading((prev) => ({ ...prev, [item.id]: true }))

    try {
      addItem(item)
      toast({
        title: 'Added to cart',
        description: `${item.name} has been added to your cart.`,
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search menu items..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />
      
      <ScrollArea className="h-[calc(100vh-220px)]">
        {!selectedCategory ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {sortedCategories.map((category) => {
              const itemCount = items.filter(
                item => item.category_id === category.id && item.is_available
              ).length

              if (itemCount === 0) return null

              const Icon = category.icon

              return (
                <div
                  key={category.id}
                  className="p-6 border rounded-lg hover:bg-accent cursor-pointer text-center"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <Icon className="h-8 w-8 mx-auto mb-3" />
                  <h3 className="font-medium">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </p>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="self-start -ml-2 mb-6"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Categories
              </Button>
              {(() => {
                const category = sortedCategories.find(c => c.id === selectedCategory);
                const Icon = category?.icon || Coffee;
                return (
                  <>
                    <Icon className="h-12 w-12 mb-2" />
                    <h2 className="text-2xl font-semibold">{category?.name}</h2>
                  </>
                );
              })()}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden aspect-[4/3] border rounded-lg hover:bg-accent cursor-pointer"
                  onClick={() => handleAddToCart(item)}
                >
                  <div className="relative w-full h-full">
                    <img
                      src={item.image_url || getRandomFallbackImage()}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        if (!imgElement.src.includes('fallback')) {
                          imgElement.src = getRandomFallbackImage();
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/50 group-hover:to-black/30 transition-colors" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-white/80 line-clamp-2">{item.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-medium text-white">${item.price.toFixed(2)}</p>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={loading[item.id] || !item.is_available}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          {loading[item.id] ? 'Adding...' : item.is_available ? 'Add to Cart' : 'Sold Out'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 