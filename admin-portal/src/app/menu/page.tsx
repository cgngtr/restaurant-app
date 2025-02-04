'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { FileSpreadsheet, Plus, Search, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import MenuItemCard from '@/components/menu/MenuItemCard'
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

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  restaurant_id: string
  image_url: string | null
  is_available: boolean
  customization_options: {
    type: 'burger' | 'coffee' | null
    extras: Record<string, number>
    sides: Record<string, number>
    sizes: Record<string, number>
    milk_options: Record<string, number>
  }
}

interface Category {
  id: string
  name: string
  sort_order: number
  restaurant_id: string
}

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

export default function MenuPage() {
  const [isUploading, setIsUploading] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: true,
    customization_options: {
      type: null,
      extras: {},
      sides: {},
      sizes: {},
      milk_options: {}
    }
  })
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>({
    type: null,
    extras: {},
    sides: {},
    sizes: {},
    milk_options: {}
  })

  useEffect(() => {
    fetchCategories()
    fetchMenuItems()
  }, [])

  const getRestaurantId = async () => {
    // Try both possible slugs
    const { data: restaurant, error } = await supabase
      .from('restaurants')
      .select('id')
      .or('slug.eq.demo-restaurant,slug.eq.rest_demo1')
      .single()

    if (error || !restaurant) {
      console.error('Error getting restaurant:', error)
      toast({
        title: 'Error',
        description: 'Restaurant not found',
        variant: 'destructive'
      })
      return null
    }

    return restaurant.id
  }

  const fetchCategories = async () => {
    try {
      const restaurantId = await getRestaurantId()
      if (!restaurantId) return

      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Error fetching categories:', error)
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        })
        return
      }

      console.log('Fetched categories:', data)
      setCategories(data)
    } catch (error: any) {
      console.error('Error in fetchCategories:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const createCategories = async () => {
    try {
      const restaurantId = await getRestaurantId()
      if (!restaurantId) return null

      const categoriesToCreate = [
        { id: crypto.randomUUID(), name: 'Appetizers', sort_order: 1, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Main Courses', sort_order: 2, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Burgers & Sandwiches', sort_order: 3, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Pasta & Risotto', sort_order: 4, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Salads', sort_order: 5, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Desserts', sort_order: 6, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Beverages', sort_order: 7, restaurant_id: restaurantId },
        { id: crypto.randomUUID(), name: 'Side Dishes', sort_order: 8, restaurant_id: restaurantId }
      ]

      console.log('Creating categories for restaurant:', restaurantId)
      const { data, error } = await supabase
        .from('menu_categories')
        .insert(categoriesToCreate)
        .select()

      if (error) {
        console.error('Error creating categories:', error)
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive'
        })
        return null
      }

      console.log('Categories created:', data)
      setCategories(data)
      return data
    } catch (error: any) {
      console.error('Error in createCategories:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
      return null
    }
  }

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // First, ensure we have categories
      if (categories.length === 0) {
        console.log('No categories found, creating default categories...')
        const newCategories = await createCategories()
        if (!newCategories) {
          toast({
            title: 'Error',
            description: 'Failed to create categories',
            variant: 'destructive'
          })
          return
        }
      }

      const text = await file.text()
      // Split by newline and filter out empty lines
      const rows = text.split('\n').filter(row => row.trim().length > 0)
      const headers = rows[0].split(',').map(header => header.trim())
      
      const requiredHeaders = ['name', 'description', 'price', 'category']
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
      
      if (missingHeaders.length > 0) {
        toast({
          title: 'Invalid CSV Format',
          description: `Missing required columns: ${missingHeaders.join(', ')}`,
          variant: 'destructive'
        })
        return
      }

      const restaurantId = await getRestaurantId()
      if (!restaurantId) return

      console.log('Processing CSV rows...')
      // Process items and map categories to category_ids
      const items = rows.slice(1).map((row, index) => {
        const values = row.split(',').map(value => value.trim())
        
        // Skip empty rows
        if (values.every(v => !v)) {
          return null
        }

        const item: any = {
          id: crypto.randomUUID(),
          restaurant_id: restaurantId,
        }
        
        headers.forEach((header, colIndex) => {
          if (header === 'category') {
            const categoryName = values[colIndex]
            if (!categoryName) {
              throw new Error(`Empty category name at row ${index + 2}`)
            }
            const category = categories.find(c => c.name === categoryName)
            if (!category) {
              throw new Error(`Category "${categoryName}" not found for item at row ${index + 2}`)
            }
            item.category_id = category.id
          } else if (header === 'price') {
            const price = parseFloat(values[colIndex])
            if (isNaN(price)) {
              throw new Error(`Invalid price format at row ${index + 2}`)
            }
            item[header] = price
          } else if (header !== 'is_available') {
            item[header] = values[colIndex]
          }
        })

        // Validate required fields
        if (!item.name || !item.description || !item.price || !item.category_id) {
          throw new Error(`Missing required fields for item at row ${index + 2}`)
        }

        return item
      }).filter(item => item !== null) // Remove null items (empty rows)

      if (items.length === 0) {
        toast({
          title: 'Error',
          description: 'No valid menu items found in CSV',
          variant: 'destructive'
        })
        return
      }

      console.log(`Uploading ${items.length} items to Supabase...`)
      // Upload to Supabase
      const { data, error } = await supabase
        .from('menu_items')
        .insert(items)
        .select()

      if (error) throw error

      toast({
        title: 'Success',
        description: `${items.length} menu items imported successfully`,
      })

      fetchMenuItems()
    } catch (error: any) {
      console.error('Error in handleCSVUpload:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const fetchMenuItems = async () => {
    const { data, error } = await supabase
      .from('menu_items')
      .select(`
        *,
        category:menu_categories(name)
      `)
      .order('name', { ascending: true })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
      return
    }

    setMenuItems(data)
  }

  const handleAddItem = async () => {
    try {
      // Get restaurant ID
      const { data: restaurant } = await supabase
        .from('restaurants')
        .select('id')
        .single()

      if (!restaurant?.id) {
        toast({
          title: 'Error',
          description: 'Restaurant not found',
          variant: 'destructive'
        })
        return
      }

      // Validate required fields
      if (!newItem.name || !newItem.description || !newItem.price || !newItem.category_id) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive'
        })
        return
      }

      const itemToAdd = {
        ...newItem,
        id: crypto.randomUUID(),
        restaurant_id: restaurant.id,
        customization_options: customizationOptions
      }

      const { data, error } = await supabase
        .from('menu_items')
        .insert([itemToAdd])
        .select()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Menu item added successfully',
      })

      setIsAddDialogOpen(false)
      setNewItem({
        name: '',
        description: '',
        price: 0,
        category_id: '',
        is_available: true,
        customization_options: {
          type: null,
          extras: {},
          sides: {},
          sizes: {},
          milk_options: {}
        }
      })
      setCustomizationOptions({
        type: null,
        extras: {},
        sides: {},
        sizes: {},
        milk_options: {}
      })
      fetchMenuItems()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Menu item deleted successfully',
      })

      fetchMenuItems()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  // Add preload function
  const preloadAdjacentImages = useCallback((currentIndex: number) => {
    const preloadImage = (url: string) => {
      if (!url) return
      const img = new Image()
      img.src = url
    }

    // Preload next and previous 2 images
    for (let i = -2; i <= 2; i++) {
      const index = currentIndex + i
      if (index >= 0 && index < menuItems.length && i !== 0) {
        const imageUrl = menuItems[index].image_url
        if (imageUrl) {
          preloadImage(imageUrl)
        }
      }
    }
  }, [menuItems])

  // Filter menu items by selected category and search query
  const filteredMenuItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory ? item.category_id === selectedCategory : true
    const matchesSearch = searchQuery.trim() === '' ? true : (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return matchesCategory && matchesSearch
  })

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <div className="space-x-2">
          <Button onClick={() => document.getElementById('csv-upload')?.click()} disabled={isUploading}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {isUploading ? 'Importing...' : 'Import CSV'}
          </Button>
          <input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="basic" className="w-full">
                <TabsList>
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="customization">Customization</TabsTrigger>
                </TabsList>

                <TabsContent value="basic">
                  <div className="space-y-4">
                    <div>
                      <Label>Name</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newItem.description}
                        onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select
                        className="w-full p-2 border rounded-md"
                        value={newItem.category_id}
                        onChange={(e) => setNewItem({ ...newItem, category_id: e.target.value })}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="customization">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Item Type</Label>
                      <div className="flex gap-4">
                        <Button
                          variant={customizationOptions.type === 'burger' ? 'default' : 'outline'}
                          onClick={() => setCustomizationOptions(prev => ({ ...prev, type: 'burger' }))}
                        >
                          Burger
                        </Button>
                        <Button
                          variant={customizationOptions.type === 'coffee' ? 'default' : 'outline'}
                          onClick={() => setCustomizationOptions(prev => ({ ...prev, type: 'coffee' }))}
                        >
                          Coffee
                        </Button>
                        <Button
                          variant={customizationOptions.type === null ? 'default' : 'outline'}
                          onClick={() => setCustomizationOptions(prev => ({ ...prev, type: null }))}
                        >
                          None
                        </Button>
                      </div>
                    </div>

                    {customizationOptions.type === 'burger' && (
                      <>
                        <div className="space-y-4">
                          <Label>Extras</Label>
                          <div className="grid gap-4">
                            {Object.entries(customizationOptions.extras).map(([name, price]) => (
                              <div key={name} className="flex items-center gap-4">
                                <Input
                                  value={name}
                                  onChange={(e) => {
                                    const newExtras = { ...customizationOptions.extras }
                                    delete newExtras[name]
                                    newExtras[e.target.value] = price
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      extras: newExtras
                                    }))
                                  }}
                                  placeholder="Extra name"
                                />
                                <Input
                                  type="number"
                                  value={price}
                                  onChange={(e) => {
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      extras: {
                                        ...prev.extras,
                                        [name]: parseFloat(e.target.value)
                                      }
                                    }))
                                  }}
                                  placeholder="Price"
                                  className="w-24"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const newExtras = { ...customizationOptions.extras }
                                    delete newExtras[name]
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      extras: newExtras
                                    }))
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCustomizationOptions(prev => ({
                                  ...prev,
                                  extras: {
                                    ...prev.extras,
                                    'New Extra': 0
                                  }
                                }))
                              }}
                            >
                              Add Extra
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Sides</Label>
                          <div className="grid gap-4">
                            {Object.entries(customizationOptions.sides).map(([name, price]) => (
                              <div key={name} className="flex items-center gap-4">
                                <Input
                                  value={name}
                                  onChange={(e) => {
                                    const newSides = { ...customizationOptions.sides }
                                    delete newSides[name]
                                    newSides[e.target.value] = price
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      sides: newSides
                                    }))
                                  }}
                                  placeholder="Side name"
                                />
                                <Input
                                  type="number"
                                  value={price}
                                  onChange={(e) => {
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      sides: {
                                        ...prev.sides,
                                        [name]: parseFloat(e.target.value)
                                      }
                                    }))
                                  }}
                                  placeholder="Price"
                                  className="w-24"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const newSides = { ...customizationOptions.sides }
                                    delete newSides[name]
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      sides: newSides
                                    }))
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCustomizationOptions(prev => ({
                                  ...prev,
                                  sides: {
                                    ...prev.sides,
                                    'New Side': 0
                                  }
                                }))
                              }}
                            >
                              Add Side
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {customizationOptions.type === 'coffee' && (
                      <>
                        <div className="space-y-4">
                          <Label>Sizes</Label>
                          <div className="grid gap-4">
                            {Object.entries(customizationOptions.sizes).map(([name, price]) => (
                              <div key={name} className="flex items-center gap-4">
                                <Input
                                  value={name}
                                  onChange={(e) => {
                                    const newSizes = { ...customizationOptions.sizes }
                                    delete newSizes[name]
                                    newSizes[e.target.value] = price
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      sizes: newSizes
                                    }))
                                  }}
                                  placeholder="Size name"
                                />
                                <Input
                                  type="number"
                                  value={price}
                                  onChange={(e) => {
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      sizes: {
                                        ...prev.sizes,
                                        [name]: parseFloat(e.target.value)
                                      }
                                    }))
                                  }}
                                  placeholder="Price"
                                  className="w-24"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const newSizes = { ...customizationOptions.sizes }
                                    delete newSizes[name]
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      sizes: newSizes
                                    }))
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCustomizationOptions(prev => ({
                                  ...prev,
                                  sizes: {
                                    ...prev.sizes,
                                    'New Size': 0
                                  }
                                }))
                              }}
                            >
                              Add Size
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <Label>Milk Options</Label>
                          <div className="grid gap-4">
                            {Object.entries(customizationOptions.milk_options).map(([name, price]) => (
                              <div key={name} className="flex items-center gap-4">
                                <Input
                                  value={name}
                                  onChange={(e) => {
                                    const newMilkOptions = { ...customizationOptions.milk_options }
                                    delete newMilkOptions[name]
                                    newMilkOptions[e.target.value] = price
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      milk_options: newMilkOptions
                                    }))
                                  }}
                                  placeholder="Milk option name"
                                />
                                <Input
                                  type="number"
                                  value={price}
                                  onChange={(e) => {
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      milk_options: {
                                        ...prev.milk_options,
                                        [name]: parseFloat(e.target.value)
                                      }
                                    }))
                                  }}
                                  placeholder="Price"
                                  className="w-24"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => {
                                    const newMilkOptions = { ...customizationOptions.milk_options }
                                    delete newMilkOptions[name]
                                    setCustomizationOptions(prev => ({
                                      ...prev,
                                      milk_options: newMilkOptions
                                    }))
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => {
                                setCustomizationOptions(prev => ({
                                  ...prev,
                                  milk_options: {
                                    ...prev.milk_options,
                                    'New Milk Option': 0
                                  }
                                }))
                              }}
                            >
                              Add Milk Option
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button onClick={handleAddItem} className="w-full">
                  Add Menu Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Category selector */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Filter by Category</Label>
          <select
            className="w-full p-2 border rounded-md bg-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Search bar */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search Menu Items</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or description..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CSV Import Instructions Card */}
      <Card className="p-4 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">CSV Import Instructions</h2>
          <p className="text-sm text-muted-foreground">
            Your CSV file should include the following columns:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground ml-4 mt-2">
            <li>name (required) - The name of the menu item</li>
            <li>description (required) - A description of the menu item</li>
            <li>price (required) - The price in decimal format (e.g., 9.99)</li>
            <li>category (required) - One of: Appetizers, Main Courses, Burgers & Sandwiches, Pasta & Risotto, Salads, Desserts, Beverages, Side Dishes</li>
          </ul>
        </div>
      </Card>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMenuItems.length > 0 ? (
          filteredMenuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onUpdate={fetchMenuItems}
              onDelete={handleDeleteItem}
              categories={categories}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No menu items found. Try adjusting your search or category filter.
          </div>
        )}
      </div>
    </div>
  )
} 