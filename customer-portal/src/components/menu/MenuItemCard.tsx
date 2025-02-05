import { useState } from 'react'
import { Database } from '@/types/supabase'
import { formatCurrency } from '@/lib/utils'
import { MenuItemDialog } from './menu-item-dialog'
import Image from 'next/image'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuItemCardProps {
  item: MenuItem
}

const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRUVFRUUiLz48cGF0aCBkPSJNODAgOTBINzBWMTEwSDgwVjkwWiIgZmlsbD0iIzY2NiIvPjxwYXRoIGQ9Ik0xMzAgOTBIMTIwVjExMEgxMzBWOTBaIiBmaWxsPSIjNjY2Ii8+PHBhdGggZD0iTTEwMCAxMzBDMTEzLjgwNyAxMzAgMTI1IDExOC44MDcgMTI1IDEwNUMxMjUgOTEuMTkzIDExMy44MDcgODAgMTAwIDgwQzg2LjE5MyA4MCA3NSA5MS4xOTMgNzUgMTA1Qzc1IDExOC44MDcgODYuMTkzIDEzMCAxMDAgMTMwWiIgZmlsbD0iIzY2NiIvPjwvc3ZnPg=='

export function MenuItemCard({ item }: MenuItemCardProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <div 
        className="group relative overflow-hidden aspect-[4/3] border rounded-lg hover:bg-accent cursor-pointer"
        onClick={() => setShowDialog(true)}
      >
        <div className="relative w-full h-full">
          <Image
            src={item.image_url || DEFAULT_PLACEHOLDER_IMAGE}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_PLACEHOLDER_IMAGE;
            }}
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