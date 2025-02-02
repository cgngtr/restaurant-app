'use client'

import { supabase } from '@/lib/supabase'
import { Cart } from '@/components/cart/cart'
import { Toaster } from '@/components/ui/toaster'
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
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="text-xl font-semibold truncate">{restaurantSlug}</h1>
          <Cart />
        </div>
      </header>
      {children}
      <Toaster />
    </div>
  )
} 