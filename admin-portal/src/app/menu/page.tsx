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
import type { MenuItem } from '@/types/menu'
import { NewItemModal } from '@/components/menu/new-item-modal'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'

type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface CustomizationOption {
  name: string;
  price: number;
}

interface CustomizationOptions {
  type: 'burger' | 'coffee' | null;
  extras: Record<string, number>;
  sides: Record<string, number>;
  sizes: Record<string, number>;
  milk_options: Record<string, number>;
}

interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export default function MenuPage() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Session kontrolü için useEffect ekleyelim
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        console.error('Auth error:', error)
        toast({
          title: 'Error',
          description: 'Lütfen önce giriş yapın',
          variant: 'destructive',
        })
        router.push('/auth/login')
        return
      }

      setSession(session)
    }

    checkSession()
  }, [router])

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

      // Menü öğelerini yükle
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select(`
          *,
          category:menu_categories (
            name
          )
        `)

      if (itemsError) throw itemsError

      setCategories(categoriesData)
      setItems(itemsData)
    } catch (error: any) {
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
    if (!session) {
      toast({
        title: 'Error',
        description: 'Lütfen önce giriş yapın',
        variant: 'destructive',
      })
      return
    }

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

      // İlk satırı (başlıkları) atla ve her satırı işle
      const menuItems = rows.slice(1)
        .filter(row => row.trim())
        .map((row, index) => {
          try {
            const values = parseCSVLine(row)
            
            console.log(`Row ${index + 1} values:`, values) // Debug için

            if (values.length !== headers.length) {
              throw new Error(`Satır ${index + 2}'de sütun sayısı uyuşmuyor`)
            }

            return {
              id: values[headers.indexOf('id')],
              restaurant_id: values[headers.indexOf('restaurant_id')],
              category_id: values[headers.indexOf('category_id')],
              name: values[headers.indexOf('name')],
              description: values[headers.indexOf('description')],
              price: parseFloat(values[headers.indexOf('price')]),
              image_url: values[headers.indexOf('image_url')],
              is_available: values[headers.indexOf('is_available')].toLowerCase() === 'true',
              created_at: values[headers.indexOf('created_at')],
              customization_options: values[headers.indexOf('customization_options')] === '{}' ? {} : 
                JSON.parse(values[headers.indexOf('customization_options')])
            }
          } catch (err: any) {
            console.error(`Error parsing row ${index + 2}:`, err)
            throw new Error(`Satır ${index + 2}'de hata: ${err.message}`)
          }
        })

      console.log('Parsed items:', menuItems) // Debug için

      // Supabase'e eklerken session kontrolü yap
      const { error } = await supabase
        .from('menu_items')
        .insert(menuItems)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      toast({
        title: 'Success',
        description: `${menuItems.length} ürün başarıyla import edildi.`,
      })

      // Listeyi güncelle
      loadData()
    } catch (error: any) {
      console.error('CSV import error:', error)
      toast({
        title: 'Error',
        description: error.message || 'CSV dosyası import edilirken bir hata oluştu.',
        variant: 'destructive',
      })
    }

    // Input'u temizle
    event.target.value = ''
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

  // Filtrelenmiş menü öğeleri
  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ? true : (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    )
    return matchesCategory && matchesSearch
  })

  // Loading state'ini güncelleyelim
  if (!session || isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">
            {!session ? 'Checking authentication...' : 'Loading menu...'}
          </p>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            categories={categories}
            onEdit={(updates) => handleUpdateItem(item.id, updates)}
            onDelete={() => handleDeleteItem(item.id)}
          />
        ))}
      </div>
    </div>
  )
} 