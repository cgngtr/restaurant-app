'use client'

import { Database } from '@/types/supabase'
import { MenuCategory } from './menu-category'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategoryType = Database['public']['Tables']['menu_categories']['Row']

interface MenuProps {
  categories: MenuCategoryType[]
  items: MenuItem[]
  restaurantId: string
  tableNumber: string
}

export function Menu({ categories, items, restaurantId, tableNumber }: MenuProps) {
  // Sort categories by sort_order
  const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="space-y-8">
      {sortedCategories.map((category) => {
        const categoryItems = items.filter(
          (item) => item.category_id === category.id && item.is_available
        )

        if (!category.active || categoryItems.length === 0) {
          return null
        }

        return (
          <MenuCategory
            key={category.id}
            category={category}
            items={categoryItems}
            restaurantId={restaurantId}
            tableNumber={tableNumber}
          />
        )
      })}
    </div>
  )
} 