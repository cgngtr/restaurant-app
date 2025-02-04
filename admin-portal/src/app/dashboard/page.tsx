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

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)
  const [restaurantData, setRestaurantData] = useState<{ id: string } | null>(null)

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

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="space-x-2">
          <Button asChild>
            <Link href="/tables">
              <TableIcon className="h-4 w-4 mr-2" />
              Manage Tables
            </Link>
          </Button>
          <Button asChild>
            <Link href="/orders">
              <Utensils className="h-4 w-4 mr-2" />
              View Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Today's Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <h3 className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Orders</p>
              <h3 className="text-2xl font-bold">{stats.todayOrderCount}</h3>
            </div>
            <Utensils className="h-8 w-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Orders</p>
              <h3 className="text-2xl font-bold">{stats.activeOrders}</h3>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Available Tables</p>
              <h3 className="text-2xl font-bold">{stats.availableTables} / {stats.totalTables}</h3>
            </div>
            <TableIcon className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-4">
          {stats.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
              <div>
                <p className="font-medium">Table {order.table.table_number}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{formatCurrency(order.total_amount)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.status}
                </span>
              </div>
            </div>
          ))}
          {stats.recentOrders.length === 0 && (
            <p className="text-center text-muted-foreground">No recent orders</p>
          )}
        </div>
      </Card>
    </div>
  )
} 