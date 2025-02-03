'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useMemo } from 'react'

const queryClientOptions = {
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    },
  },
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient(queryClientOptions))

  const devTools = useMemo(() => {
    if (process.env.NODE_ENV === 'production') return null
    return <ReactQueryDevtools initialIsOpen={false} />
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {devTools}
    </QueryClientProvider>
  )
} 