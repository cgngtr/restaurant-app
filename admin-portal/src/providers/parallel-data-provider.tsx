'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/react-query'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'

type RouteQuery = {
  key: string[]
  query: () => Promise<{ data: any; error: any }>
  priority?: 'high' | 'low'
  staleTime?: number
}

type RouteQueries = {
  [key: string]: RouteQuery[]
}

// Pre-fetch queries for each route with priority levels
const routeQueriesConfig: RouteQueries = {
  '/': [
    {
      key: ['dashboard-stats'],
      query: async () => await supabase
        .from('orders')
        .select('*')
        .limit(5),
      priority: 'high',
      staleTime: 1000 * 30 // 30 seconds
    },
    {
      key: ['dashboard-revenue'],
      query: async () => await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      priority: 'low',
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  ],
  '/tables': [
    {
      key: ['active-tables'],
      query: async () => await supabase
        .from('tables')
        .select('*')
        .eq('status', 'occupied'),
      priority: 'high',
      staleTime: 1000 * 15 // 15 seconds
    },
    {
      key: ['all-tables'],
      query: async () => await supabase
        .from('tables')
        .select('*'),
      priority: 'low',
      staleTime: 1000 * 60 // 1 minute
    }
  ],
  '/menu': [
    {
      key: ['menu-items'],
      query: async () => await supabase
        .from('menu_items')
        .select('*'),
      staleTime: 1000 * 60 * 5 // 5 minutes
    },
    {
      key: ['categories'],
      query: async () => await supabase
        .from('menu_categories')
        .select('*'),
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  ],
  '/orders': [
    {
      key: ['active-orders'],
      query: async () => await supabase
        .from('orders')
        .select('*')
        .neq('status', 'completed'),
      staleTime: 1000 * 15 // 15 seconds
    }
  ]
}

const ParallelDataContext = createContext<null>(null)

export function ParallelDataProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [mounted, setMounted] = useState(false)

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
    const routes = ['/', '/tables', '/menu', '/orders']
    const currentIndex = routes.indexOf(pathname)
    
    if (currentIndex !== -1) {
      const prevRoute = routes[currentIndex - 1]
      const nextRoute = routes[currentIndex + 1]

      if (prevRoute) {
        const queries = routeQueriesConfig[prevRoute]
        if (queries) prefetchQueries(queries)
      }

      if (nextRoute) {
        const queries = routeQueriesConfig[nextRoute]
        if (queries) prefetchQueries(queries)
      }
    }
  }, [pathname, prefetchQueries])

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      return
    }

    // Prefetch current route data immediately
    const currentRouteQueries = routeQueriesConfig[pathname as keyof typeof routeQueriesConfig] || []
    prefetchQueries(currentRouteQueries, true)

    // Prefetch adjacent routes in the background
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(prefetchAdjacentRoutes)
    } else {
      setTimeout(prefetchAdjacentRoutes, 1000)
    }
  }, [pathname, prefetchQueries, prefetchAdjacentRoutes, mounted])

  if (!mounted) {
    return null
  }

  return (
    <ParallelDataContext.Provider value={null}>
      {children}
    </ParallelDataContext.Provider>
  )
} 