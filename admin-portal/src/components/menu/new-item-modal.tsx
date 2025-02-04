'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MenuItem } from '@/types/menu';
import { Database } from '@/types/supabase';

type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];

interface NewItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (item: Partial<MenuItem>) => Promise<void>;
  categories: MenuCategory[];
}

export function NewItemModal({ open, onClose, onSubmit, categories }: NewItemModalProps) {
  const [item, setItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    category_id: '',
    is_available: true,
    customization_options: {
      size: {
        options: [],
        required: false
      },
      extras: {
        options: [],
        required: false
      },
      spiciness: {
        options: [],
        required: false
      }
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!item.name || !item.description || !item.category_id || typeof item.price !== 'number') {
      return;
    }
    await onSubmit(item);
    onClose();
    // Form'u sıfırla
    setItem({
      name: '',
      description: '',
      price: 0,
      category_id: '',
      is_available: true,
      customization_options: {
        size: {
          options: [],
          required: false
        },
        extras: {
          options: [],
          required: false
        },
        spiciness: {
          options: [],
          required: false
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Menu Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={item.name || ''}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={item.description || ''}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={item.price || 0}
              onChange={(e) => setItem({ ...item, price: parseFloat(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={item.category_id}
              onValueChange={(value) => setItem({ ...item, category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
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
          <div className="flex items-center space-x-2">
            <Switch
              id="is_available"
              checked={item.is_available}
              onCheckedChange={(checked) => setItem({ ...item, is_available: checked })}
            />
            <Label htmlFor="is_available">Available</Label>
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 