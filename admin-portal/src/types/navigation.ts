import { Database } from '@/types/supabase'

export type NavigationItem = Database['public']['Tables']['navigation_settings']['Row']

export interface NavigationItemWithChildren extends Omit<NavigationItem, 'parent_id'> {
  parent_id?: string | null
  children?: NavigationItemWithChildren[]
  name: string
  href: string
  icon: string
  id: string
  is_visible: boolean
  sort_order: number
  restaurant_id: string
  created_at: string
  updated_at: string
}

export interface NavigationUpdatePayload {
  id: string
  sort_order?: number
  is_visible?: boolean
  parent_id?: string | null
  name?: string
  icon?: string
}

export interface NavigationCreatePayload {
  restaurant_id: string
  name: string
  href: string
  icon: string
  parent_id?: string
  sort_order: number
  is_visible: boolean
} 