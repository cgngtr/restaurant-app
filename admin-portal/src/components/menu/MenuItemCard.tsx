'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Edit, X, Trash, Loader2 } from 'lucide-react'
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
import imageCompression from 'browser-image-compression'

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

// Add compression options
const compressionOptions = {
  maxSizeMB: 1,             // Maximum size in MB
  maxWidthOrHeight: 1024,   // Max width/height
  useWebWorker: true,       // Use web worker for better performance
  initialQuality: 0.8,      // Initial quality (0 to 1)
}

// Add compression function
const compressImage = async (file: File): Promise<File> => {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log('Compression results:', {
      originalSize: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      compressedSize: (compressedFile.size / 1024 / 1024).toFixed(2) + 'MB',
    });
    return compressedFile;
  } catch (error) {
    console.error('Compression error:', error);
    throw new Error('Image compression failed');
  }
};

const DEFAULT_PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNFRUVFRUUiLz48cGF0aCBkPSJNODAgOTBINzBWMTEwSDgwVjkwWiIgZmlsbD0iIzY2NiIvPjxwYXRoIGQ9Ik0xMzAgOTBIMTIwVjExMEgxMzBWOTBaIiBmaWxsPSIjNjY2Ii8+PHBhdGggZD0iTTEwMCAxMzBDMTEzLjgwNyAxMzAgMTI1IDExOC44MDcgMTI1IDEwNUMxMjUgOTEuMTkzIDExMy44MDcgODAgMTAwIDgwQzg2LjE5MyA4MCA3NSA5MS4xOTMgNzUgMTA1Qzc1IDExOC44MDcgODYuMTkzIDEzMCAxMDAgMTMwWiIgZmlsbD0iIzY2NiIvPjwvc3ZnPg=='

export function MenuItemCard({ item, categories, onEdit, onDelete }: MenuItemCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editedItem, setEditedItem] = useState<MenuItem>({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    category_id: item.category_id,
    is_available: item.is_available,
    image_url: item.image_url,
    customization_options: item.customization_options
  })
  const [customizationOptions, setCustomizationOptions] = useState<CustomizationOptions>(
    item.customization_options || {
      type: null,
      extras: {},
      sides: {},
      sizes: {},
      milk_options: {}
    }
  )
  const [isUploading, setIsUploading] = useState(false)

  const deleteImageFromStorage = async (imageUrl: string | undefined | null) => {
    if (!imageUrl) return;
    try {
      const oldFilePath = imageUrl.split('/').pop();
      if (oldFilePath) {
        await supabase.storage
          .from('menu-images')
          .remove([`menu-items/${oldFilePath}`]);
      }
    } catch (error) {
      console.error('Error deleting image from storage:', error);
    }
  };

  const handleImageRemove = async () => {
    try {
      // Delete from storage
      await deleteImageFromStorage(editedItem.image_url);
      
      // Update local state
      setEditedItem({ ...editedItem, image_url: undefined });
      
      toast({
        title: 'Success',
        description: 'Image removed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to remove image',
        variant: 'destructive',
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      // Validate file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        throw new Error('File must be JPEG, PNG, or WebP')
      }

      // Compress image before size validation
      const compressedFile = await compressImage(file);

      // Validate compressed file size (max 2MB after compression)
      if (compressedFile.size > 2 * 1024 * 1024) {
        throw new Error('File size must be less than 2MB after compression')
      }

      // Delete old image if exists
      await deleteImageFromStorage(editedItem.image_url);

      // Generate a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${item.id}-${Date.now()}.${fileExt}`
      const filePath = `menu-items/${fileName}`

      // Upload compressed file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('menu-images')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: compressedFile.type
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('menu-images')
        .getPublicUrl(filePath)

      // Update editedItem with new image URL
      setEditedItem({ ...editedItem, image_url: publicUrl })

      toast({
        title: 'Success',
        description: `Image uploaded successfully (Size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB)`,
      })
    } catch (error: any) {
      console.error('Upload error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    try {
      // Önce update işlemini yapalım
      const { error: updateError } = await supabase
        .from('menu_items')
        .update({
          name: editedItem.name,
          description: editedItem.description,
          price: editedItem.price,
          category_id: editedItem.category_id,
          is_available: editedItem.is_available,
          image_url: editedItem.image_url || undefined,
          customization_options: customizationOptions
        })
        .eq('id', item.id)

      if (updateError) throw updateError

      // Sonra güncellenmiş veriyi alalım
      const { data: updatedData, error: fetchError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('id', item.id)
        .single()

      if (fetchError) throw fetchError

      if (!updatedData) {
        throw new Error('Updated data not found')
      }

      // UI'ı güncelleyelim
      const updatedItem: MenuItem = {
        ...updatedData,
        customization_options: customizationOptions
      }

      // Parent component'i güncelleyelim
      await onEdit(updatedItem)

      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      })

      setIsEditDialogOpen(false)
    } catch (error: any) {
      console.error('Update error:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to update menu item',
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
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = DEFAULT_PLACEHOLDER_IMAGE;
            }}
          />
        ) : (
          <div className="w-full h-full bg-secondary/10 flex flex-col items-center justify-center">
            <div className="text-4xl text-muted-foreground mb-2">🍽️</div>
            <span className="text-sm text-muted-foreground">No image</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg">{item.name}</h3>
            <p className="text-sm text-gray-500">
              {categories.find(cat => cat.id === item.category_id)?.name}
            </p>
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
                <div>
                  <Label>Image</Label>
                  <div className="mt-2 flex items-center gap-4">
                    {editedItem.image_url && (
                      <div className="relative h-20 w-20 rounded-md overflow-hidden">
                        <Image
                          src={editedItem.image_url || DEFAULT_PLACEHOLDER_IMAGE}
                          alt={editedItem.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = DEFAULT_PLACEHOLDER_IMAGE;
                          }}
                        />
                      </div>
                    )}
                    <label className={`cursor-pointer ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <div className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-md transition-colors flex items-center gap-2">
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          'Choose Image'
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                    {editedItem.image_url && !isUploading && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleImageRemove}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
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