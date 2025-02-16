import { supabase } from '@/lib/supabase';

// Types
export interface CustomizationGroupType {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
}

export interface CustomizationGroup {
  id: string;
  restaurant_id: string;
  type_id: string;
  name: string;
  description?: string;
  is_required: boolean;
  min_selections: number;
  max_selections: number;
}

export interface CustomizationOption {
  id: string;
  group_id: string;
  name: string;
  price_adjustment: number;
  is_default: boolean;
}

// Group Types
export async function getCustomizationGroupTypes(restaurantId: string) {
  const { data, error } = await supabase
    .from('customization_group_types')
    .select('*')
    .eq('restaurant_id', restaurantId);

  if (error) throw error;
  return data;
}

export async function createCustomizationGroupType(
  restaurantId: string,
  data: Omit<CustomizationGroupType, 'id' | 'restaurant_id'>
) {
  const { data: result, error } = await supabase
    .from('customization_group_types')
    .insert([{ ...data, restaurant_id: restaurantId }])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateCustomizationGroupType(
  id: string,
  data: Partial<Omit<CustomizationGroupType, 'id' | 'restaurant_id'>>
) {
  const { data: result, error } = await supabase
    .from('customization_group_types')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteCustomizationGroupType(id: string) {
  const { error } = await supabase
    .from('customization_group_types')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Groups
export async function getCustomizationGroups(restaurantId: string) {
  const { data, error } = await supabase
    .from('customization_groups')
    .select('*, customization_options(*)')
    .eq('restaurant_id', restaurantId);

  if (error) throw error;
  return data;
}

export async function createCustomizationGroup(
  restaurantId: string,
  data: Omit<CustomizationGroup, 'id' | 'restaurant_id'>
) {
  const { data: result, error } = await supabase
    .from('customization_groups')
    .insert([{ ...data, restaurant_id: restaurantId }])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateCustomizationGroup(
  id: string,
  data: Partial<Omit<CustomizationGroup, 'id' | 'restaurant_id'>>
) {
  const { data: result, error } = await supabase
    .from('customization_groups')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteCustomizationGroup(id: string) {
  const { error } = await supabase
    .from('customization_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Options
export async function createCustomizationOption(
  data: Omit<CustomizationOption, 'id'>
) {
  const { data: result, error } = await supabase
    .from('customization_options')
    .insert([data])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateCustomizationOption(
  id: string,
  data: Partial<Omit<CustomizationOption, 'id' | 'group_id'>>
) {
  const { data: result, error } = await supabase
    .from('customization_options')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteCustomizationOption(id: string) {
  const { error } = await supabase
    .from('customization_options')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Menu Item Customizations
export async function addCustomizationToMenuItem(
  menuItemId: string,
  groupId: string,
  sortOrder: number = 0
) {
  const { data, error } = await supabase
    .from('menu_item_customizations')
    .insert([
      {
        menu_item_id: menuItemId,
        customization_group_id: groupId,
        sort_order: sortOrder,
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeCustomizationFromMenuItem(
  menuItemId: string,
  groupId: string
) {
  const { error } = await supabase
    .from('menu_item_customizations')
    .delete()
    .eq('menu_item_id', menuItemId)
    .eq('customization_group_id', groupId);

  if (error) throw error;
}

export async function updateCustomizationSortOrder(
  menuItemId: string,
  groupId: string,
  sortOrder: number
) {
  const { data, error } = await supabase
    .from('menu_item_customizations')
    .update({ sort_order: sortOrder })
    .eq('menu_item_id', menuItemId)
    .eq('customization_group_id', groupId)
    .select()
    .single();

  if (error) throw error;
  return data;
} 