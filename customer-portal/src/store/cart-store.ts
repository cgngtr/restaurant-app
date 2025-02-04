'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Database } from '@/types/supabase'

type MenuItem = Database['public']['Tables']['menu_items']['Row']

interface MenuItemWithExtras extends MenuItem {
  quantity: number
  special_instructions?: string
  extras?: {
    size?: string;
    milk?: string;
    side?: string;
    extras?: Record<string, number>;
  }
}

interface CartStore {
  items: MenuItemWithExtras[]
  addItem: (item: MenuItem & { extras?: MenuItemWithExtras['extras'] }) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  updateSpecialInstructions: (itemId: string, instructions: string) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => ({ 
        items: [...state.items, { ...item, quantity: 1 }] as MenuItemWithExtras[] 
      })),

      removeItem: (itemId) => set((state) => ({ 
        items: state.items.filter((item) => item.id !== itemId)
      })),

      updateQuantity: (itemId, quantity) => set((state) => {
        if (quantity <= 0) {
          return {
            items: state.items.filter((i) => i.id !== itemId),
          }
        }
        return {
          items: state.items.map((i) =>
            i.id === itemId ? { ...i, quantity } : i
          ),
        }
      }),

      updateSpecialInstructions: (itemId, instructions) => set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, special_instructions: instructions } : i
        ),
      })),

      clearCart: () => set({ items: [] }),

      getTotal: () => {
        const state = get()
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
    }),
    {
      name: 'cart-storage',
    }
  )
) 