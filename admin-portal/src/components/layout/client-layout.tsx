'use client'

import { ThemeProvider } from '@/providers/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ParallelDataProvider } from '@/providers/parallel-data-provider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/sidebar'
import { RestaurantProvider } from '@/providers/restaurant-provider'
import { useMemo } from 'react'
import dynamic from 'next/dynamic'

// Hydration sorunlarını önlemek için dinamik import
const ClientWrapper = dynamic(() => import('./client-wrapper'), {
  ssr: false,
})

interface ClientLayoutProps {
  children: React.ReactNode
  isAuthPage: boolean
}

export default function ClientLayout({ children, isAuthPage }: ClientLayoutProps) {
  // QueryClient'ı useMemo ile oluştur
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }), [])

  return (
    <ClientWrapper>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="qr-order-theme"
        >
          {isAuthPage ? (
            <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
              {children}
            </div>
          ) : (
            <RestaurantProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 pl-64">
                  <div className="p-8">
                    <ParallelDataProvider>
                      {children}
                    </ParallelDataProvider>
                  </div>
                </main>
              </div>
            </RestaurantProvider>
          )}
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </ClientWrapper>
  )
} 