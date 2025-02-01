'use client'

import { supabase } from '@/lib/supabase'
import { Cart } from '@/components/cart/cart'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export default function RestaurantLayout({ children }: LayoutProps) {
  const [restaurantSlug, setRestaurantSlug] = useState('')

  useEffect(() => {
    const slug = window.location.pathname.split('/')[1]
    setRestaurantSlug(slug)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Restaurant: {restaurantSlug}</h1>
            <Cart />
          </div>
        </div>
      </header>
      {children}
    </div>
  )
} 