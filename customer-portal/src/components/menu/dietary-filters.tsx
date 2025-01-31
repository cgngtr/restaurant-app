'use client'

import { Badge } from '@/components/ui/badge'

interface DietaryFiltersProps {
  selectedFilters: string[]
  onToggleFilter: (filter: string) => void
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: '🥬 Vegetarian' },
  { id: 'vegan', label: '🌱 Vegan' },
  { id: 'gluten-free', label: '🌾 Gluten Free' },
  { id: 'halal', label: '🥩 Halal' },
  { id: 'spicy', label: '🌶️ Spicy' },
]

export function DietaryFilters({
  selectedFilters,
  onToggleFilter,
}: DietaryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DIETARY_OPTIONS.map((option) => (
        <Badge
          key={option.id}
          variant={selectedFilters.includes(option.id) ? 'default' : 'outline'}
          className="cursor-pointer"
          onClick={() => onToggleFilter(option.id)}
        >
          {option.label}
        </Badge>
      ))}
    </div>
  )
} 