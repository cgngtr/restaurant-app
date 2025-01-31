export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          created_at: string
          name: string
          slug: string
          logo_url: string | null
          active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          slug: string
          logo_url?: string | null
          active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          slug?: string
          logo_url?: string | null
          active?: boolean
        }
      }
      tables: {
        Row: {
          id: string
          restaurant_id: string
          table_number: string
          status: 'available' | 'occupied' | 'reserved'
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_number: string
          status?: 'available' | 'occupied' | 'reserved'
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_number?: string
          status?: 'available' | 'occupied' | 'reserved'
          created_at?: string
        }
      }
      menu_categories: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          sort_order: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          sort_order?: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          sort_order?: number
          active?: boolean
          created_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          category_id: string
          name: string
          description: string
          price: number
          image_url: string | null
          is_available: boolean
          dietary_flags: string[]
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          category_id: string
          name: string
          description: string
          price: number
          image_url?: string | null
          is_available?: boolean
          dietary_flags?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          category_id?: string
          name?: string
          description?: string
          price?: number
          image_url?: string | null
          is_available?: boolean
          dietary_flags?: string[]
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          table_id: string
          status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_id: string
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_id?: string
          status?: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled'
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id: string
          quantity: number
          unit_price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string
          quantity?: number
          unit_price?: number
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 