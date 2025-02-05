"use client";

import { useState } from "react";
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

interface DietaryFlag {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}

export function DietaryOptions() {
  const { toast } = useToast();
  const restaurantId = useRestaurantId();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<DietaryFlag | null>(null);

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
          name: 'Vejetaryen',
          description: 'Et içermeyen seçenekler',
          icon_url: 'https://api.iconify.design/material-symbols:eco.svg?color=%2322c55e'
        },
        { 
          name: 'Vegan',
          description: 'Hiçbir hayvansal ürün içermez',
          icon_url: 'https://api.iconify.design/mdi:sprout.svg?color=%2322c55e'
        },
        { 
          name: 'Glütensiz',
          description: 'Glüten içermeyen seçenekler',
          icon_url: 'https://api.iconify.design/fluent:food-grains-24-regular.svg?color=%23b91c1c'
        },
        { 
          name: 'Acılı',
          description: 'Baharatlı ve acılı',
          icon_url: 'https://api.iconify.design/mdi:chili-hot.svg?color=%23b91c1c'
        },
        { 
          name: 'Laktozsuz',
          description: 'Süt ürünü içermez',
          icon_url: '/no_lactose_icon.svg'
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
      } else {
        // Mevcut bayrakları güncelle
        for (const defaultFlag of defaultFlags) {
          const existingFlag = data.find(f => f.name === defaultFlag.name);
          if (existingFlag) {
            // Bayrak varsa güncelle
            const { error: updateError } = await supabase
              .from('dietary_flags')
              .update({
                description: defaultFlag.description,
                icon_url: defaultFlag.icon_url
              })
              .eq('id', existingFlag.id);

            if (updateError) {
              console.error('Error updating dietary flag:', updateError);
            }
          } else {
            // Bayrak yoksa ekle
            const { error: insertError } = await supabase
              .from('dietary_flags')
              .insert([{
                ...defaultFlag,
                restaurant_id: restaurantId
              }]);

            if (insertError) {
              console.error('Error inserting dietary flag:', insertError);
            }
          }
        }

        // Güncellenmiş verileri getir
        const { data: updatedData, error: fetchError } = await supabase
          .from('dietary_flags')
          .select('*')
          .eq('restaurant_id', restaurantId)
          .order('name');

        if (fetchError) {
          console.error('Error fetching updated dietary flags:', fetchError);
          throw fetchError;
        }

        return updatedData;
      }
    },
    enabled: !!restaurantId
  });

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
    mutationFn: async (data: { id: string; name: string; description?: string; icon_url?: string }) => {
      const { error } = await supabase
        .from('dietary_flags')
        .update({
          name: data.name,
          description: data.description,
          icon_url: data.icon_url
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dietary-flags'] });
      toast({
        title: "Dietary flag updated",
        description: "The dietary flag has been updated successfully.",
      });
      setEditingFlag(null);
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
        <h2 className="text-xl font-semibold">Dietary Options</h2>
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
        <DialogContent>
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
                  icon_url: formData.get("iconUrl") as string
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
            <Button type="submit" className="w-full">
              Update Dietary Option
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 