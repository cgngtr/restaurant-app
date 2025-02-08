'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { FileSpreadsheet, Plus, Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MenuItemCard } from '@/components/menu/MenuItemCard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MenuItemCard as NewMenuItemCard } from '@/components/menu/MenuItemCard'
import { useToast } from '@/components/ui/use-toast'
import type { Database } from '@/types/supabase'
import type { MenuItem, DietaryFlag } from '@/types/menu'
import { NewItemModal } from '@/components/menu/new-item-modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface CustomizationOption {
  name: string;
  price_adjustment: number;
  is_default: boolean;
}

interface CustomizationOptions {
  type: 'burger' | 'coffee' | null;
  [key: string]: any;
  extras: Record<string, number>;
  sides: Record<string, number>;
  sizes: Record<string, number>;
  milk_options: Record<string, number>;
}

interface CustomizationGroup {
  id: string;
  name: string;
  customization_options: CustomizationOption[];
}

interface MenuItemCustomization {
  id: string;
  group_id: string;
  sort_order: number;
  customization_groups: CustomizationGroup;
}

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

interface MenuItemDietaryFlag {
  dietary_flag: DietaryFlag;
}

export default function MenuPage() {
  const router = useRouter()
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // loadData fonksiyonunu güncelleyelim
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Kategorileri yükle
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categories')
        .select('*')
        .order('sort_order')

      if (categoriesError) throw categoriesError

      // Menü öğelerini, dietary flags ve customization bilgilerini yükle
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories (
            name
          ),
          menu_item_customizations (
            id,
            group_id,
            sort_order,
            customization_groups (
              id,
              name,
              customization_options (
                id,
                name,
                price_adjustment,
                is_default
              )
            )
          ),
          menu_item_dietary_flags (
            dietary_flag: dietary_flags (
              id,
              name,
              description,
              icon_url
            )
          )
        `)
        .order('name')

      if (itemsError) throw itemsError

      // Customization ve dietary flags bilgilerini düzenle
      const itemsWithCustomizations = itemsData?.map(item => {
        const customOptions: CustomizationOptions = {
          type: null,
          extras: {},
          sides: {},
          sizes: {},
          milk_options: {}
        }

        // Customization options
        item.menu_item_customizations?.forEach((curr: MenuItemCustomization) => {
          const group = curr.customization_groups
          if (group) {
            // Grup tipini isimden çıkaralım
            const groupName = group.name.toLowerCase()
            let type: 'burger' | 'coffee' | null = null

            if (groupName.includes('burger')) {
              type = 'burger'
            } else if (groupName.includes('coffee')) {
              type = 'coffee'
            }

            customOptions.type = type

            if (type) {
              const options = group.customization_options?.reduce((acc, opt) => {
                acc[opt.name] = opt.price_adjustment
                return acc
              }, {} as Record<string, number>) || {}

              if (groupName.includes('extra')) {
                customOptions.extras = { ...customOptions.extras, ...options }
              } else if (groupName.includes('side')) {
                customOptions.sides = { ...customOptions.sides, ...options }
              } else if (groupName.includes('size')) {
                customOptions.sizes = { ...customOptions.sizes, ...options }
              } else if (groupName.includes('milk')) {
                customOptions.milk_options = { ...customOptions.milk_options, ...options }
              }
            }
          }
        })

        // Dietary flags
        const dietary_flags = item.menu_item_dietary_flags?.map((flag: MenuItemDietaryFlag) => flag.dietary_flag) || []

        return {
          ...item,
          customization_options: customOptions,
          dietary_flags
        }
      })

      console.log('Loaded items:', itemsWithCustomizations) // Debug için

      setCategories(categoriesData)
      setItems(itemsWithCustomizations || [])
    } catch (error: any) {
      console.error('Error loading menu data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load menu data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    loadData()
  }, [loadData])

  // CSV Import fonksiyonunu güncelleyelim
  const handleCsvImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      
      // CSV ayrıştırma fonksiyonu
      const parseCSVLine = (line: string) => {
        const result = []
        let startValueIndex = 0
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
          if (line[i] === '"') {
            inQuotes = !inQuotes
          } else if (line[i] === ',' && !inQuotes) {
            result.push(line.slice(startValueIndex, i).trim().replace(/^"|"$/g, ''))
            startValueIndex = i + 1
          }
        }
        
        // Son değeri ekle
        result.push(line.slice(startValueIndex).trim().replace(/^"|"$/g, ''))
        return result
      }

      // Satırları ayır ve boş satırları filtrele
      const rows = text.split(/\r?\n/).filter(row => row.trim())
      
      // Başlıkları ayrıştır
      const headers = parseCSVLine(rows[0])
      
      // CSV başlıklarını kontrol et
      const requiredHeaders = ['id', 'restaurant_id', 'category_id', 'name', 'description', 'price', 'image_url', 'is_available', 'created_at', 'customization_options']
      const hasAllHeaders = requiredHeaders.every(header => headers.includes(header))
      
      if (!hasAllHeaders) {
        throw new Error('CSV dosyası gerekli tüm sütunları içermiyor')
      }

      console.log('Headers:', headers) // Debug için
    } catch (error) {
      console.error('Error importing CSV:', error)
      toast({
        title: 'Error',
        description: 'Failed to import CSV file',
        variant: 'destructive',
      })
    }
  }

  // Menü öğesini sil
  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setItems((prev) => prev.filter((item) => item.id !== itemId))
      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting menu item:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete menu item',
        variant: 'destructive',
      })
    }
  }

  // Yeni menü öğesi oluştur
  const handleCreateItem = async (newItem: Partial<MenuItem>) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([newItem])
        .select()
        .single()

      if (error) throw error

      setItems((prev) => [...prev, data])
      setIsModalOpen(false)
      toast({
        title: 'Success',
        description: 'Menu item created successfully',
      })
    } catch (error) {
      console.error('Error creating menu item:', error)
      toast({
        title: 'Error',
        description: 'Failed to create menu item',
        variant: 'destructive',
      })
    }
  }

  // Menü öğesini güncelle
  const handleUpdateItem = async (itemId: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update(updates)
        .eq('id', itemId)

      if (error) throw error

      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updates } : item
        )
      )

      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      })
    } catch (error) {
      console.error('Error updating menu item:', error)
      toast({
        title: 'Error',
        description: 'Failed to update menu item',
        variant: 'destructive',
      })
    }
  }

  // Filtrelenmiş menü öğeleri
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ? true : (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    return matchesCategory && matchesSearch
  })

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <Select
            value={selectedCategory || 'all'}
            onValueChange={(value) => setSelectedCategory(value === 'all' ? null : value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="file"
              accept=".csv"
              onChange={handleCsvImport}
              className="hidden"
              id="csv-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById('csv-upload')?.click()}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          </div>

          <NewItemModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateItem}
            categories={categories}
          />
          
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="aspect-square">
            <MenuItemCard
              item={item}
              categories={categories}
              onEdit={(updates) => handleUpdateItem(item.id, updates)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          </div>
        ))}
      </div>
    </div>
  )
} 