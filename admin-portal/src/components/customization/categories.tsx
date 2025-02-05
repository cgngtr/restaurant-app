"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRestaurantId } from "@/hooks/use-restaurant-id";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  sort_order: number;
  parent_id: string | null;
}

export function Categories() {
  const { toast } = useToast();
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Kategorileri çek
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      if (!restaurantId) {
        console.log('No restaurant ID available');
        return [];
      }

      console.log('Fetching categories for restaurant:', restaurantId);
      
      const { data, error } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('sort_order');
      
      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        // Eğer hiç kategori yoksa, varsayılan kategorileri oluştur
        const defaultCategories = [
          { name: 'Ana Yemekler', sort_order: 1 },
          { name: 'Başlangıçlar', sort_order: 2 },
          { name: 'Tatlılar', sort_order: 3 },
          { name: 'İçecekler', sort_order: 4 }
        ];

        const { data: insertedData, error: insertError } = await supabase
          .from('menu_categories')
          .insert(defaultCategories.map(cat => ({
            ...cat,
            restaurant_id: restaurantId
          })))
          .select();

        if (insertError) {
          console.error('Error creating default categories:', insertError);
          throw insertError;
        }

        return insertedData;
      }

      return data;
    },
    enabled: !!restaurantId
  });

  // Kategori ekleme mutation'ı
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; parent_id?: string }) => {
      const { error } = await supabase
        .from('menu_categories')
        .insert([
          {
            restaurant_id: restaurantId,
            name: data.name,
            parent_id: data.parent_id || null,
            sort_order: (categories?.length || 0) + 1
          }
        ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      toast({
        title: "Category added",
        description: "The category has been added successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add category.",
        variant: "destructive",
      });
    }
  });

  // Kategori güncelleme mutation'ı
  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; parent_id?: string }) => {
      const { error } = await supabase
        .from('menu_categories')
        .update({
          name: data.name,
          parent_id: data.parent_id || null
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      toast({
        title: "Category updated",
        description: "The category has been updated successfully.",
      });
      setEditingCategory(null);
    }
  });

  // Kategori silme mutation'ı
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      });
    }
  });

  // Sıralama güncelleme mutation'ı
  const reorderMutation = useMutation({
    mutationFn: async ({ id, newOrder }: { id: string; newOrder: number }) => {
      const { error } = await supabase
        .from('menu_categories')
        .update({ sort_order: newOrder })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-categories'] });
    }
  });

  const handleAddCategory = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const parentId = formData.get("parentId") as string;

    createMutation.mutate({ name, parent_id: parentId || undefined });
  };

  const handleMoveCategory = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = categories?.findIndex((c: Category) => c.id === id) || 0;
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= (categories?.length || 0)) return;

    reorderMutation.mutate({ 
      id, 
      newOrder: categories![newIndex].sort_order 
    });
    reorderMutation.mutate({ 
      id: categories![newIndex].id, 
      newOrder: categories![currentIndex].sort_order 
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Menu Categories</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <form action={handleAddCategory} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="parentId">Parent Category (Optional)</Label>
                <select
                  id="parentId"
                  name="parentId"
                  className="w-full border rounded-md p-2"
                >
                  <option value="">None</option>
                  {categories?.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full">
                Add Category
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories?.map((category: Category) => (
          <Card key={category.id}>
            <CardContent className="flex items-center justify-between p-4">
              <span className="font-medium">{category.name}</span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleMoveCategory(category.id, 'up')}
                  disabled={categories.indexOf(category) === 0}
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleMoveCategory(category.id, 'down')}
                  disabled={categories.indexOf(category) === categories.length - 1}
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingCategory(category)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this category?')) {
                      deleteMutation.mutate(category.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (editingCategory) {
                updateMutation.mutate({
                  id: editingCategory.id,
                  name: formData.get("name") as string,
                  parent_id: formData.get("parentId") as string
                });
              }
            }} 
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-name">Category Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                defaultValue={editingCategory?.name}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit-parentId">Parent Category (Optional)</Label>
              <select
                id="edit-parentId"
                name="parentId"
                className="w-full border rounded-md p-2"
                defaultValue={editingCategory?.parent_id || ""}
              >
                <option value="">None</option>
                {categories?.filter((c: Category) => c.id !== editingCategory?.id).map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full">
              Update Category
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 