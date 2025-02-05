"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2, ChevronDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useRestaurantId } from "@/hooks/use-restaurant-id";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CustomizationOption {
  id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean;
}

interface CustomizationGroup {
  id: string;
  type_id: string;
  name: string;
  description?: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
  options: CustomizationOption[];
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

export function CustomizationGroups() {
  const { toast } = useToast();
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddOptionDialogOpen, setIsAddOptionDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CustomizationGroup | null>(null);
  const [selectedGroupForOption, setSelectedGroupForOption] = useState<string | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Customization gruplarını çek
  const { data: groups, isLoading } = useQuery({
    queryKey: ['customization-groups', restaurantId],
    queryFn: async () => {
      if (!restaurantId) {
        console.log('No restaurant ID available');
        return [];
      }

      console.log('Fetching customization groups for restaurant:', restaurantId);
      
      const { data, error } = await supabase
        .from('customization_groups')
        .select(`
          *,
          options:customization_options(*)
        `)
        .eq('restaurant_id', restaurantId)
        .order('name');
      
      if (error) {
        console.error('Error fetching customization groups:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        // Eğer hiç customization grubu yoksa, varsayılan grupları oluştur
        const defaultGroups = [
          {
            name: 'Pişirme Derecesi',
            description: 'Et pişirme tercihinizi seçin',
            is_required: true,
            min_selections: 1,
            max_selections: 1,
            options: [
              { name: 'Az Pişmiş', price_adjustment: 0, is_default: false },
              { name: 'Orta', price_adjustment: 0, is_default: true },
              { name: 'İyi Pişmiş', price_adjustment: 0, is_default: false }
            ]
          },
          {
            name: 'İçecek Boyutu',
            description: 'İçeceğinizin boyutunu seçin',
            is_required: true,
            min_selections: 1,
            max_selections: 1,
            options: [
              { name: 'Küçük', price_adjustment: 0, is_default: false },
              { name: 'Orta', price_adjustment: 5, is_default: true },
              { name: 'Büyük', price_adjustment: 10, is_default: false }
            ]
          },
          {
            name: 'Ekstra Malzemeler',
            description: 'İstediğiniz ekstra malzemeleri seçin',
            is_required: false,
            min_selections: 0,
            max_selections: 5,
            options: [
              { name: 'Ekstra Peynir', price_adjustment: 10, is_default: false },
              { name: 'Mantar', price_adjustment: 8, is_default: false },
              { name: 'Bacon', price_adjustment: 15, is_default: false }
            ]
          }
        ];

        // Önce grupları oluştur
        for (const group of defaultGroups) {
          const { data: groupData, error: groupError } = await supabase
            .from('customization_groups')
            .insert([{
              restaurant_id: restaurantId,
              name: group.name,
              description: group.description,
              is_required: group.is_required,
              min_selections: group.min_selections,
              max_selections: group.max_selections
            }])
            .select()
            .single();

          if (groupError) {
            console.error('Error creating customization group:', groupError);
            continue;
          }

          // Sonra her grubun seçeneklerini oluştur
          const { error: optionsError } = await supabase
            .from('customization_options')
            .insert(
              group.options.map(option => ({
                group_id: groupData.id,
                name: option.name,
                price_adjustment: option.price_adjustment,
                is_default: option.is_default
              }))
            );

          if (optionsError) {
            console.error('Error creating customization options:', optionsError);
          }
        }

        // Oluşturulan tüm grupları ve seçenekleri getir
        const { data: finalData, error: finalError } = await supabase
          .from('customization_groups')
          .select(`
            *,
            options:customization_options(*)
          `)
          .eq('restaurant_id', restaurantId)
          .order('name');

        if (finalError) {
          console.error('Error fetching final customization groups:', finalError);
          throw finalError;
        }

        return finalData;
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
    if (editingGroup) {
      const fetchAppliedProducts = async () => {
        const { data } = await supabase
          .from('menu_item_customizations')
          .select('menu_item_id')
          .eq('group_id', editingGroup.id);
        
        if (data) {
          setSelectedProducts(data.map(item => item.menu_item_id));
        }
      };
      fetchAppliedProducts();
    }
  }, [editingGroup]);

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

  // Grup ekleme mutation'ı
  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      is_required: boolean;
      min_selections: number;
      max_selections: number;
    }) => {
      const { error } = await supabase
        .from('customization_groups')
        .insert([{
          restaurant_id: restaurantId,
          name: data.name,
          description: data.description,
          is_required: data.is_required,
          min_selections: data.min_selections,
          max_selections: data.max_selections
        }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-groups'] });
      toast({
        title: "Group added",
        description: "The customization group has been added successfully.",
      });
      setIsAddDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add customization group.",
        variant: "destructive",
      });
    }
  });

  // Grup güncelleme mutation'ı
  const updateMutation = useMutation({
    mutationFn: async (data: {
      id: string;
      name: string;
      description?: string;
      is_required: boolean;
      min_selections: number;
      max_selections: number;
      products: string[];
    }) => {
      // Update group
      const { error: groupError } = await supabase
        .from('customization_groups')
        .update({
          name: data.name,
          description: data.description,
          is_required: data.is_required,
          min_selections: data.min_selections,
          max_selections: data.max_selections
        })
        .eq('id', data.id);

      if (groupError) throw groupError;

      // Delete existing associations
      const { error: deleteError } = await supabase
        .from('menu_item_customizations')
        .delete()
        .eq('group_id', data.id);

      if (deleteError) throw deleteError;

      // Insert new associations
      if (data.products.length > 0) {
        const { error: insertError } = await supabase
          .from('menu_item_customizations')
          .insert(
            data.products.map(productId => ({
              menu_item_id: productId,
              group_id: data.id,
              sort_order: 0
            }))
          );

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-groups'] });
      toast({
        title: "Group updated",
        description: "The customization group has been updated successfully.",
      });
      setEditingGroup(null);
      setSelectedProducts([]);
      setSelectedCategory(null);
      setSearchTerm("");
    }
  });

  // Grup silme mutation'ı
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customization_groups')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-groups'] });
      toast({
        title: "Group deleted",
        description: "The customization group has been deleted successfully.",
      });
    }
  });

  // Seçenek ekleme mutation'ı
  const createOptionMutation = useMutation({
    mutationFn: async (data: {
      group_id: string;
      name: string;
      price_adjustment: number;
      is_default: boolean;
    }) => {
      const { error } = await supabase
        .from('customization_options')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-groups'] });
      toast({
        title: "Option added",
        description: "The option has been added successfully.",
      });
      setIsAddOptionDialogOpen(false);
      setSelectedGroupForOption(null);
    }
  });

  // Seçenek silme mutation'ı
  const deleteOptionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customization_options')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customization-groups'] });
      toast({
        title: "Option deleted",
        description: "The option has been deleted successfully.",
      });
    }
  });

  const handleAddGroup = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const isRequired = formData.get("isRequired") === "on";
    const minSelections = parseInt(formData.get("minSelections") as string) || 0;
    const maxSelections = parseInt(formData.get("maxSelections") as string) || 1;

    createMutation.mutate({
      name,
      description: description || undefined,
      is_required: isRequired,
      min_selections: minSelections,
      max_selections: maxSelections
    });
  };

  const handleAddOption = async (formData: FormData) => {
    if (!selectedGroupForOption) return;

    const name = formData.get("name") as string;
    const priceAdjustment = parseFloat(formData.get("priceAdjustment") as string) || 0;
    const isDefault = formData.get("isDefault") === "on";

    createOptionMutation.mutate({
      group_id: selectedGroupForOption,
      name,
      price_adjustment: priceAdjustment,
      is_default: isDefault
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Customization Groups</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Customization Group</DialogTitle>
            </DialogHeader>
            <form action={handleAddGroup} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="isRequired" name="isRequired" />
                  <Label htmlFor="isRequired">Required</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minSelections">Min Selections</Label>
                  <Input
                    id="minSelections"
                    name="minSelections"
                    type="number"
                    min="0"
                    defaultValue="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSelections">Max Selections</Label>
                  <Input
                    id="maxSelections"
                    name="maxSelections"
                    type="number"
                    min="1"
                    defaultValue="1"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add Group
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {groups?.map((group) => (
          <AccordionItem key={group.id} value={group.id}>
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-4 py-2">
                  <div className="flex items-center justify-between flex-1 pr-4">
                    <div className="text-left">
                      <h3 className="font-medium text-left">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-gray-500 text-left">
                          {group.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        role="button"
                        tabIndex={0}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingGroup(group);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setEditingGroup(group);
                          }
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </div>
                      <div
                        role="button"
                        tabIndex={0}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this group?')) {
                            deleteMutation.mutate(group.id);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (confirm('Are you sure you want to delete this group?')) {
                              deleteMutation.mutate(group.id);
                            }
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </div>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="px-4 py-2 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Options</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedGroupForOption(group.id);
                          setIsAddOptionDialogOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                    <div className="h-px bg-gray-200 w-full my-0"></div>
                    <div className="space-y-0">
                      {group.options?.map((option: CustomizationOption) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between py-0 text-left"
                        >
                          <div className="text-left">
                            <span className="font-medium">{option.name}</span>
                            {option.price_adjustment > 0 && (
                              <span className="ml-2 text-sm text-gray-500">
                                +${option.price_adjustment}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this option?')) {
                                  deleteOptionMutation.mutate(option.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Edit Group Dialog */}
      <Dialog open={!!editingGroup} onOpenChange={(open) => !open && setEditingGroup(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customization Group</DialogTitle>
          </DialogHeader>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              if (editingGroup) {
                updateMutation.mutate({
                  id: editingGroup.id,
                  name: formData.get("name") as string,
                  description: formData.get("description") as string,
                  is_required: formData.get("isRequired") === "on",
                  min_selections: parseInt(formData.get("minSelections") as string) || 0,
                  max_selections: parseInt(formData.get("maxSelections") as string) || 1,
                  products: selectedProducts
                });
              }
            }} 
            className="space-y-4"
          >
            <div>
              <Label htmlFor="edit-name">Group Name</Label>
              <Input 
                id="edit-name" 
                name="name" 
                defaultValue={editingGroup?.name}
                required 
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                name="description"
                defaultValue={editingGroup?.description}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  id="edit-isRequired" 
                  name="isRequired"
                  defaultChecked={editingGroup?.is_required}
                />
                <Label htmlFor="edit-isRequired">Required</Label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-minSelections">Min Selections</Label>
                <Input
                  id="edit-minSelections"
                  name="minSelections"
                  type="number"
                  min="0"
                  defaultValue={editingGroup?.min_selections}
                />
              </div>
              <div>
                <Label htmlFor="edit-maxSelections">Max Selections</Label>
                <Input
                  id="edit-maxSelections"
                  name="maxSelections"
                  type="number"
                  min="1"
                  defaultValue={editingGroup?.max_selections}
                />
              </div>
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
              Update Customization Group
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Option Dialog */}
      <Dialog 
        open={isAddOptionDialogOpen} 
        onOpenChange={(open) => {
          setIsAddOptionDialogOpen(open);
          if (!open) setSelectedGroupForOption(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Option</DialogTitle>
          </DialogHeader>
          <form action={handleAddOption} className="space-y-4">
            <div>
              <Label htmlFor="option-name">Option Name</Label>
              <Input id="option-name" name="name" required />
            </div>
            <div>
              <Label htmlFor="priceAdjustment">Price Adjustment</Label>
              <Input
                id="priceAdjustment"
                name="priceAdjustment"
                type="number"
                step="0.01"
                min="0"
                defaultValue="0"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="isDefault" name="isDefault" />
              <Label htmlFor="isDefault">Default Selection</Label>
            </div>
            <Button type="submit" className="w-full">
              Add Option
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 