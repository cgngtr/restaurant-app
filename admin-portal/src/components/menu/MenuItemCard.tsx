'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Edit, X, Trash } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database } from '@/types/supabase'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { MenuItem } from '@/types/menu'

interface CustomizationOptions {
  type: 'burger' | 'coffee' | null;
  extras: Record<string, number>;
  sides: Record<string, number>;
  sizes: Record<string, number>;
  milk_options: Record<string, number>;
}

const DEFAULT_BURGER_OPTIONS = {
  extras: {
    'Extra Cheese': 1.50,
    'Bacon': 2.00,
    'Avocado': 1.50,
    'Caramelized Onions': 1.00,
    'Extra Patty': 3.50,
    'Fried Egg': 1.50
  },
  sides: {
    'French Fries': 3.00,
    'Sweet Potato Fries': 4.00,
    'Onion Rings': 3.50,
    'Side Salad': 3.00,
    'Coleslaw': 2.50
  }
} as const;

const DEFAULT_COFFEE_OPTIONS = {
  sizes: {
    'Small': 0,
    'Medium': 0.50,
    'Large': 1.00
  },
  milk_options: {
    'Whole Milk': 0,
    'Skim Milk': 0,
    'Almond Milk': 0.80,
    'Soy Milk': 0.80,
    'Oat Milk': 0.80
  }
} as const;

type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface MenuItemCardProps {
  item: MenuItem
  categories: MenuCategory[]
  onEdit: (updates: Partial<MenuItem>) => Promise<void>
  onDelete: () => Promise<void>
}

export function MenuItemCard({ item, categories, onEdit, onDelete }: MenuItemCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<MenuItem>(item)
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>({
    type: null,
    extras: {},
    sides: {},
    sizes: {},
    milk_options: {}
  })

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          ...editedItem,
          dietary_flags: customizationOptions
        })
        .eq('id', item.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      })

      setIsEditDialogOpen(false)
      onEdit(editedItem)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  const handleTypeChange = (type: 'burger' | 'coffee' | null) => {
    if (type === 'burger') {
      setCustomizationOptions({
        type: 'burger',
        extras: DEFAULT_BURGER_OPTIONS.extras,
        sides: DEFAULT_BURGER_OPTIONS.sides,
        sizes: {},
        milk_options: {}
      })
    } else if (type === 'coffee') {
      setCustomizationOptions({
        type: 'coffee',
        extras: {},
        sides: {},
        sizes: DEFAULT_COFFEE_OPTIONS.sizes,
        milk_options: DEFAULT_COFFEE_OPTIONS.milk_options
      })
    } else {
      setCustomizationOptions({
        type: null,
        extras: {},
        sides: {},
        sizes: {},
        milk_options: {}
      })
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.category?.name}</p>
          </div>
          <p className="font-medium">{formatCurrency(item.price)}</p>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="basic">
            <TabsList>
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="customization">Customization</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <div className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={editedItem.name}
                    onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={editedItem.description || ''}
                    onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editedItem.price}
                    onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={editedItem.category_id}
                    onChange={(e) => setEditedItem({ ...editedItem, category_id: e.target.value })}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={editedItem.is_available}
                    onCheckedChange={(checked) => setEditedItem({ ...editedItem, is_available: checked })}
                  />
                  <Label>Available</Label>
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
                      onClick={() => handleTypeChange('burger')}
                    >
                      Burger
                    </Button>
                    <Button
                      variant={customizationOptions.type === 'coffee' ? 'default' : 'outline'}
                      onClick={() => handleTypeChange('coffee')}
                    >
                      Coffee
                    </Button>
                    <Button
                      variant={customizationOptions.type === null ? 'default' : 'outline'}
                      onClick={() => handleTypeChange(null)}
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  extras: newExtras
                                })
                              }}
                              placeholder="Extra name"
                            />
                            <Input
                              type="number"
                              value={price.toString()}
                              onChange={(e) => {
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  extras: {
                                    ...customizationOptions.extras,
                                    [name]: parseFloat(e.target.value)
                                  }
                                })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  extras: newExtras
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCustomizationOptions({
                              ...customizationOptions,
                              extras: {
                                ...customizationOptions.extras,
                                'New Extra': 0
                              }
                            })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  sides: newSides
                                })
                              }}
                              placeholder="Side name"
                            />
                            <Input
                              type="number"
                              value={price.toString()}
                              onChange={(e) => {
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  sides: {
                                    ...customizationOptions.sides,
                                    [name]: parseFloat(e.target.value)
                                  }
                                })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  sides: newSides
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCustomizationOptions({
                              ...customizationOptions,
                              sides: {
                                ...customizationOptions.sides,
                                'New Side': 0
                              }
                            })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  sizes: newSizes
                                })
                              }}
                              placeholder="Size name"
                            />
                            <Input
                              type="number"
                              value={price.toString()}
                              onChange={(e) => {
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  sizes: {
                                    ...customizationOptions.sizes,
                                    [name]: parseFloat(e.target.value)
                                  }
                                })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  sizes: newSizes
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCustomizationOptions({
                              ...customizationOptions,
                              sizes: {
                                ...customizationOptions.sizes,
                                'New Size': 0
                              }
                            })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  milk_options: newMilkOptions
                                })
                              }}
                              placeholder="Milk option name"
                            />
                            <Input
                              type="number"
                              value={price.toString()}
                              onChange={(e) => {
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  milk_options: {
                                    ...customizationOptions.milk_options,
                                    [name]: parseFloat(e.target.value)
                                  }
                                })
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
                                setCustomizationOptions({
                                  ...customizationOptions,
                                  milk_options: newMilkOptions
                                })
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCustomizationOptions({
                              ...customizationOptions,
                              milk_options: {
                                ...customizationOptions.milk_options,
                                'New Milk Option': 0
                              }
                            })
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
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 