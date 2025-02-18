'use client'

import { useEffect, useState } from "react"
import { useRestaurant } from "@/providers/restaurant-provider"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Package, Plus, Search, FileSpreadsheet } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StockItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  minimum_quantity: number
  maximum_quantity: number | null
  unit_cost: number
  supplier_id: string
  supplier: {
    id: string
    company_name: string
  } | null
}

export default function CurrentStockPage() {
  const { restaurant } = useRestaurant()
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const loadStockItems = async () => {
      if (!restaurant?.id) return

      try {
        console.log('Fetching stock items for restaurant:', restaurant.id)
        
        // First, let's get the stock items
        const { data: stockData, error: stockError } = await supabase
          .from('stock_items')
          .select('*')
          .eq('restaurant_id', restaurant.id)

        if (stockError) {
          console.error('Stock items fetch error:', stockError)
          throw stockError
        }

        console.log('Stock items:', stockData)

        if (stockData) {
          // Now let's get the suppliers for these items
          const supplierIds = Array.from(new Set(stockData.map(item => item.supplier_id)))
          console.log('Supplier IDs:', supplierIds)

          const { data: suppliersData, error: suppliersError } = await supabase
            .from('suppliers')
            .select('id, company_name')
            .in('id', supplierIds)

          if (suppliersError) {
            console.error('Suppliers fetch error:', suppliersError)
            throw suppliersError
          }

          console.log('Suppliers data:', suppliersData)

          // Create a map of supplier id to supplier data
          const suppliersMap = new Map(
            suppliersData?.map(supplier => [supplier.id, supplier]) || []
          )

          // Combine the data
          const items: StockItem[] = stockData.map(item => ({
            ...item,
            supplier: suppliersMap.get(item.supplier_id) || null
          }))

          setStockItems(items)
          
          // Extract unique categories
          const uniqueCategories = Array.from(new Set(items.map(item => item.category)))
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error('Error loading stock items:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStockItems()

    // Set up real-time subscription
    const subscription = supabase
      .channel('stock_items_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stock_items',
          filter: `restaurant_id=eq.${restaurant?.id}`
        },
        () => {
          loadStockItems()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [restaurant?.id])

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.supplier?.company_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (item: StockItem) => {
    if (item.quantity <= item.minimum_quantity) {
      return "text-red-500"
    }
    if (item.maximum_quantity && item.quantity >= item.maximum_quantity) {
      return "text-yellow-500"
    }
    return "text-green-500"
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Current Stock</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items or suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem key="all-categories" value="all">
                  <span>All Categories</span>
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={`category-${category}`} value={category}>
                    <span>{category}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stock Items Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Min. Quantity</TableHead>
                <TableHead>Max. Quantity</TableHead>
                <TableHead>Unit Cost</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Supplier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No items found
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className={getStockStatus(item)}>
                      {item.quantity}
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.minimum_quantity}</TableCell>
                    <TableCell>{item.maximum_quantity || '-'}</TableCell>
                    <TableCell>₺{item.unit_cost.toLocaleString()}</TableCell>
                    <TableCell>
                      ₺{(item.quantity * item.unit_cost).toLocaleString()}
                    </TableCell>
                    <TableCell>{item.supplier?.company_name || 'Unknown'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 