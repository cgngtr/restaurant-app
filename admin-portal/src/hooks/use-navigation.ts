import { useCallback, useEffect, useState } from 'react'
import { useRestaurant } from '@/providers/restaurant-provider'
import { supabase } from '@/lib/supabase'
import type { NavigationItem, NavigationItemWithChildren, NavigationUpdatePayload, NavigationCreatePayload } from '@/types/navigation'

export const useNavigation = () => {
  const { restaurant } = useRestaurant()
  const [navigation, setNavigation] = useState<NavigationItemWithChildren[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch navigation items
  const fetchNavigation = useCallback(async () => {
    if (!restaurant?.id) return

    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('navigation_settings')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .order('sort_order', { ascending: true })

      if (error) throw error

      // Convert flat array to tree structure
      const buildNavigationTree = (items: NavigationItem[], parentId: string | null = null): NavigationItemWithChildren[] => {
        return items
          .filter(item => item.parent_id === parentId)
          .map(item => ({
            ...item,
            children: buildNavigationTree(items, item.id)
          }))
      }

      const treeData = buildNavigationTree(data)
      setNavigation(treeData)
    } catch (err) {
      console.error('Error fetching navigation:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while fetching navigation')
    } finally {
      setLoading(false)
    }
  }, [restaurant?.id])

  // Update navigation item
  const updateNavigationItem = async (payload: NavigationUpdatePayload) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('navigation_settings')
        .update(payload)
        .eq('id', payload.id)
        .select()
        .single()

      if (error) throw error

      await fetchNavigation()
      return data
    } catch (err) {
      console.error('Error updating navigation item:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while updating navigation item')
      throw err
    }
  }

  // Create navigation item
  const createNavigationItem = async (payload: NavigationCreatePayload) => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('navigation_settings')
        .insert(payload)
        .select()
        .single()

      if (error) throw error

      await fetchNavigation()
      return data
    } catch (err) {
      console.error('Error creating navigation item:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while creating navigation item')
      throw err
    }
  }

  // Delete navigation item
  const deleteNavigationItem = async (id: string) => {
    try {
      setError(null)
      const { error } = await supabase
        .from('navigation_settings')
        .delete()
        .eq('id', id)

      if (error) throw error

      await fetchNavigation()
    } catch (err) {
      console.error('Error deleting navigation item:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while deleting navigation item')
      throw err
    }
  }

  // Reorder navigation items
  const reorderNavigationItems = async (items: NavigationUpdatePayload[]) => {
    try {
      setError(null)
      
      // Update items one by one to maintain RLS compliance
      for (const item of items) {
        const { error } = await supabase
          .from('navigation_settings')
          .update({ sort_order: item.sort_order })
          .eq('id', item.id)

        if (error) throw error
      }

      await fetchNavigation()
    } catch (err) {
      console.error('Error reordering navigation items:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while reordering navigation items')
      throw err
    }
  }

  useEffect(() => {
    fetchNavigation()
  }, [fetchNavigation])

  return {
    navigation,
    loading,
    error,
    updateNavigationItem,
    createNavigationItem,
    deleteNavigationItem,
    reorderNavigationItems,
    refetch: fetchNavigation
  }
} 