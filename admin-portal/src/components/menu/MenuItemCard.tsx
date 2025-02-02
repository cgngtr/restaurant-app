'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from '@/components/ui/use-toast'
import { Edit2, X, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Category {
  id: string
  name: string
  sort_order: number
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
}

interface MenuItemProps {
  item: MenuItem
  onUpdate: () => void
  onDelete: (id: string) => void
}

export default function MenuItemCard({ item, onUpdate, onDelete }: MenuItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState(item)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('menu_categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
      return
    }

    setCategories(data)
  }

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: editedItem.name,
          description: editedItem.description,
          price: editedItem.price,
          category_id: editedItem.category_id,
          is_available: editedItem.is_available
        })
        .eq('id', item.id)

      if (error) throw error

      setIsEditing(false)
      onUpdate()

      toast({
        title: 'Success',
        description: 'Menu item updated successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    }
  }

  return (
    <Card className="p-4">
      {isEditing ? (
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
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold">{editedItem.name}</h3>
              <p className="text-sm text-muted-foreground">{editedItem.description}</p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">${editedItem.price.toFixed(2)}</span>
            <span className={`text-sm ${editedItem.is_available ? 'text-green-600' : 'text-red-600'}`}>
              {editedItem.is_available ? 'Available' : 'Unavailable'}
            </span>
          </div>
          <div className="mt-2">
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
              {editedItem.category?.name}
            </span>
          </div>
        </div>
      )}
    </Card>
  )
} 