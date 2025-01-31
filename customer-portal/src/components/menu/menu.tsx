'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface MenuProps {
  restaurantId: string
  categories: MenuCategory[]
  items: MenuItem[]
  onAddToCart: (item: MenuItem) => void
}

export function Menu({ restaurantId, categories, items, onAddToCart }: MenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    categories[0]?.id || null
  )
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const toggleFilter = (filter: string) => {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((f) => f !== filter)
        : [...current, filter]
    )
  }

  const filteredItems = selectedCategory
    ? items.filter((item) => item.category_id === selectedCategory)
    : items

  const filteredByDiet = selectedFilters.length > 0
    ? filteredItems.filter((item) => 
        selectedFilters.every(filter => item.dietary_flags.includes(filter))
      )
    : filteredItems

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.filter(c => c.active).map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {DIETARY_OPTIONS.map((option) => (
          <Badge
            key={option.id}
            variant={selectedFilters.includes(option.id) ? 'default' : 'outline'}
            className="cursor-pointer"
            onClick={() => toggleFilter(option.id)}
          >
            {option.label}
          </Badge>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredByDiet.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            {item.image_url && (
              <div className="relative h-48 w-full">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
                <span className="font-medium">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {item.dietary_flags?.map((flag) => (
                  <Badge key={flag} variant="secondary">
                    {flag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={() => onAddToCart(item)}
                className="mt-4 w-full"
                disabled={!item.is_available}
              >
                {item.is_available ? 'Add to Order' : 'Out of Stock'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🥬 Vegetarian' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'gluten-free', label: '🌾 Gluten Free' },
  { id: 'halal', label: '🥩 Halal' },
  { id: 'spicy', label: '🌶️ Spicy' },
] 