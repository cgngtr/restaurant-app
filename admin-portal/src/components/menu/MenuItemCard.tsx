'use client'

import { useState } from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Edit, X, Trash, Loader2, Pencil, Trash2 } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

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
  onDelete: (id: string) => Promise<void>
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
    <Card className="h-full flex flex-col overflow-hidden group relative hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          <Badge 
            variant={item.is_available ? "default" : "destructive"} 
            className={`${
              item.is_available 
                ? 'bg-green-600/90 hover:bg-green-600 backdrop-blur-sm' 
                : 'bg-red-500/90 hover:bg-red-600 backdrop-blur-sm'
            } shadow-sm`}
          >
            {item.is_available ? "Available" : "Unavailable"}
          </Badge>
        </div>
        
        {item.dietary_flags && item.dietary_flags.length > 0 && (
          <div className="absolute top-2 left-2 z-10 flex gap-1">
            {item.dietary_flags.map((flag) => (
              <Badge 
                key={flag.id} 
                variant="secondary"
                className="bg-card/80 backdrop-blur-sm shadow-sm"
              >
                {flag.name}
              </Badge>
            ))}
          </div>
        )}

        <Image
          src={item.image_url || '/placeholder-food.jpg'}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardContent className="flex-1 p-4">
        <div className="space-y-2 min-h-[120px] flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-lg leading-tight line-clamp-1">
              {item.name}
            </h3>
            <span className="text-lg font-bold text-primary whitespace-nowrap">
              ₺{item.price.toFixed(2)}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {item.description}
          </p>

          <div className="h-6">
            {item.customization_options?.type && (
              <Badge variant="outline" className="text-xs">
                {item.customization_options.type === 'burger' ? '🍔 Customizable' : '☕ Customizable'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
            className="h-8 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
            className="h-8 hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Edit Menu Item</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Item Name</Label>
                <Input
                  id="name"
                  value={editedItem.name}
                  onChange={(e) => setEditedItem({ ...editedItem, name: e.target.value })}
                  className="h-9"
                  placeholder="Enter item name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">Price (₺)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editedItem.price}
                  onChange={(e) => setEditedItem({ ...editedItem, price: parseFloat(e.target.value) })}
                  className="h-9"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Input
                id="description"
                value={editedItem.description}
                onChange={(e) => setEditedItem({ ...editedItem, description: e.target.value })}
                className="h-9"
                placeholder="Enter item description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                <Select
                  value={editedItem.category_id}
                  onValueChange={(value) => setEditedItem({ ...editedItem, category_id: value })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Item Type</Label>
                <Select
                  value={customizationOptions.type || "none"}
                  onValueChange={(value: string) => handleTypeChange(value as 'burger' | 'coffee' | null)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="burger">Burger</SelectItem>
                    <SelectItem value="coffee">Coffee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-secondary/30 p-3 rounded-lg">
              <div className="flex-1">
                <Label htmlFor="availability" className="text-sm font-medium">Availability Status</Label>
                <p className="text-sm text-muted-foreground">Toggle whether this item is available for order</p>
              </div>
              <Switch
                id="availability"
                checked={editedItem.is_available}
                onCheckedChange={(checked) => setEditedItem({ ...editedItem, is_available: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Item Image</Label>
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={editedItem.image_url || '/placeholder-food.jpg'}
                    alt={editedItem.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="text-sm"
                  />
                  {editedItem.image_url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleImageRemove}
                      className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Image
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="h-9"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="h-9 px-8"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
} 