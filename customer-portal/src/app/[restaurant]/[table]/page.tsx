'use client'

import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Menu } from '@/components/menu/menu'
import { Database } from '@/types/supabase'
import { useEffect, useState, use } from 'react'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

type MenuItem = Database['public']['Tables']['menu_items']['Row']
type MenuCategory = Database['public']['Tables']['menu_categories']['Row']

interface RestaurantData {
  id: string
  name: string
  logo_url: string | null
  slug: string
  tables: Array<{
    id: string
    table_number: string
    status: string
  }>
  menu_categories: MenuCategory[]
  menu_items: MenuItem[]
}

async function getRestaurantData(slug: string, tableNumber: string): Promise<RestaurantData | null> {
  // Önce restaurant ve table verilerini al
  const { data: restaurant, error: restaurantError } = await supabase
    .from('restaurants')
    .select(`
      id,
      name,
      logo_url,
      slug,
      tables!inner (
        id,
        table_number,
        status
      )
    `)
    .eq('slug', slug)
    .eq('tables.table_number', tableNumber)
    .single()

  if (restaurantError || !restaurant) {
    console.error('Restaurant fetch error:', restaurantError)
    return null
  }

  // Sonra menu kategorilerini al
  const { data: categories, error: categoriesError } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('restaurant_id', restaurant.id)
    .order('sort_order', { ascending: true })

  if (categoriesError) {
    console.error('Categories fetch error:', categoriesError)
    return null
  }

  // Son olarak menu itemlarını al
  const { data: items, error: itemsError } = await supabase
    .from('menu_items')
    .select('*')
    .eq('restaurant_id', restaurant.id)

  if (itemsError) {
    console.error('Menu items fetch error:', itemsError)
    return null
  }

  return {
    ...restaurant,
    menu_categories: categories || [],
    menu_items: items || []
  }
}

interface PageProps {
  params: Promise<{
    restaurant: string
    table: string
  }>
}

export default function RestaurantTablePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const [activeOrder, setActiveOrder] = useState<{ id: string, status: string } | null>(null)
  const [restaurant, setRestaurant] = useState<RestaurantData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRestaurantData = async () => {
      const data = await getRestaurantData(resolvedParams.restaurant, resolvedParams.table)
      setRestaurant(data)
      setIsLoading(false)
    }

    loadRestaurantData()
  }, [resolvedParams.restaurant, resolvedParams.table])

  useEffect(() => {
    const fetchActiveOrder = async () => {
      const { data: restaurantData } = await supabase
        .from('restaurants')
        .select('id')
        .eq('slug', resolvedParams.restaurant)
        .single()

      if (!restaurantData) return

      const { data: tableData } = await supabase
        .from('tables')
        .select('id')
        .eq('restaurant_id', restaurantData.id)
        .eq('table_number', resolvedParams.table)
        .single()

      if (tableData) {
        const { data: orderData } = await supabase
          .from('orders')
          .select('id, status')
          .eq('table_id', tableData.id)
          .in('status', ['pending', 'preparing', 'ready'])
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        if (orderData) {
          setActiveOrder(orderData)
        } else {
          setActiveOrder(null)
        }
      }
    }

    fetchActiveOrder()

    const subscription = supabase
      .channel('active_order')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          fetchActiveOrder()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [resolvedParams.restaurant, resolvedParams.table])

  useEffect(() => {
    console.log('Active Order:', activeOrder)
  }, [activeOrder])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  if (!restaurant) {
    notFound()
  }

  return (
    <main className="container mx-auto px-4 py-6">
      <Menu
        restaurantName={restaurant.name}
        tableNumber={resolvedParams.table}
        categories={restaurant.menu_categories}
        items={restaurant.menu_items}
      />

      {/* Active Order Button */}
      {activeOrder && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            size="lg"
            variant="default"
            className="shadow-lg bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full"
            onClick={() => {
              window.location.href = `/${resolvedParams.restaurant}/${resolvedParams.table}/orders/${activeOrder.id}`
            }}
          >
            <Clock className="mr-2 h-5 w-5" />
            View Order Status
          </Button>
        </div>
      )}
    </main>
  )
} 