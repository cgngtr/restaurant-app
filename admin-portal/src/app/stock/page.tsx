'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Package,
  TrendingDown,
  AlertTriangle,
  Box,
  FolderTree,
  Building2,
  ArrowRight,
  FileSpreadsheet,
  Plus
} from 'lucide-react'
import { useRestaurant } from "@/providers/restaurant-provider"
import { supabase } from "@/lib/supabase"

interface StockStats {
  totalItems: number
  lowStockItems: number
  overstockedItems: number
  stockValue: number
}

export default function Test1Page() {
  const { restaurant } = useRestaurant()
  const [stats, setStats] = useState<StockStats>({
    totalItems: 0,
    lowStockItems: 0,
    overstockedItems: 0,
    stockValue: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStockStats = async () => {
      if (!restaurant?.id) return

      try {
        // Fetch all stock items
        const { data: stockItems, error: stockError } = await supabase
          .from('stock_items')
          .select('*')
          .eq('restaurant_id', restaurant.id)

        if (stockError) throw stockError

        if (stockItems) {
          const stats: StockStats = {
            totalItems: stockItems.length,
            lowStockItems: stockItems.filter(item => 
              item.quantity <= item.minimum_quantity
            ).length,
            overstockedItems: stockItems.filter(item => 
              item.maximum_quantity !== null && 
              item.quantity >= item.maximum_quantity
            ).length,
            stockValue: stockItems.reduce((total, item) => 
              total + (item.quantity * (item.unit_cost || 0)), 0
            )
          }
          setStats(stats)
        }
      } catch (error) {
        console.error('Error loading stock stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStockStats()
  }, [restaurant?.id])

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : stats.totalItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items in inventory
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {isLoading ? "..." : stats.lowStockItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items below minimum
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overstocked Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {isLoading ? "..." : stats.overstockedItems}
            </div>
            <p className="text-xs text-muted-foreground">
              Items above maximum
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₺{isLoading ? "..." : stats.stockValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Total inventory value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Link href="/stock/current-stock">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Stock</CardTitle>
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Monitor and manage inventory levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>View current stock status</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stock/categories">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product Categories</CardTitle>
                <FolderTree className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Organize and categorize inventory
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Manage product categories</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/stock/suppliers">
          <Card className="hover:bg-accent cursor-pointer transition-colors">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Suppliers</CardTitle>
                <Building2 className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardDescription>
                Manage supplier relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>View supplier details</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
} 