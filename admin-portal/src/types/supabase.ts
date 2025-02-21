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
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string
          role: 'superadmin' | 'restaurant_owner' | 'staff'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          display_name: string
          role: 'superadmin' | 'restaurant_owner' | 'staff'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          role?: 'superadmin' | 'restaurant_owner' | 'staff'
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          active: boolean
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          active?: boolean
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          active?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          restaurant_id: string
          table_id: string | null
          status: string
          total_amount: number
          notes: string | null
          created_at: string
          updated_at: string
          order_number: string
          payment_status: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          table_id?: string | null
          status: string
          total_amount: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          order_number: string
          payment_status?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          table_id?: string | null
          status?: string
          total_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          order_number?: string
          payment_status?: string
        }
      }
      navigation_settings: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          href: string
          icon: string
          parent_id: string | null
          sort_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          href: string
          icon: string
          parent_id?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          href?: string
          icon?: string
          parent_id?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      superadmin_navigation_settings: {
        Row: {
          id: string
          name: string
          href: string
          icon: string
          parent_id: string | null
          sort_order: number
          is_visible: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          href: string
          icon: string
          parent_id?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          href?: string
          icon?: string
          parent_id?: string | null
          sort_order?: number
          is_visible?: boolean
          created_at?: string
          updated_at?: string
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