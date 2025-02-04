'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import { Plus, Eye, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface TableStats {
  id: string
  table_number: string
  status: 'available' | 'occupied' | 'reserved'
  total_orders: number
  total_revenue: number
  active_order?: {
    id: string
    status: string
    total_amount: number
  }
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableStats[]>([])
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
        toast({
          title: 'Error',
          description: 'Failed to fetch restaurant data',
          variant: 'destructive',
        })
        return
      }

      setRestaurantData(data)
    }

    fetchRestaurant()
  }, [])

  const fetchTables = async () => {
    if (!restaurantData?.id) return

    console.log('Fetching tables...')
    try {
      // Get tables with orders in a single query
      const { data, error } = await supabase
        .from('tables')
        .select(`
          id,
          table_number,
          status,
          orders (
            id,
            status,
            total_amount
          )
        `)
        .eq('restaurant_id', restaurantData.id)
        .order('table_number')

      if (error) throw error

      // Process the data
      const tablesWithStats = (data || []).map(table => {
        const orders = table.orders || []
        const total_revenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0)
        const active_order = orders.find(order => 
          order.status !== 'completed' && order.status !== 'cancelled'
        )

        return {
          id: table.id,
          table_number: table.table_number,
          status: table.status,
          total_orders: orders.length,
          total_revenue,
          active_order: active_order || undefined
        }
      })

      setTables(tablesWithStats)
    } catch (error) {
      console.error('Error fetching tables:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tables',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  // Fetch tables when restaurant data is available
  useEffect(() => {
    if (restaurantData?.id) {
      fetchTables()
    }
  }, [restaurantData])

  const createTable = async () => {
    if (!restaurantData?.id) return

    const newTableNumber = (tables.length + 1).toString()
    
    try {
      const { data, error } = await supabase
        .from('tables')
        .insert({
          id: crypto.randomUUID(),
          restaurant_id: restaurantData.id,
          table_number: newTableNumber,
          status: 'available'
        })
        .select()
        .single()

      if (error) throw error

      await fetchTables() // Refresh the list to get stats
      
      toast({
        title: 'Success',
        description: `Table ${newTableNumber} created successfully`,
      })
    } catch (error) {
      console.error('Error creating table:', error)
      toast({
        title: 'Error',
        description: 'Failed to create table',
        variant: 'destructive',
      })
    }
  }

  const createInitialTables = async () => {
    if (!restaurantData?.id) return

    console.log('Creating initial tables...')
    setIsLoading(true)
    try {
      const tablesToCreate = Array.from({ length: 5 }, (_, i) => ({
        id: crypto.randomUUID(),
        restaurant_id: restaurantData.id,
        table_number: (i + 1).toString(),
        status: 'available'
      }))

      const { error } = await supabase
        .from('tables')
        .insert(tablesToCreate)

      if (error) throw error

      await fetchTables() // Refresh the list to get stats
      
      toast({
        title: 'Success',
        description: 'Initial tables created successfully',
      })
    } catch (error) {
      console.error('Error creating initial tables:', error)
      toast({
        title: 'Error',
        description: 'Failed to create initial tables',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading tables...</p>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800'
      case 'reserved':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tables</h1>
        <div className="space-x-2">
          {tables.length === 0 ? (
            <Button onClick={createInitialTables} disabled={isLoading}>
              {isLoading ? 'Creating Tables...' : 'Create 5 Tables'}
            </Button>
          ) : (
            <Button onClick={createTable} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Table
            </Button>
          )}
        </div>
      </div>

      {tables.length === 0 && !isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">No tables found. Create some tables to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table) => (
            <Card key={table.id} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">Table {table.table_number}</h2>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(table.status)}`}>
                    {table.status}
                  </span>
                </div>
                <Link href={`/tables/${table.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Orders</span>
                  <span className="font-medium">{table.total_orders}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">${table.total_revenue.toFixed(2)}</span>
                </div>
                {table.active_order && (
                  <div className="mt-4 p-2 bg-yellow-50 rounded-md">
                    <p className="text-sm font-medium text-yellow-800">Active Order</p>
                    <div className="text-sm text-yellow-800">
                      Status: {table.active_order.status}
                      <br />
                      Amount: ${table.active_order.total_amount.toFixed(2)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 