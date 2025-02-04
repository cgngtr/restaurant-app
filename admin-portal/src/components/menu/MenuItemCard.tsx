'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Edit2, X, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
}

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
}

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category_id: string
  category?: {
    name: string
  }
  is_available: boolean
  customization_options: {
    type: 'burger' | 'coffee' | null
    extras: Record<string, number>
    sides: Record<string, number>
    sizes: Record<string, number>
    milk_options: Record<string, number>
  }
}

interface MenuItemCardProps {
  item: MenuItem
  onUpdate: () => void
  onDelete: (id: string) => void
  categories: Array<{ id: string; name: string }>
}

export default function MenuItemCard({ item, onUpdate, onDelete, categories }: MenuItemCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<MenuItem>(item)
  const [customizationOptions, setCustomizationOptions] = useState(item.customization_options)

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          ...editedItem,
          customization_options: customizationOptions
        })
        .eq('id', item.id)

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      })

      setIsEditDialogOpen(false)
      onUpdate()
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
    <Card className="p-4">
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">${item.price.toFixed(2)}</span>
          <span className={`text-sm ${item.is_available ? 'text-green-600' : 'text-red-600'}`}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </span>
        </div>
        <div className="mt-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
            {item.category?.name}
          </span>
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
                    value={editedItem.description}
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
            <Button onClick={handleSave} className="w-full">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 