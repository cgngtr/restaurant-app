import { useState } from 'react'
import { Database } from '@/types/supabase'
import { formatCurrency } from '@/lib/utils'
import { MenuItemDialog } from './menu-item-dialog'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuItemCardProps {
  item: MenuItem
}

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <div 
        className="group relative overflow-hidden aspect-[4/3] border rounded-lg hover:bg-accent cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <div className="relative w-full h-full">
          <img
            src={item.image_url || '/placeholder-food.jpg'}
            alt={item.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <h3 className="text-sm font-medium text-white line-clamp-2">{item.name}</h3>
              <p className="text-sm font-medium text-white/90">{formatCurrency(item.price)}</p>
            </div>
          </div>
        </div>
      </div>

      <MenuItemDialog
        item={item}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  )
} 