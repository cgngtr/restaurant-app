'use client'

import { Suspense } from 'react'
import { QueryProvider } from '@/providers/query-provider'
import { ParallelDataProvider } from '@/providers/parallel-data-provider'
import { LoadingState } from '@/components/ui/loading-state'
import { Toaster } from '@/components/ui/toaster'
import { Cart } from '@/components/cart/cart'
import { useEffect, useState } from 'react'

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [restaurantName, setRestaurantName] = useState('')

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/')
    const restaurantSlug = pathSegments[1] || ''
    // Convert slug to display name (e.g., "demo-restaurant" -> "Demo Restaurant")
    const displayName = restaurantSlug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    setRestaurantName(displayName)
  }, [])

  return (
    <Suspense fallback={<LoadingState />}>
      <QueryProvider>
        <ParallelDataProvider>
          <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b sticky top-0 z-50">
              <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                <h1 className="text-xl font-semibold truncate">{restaurantName}</h1>
                <Cart />
              </div>
            </header>
            <main>
              <Suspense fallback={<LoadingState />}>
                {children}
              </Suspense>
            </main>
          </div>
          <Toaster />
        </ParallelDataProvider>
      </QueryProvider>
    </Suspense>
  )
} 