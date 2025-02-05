export interface TableDetails {
  id: string
  restaurant_id: string
  table_number: string
  status: 'available' | 'occupied' | 'reserved'
  qr_code: string | null
  orders: Array<{
    id: string
    status: string
    total_amount: number
    created_at: string
    order_items: Array<{
      quantity: number
      unit_price: number
      menu_item: {
        name: string
      }
    }>
  }>
  stats: {
    total_orders: number
    total_revenue: number
    average_order_value: number
  }
} 