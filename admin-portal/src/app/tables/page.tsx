'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'
import QRCode from 'qrcode'
import { Download, Plus, Trash, RefreshCw } from 'lucide-react'

interface Table {
  id: string
  table_number: string
  restaurant_id: string
  qr_code: string | null
  status: 'available' | 'occupied' | 'reserved'
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const restaurantId = 'rest_demo1' // For testing purposes

  const fetchTables = async () => {
    console.log('Fetching tables...')
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .order('table_number')

    if (error) {
      console.error('Error fetching tables:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch tables',
        variant: 'destructive',
      })
      return
    }

    console.log('Fetched tables:', data)
    setTables(data || [])
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTables()
  }, [])

  const generateQRCode = async (tableNumber: string): Promise<string> => {
    console.log('Generating QR code for table:', tableNumber)
    const url = `http://localhost:3000/demo-restaurant/${tableNumber}`
    try {
      const qrCode = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
      console.log('QR code generated successfully')
      return qrCode
    } catch (error) {
      console.error('Error generating QR code:', error)
      throw error
    }
  }

  const generateTableId = () => {
    const timestamp = Date.now().toString(36)
    const randomStr = Math.random().toString(36).substring(2, 8)
    return `table_${timestamp}${randomStr}`
  }

  const createTable = async () => {
    const newTableNumber = (tables.length + 1).toString()
    
    try {
      const qrCode = await generateQRCode(newTableNumber)
      const tableId = generateTableId()
      
      const { data, error } = await supabase
        .from('tables')
        .insert({
          id: tableId,
          restaurant_id: restaurantId,
          table_number: newTableNumber,
          qr_code: qrCode,
          status: 'available'
        })
        .select()
        .single()

      if (error) throw error

      setTables(prev => [...prev, data as Table])
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

  const deleteTable = async (tableId: string, tableNumber: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error

      setTables(prev => prev.filter(table => table.id !== tableId))
      toast({
        title: 'Success',
        description: `Table ${tableNumber} deleted successfully`,
      })
    } catch (error) {
      console.error('Error deleting table:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete table',
        variant: 'destructive',
      })
    }
  }

  const downloadQRCode = (qrCode: string, tableNumber: string) => {
    const link = document.createElement('a')
    link.href = qrCode
    link.download = `table-${tableNumber}-qr.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const createInitialTables = async () => {
    console.log('Creating initial tables...')
    setIsLoading(true)
    try {
      const newTables = []
      for (let i = 1; i <= 5; i++) {
        console.log(`Generating QR code for table ${i}...`)
        const qrCode = await generateQRCode(i.toString())
        const tableId = generateTableId()
        
        const { data, error } = await supabase
          .from('tables')
          .insert({
            id: tableId,
            restaurant_id: restaurantId,
            table_number: i.toString(),
            qr_code: qrCode,
            status: 'available'
          })
          .select()
          .single()

        if (error) {
          console.error(`Error creating table ${i}:`, error)
          throw error
        }

        console.log(`Table ${i} created:`, data)
        newTables.push(data)
      }

      setTables(newTables as Table[])
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

  const regenerateQRCodes = async () => {
    setIsLoading(true)
    try {
      const updatedTables = []
      for (const table of tables) {
        const qrCode = await generateQRCode(table.table_number)
        const { data, error } = await supabase
          .from('tables')
          .update({ qr_code: qrCode })
          .eq('id', table.id)
          .select()
          .single()

        if (error) {
          console.error(`Error updating table ${table.table_number}:`, error)
          continue
        }
        updatedTables.push(data)
      }

      setTables(updatedTables as Table[])
      toast({
        title: 'Success',
        description: 'QR codes regenerated successfully',
      })
    } catch (error) {
      console.error('Error regenerating QR codes:', error)
      toast({
        title: 'Error',
        description: 'Failed to regenerate QR codes',
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
            <>
              <Button 
                variant="outline" 
                onClick={regenerateQRCodes} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate QR Codes
              </Button>
              <Button onClick={createTable} disabled={isLoading}>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </>
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
                <h2 className="text-xl font-semibold">Table {table.table_number}</h2>
                <div className="space-x-2">
                  {table.qr_code && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQRCode(table.qr_code!, table.table_number)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTable(table.id, table.table_number)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
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
                <p className="text-center text-muted-foreground">QR code not available</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 