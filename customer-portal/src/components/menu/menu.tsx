'use client'

import { useState } from 'react'
import { Database } from '@/types/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useCartStore } from '@/store/cart-store'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { 
  ChevronLeft,
  Coffee,
  GlassWater,
  Sandwich,
  Soup,
  Pizza,
  Beef,
  Cookie,
  Wine,
  Salad,
  IceCream,
  type LucideIcon,
  Plus,
  ShoppingCart
} from 'lucide-react'
import { MenuItemDialog } from './menu-item-dialog'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategoryType = Database['public']['Tables']['menu_categories']['Row']

interface MenuProps {
  restaurantName: string
  tableNumber: string
  categories: MenuCategoryType[]
  items: MenuItem[]
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Hot Beverages': Coffee,
  'Cold Beverages': GlassWater,
  'Desserts': IceCream,
  'Sandwiches': Sandwich,
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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
}

export function Menu({ restaurantName, tableNumber, categories, items }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState<Record<string, boolean>>({})
  const addItem = useCartStore((state) => state.addItem)
  const cartItems = useCartStore((state) => state.items)
  const { toast } = useToast()
  
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
      <div className="sticky top-0 bg-background pt-1 pb-2 z-10">
        {selectedCategory && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="-ml-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        )}
      </div>

      {!selectedCategory ? (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {sortedCategories.map((category) => {
              const itemCount = items.filter(
                item => item.category_id === category.id && item.is_available
              ).length

              if (itemCount === 0) return null

              const Icon = category.icon

              return (
                <motion.div
                  key={category.id}
                  variants={item}
                  className="relative p-6 border rounded-xl hover:bg-accent/50 cursor-pointer text-center transition-all duration-200 group"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <Icon className="h-8 w-8 mx-auto mb-3 text-primary group-hover:scale-110 transition-transform duration-200" />
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {itemCount} {itemCount === 1 ? 'product' : 'products'}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>
        </ScrollArea>
      ) : (
        <ScrollArea className="h-[calc(100vh-220px)]">
          <motion.div 
            className="grid grid-cols-2 sm:grid-cols-3 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {filteredItems.map((menuItem) => (
              <motion.div
                key={menuItem.id}
                layoutId={menuItem.id}
                className="group relative overflow-hidden aspect-[4/3] border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => setSelectedItem(menuItem)}
              >
                <div className="relative w-full h-full">
                  {menuItem.image_url ? (
                    <img
                      src={menuItem.image_url}
                      alt={menuItem.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        const imgElement = e.target as HTMLImageElement;
                        imgElement.src = getRandomFallbackImage();
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-secondary/10 flex flex-col items-center justify-center">
                      <div className="text-4xl text-muted-foreground mb-2">🍽️</div>
                      <span className="text-sm text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-sm font-medium text-white line-clamp-2">{menuItem.name}</h3>
                      <p className="text-sm font-medium text-white/90">${menuItem.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </ScrollArea>
      )}

      {selectedItem && (
        <MenuItemDialog
          item={selectedItem}
          open={!!selectedItem}
          onOpenChange={(open) => !open && setSelectedItem(null)}
        />
      )}
    </div>
  )
} 