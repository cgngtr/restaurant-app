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
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    const loadData = async () => {
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
    }

    loadData()
  }, [toast])

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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select 
          value={selectedCategory || undefined} 
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Categories" />
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

      <NewItemModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateItem}
        categories={categories}
      />
    </div>
  )
} 