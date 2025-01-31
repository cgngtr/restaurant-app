import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (item: MenuItem) => void
}

export function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const dietaryFlags = item.dietary_flags as string[]

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex gap-4">
        {item.image_url ? (
          <div className="relative h-24 w-24 flex-shrink-0">
            <Image
              src={item.image_url}
              alt={item.name}
              fill
              className="object-cover rounded-md"
            />
          </div>
        ) : (
          <div className="h-24 w-24 bg-muted rounded-md flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium leading-none mb-1 truncate">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {item.description}
                </p>
              )}
            </div>
            <div className="flex-shrink-0 font-medium">
              {formatCurrency(item.price)}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex flex-wrap gap-1">
              {dietaryFlags?.map((flag) => (
                <Badge key={flag} variant="secondary" className="text-xs">
                  {flag}
                </Badge>
              ))}
            </div>
            <Button
              onClick={() => onAddToCart(item)}
              disabled={!item.is_available}
              size="sm"
            >
              {item.is_available ? 'Add to Cart' : 'Sold Out'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 