import * as React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import { 
  Loader2, 
  Plus, 
  Minus, 
  Trash2, 
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
import { TableDetails } from '@/types/tables'
import { ChangeEvent } from 'react'
import { cn } from '@/lib/utils'

interface MenuCategory {
  id: string
  name: string
  icon?: LucideIcon
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category_name: string
  category_id: string
  is_available: boolean
  menu_categories: MenuCategory | null
  image_url?: string
}

type SupabaseResponse = {
  id: string
  name: string
  description: string
  price: number
  is_available: boolean
  category_id: string
  image_url?: string
  menu_categories: {
    id: string
    name: string
  } | null
}

interface NewOrderModalProps {
  table: TableDetails
  onClose: () => void
  onSubmit: (items: Array<{ menuItemId: string; quantity: number; notes?: string }>) => Promise<void>
  isLoading: boolean
}

interface OrderItem {
  menuItemId: string
  quantity: number
  notes?: string
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Starters': Soup,
  'Main Course': Beef,
  'Desserts': IceCream,
  'Drinks': Coffee,
  'Wines': Wine,
  'Salads': Salad,
  'Pizza': Pizza,
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

export default function NewOrderModal({ table, onClose, onSubmit, isLoading }: NewOrderModalProps) {
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([])
  const [selectedItems, setSelectedItems] = React.useState<OrderItem[]>([])
  const [isLoadingMenu, setIsLoadingMenu] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          id,
          name,
          description,
          price,
          is_available,
          category_id,
          image_url,
          menu_categories (
            id,
            name
          )
        `)
        .eq('restaurant_id', table.restaurant_id)
        .eq('is_available', true)

      if (!error && data) {
        const formattedData = (data as unknown as SupabaseResponse[]).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          is_available: item.is_available,
          category_id: item.category_id,
          category_name: item.menu_categories?.name || 'Uncategorized',
          menu_categories: item.menu_categories,
          image_url: item.image_url
        }))
        setMenuItems(formattedData)
      }
      setIsLoadingMenu(false)
    }

    fetchMenuItems()
  }, [table.restaurant_id])

  const categories = React.useMemo(() => {
    const uniqueCategories = new Map<string, MenuCategory>()
    menuItems.forEach(item => {
      if (item.menu_categories) {
        uniqueCategories.set(item.menu_categories.id, {
          id: item.menu_categories.id,
          name: item.menu_categories.name,
          icon: CATEGORY_ICONS[item.menu_categories.name] || Coffee
        })
      }
    })
    return Array.from(uniqueCategories.values())
  }, [menuItems])

  const filteredItems = React.useMemo(() => {
    let items = selectedCategory
      ? menuItems.filter(item => item.category_id === selectedCategory)
      : menuItems

    if (searchQuery) {
      items = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return items
  }, [menuItems, selectedCategory, searchQuery])

  const handleAddItem = (menuItem: MenuItem) => {
    setSelectedItems(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem.id)
      if (existing) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { menuItemId: menuItem.id, quantity: 1 }]
    })
  }

  const handleUpdateQuantity = (menuItemId: string, change: number) => {
    setSelectedItems(prev => {
      return prev.map(item => {
        if (item.menuItemId === menuItemId) {
          const newQuantity = Math.max(0, item.quantity + change)
          return newQuantity === 0 ? null : { ...item, quantity: newQuantity }
        }
        return item
      }).filter(Boolean) as OrderItem[]
    })
  }

  const handleUpdateNotes = (menuItemId: string, notes: string) => {
    setSelectedItems(prev =>
      prev.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, notes: notes || undefined }
          : item
      )
    )
  }

  const handleRemoveItem = (menuItemId: string) => {
    setSelectedItems(prev => prev.filter(item => item.menuItemId !== menuItemId))
  }

  const handleSubmit = async () => {
    if (selectedItems.length === 0) return
    await onSubmit(selectedItems)
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleNotesChange = (menuItemId: string, e: ChangeEvent<HTMLTextAreaElement>) => {
    handleUpdateNotes(menuItemId, e.target.value)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>New Order for Table {table.table_number}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 h-full">
          {/* Menu Items */}
          <div className="space-y-4">
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <ScrollArea className="h-[calc(90vh-200px)]">
              {isLoadingMenu ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : selectedCategory ? (
                <div className="space-y-4 pr-4">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCategory(null)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Back to Categories
                    </Button>
                    <h3 className="font-medium">
                      {categories.find(c => c.id === selectedCategory)?.name}
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden aspect-[4/3] border rounded-lg hover:bg-accent cursor-pointer"
                        onClick={() => handleAddItem(item)}
                      >
                        <div className="relative w-full h-full">
                          <Image
                            src={item.image_url || getRandomFallbackImage()}
                            alt={item.name}
                            fill
                            className="object-cover transition-transform group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={(e) => {
                              const imgElement = e.target as HTMLImageElement;
                              if (!imgElement.src.includes('fallback')) {
                                imgElement.src = getRandomFallbackImage();
                              }
                            }}
                            priority={false}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/40 to-black/20 group-hover:from-black/70 group-hover:via-black/50 group-hover:to-black/30 transition-colors" />
                          <div className="absolute inset-0 p-4 flex flex-col justify-end">
                            <h3 className="font-medium text-white">{item.name}</h3>
                            <p className="text-sm text-white/80 line-clamp-2">{item.description}</p>
                            <p className="font-medium text-white mt-2">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4 pr-4">
                  {categories.map((category) => {
                    const Icon = category.icon || Coffee
                    return (
                      <div
                        key={category.id}
                        className="p-6 border rounded-lg hover:bg-accent cursor-pointer text-center"
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <Icon className="h-8 w-8 mx-auto mb-3" />
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {menuItems.filter(item => item.category_id === category.id).length} items
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Selected Items */}
          <div className="border-l pl-6">
            <h3 className="font-medium mb-4">Selected Items</h3>
            <ScrollArea className="h-[calc(90vh-280px)]">
              <div className="space-y-4 pr-4">
                {selectedItems.map((item) => {
                  const menuItem = menuItems.find(m => m.id === item.menuItemId)
                  if (!menuItem) return null

                  return (
                    <div key={item.menuItemId} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{menuItem.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.menuItemId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.menuItemId, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateQuantity(item.menuItemId, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <span className="ml-2 text-muted-foreground">
                          ${(menuItem.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`notes-${item.menuItemId}`}>Special Instructions</Label>
                        <Textarea
                          id={`notes-${item.menuItemId}`}
                          placeholder="Any special instructions?"
                          value={item.notes || ''}
                          onChange={(e) => handleNotesChange(item.menuItemId, e)}
                          className="h-20"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            <div className="mt-4 space-x-2 flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedItems.length === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  'Create Order'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 