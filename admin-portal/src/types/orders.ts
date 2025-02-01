export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
  notes?: string;
  created_at: string;
  menu_item?: {
    name: string;
    description: string;
  };
}

export interface Order {
  id: string;
  restaurant_id: string;
  table_id: string;
  status: OrderStatus;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  table?: {
    table_number: string;
  };
  order_items?: OrderItem[];
}

export type OrderWithDetails = Order & {
  table: {
    table_number: string;
  };
  order_items: (OrderItem & {
    menu_item: {
      name: string;
      description: string;
    };
  })[];
}; 