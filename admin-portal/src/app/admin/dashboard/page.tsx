'use client';

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Store,
  Users,
  Settings,
  ArrowUpRight,
  DollarSign,
  Timer,
  LayoutGrid
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { formatCurrency } from '@/lib/utils'

interface AdminDashboardStats {
  totalRestaurants: number
  activeRestaurants: number
  totalUsers: number
  totalRevenue: number
  todayRevenue: number
  recentRestaurants: Array<{
    id: string
    name: string
    created_at: string
    active: boolean
  }>
}

const initialStats: AdminDashboardStats = {
  totalRestaurants: 0,
  activeRestaurants: 0,
  totalUsers: 0,
  totalRevenue: 0,
  todayRevenue: 0,
  recentRestaurants: []
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats>(initialStats)
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      // Get today's date at midnight in the user's timezone
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Fetch restaurants stats
      const { data: restaurantsData } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false })

      const totalRestaurants = restaurantsData?.length || 0
      const activeRestaurants = restaurantsData?.filter(r => r.active).length || 0

      // Fetch users stats
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')

      const totalUsers = usersData?.length || 0

      // Fetch revenue stats
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total_amount, created_at')
        .eq('payment_status', 'completed')

      const totalRevenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const todayRevenue = ordersData
        ?.filter(order => new Date(order.created_at).getTime() >= today.getTime())
        .reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

      // Get recent restaurants
      const recentRestaurants = (restaurantsData || []).slice(0, 5).map(restaurant => ({
        id: restaurant.id,
        name: restaurant.name,
        created_at: restaurant.created_at,
        active: restaurant.active
      }))

      setStats({
        totalRestaurants,
        activeRestaurants,
        totalUsers,
        totalRevenue,
        todayRevenue,
        recentRestaurants
      })
    } catch (error) {
      console.error('Error fetching admin dashboard stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Restaurants</p>
              <h2 className="text-2xl font-bold">{stats.totalRestaurants}</h2>
            </div>
            <Store className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Active: {stats.activeRestaurants}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <h2 className="text-2xl font-bold">{stats.totalUsers}</h2>
            </div>
            <Users className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <h2 className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</h2>
            </div>
            <DollarSign className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Revenue</p>
              <h2 className="text-2xl font-bold">{formatCurrency(stats.todayRevenue)}</h2>
            </div>
            <Timer className="h-8 w-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent Restaurants</h3>
          <Link href="/admin/restaurants">
            <Button variant="outline" size="sm">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="space-y-4">
          {stats.recentRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="flex items-center justify-between p-4 rounded-lg border"
            >
              <div>
                <h4 className="font-medium">{restaurant.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Created: {new Date(restaurant.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                restaurant.active
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100'
              }`}>
                {restaurant.active ? 'Active' : 'Inactive'}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
} 