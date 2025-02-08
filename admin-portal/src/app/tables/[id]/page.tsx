'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { ArrowLeft, Download, RefreshCw, Check, AlertCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import NewOrderModal from '@/components/orders/NewOrderModal'
import { TableDetails } from '@/types/tables'

export default function TableDetailsPage() {
  const params = useParams()
  const [table, setTable] = useState<TableDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRegeneratingQR, setIsRegeneratingQR] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [isCreatingOrder, setIsCreatingOrder] = useState(false)

  const fetchTableDetails = async () => {
    try {
      // Fetch table basic info
      const { data: tableData, error: tableError } = await supabase
        .from('tables')
        .select('*')
        .eq('id', params.id)
        .single()

      if (tableError) throw tableError

      // Fetch orders for this table
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          status,
          total_amount,
          created_at,
          order_items (
            quantity,
            unit_price,
            menu_item:menu_items (
              name
            )
          )
        `)
        .eq('table_id', params.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError

      // Calculate stats
      const total_orders = ordersData?.length || 0
      const total_revenue = ordersData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0
      const average_order_value = total_orders > 0 ? total_revenue / total_orders : 0

      setTable({
        ...tableData,
        orders: ordersData || [],
        stats: {
          total_orders,
          total_revenue,
          average_order_value
        }
      })
    } catch (error) {
      console.error('Error fetching table details:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch table details',
        variant: 'destructive',
      })
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTableDetails()
  }, [params.id])

  const generateQRCode = async () => {
    if (!table) return null
    const url = `http://localhost:3000/demo-restaurant/${table.table_number}`
    try {
      return await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
      return null
    }
  }

  const handleRegenerateQR = async () => {
    if (!table) return
    
    setIsRegeneratingQR(true)
    try {
      const qrCode = await generateQRCode()
      if (!qrCode) throw new Error('Failed to generate QR code')

      const { error } = await supabase
        .from('tables')
        .update({ qr_code: qrCode })
        .eq('id', table.id)

      if (error) throw error

      setTable(prev => prev ? { ...prev, qr_code: qrCode } : null)
      
      toast({
        title: 'Success',
        description: 'QR code regenerated successfully',
      })
    } catch (error) {
      console.error('Error regenerating QR code:', error)
      toast({
        title: 'Error',
        description: 'Failed to regenerate QR code',
        variant: 'destructive',
      })
    }
    setIsRegeneratingQR(false)
  }

  const downloadQRCode = () => {
    if (!table?.qr_code) return
    
    const link = document.createElement('a')
    link.href = table.qr_code
    link.download = `table-${table.table_number}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800'
      case 'reserved':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'preparing':
        return 'bg-blue-100 text-blue-800'
      case 'ready':
        return 'bg-purple-100 text-purple-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const updateTableStatus = async (newStatus: string) => {
    if (!table) return
    
    setIsUpdatingStatus(true)
    try {
      const { error } = await supabase
        .from('tables')
        .update({ status: newStatus })
        .eq('id', table.id)

      if (error) throw error

      // Update local state
      setTable(prev => prev ? { ...prev, status: newStatus as TableDetails['status'] } : null)
      
      toast({
        title: 'Success',
        description: `Table status updated to ${newStatus}`,
      })
    } catch (error) {
      console.error('Error updating table status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update table status',
        variant: 'destructive',
      })
    }
    setIsUpdatingStatus(false)
  }

  const handleMarkAsAvailable = async () => {
    if (!table) return
    
    setIsUpdatingStatus(true)
    try {
      // First, get all active orders for this table
      const activeOrders = table.orders.filter(order => 
        order.status !== 'completed' && order.status !== 'cancelled'
      )

      if (activeOrders.length > 0) {
        // Mark all active orders as completed and update payment status
        const { error: ordersError } = await supabase
          .from('orders')
          .update({ 
            status: 'completed',
            payment_status: 'completed'
          })
          .in('id', activeOrders.map(order => order.id))

        if (ordersError) throw ordersError
      }

      // Then update table status
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', table.id)

      if (tableError) throw tableError

      // Update local state
      setTable(prev => {
        if (!prev) return null
        return {
          ...prev,
          status: 'available',
          orders: prev.orders.map(order => ({
            ...order,
            status: order.status !== 'cancelled' ? 'completed' : order.status,
            payment_status: order.status !== 'cancelled' ? 'completed' : 'pending'
          }))
        }
      })
      
      toast({
        title: 'Success',
        description: 'Table marked as available and payment completed',
      })
    } catch (error) {
      console.error('Error updating table status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update table status',
        variant: 'destructive',
      })
    }
    setIsUpdatingStatus(false)
  }

  const handleCreateOrder = async (items: Array<{ menuItemId: string; quantity: number; notes?: string }>) => {
    if (!table) return;
    setIsCreatingOrder(true);

    try {
      // Get menu items details for prices
      const { data: menuItems, error: menuError } = await supabase
        .from('menu_items')
        .select('id, price')
        .in('id', items.map(item => item.menuItemId));

      if (menuError) throw menuError;

      const menuItemPrices = new Map(menuItems.map(item => [item.id, item.price]));

      // Create order
      const orderId = crypto.randomUUID();
      const totalAmount = items.reduce((sum, item) => {
        const price = menuItemPrices.get(item.menuItemId) || 0;
        return sum + (price * item.quantity);
      }, 0);

      // Get next manual order number
      const { data: sequenceData, error: sequenceError } = await supabase
        .rpc('next_manual_order_number', { table_number: table.table_number });

      if (sequenceError) throw sequenceError;

      const orderNumber = `MN-B${table.table_number}-${String(sequenceData).padStart(4, '0')}`;
      console.log('Generated order number:', orderNumber); // Debug log

      // First, try to insert order without select
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          order_number: orderNumber,
          restaurant_id: table.restaurant_id,
          table_id: table.id,
          status: 'pending',
          total_amount: totalAmount,
        });

      if (insertError) {
        console.error('Order insert error:', insertError);
        throw insertError;
      }

      // Then fetch the created order
      const { data: createdOrder, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) {
        console.error('Order fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Created order:', createdOrder); // Debug log

      // Create order items with unit prices
      const orderItems = items.map(item => ({
        id: crypto.randomUUID(),
        order_id: orderId,
        menu_item_id: item.menuItemId,
        quantity: item.quantity,
        unit_price: menuItemPrices.get(item.menuItemId) || 0,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update table status to occupied
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', table.id);

      if (tableError) throw tableError;

      // Refresh table details
      await fetchTableDetails();

      toast({
        title: 'Success',
        description: 'Order created successfully',
      });

      setIsOrderModalOpen(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
    }
    setIsCreatingOrder(false);
  };

  if (isLoading || !table) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center">Loading table details...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <Link href="/tables">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tables
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Table {table.table_number}</h1>
        <span className={`ml-4 inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(table.status)}`}>
          {table.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Status Management Card */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Table Status</h2>
              <Button
                onClick={() => setIsOrderModalOpen(true)}
                disabled={table.status === 'reserved'}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
            
            {/* Show alert when table is occupied and has active order */}
            {table.status === 'occupied' && table.orders.some(order => 
              order.status !== 'completed' && order.status !== 'cancelled'
            ) && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Active Order in Progress</AlertTitle>
                <AlertDescription>
                  This table has an active order. Mark it as available once payment is complete.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              {/* Quick action button for marking as available */}
              {table.status === 'occupied' && (
                <Button
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  onClick={handleMarkAsAvailable}
                  disabled={isUpdatingStatus}
                >
                  {isUpdatingStatus ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Mark as Available (Payment Complete)
                    </>
                  )}
                </Button>
              )}

              {/* Status dropdown for other changes */}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Change Status:</span>
                <Select
                  value={table.status}
                  onValueChange={updateTableStatus}
                  disabled={isUpdatingStatus}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Existing Stats Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Table Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Orders</span>
                <span className="font-medium">{table.stats.total_orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium">₺{table.stats.total_revenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Average Order Value</span>
                <span className="font-medium">₺{table.stats.average_order_value.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Existing QR Code Card */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">QR Code</h2>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateQR}
                  disabled={isRegeneratingQR}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRegeneratingQR ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
                {table.qr_code && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadQRCode}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>
            </div>
            {table.qr_code ? (
              <div className="flex justify-center">
                <img
                  src={table.qr_code}
                  alt={`QR Code for Table ${table.table_number}`}
                  className="w-48 h-48"
                />
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No QR code available</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateQR}
                  className="mt-2"
                  disabled={isRegeneratingQR}
                >
                  Generate QR Code
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Existing Order History Card */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Order History</h2>
          <div className="space-y-4">
            {table.orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No orders yet</p>
            ) : (
              table.orders.map((order) => (
                <div key={order.id} className="border-b pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className="font-medium">
                      ₺{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="text-sm flex justify-between">
                        <span>{item.quantity}x {item.menu_item.name}</span>
                        <span className="text-muted-foreground">
                          ₺{(item.quantity * item.unit_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {isOrderModalOpen && (
        <NewOrderModal
          table={table}
          onClose={() => setIsOrderModalOpen(false)}
          onSubmit={handleCreateOrder}
          isLoading={isCreatingOrder}
        />
      )}
    </div>
  )
} 