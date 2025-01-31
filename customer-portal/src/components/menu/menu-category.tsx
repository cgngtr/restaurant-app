import Image from 'next/image'
import { Database } from '@/types/supabase'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface MenuCategoryProps {
  category: MenuCategory
  items: MenuItem[]
  restaurantId: string
  tableNumber: string
}

export function MenuCategory({ category, items, restaurantId, tableNumber }: MenuCategoryProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const addToOrder = async (item: MenuItem) => {
    setLoading((prev) => ({ ...prev, [item.id]: true }))

    try {
      const { error } = await supabase.from('order_items').insert({
        restaurant_id: restaurantId,
        table_number: tableNumber,
        menu_item_id: item.id,
        quantity: 1,
        status: 'pending',
        special_instructions: '',
      })

      if (error) throw error

      toast({
        title: 'Added to order',
        description: `${item.name} has been added to your order.`,
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to add item to order. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading((prev) => ({ ...prev, [item.id]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{category.name}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
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
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="font-medium">
                  ${item.price.toFixed(2)}
                </span>
              </div>

              {item.dietary_flags && item.dietary_flags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {item.dietary_flags.map((flag) => (
                    <Badge key={flag} variant="secondary">
                      {flag}
                    </Badge>
                  ))}
                </div>
              )}

              <Button
                onClick={() => addToOrder(item)}
                className="mt-4 w-full"
                disabled={!item.is_available || loading[item.id]}
              >
                {loading[item.id]
                  ? 'Adding...'
                  : item.is_available
                  ? 'Add to Order'
                  : 'Out of Stock'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 