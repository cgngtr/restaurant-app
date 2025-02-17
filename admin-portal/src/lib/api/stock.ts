import { supabase } from '@/lib/supabase';

// Types
export interface Supplier {
  id: string;
  restaurant_id: string;
  company_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  status: 'active' | 'inactive';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StockItem {
  id: string;
  restaurant_id: string;
  supplier_id: string | null;
  name: string;
  sku: string | null;
  description: string | null;
  unit: string;
  quantity: number;
  minimum_quantity: number;
  maximum_quantity: number | null;
  unit_cost: number | null;
  last_ordered_at: string | null;
  last_received_at: string | null;
  created_at: string;
  updated_at: string;
  supplier?: Supplier;
}

export interface StockTransaction {
  id: string;
  restaurant_id: string;
  stock_item_id: string;
  supplier_id: string | null;
  transaction_type: 'received' | 'used' | 'adjusted' | 'waste';
  quantity: number;
  unit_cost: number | null;
  notes: string | null;
  created_at: string;
  created_by: string;
}

// Suppliers
export async function getSuppliers(restaurantId: string) {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('company_name');

  if (error) throw error;
  return data;
}

export async function createSupplier(
  restaurantId: string,
  data: Omit<Supplier, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>
) {
  const { data: result, error } = await supabase
    .from('suppliers')
    .insert([{ ...data, restaurant_id: restaurantId }])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateSupplier(
  id: string,
  data: Partial<Omit<Supplier, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>
) {
  const { data: result, error } = await supabase
    .from('suppliers')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteSupplier(id: string) {
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Stock Items
export async function getStockItems(restaurantId: string) {
  const { data, error } = await supabase
    .from('stock_items')
    .select(`
      *,
      supplier:suppliers (
        id,
        company_name,
        contact_person
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('name');

  if (error) throw error;
  return data;
}

export async function createStockItem(
  restaurantId: string,
  data: Omit<StockItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>
) {
  const { data: result, error } = await supabase
    .from('stock_items')
    .insert([{ ...data, restaurant_id: restaurantId }])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function updateStockItem(
  id: string,
  data: Partial<Omit<StockItem, 'id' | 'restaurant_id' | 'created_at' | 'updated_at'>>
) {
  const { data: result, error } = await supabase
    .from('stock_items')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function deleteStockItem(id: string) {
  const { error } = await supabase
    .from('stock_items')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Stock Transactions
export async function createStockTransaction(
  restaurantId: string,
  userId: string,
  data: Omit<StockTransaction, 'id' | 'restaurant_id' | 'created_at' | 'created_by'>
) {
  const { data: result, error } = await supabase
    .from('stock_transactions')
    .insert([{
      ...data,
      restaurant_id: restaurantId,
      created_by: userId
    }])
    .select()
    .single();

  if (error) throw error;
  return result;
}

export async function getStockTransactions(
  restaurantId: string,
  stockItemId?: string,
  limit = 10
) {
  let query = supabase
    .from('stock_transactions')
    .select(`
      *,
      stock_item:stock_items (
        id,
        name,
        unit
      ),
      supplier:suppliers (
        id,
        company_name
      ),
      created_by_user:profiles (
        id,
        email
      )
    `)
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (stockItemId) {
    query = query.eq('stock_item_id', stockItemId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

// Stock Alerts
export async function getStockAlerts(restaurantId: string) {
  const { data, error } = await supabase
    .from('stock_alerts')
    .select(`
      *,
      stock_item:stock_items (
        id,
        name,
        unit,
        quantity,
        minimum_quantity,
        maximum_quantity
      )
    `)
    .eq('restaurant_id', restaurantId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function resolveStockAlert(alertId: string, userId: string) {
  const { data, error } = await supabase
    .from('stock_alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
      resolved_by: userId
    })
    .eq('id', alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
} 