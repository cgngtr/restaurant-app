'use client'

import { useEffect, useState, use } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock, CheckCircle2, ChefHat, Soup } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed'

interface MenuItem {
  name: string
  description: string
}

interface OrderItem {
  quantity: number
  unit_price: number
  notes?: string
  menu_item: MenuItem
}

interface Order {
  id: string
  status: OrderStatus
  total_amount: number
  notes?: string
  created_at: string
  table: {
    table_number: string
  }
  order_items: OrderItem[]
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Order Received',
    description: 'Your order has been received and is waiting to be prepared.',
    color: 'text-yellow-500'
  },
  preparing: {
    icon: ChefHat,
    label: 'Preparing',
    description: 'Our chefs are preparing your delicious meal.',
    color: 'text-blue-500'
  },
  ready: {
    icon: Soup,
    label: 'Ready to Serve',
    description: 'Your order is ready and will be served shortly.',
    color: 'text-purple-500'
  },
  completed: {
    icon: CheckCircle2,
    label: 'Completed',
    description: 'Your order has been served. Enjoy your meal!',
    color: 'text-green-500'
  }
}

interface PageParams {
  orderId: string
  restaurant: string
  table: string
}

type Props = {
  params: Promise<PageParams>
}

export default function OrderStatusPage({ params }: Props) {
  const [order, setOrder] = useState<Order | null>(null)
  const resolvedParams = use<PageParams>(params)
  const { orderId, restaurant, table } = resolvedParams

  useEffect(() => {
    // Fetch initial order data
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          table:tables(table_number),
          order_items(
            quantity,
            unit_price,
            notes,
            menu_item:menu_items(name, description)
          )
        `)
        .eq('id', orderId)
        .single()

      if (error) {
        console.error('Error fetching order:', error)
        return
      }

      setOrder(data as Order)
    }

    fetchOrder()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        async (payload) => {
          console.log('Order update received:', payload)
          
          // Fetch the complete order data when status changes
          const { data } = await supabase
            .from('orders')
            .select(`
              *,
              table:tables(table_number),
              order_items(
                quantity,
                unit_price,
                notes,
                menu_item:menu_items(name, description)
              )
            `)
            .eq('id', orderId)
            .single()

          if (data) {
            setOrder(data as Order)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [orderId])

  const handleBack = () => {
    window.location.href = `/${restaurant}/${table}`
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-lg text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Menu
        </Button>
        <h1 className="text-2xl font-bold">Order Status</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <StatusIcon className={`h-10 w-10 ${currentStatus.color}`} />
            <div>
              <h2 className="text-lg font-medium">{currentStatus.label}</h2>
              <p className="text-sm text-muted-foreground">{currentStatus.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-medium">{order.id}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Table Number</span>
              <span className="font-medium">{order.table.table_number}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order Time</span>
              <span className="font-medium">{new Date(order.created_at).toLocaleTimeString()}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.order_items.map((item, index) => (
              <div key={index} className="flex justify-between pb-4 border-b last:border-0 last:pb-0">
                <div>
                  <h3 className="font-medium">{item.menu_item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Quantity: {item.quantity}
                  </p>
                  {item.notes && (
                    <p className="text-sm text-muted-foreground">
                      Notes: {item.notes}
                    </p>
                  )}
                </div>
                <p className="font-medium">
                  {formatCurrency(item.unit_price * item.quantity)}
                </p>
              </div>
            ))}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
} 