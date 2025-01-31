'use client'

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface MenuCategoriesProps {
  categories: {
    id: string
    name: string
    active: boolean
  }[]
  selectedCategory: string | null
  onSelectCategory: (categoryId: string) => void
}

export function MenuCategories({
  categories,
  selectedCategory,
  onSelectCategory,
}: MenuCategoriesProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-md border">
      <div className="flex w-max space-x-4 p-4">
        {categories.map((category) => {
          if (!category.active) return null
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                'inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              )}
            >
              {category.name}
            </button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
} 