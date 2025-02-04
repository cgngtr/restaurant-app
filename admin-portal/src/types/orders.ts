export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  image_url?: string;
  is_available: boolean;
  restaurant_id: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  special_instructions?: string;
  menu_item?: MenuItem;
  created_at: string;
  updated_at: string;
}

export interface Table {
  id: string;
  restaurant_id: string;
  table_number: string;
  status: 'available' | 'occupied' | 'reserved';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  total_amount: number;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderWithDetails extends Order {
  table: Table;
  order_items: (OrderItem & {
    menu_item: Pick<MenuItem, 'name' | 'description'>;
  })[];
} 