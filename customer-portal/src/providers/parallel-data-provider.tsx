'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'

type RouteQuery = {
  key: string[]
  query: () => Promise<{ data: any; error: any }>
  priority?: 'high' | 'low'
  staleTime?: number
}

type RouteQueries = {
  [key: string]: (params: { restaurantId: string; tableId: string }) => RouteQuery[]
}

// Pre-fetch queries for each route with priority levels
const routeQueriesConfig: RouteQueries = {
  '/[restaurant]/[table]': ({ restaurantId, tableId }) => [
    {
      key: ['restaurant', restaurantId],
      query: async () => await supabase
        .from('restaurants')
        .select('*, menu_categories(*)')
        .eq('id', restaurantId)
        .single(),
      priority: 'high',
      staleTime: 1000 * 60 * 5 // 5 minutes
    },
    {
      key: ['active-menu-items', restaurantId],
      query: async () => await supabase
        .from('menu_items')
        .select('*, menu_categories(*)')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true),
      priority: 'high',
      staleTime: 1000 * 60 // 1 minute
    },
    {
      key: ['table-info', tableId],
      query: async () => await supabase
        .from('tables')
        .select('*')
        .eq('id', tableId)
        .single(),
      priority: 'high',
      staleTime: 1000 * 15 // 15 seconds
    }
  ],
  '/[restaurant]/[table]/orders': ({ restaurantId, tableId }) => [
    {
      key: ['table-orders', tableId],
      query: async () => await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('table_id', tableId)
        .order('created_at', { ascending: false })
        .limit(10),
      priority: 'high',
      staleTime: 1000 * 15 // 15 seconds
    }
  ],
  '/[restaurant]/[table]/checkout': ({ restaurantId, tableId }) => [
    {
      key: ['active-order', tableId],
      query: async () => await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('table_id', tableId)
        .eq('status', 'active')
        .single(),
      priority: 'high',
      staleTime: 1000 * 15 // 15 seconds
    }
  ]
}

const ParallelDataContext = createContext<null>(null)

export function ParallelDataProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)

  // Get current pathname
  const getCurrentPath = useCallback(() => {
    if (typeof window === 'undefined') return ''
    return window.location.pathname
  }, [])

  // Extract route parameters from URL
  const getRouteParams = useCallback(() => {
    const pathSegments = getCurrentPath().split('/')
    return {
      restaurantId: pathSegments[1] || '',
      tableId: pathSegments[2] || ''
    }
  }, [getCurrentPath])

  const { restaurantId, tableId } = getRouteParams()

  // Get base route by removing dynamic segments
  const getBaseRoute = useCallback((path: string) => {
    return path.split('/').map(segment => {
      return segment.startsWith('[') ? `[${segment.slice(1, -1)}]` : segment
    }).join('/')
  }, [])

  // Prefetch function with priority handling
  const prefetchQueries = useCallback(async (queries: RouteQuery[], immediate = false) => {
    const highPriorityQueries = queries.filter(q => q.priority === 'high' || !q.priority)
    const lowPriorityQueries = queries.filter(q => q.priority === 'low')

    try {
      // Immediately fetch high priority queries
      await Promise.all(
        highPriorityQueries.map(({ key, query, staleTime = 1000 * 30 }) =>
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn: async () => {
              const { data, error } = await query()
              if (error) throw error
              return data
            },
            staleTime
          })
        )
      )

      // Fetch low priority queries with delay unless immediate is true
      if (!immediate) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      await Promise.all(
        lowPriorityQueries.map(({ key, query, staleTime = 1000 * 30 }) =>
          queryClient.prefetchQuery({
            queryKey: key,
            queryFn: async () => {
              const { data, error } = await query()
              if (error) throw error
              return data
            },
            staleTime
          })
        )
      )
    } catch (error) {
      console.error('Error prefetching queries:', error)
    }
  }, [queryClient])

  // Prefetch adjacent routes
  const prefetchAdjacentRoutes = useCallback(() => {
    if (!restaurantId || !tableId) return

    const routes = [
      '/[restaurant]/[table]',
      '/[restaurant]/[table]/orders',
      '/[restaurant]/[table]/checkout'
    ]
    const baseRoute = getBaseRoute(getCurrentPath())
    const currentIndex = routes.indexOf(baseRoute)
    
    if (currentIndex !== -1) {
      const prevRoute = routes[currentIndex - 1]
      const nextRoute = routes[currentIndex + 1]

      if (prevRoute) {
        const queryFn = routeQueriesConfig[prevRoute]
        if (queryFn) {
          const queries = queryFn({ restaurantId, tableId })
          prefetchQueries(queries)
        }
      }

      if (nextRoute) {
        const queryFn = routeQueriesConfig[nextRoute]
        if (queryFn) {
          const queries = queryFn({ restaurantId, tableId })
          prefetchQueries(queries)
        }
      }
    }
  }, [restaurantId, tableId, getBaseRoute, getCurrentPath, prefetchQueries])

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    if (!restaurantId || !tableId) return

    // Prefetch current route data immediately
    const baseRoute = getBaseRoute(getCurrentPath())
    const queryFn = routeQueriesConfig[baseRoute]
    if (queryFn) {
      const currentRouteQueries = queryFn({ restaurantId, tableId })
      prefetchQueries(currentRouteQueries, true)
    }

    // Prefetch adjacent routes in the background
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchAdjacentRoutes)
    } else {
      setTimeout(prefetchAdjacentRoutes, 1000)
    }
  }, [restaurantId, tableId, getBaseRoute, getCurrentPath, prefetchQueries, prefetchAdjacentRoutes, mounted])

  if (!mounted) {
    return null
  }

  return (
    <ParallelDataContext.Provider value={null}>
      {children}
    </ParallelDataContext.Provider>
  )
} 