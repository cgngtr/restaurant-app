import type { Database } from './supabase';

export type Order = Database['public']['Tables']['orders']['Row'];

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export type OrderWithDetails = {
  id: string;
  restaurant_id: string;
  table_id: string;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  table: {
    table_number: string;
  } | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  customizations?: {
    size?: string;
    extras?: string[];
    spiciness?: string;
  };
  menu_item: {
    name: string;
    description: string;
    price: number;
  };
}; 