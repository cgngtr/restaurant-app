'use client'

import { useState } from 'react'
import { Database } from '@/types/supabase'
import { MenuCategory } from './menu-category'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
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
  type LucideIcon
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

export function Menu({ categories, items }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  
  // Sort categories by sort_order
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    .filter(category => category.active)
    .map(category => ({
      ...category,
      icon: CATEGORY_ICONS[category.name] || Coffee
    }))

  const selectedItems = selectedCategory
    ? items.filter(item => item.category_id === selectedCategory && item.is_available)
    : []

  const selectedCategoryData = selectedCategory
    ? sortedCategories.find(cat => cat.id === selectedCategory)
    : null

  return (
    <div className="space-y-8">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-2 gap-4"
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-[120px] flex flex-col items-center justify-center gap-1 p-4 hover:bg-accent"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">{category.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </span>
                  </Button>
                </motion.div>
              )
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2 mb-6 hover:bg-transparent hover:text-primary -ml-2"
                onClick={() => setSelectedCategory(null)}
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Categories
              </Button>
              <div className="flex flex-col items-center">
                {selectedCategoryData?.icon && (
                  <selectedCategoryData.icon className="h-8 w-8 mb-2" />
                )}
                <h2 className="text-2xl font-semibold">{selectedCategoryData?.name}</h2>
              </div>
            </div>
            <MenuCategory
              category={selectedCategoryData!}
              items={selectedItems}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 