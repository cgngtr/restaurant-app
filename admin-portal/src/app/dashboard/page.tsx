'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Clock,
  Grid2X2 as Grid,
  Settings,
  Menu as MenuIcon,
  ArrowUpRight,
  DollarSign,
  Timer,
  LayoutGrid
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { OrderDetails } from "@/components/orders/order-details"
import { useQuery } from '@tanstack/react-query'
import { OrderWithDetails } from '@/types/order'
import type { Database } from '@/types/supabase'
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
          order_items(
            id,
            order_id,
            menu_item_id,
            quantity,
            unit_price,
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

      const todayRevenue = todayOrders
        .filter(order => order.status !== 'cancelled')
        .reduce((sum, order) => sum + (order.total_amount || 0), 0)
      const todayOrderCount = todayOrders.filter(order => order.status !== 'cancelled').length

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {/* Today's Revenue */}
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Today's Revenue</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold">{formatCurrency(stats.todayRevenue)}</p>
              <span className="text-xs text-emerald-500">↑ 12.5%</span>
            </div>
          </div>
        </Card>

        {/* Active Orders */}
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
              <Timer className="w-6 h-6 text-amber-500" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Orders</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold">{stats.activeOrders}</p>
              <span className="text-[10px] text-amber-500 font-medium px-1.5 py-0.5 rounded-full bg-amber-500/10">Live</span>
            </div>
          </div>
        </Card>

        {/* Tables Status */}
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center">
              <LayoutGrid className="w-6 h-6 text-violet-500" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Tables Status</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold">{stats.availableTables}/{stats.totalTables}</p>
              <span className="text-[10px] text-violet-500 font-medium px-1.5 py-0.5 rounded-full bg-violet-500/10">Available</span>
            </div>
          </div>
        </Card>

        {/* Completed Orders */}
        <Card className="p-6 relative overflow-hidden">
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Completed Orders</p>
            <div className="flex items-baseline gap-2 mt-2">
              <p className="text-2xl font-semibold">{stats.completedOrders}</p>
              <span className="text-[10px] text-blue-500 font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10">Today</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-[2fr_1fr] gap-4">
        {/* Recent Orders Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Button variant="ghost" size="sm" className="h-8 text-muted-foreground hover:text-foreground">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-2">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div>
                  <p className="font-medium">Table {order.table.table_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${
                    order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    order.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    order.status === 'preparing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    order.status === 'ready' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                    'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Quick Actions Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/menu" className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center bg-white hover:bg-muted/50"
                >
                  <MenuIcon className="h-6 w-6 mb-2" />
                  Update Menu
                </Button>
              </Link>
              <Link href="/tables" className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center bg-white hover:bg-muted/50"
                >
                  <Grid className="h-6 w-6 mb-2" />
                  Manage Tables
                </Button>
              </Link>
              <Link href="/orders" className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center bg-white hover:bg-muted/50"
                >
                  <Clock className="h-6 w-6 mb-2" />
                  View Orders
                </Button>
              </Link>
              <Link href="/settings" className="block">
                <Button
                  variant="outline"
                  className="w-full h-24 flex flex-col items-center justify-center bg-white hover:bg-muted/50"
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </Card>

          {/* Today's Performance Card */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Today's Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Average Order Value</span>
                <span className="font-medium">{formatCurrency(stats.todayRevenue / (stats.todayOrderCount || 1))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Table Turnover Rate</span>
                <span className="font-medium">0.2x</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Peak Hours</span>
                <span className="font-medium">12:00 - 14:00</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrderId} onOpenChange={(open) => !open && setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <p className="text-sm text-muted-foreground">
              View and manage order details, items, and status.
            </p>
          </DialogHeader>
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onStatusChange={async (newStatus) => {
                try {
                  const { error } = await supabase
                    .from('orders')
                    .update({ status: newStatus })
                    .eq('id', selectedOrder.id)

                  if (error) throw error

                  setSelectedOrderId(null)
                  fetchDashboardStats()
                } catch (error) {
                  console.error('Error updating order status:', error)
                }
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}