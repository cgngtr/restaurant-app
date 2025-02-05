"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRestaurantId } from "@/hooks/use-restaurant-id";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

interface DietaryFlag {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}

interface MenuItem {
  id: string;
  name: string;
  category_id: string;
}

interface MenuCategory {
  id: string;
  name: string;
}

export function DietaryOptions() {
  const { toast } = useToast();
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<DietaryFlag | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Dietary flags'leri çek
  const { data: flags, isLoading } = useQuery({
    queryKey: ['dietary-flags', restaurantId],
    queryFn: async () => {
      if (!restaurantId) {
        console.log('No restaurant ID available');
        return [];
      }

      console.log('Fetching dietary flags for restaurant:', restaurantId);
      
      // Varsayılan bayrakları tanımla
      const defaultFlags = [
        { 
          name: 'Vegetarian',
          description: 'Options without meat',
          icon_url: 'https://api.iconify.design/material-symbols:eco.svg?color=%2322c55e'
        },
        { 
          name: 'Vegan',
          description: 'Contains no animal products',
          icon_url: 'https://api.iconify.design/mdi:sprout.svg?color=%2322c55e'
        },
        { 
          name: 'Gluten Free',
          description: 'Options without gluten',
          icon_url: 'https://api.iconify.design/fluent:food-grains-24-regular.svg?color=%23b91c1c'
        },
        {
          name: 'Nut Free',
          description: 'No nuts or tree nuts',
          icon_url: 'https://api.iconify.design/game-icons:peanut.svg?color=%23854d0e'
        },
        {
          name: 'Dairy Free',
          description: 'Contains no dairy products',
          icon_url: 'https://api.iconify.design/mdi:cow-off.svg?color=%23854d0e'
        }
      ];
      
      const { data, error } = await supabase
        .from('dietary_flags')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name');
      
      if (error) {
        console.error('Error fetching dietary flags:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        // Hiç veri yoksa varsayılanları ekle
        const { data: insertedData, error: insertError } = await supabase
          .from('dietary_flags')
          .insert(defaultFlags.map(flag => ({
            ...flag,
            restaurant_id: restaurantId
          })))
          .select();

        if (insertError) {
          console.error('Error creating default dietary flags:', insertError);
          throw insertError;
        }

        return insertedData;
      }

      return data;
    },
    enabled: !!restaurantId
  });

  // Fetch menu categories and items
  const { data: categories } = useQuery({
    queryKey: ['menu-categories', restaurantId],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_categories')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name');
      return data || [];
    }
  });

  const { data: menuItems } = useQuery({
    queryKey: ['menu-items', restaurantId],
    queryFn: async () => {
      const { data } = await supabase
        .from('menu_items')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .order('name');
      return data || [];
    }
  });

  // Fetch applied products when editing
  useEffect(() => {
    if (editingFlag) {
      const fetchAppliedProducts = async () => {
        const { data } = await supabase
          .from('menu_item_dietary_flags')
          .select('menu_item_id')
          .eq('flag_id', editingFlag.id);
        
        if (data) {
          setSelectedProducts(data.map(item => item.menu_item_id));
        }
      };
      fetchAppliedProducts();
    }
  }, [editingFlag]);

  // Filter menu items based on search and category
  const filteredItems = useMemo(() => {
    let items = menuItems || [];
    
    if (selectedCategory && selectedCategory !== '_all') {
      items = items.filter(item => item.category_id === selectedCategory);
    }
    
    if (searchTerm) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return items;
  }, [menuItems, selectedCategory, searchTerm]);

  // Get selected product names for display
  const selectedProductNames = useMemo(() => {
    return selectedProducts.map(id => 
      menuItems?.find(item => item.id === id)?.name || ''
    ).filter(Boolean);
  }, [selectedProducts, menuItems]);

  // Handle product selection
  const toggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Flag ekleme mutation'ı
  const createMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; icon_url?: string }) => {
      const { error } = await supabase
        .from('dietary_flags')
        .insert([{
          restaurant_id: restaurantId,
          name: data.name,
          description: data.description,
          icon_url: data.icon_url
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietary-flags'] });
      toast({
        title: "Dietary flag added",
        description: "The dietary flag has been added successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add dietary flag.",
        variant: "destructive",
      });
    }
  });

  // Flag güncelleme mutation'ı
  const updateMutation = useMutation({
    mutationFn: async (data: { 
      id: string; 
      name: string; 
      description?: string; 
      icon_url?: string;
      products: string[];
    }) => {
      // Update flag
      const { error: flagError } = await supabase
        .from('dietary_flags')
        .update({
          name: data.name,
          description: data.description,
          icon_url: data.icon_url
        })
        .eq('id', data.id);

      if (flagError) throw flagError;

      // Delete existing associations
      const { error: deleteError } = await supabase
        .from('menu_item_dietary_flags')
        .delete()
        .eq('flag_id', data.id);

      if (deleteError) throw deleteError;

      // Insert new associations
      if (data.products.length > 0) {
        const { error: insertError } = await supabase
          .from('menu_item_dietary_flags')
          .insert(
            data.products.map(productId => ({
              menu_item_id: productId,
              flag_id: data.id
            }))
          );

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietary-flags'] });
      toast({
        title: "Dietary flag updated",
        description: "The dietary flag has been updated successfully.",
      });
      setEditingFlag(null);
      setSelectedProducts([]);
      setSelectedCategory(null);
      setSearchTerm("");
    }
  });

  // Flag silme mutation'ı
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dietary_flags')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietary-flags'] });
      toast({
        title: "Dietary flag deleted",
        description: "The dietary flag has been deleted successfully.",
      });
    }
  });

  const handleAddFlag = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const iconUrl = formData.get("iconUrl") as string;

    createMutation.mutate({ 
      name, 
      description: description || undefined,
      icon_url: iconUrl || undefined
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Dietary Options</h2>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-[#22c55e] mr-2">●</span>Certified options
            <span className="text-[#854d0e] mx-2">●</span>Allergen free options
            <span className="text-[#b91c1c] ml-2">●</span>Special diet options
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Dietary Option
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Dietary Option</DialogTitle>
            </DialogHeader>
            <form action={handleAddFlag} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="iconUrl">Icon URL</Label>
                <Input id="iconUrl" name="iconUrl" type="url" />
              </div>
              <Button type="submit" className="w-full">
                Add Dietary Option
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {flags?.map((flag) => (
          <Card key={flag.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {flag.icon_url && (
                  <img
                    src={flag.icon_url}
                    alt={flag.name}
                    className="w-6 h-6"
                  />
                )}
                <div>
                  <h3 className="font-medium">{flag.name}</h3>
                  {flag.description && (
                    <p className="text-sm text-gray-500">{flag.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setEditingFlag(flag)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this dietary flag?')) {
                      deleteMutation.mutate(flag.id);
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
      <Dialog open={!!editingFlag} onOpenChange={(open) => !open && setEditingFlag(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Dietary Option</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (editingFlag) {
                updateMutation.mutate({
                  id: editingFlag.id,
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  icon_url: formData.get("iconUrl") as string,
                  products: selectedProducts
                });
              }
            }} 
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                defaultValue={editingFlag?.name}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description" 
                name="description"
                defaultValue={editingFlag?.description}
              />
            </div>
            <div>
              <Label htmlFor="edit-iconUrl">Icon URL</Label>
              <Input 
                id="edit-iconUrl" 
                name="iconUrl" 
                type="url"
                defaultValue={editingFlag?.icon_url}
              />
            </div>

            <div className="space-y-4">
              <Label>Applied for Products</Label>
              
              {/* Selected Products Display */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedProductNames.map(name => (
                  <Badge key={name} variant="secondary">
                    {name}
                  </Badge>
                ))}
              </div>

              {/* Category and Search */}
              <div className="flex gap-4 mb-2">
                <Select
                  value={selectedCategory || undefined}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_all">All Categories</SelectItem>
                    {categories?.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              {/* Products List */}
              <ScrollArea className="h-[200px] border rounded-md p-4">
                <div className="space-y-2">
                  {filteredItems.map(item => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={selectedProducts.includes(item.id)}
                        onCheckedChange={() => toggleProduct(item.id)}
                      />
                      <label
                        htmlFor={item.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item.name}
                      </label>
                    </div>
                  ))}
                  {filteredItems.length === 0 && (
                    <p className="text-sm text-gray-500">No products found</p>
                  )}
                </div>
              </ScrollArea>
            </div>

            <Button type="submit" className="w-full">
              Update Dietary Option
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 