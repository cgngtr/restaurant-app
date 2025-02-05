'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  Utensils,
  Clock,
  CheckCircle,
  ChefHat,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Table as TableIcon
} from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { OrderDetails } from "@/components/orders/order-details"
import { useQuery } from '@tanstack/react-query'
import { OrderWithDetails } from '@/types/order'
import type { Database } from '@/types/supabase'

interface OrderData {
  id: string
  status: string
  total_amount: number
  created_at: string
  table: {
    table_number: string
  }
}

interface DashboardStats {
  totalOrders: number
  activeOrders: number
  completedOrders: number
  totalTables: number
  availableTables: number
  occupiedTables: number
  todayRevenue: number
  todayOrderCount: number
  recentOrders: Array<{
    id: string
    status: string
    total_amount: number
    created_at: string
    table: { table_number: string }
  }>
}

const initialStats: DashboardStats = {
  totalOrders: 0,
  activeOrders: 0,
  completedOrders: 0,
  totalTables: 0,
  availableTables: 0,
  occupiedTables: 0,
  todayRevenue: 0,
  todayOrderCount: 0,
  recentOrders: []
}

type OrderItemRaw = Database['public']['Tables']['order_items']['Row'] & {
  menu_item: Array<{
    name: string;
    description: string;
    price: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)
  const [restaurantData, setRestaurantData] = useState<{ id: string } | null>(null)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  // Fetch selected order details
  const { data: selectedOrder } = useQuery<OrderWithDetails | undefined>({
    queryKey: ['order', selectedOrderId],
    queryFn: async () => {
      if (!selectedOrderId) return undefined;
      
      const { data: orderData, error } = await supabase
        .from('orders')
        .select(`
          id,
          restaurant_id,
          table_id,
          status,
          total_amount,
          notes,
          created_at,
          updated_at,
          table:tables(table_number),
          order_items:order_items(
            id,
            order_id,
            menu_item_id,
            quantity,
            unit_price,
            customizations,
            menu_item:menu_items(
              name,
              description,
              price
            )
          )
        `)
        .eq('id', selectedOrderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return undefined;
      }

      if (!orderData) return undefined;

      // Transform the data to match our types
      const transformedOrder: OrderWithDetails = {
        id: orderData.id,
        restaurant_id: orderData.restaurant_id,
        table_id: orderData.table_id,
        status: orderData.status,
        total_amount: orderData.total_amount,
        notes: orderData.notes,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        table: Array.isArray(orderData.table) && orderData.table[0] ? {
          table_number: orderData.table[0].table_number
        } : null,
        order_items: orderData.order_items.map((item) => ({
          id: item.id,
          order_id: item.order_id,
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          customizations: item.customizations || {},
          menu_item: Array.isArray(item.menu_item) && item.menu_item[0] ? {
            name: item.menu_item[0].name,
            description: item.menu_item[0].description,
            price: item.menu_item[0].price
          } : {
            name: 'Unknown Item',
            description: '',
            price: 0
          }
        }))
      }

      return transformedOrder;
    },
    enabled: !!selectedOrderId,
    retry: false
  })

  // Fetch restaurant data first
  useEffect(() => {
    const fetchRestaurant = async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id')
        .single()

      if (error) {
        console.error('Error fetching restaurant:', error)
        return
      }

      setRestaurantData(data)
    }

    fetchRestaurant()
  }, [])

  const fetchDashboardStats = async () => {
    if (!restaurantData?.id) return

    try {
      // Get today's date at midnight in the user's timezone
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch tables stats
      const { data: tablesData } = await supabase
        .from('tables')
        .select('status')
        .eq('restaurant_id', restaurantData.id)

      const totalTables = tablesData?.length || 0
      const availableTables = tablesData?.filter(t => t.status === 'available').length || 0
      const occupiedTables = tablesData?.filter(t => t.status === 'occupied').length || 0

      // Fetch orders stats with proper table join
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          table:tables!inner(
            table_number
          )
        `)
        .eq('restaurant_id', restaurantData.id)
        .order('created_at', { ascending: false })
        .returns<OrderData[]>()

      if (!ordersData) {
        throw new Error('Failed to fetch orders data')
      }

      const totalOrders = ordersData.length
      const activeOrders = ordersData.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length
      const completedOrders = ordersData.filter(o => o.status === 'completed').length

      // Calculate today's stats using the user's local timezone
      const todayOrders = ordersData.filter(order => 
        new Date(order.created_at).getTime() >= today.getTime()
      )

      const todayRevenue = todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const todayOrderCount = todayOrders.length

      // Get recent orders and ensure proper typing
      const recentOrders = ordersData.slice(0, 5).map(order => ({
        id: String(order.id),
        status: String(order.status),
        total_amount: Number(order.total_amount),
        created_at: String(order.created_at),
        table: {
          table_number: String(order.table.table_number)
        }
      }))

      setStats({
        totalOrders,
        activeOrders,
        completedOrders,
        totalTables,
        availableTables,
        occupiedTables,
        todayRevenue,
        todayOrderCount,
        recentOrders
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
    setIsLoading(false)
  }

  // Fetch stats when restaurant data is available
  useEffect(() => {
    if (restaurantData?.id) {
      fetchDashboardStats()
      
      // Set up real-time subscriptions
      const ordersSubscription = supabase
        .channel('dashboard-orders')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'orders',
            filter: `restaurant_id=eq.${restaurantData.id}`
          },
          () => fetchDashboardStats()
        )
        .subscribe()

      const tablesSubscription = supabase
        .channel('dashboard-tables')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tables',
            filter: `restaurant_id=eq.${restaurantData.id}`
          },
          () => fetchDashboardStats()
        )
        .subscribe()

      return () => {
        ordersSubscription.unsubscribe()
        tablesSubscription.unsubscribe()
      }
    }
  }, [restaurantData])

  return (
    <div className="flex flex-col space-y-4">
      {/* Rest of the component content */}
    </div>
  )
}