import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useMenuSubscription(restaurantId: string) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!restaurantId) return

    const channel = supabase
      .channel('menu-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_items',
          filter: `restaurant_id=eq.${restaurantId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-menu-items', restaurantId] })
          queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'menu_item_customizations',
          filter: `menu_item_id=in.(select id from menu_items where restaurant_id=eq.${restaurantId})`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-menu-items', restaurantId] })
          queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customization_groups'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-menu-items', restaurantId] })
          queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customization_options'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['active-menu-items', restaurantId] })
          queryClient.invalidateQueries({ queryKey: ['menu-items'] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [restaurantId, queryClient])
} 