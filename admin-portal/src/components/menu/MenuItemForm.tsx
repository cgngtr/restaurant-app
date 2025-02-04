'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { MenuItem } from '@/types/menu';
import type { Database } from '@/types/supabase';

type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];

const menuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  is_available: z.boolean(),
  image_url: z.string().optional(),
  customization_options: z.object({
    size: z.object({
      options: z.array(z.string()),
      required: z.boolean()
    }).optional(),
    extras: z.object({
      options: z.array(z.string()),
      required: z.boolean()
    }).optional(),
    spiciness: z.object({
      options: z.array(z.string()),
      required: z.boolean()
    }).optional()
  }).optional()
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItemFormProps {
  item?: MenuItem;
  categories: MenuCategory[];
  onSubmit: (data: MenuItemFormData) => Promise<void>;
}

export function MenuItemForm({ item, categories, onSubmit }: MenuItemFormProps) {
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: item?.name || '',
      description: item?.description || '',
      category_id: item?.category_id || '',
      price: item?.price || 0,
      is_available: item?.is_available ?? true,
      image_url: item?.image_url,
      customization_options: item?.customization_options || {
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
    }
  });

  const handleSubmit = async (data: MenuItemFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-red-500 text-sm">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea {...form.register('description')} />
        {form.formState.errors.description && (
          <p className="text-red-500 text-sm">{form.formState.errors.description.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="price">Price</Label>
        <Input
          type="number"
          step="0.01"
          {...form.register('price', { valueAsNumber: true })}
        />
        {form.formState.errors.price && (
          <p className="text-red-500 text-sm">{form.formState.errors.price.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={form.watch('category_id')}
          onValueChange={(value) => form.setValue('category_id', value)}
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
        {form.formState.errors.category_id && (
          <p className="text-red-500 text-sm">{form.formState.errors.category_id.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input {...form.register('image_url')} />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={form.watch('is_available')}
          onCheckedChange={(checked) => form.setValue('is_available', checked)}
        />
        <Label>Available</Label>
      </div>

      <Button type="submit">
        {item ? 'Update Menu Item' : 'Create Menu Item'}
      </Button>
    </form>
  );
} 